
// =========================================================================================
// ГЛОБАЛЬНЫЕ КОНСТАНТЫ И ДАННЫЕ ИГРЫ
// =========================================================================================

const RAW_MATERIALS = {
    'TRITRON': { id: 'TRITRON', name: 'ТРИТРОН' },
    'PLATIN': { id: 'PLATIN', name: 'ПЛАТИН' },
    'NEURIT': { id: 'NEURIT', name: 'НЕЙРИТ' },
    'PLUTAR': { id: 'PLUTAR', name: 'ПЛУТАР' },
    'ALVARG': { id: 'ALVARG', name: 'АЛЬВАРГ' },
    'RETROL': { id: 'RETROL', name: 'РЕТРОЛ' },
};

const PRODUCTS = {
    'CORONARY': { id: 'CORONARY', name: 'КОРОНАРИЙ', recipe: ['TRITRON', 'PLATIN', 'NEURIT'] },
    'STRONTIUM': { id: 'STRONTIUM', name: 'СТРОНЦИУМ', recipe: ['PLATIN', 'NEURIT', 'PLUTAR'] },
    'SALVARUS': { id: 'SALVARUS', name: 'САЛЬВАРУС', recipe: ['NEURIT', 'PLUTAR', 'ALVARG'] },
    'ARGONIS': { id: 'ARGONIS', name: 'АРГОНИС', recipe: ['ALVARG', 'RETROL'] }, // Note: Argonis has 2 ingredients in rules table, vs 3 for others
};

// Transport tariffs
const TRANSPORT_TARIFFS_RAW = {
    'TRITRON': { adjacent: 4, opposite: 5 },
    'PLATIN': { adjacent: 5, opposite: 6 },
    'NEURIT': { adjacent: 6, opposite: 7 },
    'PLUTAR': { adjacent: 7, opposite: 8 },
    'ALVARG': { adjacent: 8, opposite: 9 },
    'RETROL': { adjacent: 9, opposite: 10 },
};

const TRANSPORT_TARIFFS_PRODUCT = {
    'CORONARY': { adjacent: 10, opposite: 20 },
    'STRONTIUM': { adjacent: 15, opposite: 20 },
    'SALVARUS': { adjacent: 10, opposite: 15 },
    'ARGONIS': { adjacent: 20, opposite: 25 },
};

const MAX_CARDS_PER_CELL = 3; // Max raw material cards in market/factory cell

// Game State Object
let game = {
    player: {
        money: 0,
        inventory: {}, // rawMaterialId -> quantity
        ownedBases: [], // array of base objects
        ownedFactories: [], // array of factory objects
        brokerSector: 'sector1', // For single player, they effectively broker all during their turn, but this might define their "home" sector
    },
    bank: {
        rawMaterials: {}, // rawMaterialId -> quantity
        money: Infinity, // Bank has unlimited money for now
    },
    bases: [], // All bases on the board
    factories: [], // All factories on the board
    markets: {}, // marketId -> { rawMaterialPrices: {}, productPrices: {}, storedRawMaterials: { playerId -> { rawMaterialId -> quantity } } }
    quotationCounters: { // Current positions and directions of markers for each sector
        sector1: {
            rawMaterial: { position: 0, direction: 1, prices: [20, 25, 30, 35, 40, 45] }, // TRITRON to RETROL nominal prices
            product1: { position: 0, direction: 1, prices: [50, 60, 70, 80, 90, 100] }, // CORONARY nominal prices
            product2: { position: 0, direction: 1, prices: [55, 65, 75, 85, 95, 105] }, // STRONTIUM
            product3: { position: 0, direction: 1, prices: [45, 55, 65, 75, 85, 95] }, // SALVARUS
            product4: { position: 0, direction: 1, prices: [60, 70, 80, 90, 100, 110] }, // ARGONIS
        },
        // ... and for sector2, sector3, sector4, copied from sector1
    },
    currentPhase: 'preliminary', // preliminary, main
    currentStage: 0, // 0 for preliminary, 1-5 for main
    coreCycleCounter: 0,
    coreCycleRay: 0, // 0-11, 0 is start. Red rays at 3, 6, 9, 12 (which is 0 again, handled by a special event)
    maxPurchasesThisStage: 0, // For stage 5, max 2 purchases
};

// Helper to initialize other sectors with dummy data for now
function initializeQuotationCounters() {
    for (let i = 1; i <= 4; i++) {
        game.quotationCounters[`sector${i}`] = {
            rawMaterial: { position: i - 1, direction: 1, prices: [20, 25, 30, 35, 40, 45] },
            product1: { position: i - 1, direction: 1, prices: [50, 60, 70, 80, 90, 100] },
            product2: { position: i - 1, direction: 1, prices: [55, 65, 75, 85, 95, 105] },
            product3: { position: i - 1, direction: 1, prices: [45, 55, 65, 75, 85, 95] },
            product4: { position: i - 1, direction: 1, prices: [60, 70, 80, 90, 100, 110] },
        };
    }
}


// =========================================================================================
// UI ЭЛЕМЕНТЫ (ссылки)
// =========================================================================================
const logOutput = document.getElementById('log-output');

const playerMoneySpan = document.getElementById('player-money');
const playerRawMaterialsSpan = document.getElementById('player-raw-materials');
const playerBasesSpan = document.getElementById('player-bases');
const playerFactoriesSpan = document.getElementById('player-factories');
const factoryStorageList = document.getElementById('factory-storage-list');

const currentPhaseSpan = document.getElementById('current-phase');
const currentStageSpan = document.getElementById('current-stage');
const coreCycleCounterSpan = document.getElementById('core-cycle-counter');
const coreCycleRaySpan = document.getElementById('core-cycle-ray');

// Buttons
const startGameBtn = document.getElementById('start-game-btn');
const nextStageBtn = document.getElementById('next-stage-btn');
const nextTurnBtn = document.getElementById('next-turn-btn');

// Preliminary phase
const preliminaryActionsDiv = document.getElementById('preliminary-actions');
const propertyTypeSelectPrelim = document.getElementById('property-type-select-prelim');
const availablePropertiesPrelim = document.getElementById('available-properties-prelim');
const buyPropertyPrelimBtn = document.getElementById('buy-property-prelim-btn');
const endPreliminaryPhaseBtn = document.getElementById('end-preliminary-phase-btn');

// Main phase
const mainPhaseActionsDiv = document.getElementById('main-phase-actions');
const stage1ActionsDiv = document.getElementById('stage1-actions');
const stage2ActionsDiv = document.getElementById('stage2-actions');
const stage3ActionsDiv = document.getElementById('stage3-actions');
const stage4ActionsDiv = document.getElementById('stage4-actions');
const stage5ActionsDiv = document.getElementById('stage5-actions');
const brokerActionsDiv = document.getElementById('broker-actions');

// Stage 1 controls
const baseToExtractSelect = document.getElementById('base-to-extract');
const rawMaterialTypeExtractSelect = document.getElementById('raw-material-type-extract');
const extractQuantityInput = document.getElementById('extract-quantity');
const extractBtn = document.getElementById('extract-btn');

const marketSectorBuyRawSelect = document.getElementById('market-sector-buy-raw');
const rawMaterialTypeBuyRawSelect = document.getElementById('raw-material-type-buy-raw');
const buyRawQuantityInput = document.getElementById('buy-raw-quantity');
const buyRawFromMarketBtn = document.getElementById('buy-raw-from-market-btn');


// Stage 2 controls
const transportRawMaterialTypeSelect = document.getElementById('transport-raw-material-type');
const transportRawQuantityInput = document.getElementById('transport-raw-quantity');
const transportFromLocationSelect = document.getElementById('transport-from-location');
const transportToLocationSelect = document.getElementById('transport-to-location');
const transportRawBtn = document.getElementById('transport-raw-btn');

