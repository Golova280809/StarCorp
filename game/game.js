// Глобальное состояние
window.game = {
    cycle: 1,
    ray: 0,
    auto: false,
    players: {
        user: { money: 2000, lvl: 1, xp: 0, properties: [], inv: 0 },
        enemy: { money: 2000, lvl: 1, xp: 0, properties: [], inv: 0 }
    }
};

// Инициализация
function init() {
    console.log("Игра запущена");
    updateUI();
    setInterval(gameTick, 1500); // Скорость игры
}

function gameTick() {
    // Движение луча
    window.game.ray = (window.game.ray + 30) % 360;
    if (window.game.ray === 0) {
        window.game.cycle++;
        log("system", `Начался цикл ${window.game.cycle}`);
    }

    // Ход моего AI (Конкурент)
    aiLogic('enemy');

    // Ход вашего AI (если включен)
    if (window.game.auto) {
        aiLogic('user');
    }

    updateUI();
}

// Логика ИИ (общая для обоих)
function aiLogic(role) {
    const p = window.game.players[role];

    // 1. Продать, если есть груз
    if (p.inv > 0) {
        const price = 200 + (p.lvl * 10);
        p.money += price;
        p.inv--;
        addXP(role, 50);
        log(role, `Продал товар: +${price}₮`);
    } 
    // 2. Купить базу, если много денег
    else if (p.money >= 1200 && p.properties.length < 5) {
        p.money -= 1000;
        const sector = Math.floor(Math.random() * 4) + 1;
        p.properties.push(sector);
        addXP(role, 100);
        log(role, `Купил базу в S${sector}`);
    } 
    // 3. Добыть, если есть хоть одна база
    else if (p.properties.length > 0) {
        if (Math.random() > 0.4) {
            p.inv++;
            log(role, `Успешная добыча ресурса`);
        }
    }
}

// Ручные действия (кнопки)
window.manualAction = function(type) {
    const p = window.game.players.user;
    
    if (type === 'buy') {
        if (p.money >= 1000) {
            p.money -= 1000;
            const sector = Math.floor(Math.random() * 4) + 1;
            p.properties.push(sector);
            addXP('user', 100);
            log('user', `Вы купили базу в S${sector}`);
        } else {
            log('user', "Недостаточно денег!");
        }
    }
    
    if (type === 'work') {
        if (p.properties.length > 0) {
            p.inv++;
            log('user', "Вы добыли ресурс");
        } else {
            log('user', "Сначала купите базу!");
        }
    }
    
    if (type === 'sell') {
        if (p.inv > 0) {
            const price = 200 + (p.lvl * 10);
            p.money += price;
            p.inv--;
            addXP('user', 50);
            log('user', `Вы продали товар за ${price}₮`);
        } else {
            log('user', "Нечего продавать!");
        }
    }
    updateUI();
};

window.toggleAI = function() {
    window.game.auto = !window.game.auto;
    const btn = document.getElementById('ai-toggle-btn');
    btn.textContent = window.game.auto ? "🤖 ВЫКЛЮЧИТЬ АВТОПИЛОТ" : "🤖 ВКЛЮЧИТЬ АВТОПИЛОТ";
    btn.style.background = window.game.auto ? "#ff0055" : "#00d2ff";
};

function addXP(role, amt) {
    const p = window.game.players[role];
    p.xp += amt;
    if (p.xp >= 500) {
        p.lvl++;
        p.xp = 0;
        log(role, `УРОВЕНЬ ПОВЫШЕН: ${p.lvl}`);
    }
}

function updateUI() {
    const p = window.game.players.user;
    const e = window.game.players.enemy;

    // Данные игрока
    document.getElementById('p-money').textContent = `${Math.floor(p.money)}₮`;
    document.getElementById('p-lvl').textContent = p.lvl;
    document.getElementById('p-inv').textContent = p.inv;

    // Данные врага
    document.getElementById('e-money').textContent = `${Math.floor(e.money)}₮`;
    document.getElementById('e-lvl').textContent = e.lvl;
    document.getElementById('e-inv').textContent = e.inv;

    // Карта
    document.getElementById('ray').style.transform = `rotate(${window.game.ray}deg)`;
    document.getElementById('cycle-num').textContent = window.game.cycle;

    // Базы на секторах
    for (let i = 1; i <= 4; i++) {
        const sectorDiv = document.querySelector(`#s${i} .units`);
        let units = "";
        p.properties.forEach(sec => { if(sec === i) units += "🟦"; });
        e.properties.forEach(sec => { if(sec === i) units += "🟥"; });
        sectorDiv.textContent = units;
    }
}

function log(role, msg) {
    const logDiv = document.getElementById('mini-log');
    let prefix = role === 'user' ? "👉 " : "🤖 ";
    if (role === 'system') prefix = "⚙️ ";
    logDiv.textContent = prefix + msg;
}

window.onload = init;