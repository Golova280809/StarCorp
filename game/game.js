const RAW = ["💎", "✨", "⚡", "🌌"];

let game = {
    cycle: 1,
    ray: 0,
    auto: false,
    interval: null
};

let players = {
    user: { money: 2000, lvl: 1, xp: 0, properties: [], inv: 0 },
    enemy: { money: 2000, lvl: 1, xp: 0, properties: [], inv: 0 }
};

function init() {
    updateUI();
    // Запуск цикла ядра (автоматический ход времени)
    game.interval = setInterval(gameTick, 2000);
}

function gameTick() {
    game.ray = (game.ray + 30) % 360;
    if (game.ray === 0) game.cycle++;
    
    // Мой ход (AI Конкурент)
    aiDecision('enemy');
    
    // Ваш ход (если включен автопилот)
    if (game.auto) aiDecision('user');
    
    updateUI();
}

function aiDecision(role) {
    const p = players[role];
    
    // Логика AI:
    // 1. Если есть товар -> Продать
    if (p.inv > 0) {
        const income = 150 + (p.lvl * 20);
        p.money += income;
        p.inv--;
        log(role, Продал товар за ${income}₮);
        addXP(role, 40);
    } 
    // 2. Если много денег -> Купить базу
    else if (p.money > 1000) {
        p.money -= 1000;
        const sector = Math.floor(Math.random() * 4) + 1;
        p.properties.push(sector);
        log(role, Купил базу в секторе S${sector});
        addXP(role, 100);
    }
    // 3. Если есть база -> Добыть
    else if (p.properties.length > 0) {
        if (Math.random() > 0.3) {
            p.inv++;
            log(role, Добыча ресурсов успешна);
        }
    }
}

function addXP(role, amt) {
    players[role].xp += amt;
    if (players[role].xp >= 500) {
        players[role].lvl++;
        players[role].xp = 0;
        log(role, УРОВЕНЬ ПОВЫШЕН До ${players[role].lvl}!);
    }
}

function showTab(type) {
    const zone = document.getElementById('action-zone');
    if (type === 'buy') {
        zone.innerHTML = <button onclick="manualAction('buy')" class="btn-ai">КУПИТЬ БАЗУ (1000₮)</button>;
    } else if (type === 'work') {
        zone.innerHTML = <button onclick="manualAction('work')" class="btn-ai">ДОБЫТЬ РЕСУРС</button>;
    } else if (type === 'sell') {
        zone.innerHTML = <button onclick="manualAction('sell')" class="btn-ai">ПРОДАТЬ ВСЁ</button>;
    }
}

function manualAction(type) {
    const p = players.user;
    if (type === 'buy' && p.money >= 1000) {
        p.money -= 1000;
        p.properties.push(1);
        addXP('user', 100);
        log('user', 'Вы купили базу');
    } else if (type === 'work' && p.properties.length > 0) {
        p.inv++;
        log('user', 'Вы добыли ресурс');
    } else if (type === 'sell' && p.inv > 0) {
        p.money += 200;
        p.inv--;
        addXP('user', 50);
        log('user', 'Вы продали товар');
    }
    updateUI();
}

document.getElementById('ai-toggle').onclick = () => {
    game.auto = !game.auto;
    document.getElementById('ai-toggle').textContent = game.auto ? "🤖 ВЫКЛЮЧИТЬ АВТО" : "🤖 ВКЛЮЧИТЬ АВТО";
};

function updateUI() {
    // Деньги и уровни
    document.getElementById('p-money').textContent = ${Math.floor(players.user.money)}₮;
    document.getElementById('e-money').textContent = ${Math.floor(players.enemy.money)}₮;
    document.getElementById('p-lvl').textContent = players.user.lvl;
    document.getElementById('e-lvl').textContent = players.enemy.lvl;
    
    // Карта и луч
    document.getElementById('ray').style.transform = rotate(${game.ray}deg);
    document.getElementById('cycle-num').textContent = game.cycle;
    
    // Отрисовка баз на карте
    [1,2,3,4].forEach(i => {
        const s = document.querySelector(#s${i} .units);
        let content = "";
        players.user.properties.forEach(prop => { if(prop === i) content += "🟦"; });
        players.enemy.properties.forEach(prop => { if(prop === i) content += "🟥"; });
        s.textContent = content;
    });
}

function log(role, msg) {
    const text = role === 'user' ? [ВЫ]: ${msg} : [AI]: ${msg};
    document.getElementById('mini-log').textContent = text;
}

window.onload = init;
forEach(prop => { if(prop === i) content += "🟦"; });
        players.enemy.properties.forEach(prop => { if(prop === i) content += "🟥"; });
        s.textContent = content;
    });
}

function log(role, msg) {
    const text = role === 'user' ? `[ВЫ]: ${msg}` : `[AI]: ${msg}`;
    document.getElementById('mini-log').textContent = text;
}

window.onload = init;