// Stage 3 controls
const productsReadyInfo = document.getElementById('products-ready-info');

// Stage 4 controls
const factoryToSellFromSelect = document.getElementById('factory-to-sell-from');
const productToSellSelect = document.getElementById('product-to-sell');
const marketSectorToSellProductSelect = document.getElementById('market-sector-to-sell-product');
const sellProductBtn = document.getElementById('sell-product-btn');
const potentialProfitInfo = document.getElementById('potential-profit-info');

// Stage 5 controls
const propertyTypeSelectMain = document.getElementById('property-type-select-main');
const availablePropertiesMain = document.getElementById('available-properties-main');
const buyPropertyMainBtn = document.getElementById('buy-property-main-btn');
const purchasesLeftSpan = document.getElementById('purchases-left');

// Broker controls
const brokerSectorSelect = document.getElementById('broker-sector-select');
const brokerMarkerTypeSelect = document.getElementById('broker-marker-type-select');
const moveMarkerCwBtn = document.getElementById('move-marker-cw-btn');
const moveMarkerCcwBtn = document.getElementById('move-marker-ccw-btn');

const quotationTablesDiv = document.getElementById('quotation-tables');


// =========================================================================================
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ ИГРЫ (карты, цены)
// =========================================================================================

function createGameEntities() {
    // Initialize Bank
    Object.values(RAW_MATERIALS).forEach(rm => {
        game.bank.rawMaterials[rm.id] = 200; // Enough raw materials for the bank
    });

    // Bases (6 per sector, 24 total)
    let baseId = 1;
    for (let s = 1; s <= 4; s++) {
        Object.values(RAW_MATERIALS).forEach(rm => {
            game.bases.push({
                id: `base${baseId}`,
                name: `База ${baseId} (${rm.name})`,
                sector: `sector${s}`,
                rawMaterialType: rm.id,
                owner: null,
                nominalCost: 500, // Example nominal cost
            });
            baseId++;
        });
    }

    // Factories (3 per sector, 12 total)
    let factoryId = 1;
    for (let s = 1; s <= 4; s++) {
        // CORONARY factory
        game.factories.push({
            id: `factory${factoryId}`,
            name: `Завод ${factoryId} (${PRODUCTS.CORONARY.name})`,
            sector: `sector${s}`,
            productType: PRODUCTS.CORONARY.id,
            recipe: PRODUCTS.CORONARY.recipe,
            owner: null,
            isActive: false, // passive by default
            rawMaterialsStored: {}, // rawMaterialId -> quantity
            nominalCost: 1000, // Example nominal cost
        });
        factoryId++;

        // STRONTIUM factory
        game.factories.push({
            id: `factory${factoryId}`,
            name: `Завод ${factoryId} (${PRODUCTS.STRONTIUM.name})`,
            sector: `sector${s}`,
            productType: PRODUCTS.STRONTIUM.id,
            recipe: PRODUCTS.STRONTIUM.recipe,
            owner: null,
            isActive: false,
            rawMaterialsStored: {},
            nominalCost: 1000,
        });
        factoryId++;

        // SALVARUS factory
        game.factories.push({
            id: `factory${factoryId}`,
            name: `Завод ${factoryId} (${PRODUCTS.SALVARUS.name})`,
            sector: `sector${s}`,
            productType: PRODUCTS.SALVARUS.id,
            recipe: PRODUCTS.SALVARUS.recipe,
            owner: null,
            isActive: false,
            rawMaterialsStored: {},
            nominalCost: 1000,
        });
        factoryId++;
        // Argonis can be added if needed, but rules say 3 types per sector, and 4 product types overall
        // To simplify, let's keep to 3 main product factories for now, or adapt rules to 4 factories per sector
    }
     // Let's ensure all product types can be made. Assuming 1 factory per product type per sector for simplicity.
    // Re-initialize factories to ensure all 4 product types are covered, 1 per sector * 4 product types = 16 factories total
    game.factories = [];
    factoryId = 1;
    for (let s = 1; s <= 4; s++) {
        Object.values(PRODUCTS).forEach(prod => {
            game.factories.push({
                id: `factory${factoryId}`,
                name: `Завод ${factoryId} (${prod.name})`,
                sector: `sector${s}`,
                productType: prod.id,
                recipe: prod.recipe,
                owner: null,
                isActive: false,
                rawMaterialsStored: {},
                nominalCost: 1000,
            });
            factoryId++;
        });
    }


    // Markets (4 sectors)
    for (let s = 1; s <= 4; s++) {
        game.markets[`sector${s}`] = {
            id: `sector${s}`,
            rawMaterialPrices: {}, // Current actual prices, derived from quotation counters
            productPrices: {},     // Current actual prices, derived from quotation counters
            storedRawMaterials: {}, // PlayerId -> { rawMaterialId -> quantity }
        };
    }
}

// =========================================================================================
// ОБНОВЛЕНИЕ UI
// =========================================================================================

function logMessage(message, type = 'normal') {
    const p = document.createElement('p');
    p.innerHTML = message;
    if (type === 'highlight') p.classList.add('highlight');
    if (type === 'warning') p.classList.add('warning');
    if (type === 'error') p.classList.add('error');
    logOutput.prepend(p); // Add to top
    if (logOutput.children.length > 50) { // Keep log from getting too long
        logOutput.removeChild(logOutput.lastChild);
    }
}

function updatePlayerInfo() {
    playerMoneySpan.textContent = game.player.money;

    const rawMaterialsList = Object.entries(game.player.inventory)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => `${RAW_MATERIALS[id].name}: ${qty} шт.`)
        .join(', ') || 'нет';
    playerRawMaterialsSpan.textContent = rawMaterialsList;

    const ownedBasesNames = game.player.ownedBases.map(b => b.name).join(', ') || 'нет';
    playerBasesSpan.textContent = ownedBasesNames;

    const ownedFactoriesNames = game.player.ownedFactories.map(f => {
        const status = f.isActive ? '(Активен)' : '(Пассивен)';
        return `${f.name} ${status}`;
    }).join(', ') || 'нет';
    playerFactoriesSpan.textContent = ownedFactoriesNames;

    factoryStorageList.innerHTML = '';
    game.player.ownedFactories.forEach(factory => {
        const stored = Object.entries(factory.rawMaterialsStored)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => `${RAW_MATERIALS[id].name}: ${qty} шт.`)
            .join(', ') || 'пусто';
        const li = document.createElement('li');
        li.textContent = `${factory.name} (${factory.sector}): ${stored}`;
        factoryStorageList.appendChild(li);
    });
}

function updateGameStateInfo() {
    currentPhaseSpan.textContent = game.currentPhase === 'preliminary' ? 'Предварительная' : 'Основная';
    currentStageSpan.textContent = game.currentPhase === 'main' ? `Стадия ${game.currentStage}` : 'N/A';
    coreCycleCounterSpan.textContent = game.coreCycleCounter;

    const rayNames = ["Стартовый", "1", "2", "Красный (3)", "4", "5", "Красный (6)", "7", "8", "Красный (9)", "10", "11"];
    coreCycleRaySpan.textContent = rayNames[game.coreCycleRay];
}

