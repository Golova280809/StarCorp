
// Галактический Концерн

let player = {
    money: 1000000,
    darkMatter: 500,
    planet: "Земля-7"
};

function updateUI() {
    const moneyEl = document.querySelector('.money');
    const darkEl = document.querySelector('.dark-matter');
    const planetEl = document.querySelector('.planet-name');
    
    if (moneyEl) moneyEl.textContent = '💰 ' + player.money.toLocaleString();
    if (darkEl) darkEl.textContent = '🟣 ' + player.darkMatter;
    if (planetEl) planetEl.textContent = '🌍 ' + player.planet;
}

// Вызывай updateUI() когда меняются ресурсы