
// Конфигурация ресурсов
const RAW = ["💎", "✨", "⚡", "🌌"];
const PROD = ["👑", "🔋", "🧪"];

let state = {
    player: {
        money: 2000,
        level: 1,
        xp: 0,
        stats: { tech: 5, neg: 5, log: 5, luck: 5 },
        inventory: {},
        properties: []
    },
    game: {
        cycle: 0,
        ray: 0,
        auto: false,
        prices: {} // Будет заполнено
    }
};

// --- ИНИЦИАЛИЗАЦИЯ ---
function init() {
    createSectors();
    updateUI();
    log("Система инициализирована. Ожидание команд CEO...");
}

function createSectors() {
    const grid = document.getElementById('sectors-grid');
    for (let i = 1; i <= 4; i++) {
        const div = document.createElement('div');
        div.className = 'sector';
        div.id = `sector-${i}`;
        div.innerHTML = `<b>СЕКТОР ${i}</b><div class="content"></div>`;
        grid.appendChild(div);
        
        // Генерация цен для сектора
        state.game.prices[i] = {
            buy: 40 + Math.random() * 20,
            sell: 100 + Math.random() * 50
        };
    }
}

// --- RPG СИСТЕМА ---
function addXP(amount) {
    state.player.xp += amount;
    if (state.player.xp >= state.player.level * 100) {
        state.player.level++;
        state.player.xp = 0;
        levelUp();
    }
    updateUI();
}

function levelUp() {
    // Авто-прокачка случайного навыка
    const s = Object.keys(state.player.stats);
    const chosen = s[Math.floor(Math.random() * s.length)];
    state.player.stats[chosen] += 2;
    log(`УРОВЕНЬ ПОВЫШЕН! Навык ${chosen} улучшен.`, "green");
}

// --- ИИ ЛОГИКА (АВТОПИЛОТ) ---
let aiInterval;
document.getElementById('ai-toggle-btn').addEventListener('click', () => {
    state.game.auto = !state.game.auto;
    const btn = document.getElementById('ai-toggle-btn');
    const status = document.getElementById('ai-status');
    
    if (state.game.auto) {
        btn.textContent = "ВЫКЛЮЧИТЬ АВТОПИЛОТ";
        status.textContent = "Статус: АКТИВЕН";
        aiInterval = setInterval(aiTurn, 1500);
    } else {
        btn.textContent = "ЗАПУСТИТЬ АВТОПИЛОТ";
        status.textContent = "Статус: ОЖИДАНИЕ";
        clearInterval(aiInterval);
    }
});

function aiTurn() {
    // Простая иерархия решений ИИ:
    // 1. Если мало денег и есть товар -> Продать
    // 2. Если есть деньги и нет баз -> Купить базу
    // 3. Если есть база -> Добыть ресурс
    // 4. Закончить ход
    
    const p = state.player;
    
    // 1. Попытка продать
    if (Object.keys(p.inventory).length > 0) {
        sellDecision();
    } 
    // 2. Покупка недвижимости
    else if (p.money > 800 && p.properties.length < 3) {
        buyProperty();
    }
    // 3. Добыча
    else if (p.properties.length > 0) {
        extractResource();
    }
    
    nextTick();
}

function buyProperty() {
    const cost = 1000 - (state.player.stats.neg * 10); // Скидка за переговоры
    if (state.player.money >= cost) {
        state.player.money -= cost;
        const id = state.player.properties.length + 1;
        state.player.properties.push({ id, sector: Math.floor(Math.random()*4)+1 });
        log(`ИИ: Куплена база #${id} за ${cost}₮`, "blue");
        addXP(30);
    }
}

function extractResource() {
    const chance = 0.5 + (state.player.stats.luck * 0.02);
    if (Math.random() < chance) {
        const res = RAW[Math.floor(Math.random() * RAW.length)];
        state.player.inventory[res] = (state.player.inventory[res] || 0) + 1;
        log(`ИИ: Добыто сырье ${res}`);
    } else {
        log("ИИ: Ошибка добычи - нестабильность ядра", "red");
    }
}

function sellDecision() {
    const res = Object.keys(state.player.inventory)[0];
    const price = Math.floor(state.game.prices[1].sell + (state.player.stats.tech * 5));
    state.player.money += price;
    delete state.player.inventory[res];
    log(`ИИ: Продано ${res} за ${price}₮`, "green");
    addXP(50);
}

// --- СИСТЕМА ХОДОВ ---
function nextTick() {
    state.game.ray = (state.game.ray + 30) % 360;
    document.getElementById('ray-pointer').style.transform = `rotate(${state.game.ray}deg)`;
    
    if (state.game.ray === 0) {
        state.game.cycle++;
        triggerRandomEvent();
    }
    updateUI();
}

function triggerRandomEvent() {
    const events = [
        { t: "Солнечная вспышка! Налоги удвоены.", effect: () => state.player.money -= 200 },
        { t: "Технологический прорыв! +XP.", effect: () => addXP(100) },
        { t: "Пиратский рейд! Потеря части инвентаря.", effect: () => state.player.inventory = {} }
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    
    document.getElementById('event-box').classList.remove('hidden');
    document.getElementById('event-text').textContent = ev.t;
    ev.effect();
}

function closeEvent() {
    document.getElementById('event-box').classList.add('hidden');
}

// --- UI ---
function updateUI() {
    document.getElementById('money-val').textContent = Math.floor(state.player.money);
    document.getElementById('char-level').textContent = state.player.level;
    document.getElementById('xp-fill').style.width = `${state.player.xp / (state.player.level)}%`;
    document.getElementById('cycle-val').textContent = state.game.cycle;
    
    document.getElementById('stat-tech').textContent = state.player.stats.tech;
    document.getElementById('stat-neg').textContent = state.player.stats.neg;
    document.getElementById('stat-log').textContent = state.player.stats.log;
    document.getElementById('stat-luck').textContent = state.player.stats.luck;

    // Отрисовка инвентаря на секторах (визуализация)
    for (let i = 1; i <= 4; i++) {
        const sector = document.querySelector(`#sector-${i} .content`);
        sector.innerHTML = state.player.properties.filter(p => p.sector === i).map(() => '🏠').join(' ');
        if (i === 1) sector.innerHTML += "<br>" + Object.keys(state.player.inventory).join(' ');
    }
}

function log(msg, color = "") {
    const l = document.getElementById('game-log');
    const div = document.createElement('div');
    div.className = 'log-entry';
    if (color) div.style.color = color;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    l.prepend(div);
}

window.onload = init;