function updateQuotationTables() {
    quotationTablesDiv.innerHTML = '';
    for (const sectorId in game.quotationCounters) {
        const sectorData = game.quotationCounters[sectorId];
        const table = document.createElement('table');
        const caption = document.createElement('caption');
        caption.textContent = `Котировки Сектора ${sectorId.replace('sector', '')}`;
        table.appendChild(caption);

        const tbody = document.createElement('tbody');

        // Raw Materials
        let row = tbody.insertRow();
        let cell = row.insertCell();
        cell.textContent = 'Сырьё';
        cell.rowSpan = 2; // For better alignment

        const rmNames = Object.values(RAW_MATERIALS).map(rm => rm.name);
        const rmPrices = sectorData.rawMaterial.prices;
        const rmPos = sectorData.rawMaterial.position;

        row = tbody.insertRow();
        for (let i = 0; i < rmNames.length; i++) {
            const currentPrice = rmPrices[i];
            const priceCell = row.insertCell();
            priceCell.textContent = `${rmNames[i]}: ${currentPrice}`;
            if (i === rmPos) priceCell.classList.add('highlight');
            else if (i === (rmPos + 1) % rmNames.length || i === (rmPos - 1 + rmNames.length) % rmNames.length) priceCell.classList.add('warning'); // Neighboring
        }

        // Products
        Object.values(PRODUCTS).forEach((product, prodIdx) => {
            row = tbody.insertRow();
            let cell = row.insertCell();
            cell.textContent = product.name;

            const productPrices = sectorData[`product${prodIdx + 1}`].prices;
            const productPos = sectorData[`product${prodIdx + 1}`].position;
            for (let i = 0; i < productPrices.length; i++) {
                const priceCell = row.insertCell();
                priceCell.textContent = productPrices[i];
                if (i === productPos) priceCell.classList.add('highlight');
            }
        });

        table.appendChild(tbody);
        quotationTablesDiv.appendChild(table);
    }
}


function updateUI() {
    updatePlayerInfo();
    updateGameStateInfo();
    updateQuotationTables();

    // Hide all action blocks first
    [preliminaryActionsDiv, mainPhaseActionsDiv, stage1ActionsDiv, stage2ActionsDiv, stage3ActionsDiv, stage4ActionsDiv, stage5ActionsDiv, brokerActionsDiv]
        .forEach(el => el.classList.add('hidden'));

    startGameBtn.classList.add('hidden'); // Hide start button after game starts

    if (game.currentPhase === 'preliminary') {
        preliminaryActionsDiv.classList.remove('hidden');
        populateAvailablePropertiesSelect(propertyTypeSelectPrelim, availablePropertiesPrelim, game.bases.filter(b => !b.owner), game.factories.filter(f => !f.owner));
    } else if (game.currentPhase === 'main') {
        mainPhaseActionsDiv.classList.remove('hidden');
        brokerActionsDiv.classList.remove('hidden'); // Broker actions always available during main phase

        nextTurnBtn.disabled = true; // Only enabled after all stages
        nextStageBtn.disabled = false; // Enabled to move between stages

        switch (game.currentStage) {
            case 1:
                stage1ActionsDiv.classList.remove('hidden');
                populateRawMaterialExtractionControls();
                populateMarketRawBuyControls();
                break;
            case 2:
                stage2ActionsDiv.classList.remove('hidden');
                populateRawMaterialTransportationControls();
                break;
            case 3:
                stage3ActionsDiv.classList.remove('hidden');
                checkAndDisplayProductionReadiness();
                break;
            case 4:
                stage4ActionsDiv.classList.remove('hidden');
                populateProductSaleControls();
                break;
            case 5:
                stage5ActionsDiv.classList.remove('hidden');
                purchasesLeftSpan.textContent = `Покупок осталось: ${game.maxPurchasesThisStage}`;
                populateAvailablePropertiesSelect(propertyTypeSelectMain, availablePropertiesMain, game.bases.filter(b => !b.owner), game.factories.filter(f => !f.owner));
                // Only enable Next Stage if player has finished purchases or chose not to buy
                nextStageBtn.disabled = (game.maxPurchasesThisStage > 0);
                break;
            default:
                // No stage specific actions, usually means player finished all stages
                // or just started a new turn and needs to do broker actions
                if (game.currentStage === 0 && game.currentPhase === 'main') { // Means we finished stage 5 or just started a new turn cycle
                    nextTurnBtn.disabled = false; // Allow advancing turn if currentStage is effectively 'done'
                    nextStageBtn.disabled = true; // Wait for turn advancement
                }
                break;
        }
    }
}

function populateAvailablePropertiesSelect(typeSelect, propertySelect, availableBases, availableFactories) {
    propertySelect.innerHTML = '';
    const selectedType = typeSelect.value;
    let properties;
    if (selectedType === 'base') {
        properties = availableBases;
        if (properties.length === 0) {
            propertySelect.add(new Option('Нет доступных баз', ''));
            propertySelect.disabled = true;
            buyPropertyPrelimBtn.disabled = true;
            buyPropertyMainBtn.disabled = true;
            return;
        }
    } else { // factory
        properties = availableFactories;
        if (properties.length === 0) {
            propertySelect.add(new Option('Нет доступных заводов', ''));
            propertySelect.disabled = true;
            buyPropertyPrelimBtn.disabled = true;
            buyPropertyMainBtn.disabled = true;
            return;
        }
    }

    properties.forEach(prop => {
        const option = document.createElement('option');
        option.value = prop.id;
        option.textContent = `${prop.name} (Сектор: ${prop.sector.replace('sector', '')}, Цена: ${prop.nominalCost})`;
        propertySelect.appendChild(option);
    });
    propertySelect.disabled = false;
    // Enable relevant buy button based on context (preliminary vs main phase)
    if (game.currentPhase === 'preliminary') {
        buyPropertyPrelimBtn.disabled = false;
    } else if (game.currentPhase === 'main' && game.currentStage === 5) {
        buyPropertyMainBtn.disabled = (game.maxPurchasesThisStage <= 0);
    }
}

function populateRawMaterialExtractionControls() {
    baseToExtractSelect.innerHTML = '';
    if (game.player.ownedBases.length === 0) {
        baseToExtractSelect.add(new Option('Нет баз', ''));
        extractBtn.disabled = true;
        rawMaterialTypeExtractSelect.disabled = true;
        return;
    }
    game.player.ownedBases.forEach(base => {
        const option = document.createElement('option');
        option.value = base.id;
        option.textContent = `${base.name} (Сектор: ${base.sector.replace('sector', '')})`;
        baseToExtractSelect.appendChild(option);
    });
    extractBtn.disabled = false;
    rawMaterialTypeExtractSelect.disabled = false;
    populateRawMaterialTypesForExtraction();
}

function populateRawMaterialTypesForExtraction() {
    rawMaterialTypeExtractSelect.innerHTML = '';
    const selectedBaseId = baseToExtractSelect.value;
    const base = game.bases.find(b => b.id === selectedBaseId);
    if (!base) return;

    const sectorData = game.quotationCounters[base.sector];
    const rmPricesArr = Object.values(RAW_MATERIALS);
    const rmPos = sectorData.rawMaterial.position;

    // Direct material
    rawMaterialTypeExtractSelect.add(new Option(`${rmPricesArr[rmPos].name} (Номинал: ${sectorData.rawMaterial.prices[rmPos]})`, rmPricesArr[rmPos].id));
    // Clockwise adjacent
    const cwIdx = (rmPos + 1) % rmPricesArr.length;
    rawMaterialTypeExtractSelect.add(new Option(`${rmPricesArr[cwIdx].name} (Двойная цена: ${sectorData.rawMaterial.prices[rmPos] * 2})`, rmPricesArr[cwIdx].id));
    // Counter-clockwise adjacent
    const ccwIdx = (rmPos - 1 + rmPricesArr.length) % rmPricesArr.length;
    rawMaterialTypeExtractSelect.add(new Option(`${rmPricesArr[ccwIdx].name} (Полцены: ${Math.round(sectorData.rawMaterial.prices[rmPos] / 2)})`, rmPricesArr[ccwIdx].id));
}

function populateMarketRawBuyControls() {
    marketSectorBuyRawSelect.innerHTML = '';
    rawMaterialTypeBuyRawSelect.innerHTML = '';

    for (let s = 1; s <= 4; s++) {
        const option = document.createElement('option');
        option.value = `sector${s}`;
        option.textContent = `Сектор ${s}`;
        marketSectorBuyRawSelect.appendChild(option);
    }

    Object.values(RAW_MATERIALS).forEach(rm => {
        const option = document.createElement('option');
        option.value = rm.id;
        option.textContent = rm.name;
        rawMaterialTypeBuyRawSelect.appendChild(option);
    });
}

function populateRawMaterialTransportationControls() {
    transportRawMaterialTypeSelect.innerHTML = '';
    transportFromLocationSelect.innerHTML = '';
    transportToLocationSelect.innerHTML = '';

    // Populate available raw materials from player inventory
    Object.entries(game.player.inventory).filter(([, qty]) => qty > 0).forEach(([rmId]) => {
        const option = document.createElement('option');
        option.value = rmId;
        option.textContent = RAW_MATERIALS[rmId].name;
        transportRawMaterialTypeSelect.appendChild(option);
    });

    // Populate "from" locations
    transportFromLocationSelect.add(new Option('Инвентарь игрока', 'inventory'));
    // Add markets where player has stored raw materials
    for (const sectorId in game.markets) {
        const market = game.markets[sectorId];
        const playerStored = market.storedRawMaterials['player1']; // Assuming player1 is the current player
        if (playerStored && Object.keys(playerStored).length > 0) {
            transportFromLocationSelect.add(new Option(`Рынок ${sectorId.replace('sector', '')}`, `market-${sectorId}`));
        }
    }


    // Populate "to" locations
    game.player.ownedFactories.forEach(factory => {
        transportToLocationSelect.add(new Option(`${factory.name} (Сектор: ${factory.sector.replace('sector', '')})`, `factory-${factory.id}`));
    });
    for (let s = 1; s <= 4; s++) {
        transportToLocationSelect.add(new Option(`Рынок ${s}`, `market-sector${s}`));
    }
}

function checkAndDisplayProductionReadiness() {
    productsReadyInfo.innerHTML = '';
    let readyProducts = [];
    game.player.ownedFactories.forEach(factory => {
        if (!factory.isActive) return; // Only active factories can produce

        const recipe = PRODUCTS[factory.productType].recipe;
        let canProduce = true;
        let missingIngredients = [];
        recipe.forEach(ingredient => {
            if (!factory.rawMaterialsStored[ingredient] || factory.rawMaterialsStored[ingredient] < 1) {
                canProduce = false;
                missingIngredients.push(RAW_MATERIALS[ingredient].name);
            }
        });

        if (canProduce) {
            readyProducts.push(`${factory.name} (${factory.sector}) может произвести ${PRODUCTS[factory.productType].name}.`);
        } else if (missingIngredients.length > 0) {
            // Optional: Show what's missing for factories that can't produce
            // productsReadyInfo.innerHTML += `<p>${factory.name} (${factory.sector}) не может произвести ${PRODUCTS[factory.productType].name}. Не хватает: ${missingIngredients.join(', ')}</p>`;
        }
    });

    if (readyProducts.length > 0) {
        productsReadyInfo.innerHTML = `<p class="highlight">На заводах готовы продукты:</p><ul>${readyProducts.map(p => `<li>${p}</li>`).join('')}</ul>`;
        nextStageBtn.disabled = false; // Allow to proceed to sale stage
    } else {
        productsReadyInfo.innerHTML = '<p>На данный момент нет готовых продуктов на активных заводах.</p>';
        nextStageBtn.disabled = false; // Can still proceed if nothing to produce
    }
}


function populateProductSaleControls() {
    factoryToSellFromSelect.innerHTML = '';
    productToSellSelect.innerHTML = '';
    marketSectorToSellProductSelect.innerHTML = '';

    let factoriesWithProducts = [];
    game.player.ownedFactories.forEach(factory => {
        if (factory.isActive) {
            const recipe = PRODUCTS[factory.productType].recipe;
            let canProduce = true;
            recipe.forEach(ingredient => {
                if (!factory.rawMaterialsStored[ingredient] || factory.rawMaterialsStored[ingredient] < 1) {
                    canProduce = false;
                }
            });
            if (canProduce) {
                factoriesWithProducts.push(factory);
                const option = document.createElement('option');
                option.value = factory.id;
                option.textContent = factory.name;
                factoryToSellFromSelect.appendChild(option);
            }
        }
    });

    if (factoriesWithProducts.length === 0) {
        factoryToSellFromSelect.add(new Option('Нет заводов с готовыми продуктами', ''));
        sellProductBtn.disabled = true;
        productToSellSelect.disabled = true;
        marketSectorToSellProductSelect.disabled = true;
        return;
    }

    const selectedFactory = factoriesWithProducts.find(f => f.id === factoryToSellFromSelect.value);
    if (selectedFactory) {
        const option = document.createElement('option');
        option.value = selectedFactory.productType;
        option.textContent = PRODUCTS[selectedFactory.productType].name;
        productToSellSelect.appendChild(option);
    }

    for (let s = 1; s <= 4; s++) {
        const option = document.createElement('option');
        option.value = `sector${s}`;
        option.textContent = `Сектор ${s}`;
        marketSectorToSellProductSelect.appendChild(option);
    }

    sellProductBtn.disabled = false;
    productToSellSelect.disabled = false;
    marketSectorToSellProductSelect.disabled = false;
    updatePotentialProfitDisplay();
}

function updatePotentialProfitDisplay() {
    const factoryId = factoryToSellFromSelect.value;
    const productId = productToSellSelect.value;
    const targetSectorId = marketSectorToSellProductSelect.value;

    if (!factoryId || !productId || !targetSectorId) {
        potentialProfitInfo.textContent = '';
        return;
    }

    const product = PRODUCTS[productId];
    const factory = game.factories.find(f => f.id === factoryId);
    if (!product || !factory) {
        potentialProfitInfo.textContent = '';
        return;
    }

    const factorySector = factory.sector;
    const transportCosts = calculateProductTransportCost(productId, factorySector, targetSectorId);
    const salePrice = getProductSalePrice(productId, targetSectorId);
    const profit = salePrice - transportCosts;

    potentialProfitInfo.textContent = `Цена продажи: ${salePrice} фантов. Транспортные расходы: ${transportCosts} фантов. Потенциальная прибыль: ${profit} фантов.`;
}

// =========================================================================================
// ОСНОВНЫЕ ФУНКЦИИ ИГРЫ
// =========================================================================================

function initGame() {
    createGameEntities(); // Define all bases, factories, markets
    initializeQuotationCounters(); // Set initial market marker positions and prices

    game.player.money = 2000; // Starting capital
    Object.values(RAW_MATERIALS).forEach(rm => game.player.inventory[rm.id] = 0); // Initialize empty inventory

    game.currentPhase = 'preliminary';
    game.currentStage = 0;
    game.coreCycleCounter = 0;
    game.coreCycleRay = 0;

    logMessage('Игра началась! Выберите недвижимость для покупки в предварительной фазе.', 'highlight');
    updateUI();

    startGameBtn.classList.add('hidden'); // Hide start button
    preliminaryActionsDiv.classList.remove('hidden'); // Show preliminary actions
}

// --- Предварительная фаза ---
function buyPropertyPrelim() {
    const propertyType = propertyTypeSelectPrelim.value;
    const propertyId = availablePropertiesPrelim.value;

    let property;
    if (propertyType === 'base') {
        property = game.bases.find(b => b.id === propertyId);
    } else {
        property = game.factories.find(f => f.id === propertyId);
    }

    if (!property) {
        logMessage('Выберите действительное имущество.', 'error');
        return;
    }
    if (property.owner) {
        logMessage('Это имущество уже кому-то принадлежит!', 'error');
        return;
    }
    if (game.player.money < property.nominalCost) {
        logMessage('Недостаточно средств для покупки.', 'error');
        return;
    }

    game.player.money -= property.nominalCost;
    game.bank.money += property.nominalCost; // Bank gets the money
    property.owner = 'player1'; // Assign to player 1

    if (propertyType === 'base') {
        game.player.ownedBases.push(property);
        logMessage(`Куплена база ${property.name} за ${property.nominalCost} фантов.`, 'highlight');
    } else {
        game.player.ownedFactories.push(property);
        // Factories start as passive
        property.isActive = false;
        logMessage(`Куплен завод ${property.name} за ${property.nominalCost} фантов. Он пассивен.`, 'highlight');
    }

    updateUI();
}

function endPreliminaryPhase() {
    game.currentPhase = 'main';
    game.currentStage = 1; // Start main phase with Stage 1
    logMessage('Предварительная фаза завершена. Переход к Основной фазе, Стадия 1.', 'highlight');
    updateUI();
}

// --- Основная фаза: Управление стадиями и ходами ---

function nextStage() {
    if (game.currentPhase !== 'main') return;

    game.currentStage++;
    game.maxPurchasesThisStage = 0; // Reset for stage 5

    if (game.currentStage > 5) {
        logMessage('Все стадии текущего хода завершены. Теперь вы можете перемещать риски и завершить ход.', 'highlight');
        game.currentStage = 0; // Indicates end of stages for this turn, awaiting next turn button
        nextStageBtn.disabled = true;
        nextTurnBtn.disabled = false;
    } else {
        logMessage(`Переход к Стадии ${game.currentStage}.`, 'highlight');
        if (game.currentStage === 5) {
            game.maxPurchasesThisStage = 2; // Max 2 purchases in stage 5
        }
    }
    updateUI();
}

function nextTurn() {
    if (game.currentPhase !== 'main') return;
    if (game.currentStage !== 0) {
        logMessage('Вы должны завершить все стадии текущего хода, прежде чем перейти к следующему.', 'error');
        return;
    }

    game.coreCycleRay = (game.coreCycleRay + 1) % 12;

    if (game.coreCycleRay === 0) { // Full cycle, tax pause
        game.coreCycleCounter++;
        logMessage(`Цикл Ядра ${game.coreCycleCounter} завершен. Налоговая Пауза!`, 'warning');
        handleTaxPause();
    } else if ([3, 6, 9].includes(game.coreCycleRay)) { // Red rays, surprise pause
        logMessage(`Луч Ядра ${game.coreCycleRay} - Красный! Сюрпризная Пауза!`, 'warning');
        handleSurprisePause();
    }

    // Reset for next turn
    game.currentStage = 1;
    logMessage(`Начинается новый ход. Цикл Ядра: ${game.coreCycleCounter}, Луч: ${game.coreCycleRay}. Стадия 1.`, 'highlight');
    updateUI();
}

// --- Основная фаза: Стадия 1 (Добыча/Покупка сырья) ---
function extractRawMaterial() {
    const baseId = baseToExtractSelect.value;
    const rawMaterialTypeId = rawMaterialTypeExtractSelect.value;
    const quantity = parseInt(extractQuantityInput.value);

    if (quantity <= 0) {
        logMessage('Количество должно быть положительным.', 'error');
        return;
    }

    const base = game.player.ownedBases.find(b => b.id === baseId);
    if (!base) {
        logMessage('База не найдена или не принадлежит вам.', 'error');
        return;
    }

    const sectorData = game.quotationCounters[base.sector];
    const rmPricesArr = Object.values(RAW_MATERIALS).map(rm => rm.id);
    const rmPos = sectorData.rawMaterial.position;

    let costPerUnit = 0;
    const directMaterialId = rmPricesArr[rmPos];
    const cwMaterialId = rmPricesArr[(rmPos + 1) % rmPricesArr.length];
    const ccwMaterialId = rmPricesArr[(rmPos - 1 + rmPricesArr.length) % rmPricesArr.length];

    if (rawMaterialTypeId === directMaterialId) {
        costPerUnit = sectorData.rawMaterial.prices[rmPos];
    } else if (rawMaterialTypeId === cwMaterialId) {
        costPerUnit = sectorData.rawMaterial.prices[rmPos] * 2; // Double price
    } else if (rawMaterialTypeId === ccwMaterialId) {
        costPerUnit = Math.round(sectorData.rawMaterial.prices[rmPos] / 2); // Half price
    } else {
        logMessage(`Добыча ${RAW_MATERIALS[rawMaterialTypeId].name} сейчас невозможна на базах сектора ${base.sector.replace('sector', '')}.`, 'error');
        return;
    }

    const totalCost = costPerUnit * quantity;

    if (game.player.money < totalCost) {
        logMessage('Недостаточно средств для добычи сырья.', 'error');
        return;
    }
    if (game.bank.rawMaterials[rawMaterialTypeId] < quantity) {
        logMessage('В банке недостаточно этого сырья.', 'error');
        return;
    }

    game.player.money -= totalCost;
    game.bank.rawMaterials[rawMaterialTypeId] -= quantity;
    game.player.inventory[rawMaterialTypeId] = (game.player.inventory[rawMaterialTypeId] || 0) + quantity;

    logMessage(`Добыто ${quantity} ед. ${RAW_MATERIALS[rawMaterialTypeId].name} с базы ${base.name} за ${totalCost} фантов.`, 'highlight');
    updateUI();
}

function buyRawMaterialFromMarket() {
    const sectorId = marketSectorBuyRawSelect.value;
    const rawMaterialTypeId = rawMaterialTypeBuyRawSelect.value;
    const quantity = parseInt(buyRawQuantityInput.value);

    if (quantity <= 0) {
        logMessage('Количество должно быть положительным.', 'error');
        return;
    }

    // Simplified: "Free price" and "no transport costs" implies player can just buy from bank at some reasonable price or negotiate.
    // For single player, let's assume a default market price or nominal cost if not specified.
    // Rules say "Хозяин" карточек сырья может продавать их по СВОБОДНОЙ цене.
    // For simplicity, let's allow buying from Bank at 1.5x nominal cost from that sector's raw material current price.
    const sectorData = game.quotationCounters[sectorId];
    const rmPricesArr = Object.values(RAW_MATERIALS).map(rm => rm.id);
    const rmIndex = rmPricesArr.indexOf(rawMaterialTypeId);
    if (rmIndex === -1) {
        logMessage('Неверный тип сырья.', 'error');
        return;
    }

    const nominalPrice = sectorData.rawMaterial.prices[sectorData.rawMaterial.position]; // Using the marked nominal price
    let purchasePrice = nominalPrice * 1.5; // Example "free price" multiplier
    if (rmIndex === (sectorData.rawMaterial.position + 1) % rmPricesArr.length) purchasePrice = nominalPrice * 2.5;
    if (rmIndex === (sectorData.rawMaterial.position - 1 + rmPricesArr.length) % rmPricesArr.length) purchasePrice = nominalPrice * 0.75;

    const totalCost = Math.round(purchasePrice * quantity);

    if (game.player.money < totalCost) {
        logMessage('Недостаточно средств для покупки сырья на рынке.', 'error');
        return;
    }
    if (game.bank.rawMaterials[rawMaterialTypeId] < quantity) {
        logMessage('В банке недостаточно этого сырья для продажи на рынке.', 'error');
        return;
    }

    game.player.money -= totalCost;
    game.bank.rawMaterials[rawMaterialTypeId] -= quantity;
    game.player.inventory[rawMaterialTypeId] = (game.player.inventory[rawMaterialTypeId] || 0) + quantity;

    logMessage(`Куплено ${quantity} ед. ${RAW_MATERIALS[rawMaterialTypeId].name} на рынке ${sectorId.replace('sector', '')} за ${totalCost} фантов (без транспортных расходов).`, 'highlight');
    updateUI();
}


// --- Основная фаза: Стадия 2 (Транспортировка сырья) ---
function getSectorDistance(sectorA, sectorB) {
    const numA = parseInt(sectorA.replace('sector', ''));
    const numB = parseInt(sectorB.replace('sector', ''));
    if (numA === numB) return 'same';
    const diff = Math.abs(numA - numB);
    if (diff === 1 || diff === 3) return 'adjacent'; // 1-2, 2-3, 3-4, 4-1 (diff=3)
    return 'opposite'; // 1-3, 2-4
}

function calculateRawMaterialTransportCost(rawMaterialType, fromSector, toSector) {
    const distance = getSectorDistance(fromSector, toSector);
    if (distance === 'same') return 0;
    if (distance === 'adjacent') return TRANSPORT_TARIFFS_RAW[rawMaterialType].adjacent;
    if (distance === 'opposite') return TRANSPORT_TARIFFS_RAW[rawMaterialType].opposite;
    return 0; // Should not happen
}

function transportRawMaterial() {
    const rawMaterialTypeId = transportRawMaterialTypeSelect.value;
    const quantity = parseInt(transportRawQuantityInput.value);
    const fromLocationId = transportFromLocationSelect.value;
    const toLocationId = transportToLocationSelect.value;

    if (quantity <= 0) {
        logMessage('Количество должно быть положительным.', 'error');
        return;
    }
    if (!rawMaterialTypeId) {
        logMessage('Выберите тип сырья для транспортировки.', 'error');
        return;
    }
    if (!fromLocationId || !toLocationId) {
        logMessage('Выберите места отправления и назначения.', 'error');
        return;
    }

    let sourceQty = 0;
    let fromSector = null;
    let toSector = null;
    let fromName = '';
    let toName = '';

    // Determine source quantity and sector
    if (fromLocationId === 'inventory') {
        sourceQty = game.player.inventory[rawMaterialTypeId] || 0;
        fromSector = null; // Inventory is not in a specific sector for transport cost calculation
        fromName = 'инвентаря';
    } else if (fromLocationId.startsWith('market-')) {
        const marketSector = fromLocationId.split('-')[1];
        sourceQty = game.markets[marketSector].storedRawMaterials['player1']?.[rawMaterialTypeId] || 0;
        fromSector = marketSector;
        fromName = `рынка ${marketSector.replace('sector', '')}`;
    }

    if (sourceQty < quantity) {
        logMessage('Недостаточно сырья в выбранном источнике.', 'error');
        return;
    }

    // Determine destination sector
    if (toLocationId.startsWith('factory-')) {
        const factoryId = toLocationId.split('-')[1];
        const factory = game.factories.find(f => f.id === factoryId);
        if (!factory) { logMessage('Завод назначения не найден.', 'error'); return; }
        toSector = factory.sector;
        toName = `завод ${factory.name}`;
    } else if (toLocationId.startsWith('market-')) {
        toSector = toLocationId.split('-')[1];
        toName = `рынок ${toSector.replace('sector', '')}`;
    } else {
        logMessage('Неверное место назначения.', 'error');
        return;
    }

    // Calculate transport cost
    let totalTransportCost = 0;
    // If source is inventory, assume it's "at player's current location/context", 
    // so transport cost depends only on destination.
    // For simplicity, let's assume player's "current location" is their broker sector.
    // Or, more accurately, if raw materials are in inventory, they are 'unlocated' until transported.
    // The rules state: "If this market or factory is in the same sector as the raw material base, the player moves the raw material cards FOR FREE."
    // This implies that raw materials from *bases* have a 'source' sector.
    // For inventory materials (already 'owned'), the rules say: "He only pays for their transportation, since raw material cards are the player's property."
    // This means the source sector for existing inventory materials is ambiguous.
    // Let's simplify: if from inventory, assume 0 cost if to player's broker sector, otherwise adjacent/opposite relative to broker sector.
    // This requires a `game.player.brokerSector` to be meaningful.
    if (fromLocationId === 'inventory') {
        // If materials are in inventory, assume they are ready for transport *from* the player's 'home' sector (broker sector for this game)
        fromSector = game.player.brokerSector;
        totalTransportCost = calculateRawMaterialTransportCost(rawMaterialTypeId, fromSector, toSector) * quantity;
    } else { // From a market
        totalTransportCost = calculateRawMaterialTransportCost(rawMaterialTypeId, fromSector, toSector) * quantity;
    }


    if (game.player.money < totalTransportCost) {
        logMessage('Недостаточно средств для оплаты транспортировки.', 'error');
        return;
    }

    // Perform transaction
    game.player.money -= totalTransportCost;

    // Remove from source
    if (fromLocationId === 'inventory') {
        game.player.inventory[rawMaterialTypeId] -= quantity;
        if (game.player.inventory[rawMaterialTypeId] === 0) delete game.player.inventory[rawMaterialTypeId];
    } else if (fromLocationId.startsWith('market-')) {
        const marketSector = fromLocationId.split('-')[1];
        game.markets[marketSector].storedRawMaterials['player1'][rawMaterialTypeId] -= quantity;
        if (game.markets[marketSector].storedRawMaterials['player1'][rawMaterialTypeId] === 0) delete game.markets[marketSector].storedRawMaterials['player1'][rawMaterialTypeId];
    }

    // Add to destination
    if (toLocationId.startsWith('factory-')) {
        const factoryId = toLocationId.split('-')[1];
        const factory = game.factories.find(f => f.id === factoryId);
        const currentStored = (factory.rawMaterialsStored[rawMaterialTypeId] || 0);
        if (currentStored + quantity > MAX_CARDS_PER_CELL) {
            const transferable = MAX_CARDS_PER_CELL - currentStored;
            if (transferable > 0) {
                factory.rawMaterialsStored[rawMaterialTypeId] = MAX_CARDS_PER_CELL;
                const excess = quantity - transferable;
                // Return excess to player inventory or bank
                game.player.inventory[rawMaterialTypeId] = (game.player.inventory[rawMaterialTypeId] || 0) + excess; // Return to inventory
                logMessage(`На завод ${factory.name} перемещено ${transferable} ед. ${RAW_MATERIALS[rawMaterialTypeId].name}. ${excess} ед. излишка вернулись в ваш инвентарь.`, 'warning');
            } else {
                game.player.inventory[rawMaterialTypeId] = (game.player.inventory[rawMaterialTypeId] || 0) + quantity; // Return all to inventory
                logMessage(`На заводе ${factory.name} нет места для ${RAW_MATERIALS[rawMaterialTypeId].name}. Всё возвращено в ваш инвентарь.`, 'error');
            }
        } else {
            factory.rawMaterialsStored[rawMaterialTypeId] = currentStored + quantity;
            logMessage(`Перемещено ${quantity} ед. ${RAW_MATERIALS[rawMaterialTypeId].name} из ${fromName} на ${toName} за ${totalTransportCost} фантов.`, 'highlight');
        }

        // Activate factory if it was passive
        if (!factory.isActive) {
            factory.isActive = true;
            logMessage(`Завод ${factory.name} активирован.`, 'highlight');
        }
    } else if (toLocationId.startsWith('market-')) {
        const marketSector = toLocationId.split('-')[1];
        const market = game.markets[marketSector];
        market.storedRawMaterials['player1'] = market.storedRawMaterials['player1'] || {}; // Ensure player's market storage exists
        const currentStored = (market.storedRawMaterials['player1'][rawMaterialTypeId] || 0);
        if (currentStored + quantity > MAX_CARDS_PER_CELL) {
            const transferable = MAX_CARDS_PER_CELL - currentStored;
            if (transferable > 0) {
                market.storedRawMaterials['player1'][rawMaterialTypeId] = MAX_CARDS_PER_CELL;
                const excess = quantity - transferable;
                game.player.inventory[rawMaterialTypeId] = (game.player.inventory[rawMaterialTypeId] || 0) + excess;
                logMessage(`На рынок ${marketSector.replace('sector', '')} перемещено ${transferable} ед. ${RAW_MATERIALS[rawMaterialTypeId].name}. ${excess} ед. излишка вернулись в ваш инвентарь.`, 'warning');
            } else {
                game.player.inventory[rawMaterialTypeId] = (game.player.inventory[rawMaterialTypeId] || 0) + quantity;
                logMessage(`На рынке ${marketSector.replace('sector', '')} нет места для ${RAW_MATERIALS[rawMaterialTypeId].name}. Всё возвращено в ваш инвентарь.`, 'error');
            }
        } else {
            market.storedRawMaterials['player1'][rawMaterialTypeId] = currentStored + quantity;
            logMessage(`Перемещено ${quantity} ед. ${RAW_MATERIALS[rawMaterialTypeId].name} из ${fromName} на ${toName} за ${totalTransportCost} фантов.`, 'highlight');
        }
    }
    updateUI();
}


// --- Основная фаза: Стадия 3 (Производство продукта) ---
// This stage is mostly informational and a trigger for the next stage.
// Production itself is checked in Stage 4.
// `checkAndDisplayProductionReadiness()` is called in `updateUI` for this stage.


// --- Основная фаза: Стадия 4 (Транспортировка и продажа продукта) ---
function calculateProductTransportCost(productId, fromSector, toSector) {
    const distance = getSectorDistance(fromSector, toSector);
    if (distance === 'same') return 0; // Rules don't explicitly say 0 for products in same sector but implies it.
    if (distance === 'adjacent') return TRANSPORT_TARIFFS_PRODUCT[productId].adjacent;
    if (distance === 'opposite') return TRANSPORT_TARIFFS_PRODUCT[productId].opposite;
    return 0;
}

function getProductSalePrice(productId, targetSectorId) {
    const productData = Object.values(PRODUCTS).find(p => p.id === productId);
    if (!productData) return 0;
    const prodIndex = Object.values(PRODUCTS).indexOf(productData); // Find index to map to product1, product2 etc.
    const productMarker = game.quotationCounters[targetSectorId][`product${prodIndex + 1}`];
    return productMarker.prices[productMarker.position];
}

function sellProduct() {
    const factoryId = factoryToSellFromSelect.value;
    const productId = productToSellSelect.value;
    const targetMarketSectorId = marketSectorToSellProductSelect.value;

    if (!factoryId || !productId || !targetMarketSectorId) {
        logMessage('Выберите завод, продукт и рынок для продажи.', 'error');
        return;
    }

    const factory = game.factories.find(f => f.id === factoryId);
    if (!factory || factory.owner !== 'player1' || !factory.isActive) {
        logMessage('Недействительный завод или он не активен.', 'error');
        return;
    }

    const recipe = PRODUCTS[productId].recipe;
    let canProduce = true;
    let requiredRawMaterials = {}; // To store the quantity of each raw material required for one unit of product
    recipe.forEach(ingredient => {
        if (!factory.rawMaterialsStored[ingredient] || factory.rawMaterialsStored[ingredient] < 1) {
            canProduce = false;
        }
        requiredRawMaterials[ingredient] = (requiredRawMaterials[ingredient] || 0) + 1; // Count required quantity
    });

    if (!canProduce) {
        logMessage(`На заводе ${factory.name} недостаточно сырья для производства ${PRODUCTS[productId].name}.`, 'error');
        return;
    }

    const transportCosts = calculateProductTransportCost(productId, factory.sector, targetMarketSectorId);
    const salePrice = getProductSalePrice(productId, targetMarketSectorId);
    const netProfit = salePrice - transportCosts;

    if (game.player.money < transportCosts) {
        logMessage('Недостаточно средств для оплаты транспортных расходов.', 'error');
        return;
    }

    // Deduct raw materials from factory and return to bank
    recipe.forEach(ingredient => {
        factory.rawMaterialsStored[ingredient] -= requiredRawMaterials[ingredient];
        if (factory.rawMaterialsStored[ingredient] === 0) delete factory.rawMaterialsStored[ingredient];
        game.bank.rawMaterials[ingredient] = (game.bank.rawMaterials[ingredient] || 0) + requiredRawMaterials[ingredient];
    });

    // Pay transport costs and receive sale money
    game.player.money -= transportCosts;
    game.player.money += salePrice;

    logMessage(`Продан ${PRODUCTS[productId].name} с завода ${factory.name} на рынок ${targetMarketSectorId.replace('sector', '')}. Выручено ${salePrice} фантов, транспорт ${transportCosts}. Прибыль: ${netProfit} фантов.`, 'highlight');

    updateUI();
}


// --- Основная фаза: Стадия 5 (Дополнительное приобретение недвижимости) ---
function buyPropertyMain() {
    if (game.maxPurchasesThisStage <= 0) {
        logMessage('Вы исчерпали лимит покупок на этой стадии.', 'error');
        return;
    }

    const propertyType = propertyTypeSelectMain.value;
    const propertyId = availablePropertiesMain.value;

    let property;
    if (propertyType === 'base') {
        property = game.bases.find(b => b.id === propertyId);
    } else {
        property = game.factories.find(f => f.id === propertyId);
    }

    if (!property) {
        logMessage('Выберите действительное имущество.', 'error');
        return;
    }
    if (property.owner) {
        logMessage('Это имущество уже кому-то принадлежит!', 'error');
        return;
    }
    if (game.player.money < property.nominalCost) {
        logMessage('Недостаточно средств для покупки.', 'error');
        return;
    }

    game.player.money -= property.nominalCost;
    game.bank.money += property.nominalCost;
    property.owner = 'player1';

    if (propertyType === 'base') {
        game.player.ownedBases.push(property);
        logMessage(`Куплена база ${property.name} за ${property.nominalCost} фантов.`, 'highlight');
    } else {
        game.player.ownedFactories.push(property);
        property.isActive = false; // Factories start passive
        logMessage(`Куплен завод ${property.name} за ${property.nominalCost} фантов. Он пассивен.`, 'highlight');
    }

    game.maxPurchasesThisStage--;
    if (game.maxPurchasesThisStage === 0) {
        logMessage('Вы использовали все доступные покупки на этой стадии.', 'warning');
    }
    updateUI();
}

// --- Действия Маклера (Перемещение рисок) ---
function moveQuotationMarker(direction) { // 1 for CW, -1 for CCW
    const sectorId = brokerSectorSelect.value;
    const markerType = brokerMarkerTypeSelect.value; // rawMaterial, product1, product2 etc.

    const markerData = game.quotationCounters[sectorId][markerType];
    if (!markerData) {
        logMessage('Неверный тип риски или сектор.', 'error');
        return;
    }

    const numPrices = markerData.prices.length;
    let newPosition = markerData.position + direction;

    if (newPosition >= numPrices) { // Went past end, reverse direction
        newPosition = numPrices - 2; // Jump back two steps (current + one more step in reverse)
        if (newPosition < 0) newPosition = 0; // Clamp
        markerData.direction = -1;
        logMessage(`Риска ${markerType} в секторе ${sectorId.replace('sector', '')} достигла края и изменила направление.`, 'warning');
    } else if (newPosition < 0) { // Went past start, reverse direction
        newPosition = 1; // Jump forward two steps
        if (newPosition >= numPrices) newPosition = numPrices - 1; // Clamp
        markerData.direction = 1;
        logMessage(`Риска ${markerType} в секторе ${sectorId.replace('sector', '')} достигла начала и изменила направление.`, 'warning');
    }
    markerData.position = newPosition;

    logMessage(`Риска ${markerType} в секторе ${sectorId.replace('sector', '')} перемещена ${direction === 1 ? 'по часовой стрелке' : 'против часовой стрелки'} на позицию ${markerData.position}.`, 'highlight');
    updateUI();
}


// --- Спец. События ---
function handleSurprisePause() {
    const diceRoll = Math.floor(Math.random() * 6) + 1; // 1-6
    const activityType = diceRoll % 2 === 0 ? 'positive' : 'negative'; // Even = positive, Odd = negative

    const rawMaterialRoll = Math.floor(Math.random() * 6) + 1; // 1-6
    const affectedRawMaterialId = Object.values(RAW_MATERIALS)[rawMaterialRoll - 1].id;

    logMessage(`Бросок кубика: ${diceRoll}. Активность: ${activityType === 'positive' ? 'Позитивная' : 'Негативная'} для сырья ${RAW_MATERIALS[affectedRawMaterialId].name}.`, 'warning');

    if (activityType === 'negative') {
        logMessage(`Негативная активность: сырьё ${RAW_MATERIALS[affectedRawMaterialId].name} "погибает"!`, 'error');
        // Check player's factories and markets in the current broker sector (simplification)
        game.player.ownedFactories.forEach(factory => {
            if (factory.sector === game.player.brokerSector && factory.rawMaterialsStored[affectedRawMaterialId]) {
                const lostQty = factory.rawMaterialsStored[affectedRawMaterialId];
                factory.rawMaterialsStored[affectedRawMaterialId] = 0;
                game.bank.rawMaterials[affectedRawMaterialId] += lostQty;
                logMessage(`На заводе ${factory.name} потеряно ${lostQty} ед. ${RAW_MATERIALS[affectedRawMaterialId].name}.`, 'error');
            }
        });
        const marketStored = game.markets[game.player.brokerSector].storedRawMaterials['player1'];
        if (marketStored && marketStored[affectedRawMaterialId]) {
            const lostQty = marketStored[affectedRawMaterialId];
            marketStored[affectedRawMaterialId] = 0;
            game.bank.rawMaterials[affectedRawMaterialId] += lostQty;
            logMessage(`На рынке ${game.player.brokerSector.replace('sector', '')} потеряно ${lostQty} ед. ${RAW_MATERIALS[affectedRawMaterialId].name}.`, 'error');
        }
    } else { // Positive activity
        logMessage(`Позитивная активность: сырьё ${RAW_MATERIALS[affectedRawMaterialId].name} "регенерирует" вдвое!`, 'highlight');
        let totalAdded = 0;
        game.player.ownedFactories.forEach(factory => {
            if (factory.sector === game.player.brokerSector && factory.rawMaterialsStored[affectedRawMaterialId] > 0) {
                const currentQty = factory.rawMaterialsStored[affectedRawMaterialId];
                const needed = Math.min(currentQty, game.bank.rawMaterials[affectedRawMaterialId]); // Can't add more than bank has
                factory.rawMaterialsStored[affectedRawMaterialId] += needed;
                game.bank.rawMaterials[affectedRawMaterialId] -= needed;
                totalAdded += needed;
                logMessage(`На заводе ${factory.name} добавлено ${needed} ед. ${RAW_MATERIALS[affectedRawMaterialId].name}.`, 'highlight');
            }
        });
        const marketStored = game.markets[game.player.brokerSector].storedRawMaterials['player1'];
        if (marketStored && marketStored[affectedRawMaterialId] > 0) {
            const currentQty = marketStored[affectedRawMaterialId];
            const needed = Math.min(currentQty, game.bank.rawMaterials[affectedRawMaterialId]);
            marketStored[affectedRawMaterialId] += needed;
            game.bank.rawMaterials[affectedRawMaterialId] -= needed;
            totalAdded += needed;
            logMessage(`На рынке ${game.player.brokerSector.replace('sector', '')} добавлено ${needed} ед. ${RAW_MATERIALS[affectedRawMaterialId].name}.`, 'highlight');
        }
        if (totalAdded === 0) {
            logMessage(`Нет сырья ${RAW_MATERIALS[affectedRawMaterialId].name} в секторе ${game.player.brokerSector.replace('sector', '')} для регенерации.`, 'warning');
        }
    }
    updateUI();
}

function handleTaxPause() {
    let totalTaxes = 0;

    // Bases
    game.player.ownedBases.forEach(base => {
        totalTaxes += 10;
        logMessage(`Налог на базу ${base.name}: 10 фантов.`, 'normal');
    });

    // Factories
    game.player.ownedFactories.forEach(factory => {
        const factoryCostTax = factory.nominalCost * 0.10;
        totalTaxes += factoryCostTax;
        logMessage(`Налог на завод ${factory.name} (10% от стоимости): ${factoryCostTax} фантов.`, 'normal');

        if (factory.isActive) {
            Object.values(factory.rawMaterialsStored).forEach(qty => {
                totalTaxes += qty * 5; // 5 fants per raw material card
                logMessage(`Налог на сырьё в активном заводе ${factory.name}: ${qty * 5} фантов.`, 'normal');
            });
        } else { // Passive factory
            const idleEquipmentTax = factory.nominalCost * 0.20; // 20% for idle equipment
            totalTaxes += idleEquipmentTax;
            logMessage(`Налог на простой оборудования завода ${factory.name} (20% от стоимости): ${idleEquipmentTax} фантов.`, 'normal');
        }
    });

    logMessage(`Общая сумма налогов: ${totalTaxes} фантов.`, 'warning');

    if (game.player.money < totalTaxes) {
        logMessage('Недостаточно средств для уплаты налогов! Вы банкрот (упрощенно)!', 'error');
        // In a real game, this would trigger selling assets or game over.
        game.player.money = 0; // For now, just zero out money.
    } else {
        game.player.money -= totalTaxes;
        logMessage(`Налоги в размере ${totalTaxes} фантов уплачены.`, 'highlight');
    }
    updateUI();
}


// =========================================================================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// =========================================================================================

startGameBtn.addEventListener('click', initGame);
buyPropertyPrelimBtn.addEventListener('click', buyPropertyPrelim);
endPreliminaryPhaseBtn.addEventListener('click', endPreliminaryPhase);

nextStageBtn.addEventListener('click', nextStage);
nextTurnBtn.addEventListener('click', nextTurn);

// Stage 1
extractBtn.addEventListener('click', extractRawMaterial);
baseToExtractSelect.addEventListener('change', populateRawMaterialTypesForExtraction);
buyRawFromMarketBtn.addEventListener('click', buyRawMaterialFromMarket);

// Stage 2
transportRawBtn.addEventListener('click', transportRawMaterial);

// Stage 4
sellProductBtn.addEventListener('click', sellProduct);
factoryToSellFromSelect.addEventListener('change', populateProductSaleControls);
productToSellSelect.addEventListener('change', updatePotentialProfitDisplay);
marketSectorToSellProductSelect.addEventListener('change', updatePotentialProfitDisplay);


// Stage 5
buyPropertyMainBtn.addEventListener('click', buyPropertyMain);
propertyTypeSelectPrelim.addEventListener('change', () => populateAvailablePropertiesSelect(propertyTypeSelectPrelim, availablePropertiesPrelim, game.bases.filter(b => !b.owner), game.factories.filter(f => !f.owner)));
propertyTypeSelectMain.addEventListener('change', () => populateAvailablePropertiesSelect(propertyTypeSelectMain, availablePropertiesMain, game.bases.filter(b => !b.owner), game.factories.filter(f => !f.owner)));


// Broker actions
moveMarkerCwBtn.addEventListener('click', () => moveQuotationMarker(1));
moveMarkerCcwBtn.addEventListener('click', () => moveQuotationMarker(-1));

// Initial UI setup (before game starts)
document.addEventListener('DOMContentLoaded', () => {
    // Hide all action blocks initially, only start button visible
    [preliminaryActionsDiv, mainPhaseActionsDiv]
        .forEach(el => el.classList.add('hidden'));
    startGameBtn.classList.remove('hidden');

    // Create game entities once on load
    createGameEntities();
    initializeQuotationCounters(); // Ensure prices are set up for initial display
    updateQuotationTables(); // Show market info even before game starts
});

