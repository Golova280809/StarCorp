
const systems = [
    { id: 1, name: "Альфа Центавра", type: "yellow", x: 200, y: 300, info: "Население: 5.2 млрд" },
    { id: 2, name: "Сириус", type: "blue", x: 600, y: 200, info: "Население: 1.8 млрд" },
    { id: 3, name: "Вега", type: "white", x: 400, y: 500, info: "Население: 3.1 млрд" },
    { id: 4, name: "Антарес", type: "red", x: 150, y: 450, info: "Население: 0.8 млрд" },
    { id: 5, name: "Бетельгейзе", type: "orange", x: 700, y: 400, info: "Население: 2.3 млрд" }
];

const routes = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 1 }
];

const map = document.getElementById('star-map');
const menu = document.getElementById('system-menu');
const overlay = document.getElementById('overlay');

let mapWidth = window.innerWidth;
let mapHeight = window.innerHeight;

window.addEventListener('resize', () => {
    mapWidth = window.innerWidth;
    mapHeight = window.innerHeight;
});

function wrapPosition(x, y) {
    return {
        x: (x + mapWidth) % mapWidth,
        y: (y + mapHeight) % mapHeight
    };
}

function getStarSize(x, y) {
    const margin = 80;
    if (x < margin || x > mapWidth - margin || 
        y < margin || y > mapHeight - margin) {
        return 18;
    }
    return 32;
}

function drawRoutes() {
    routes.forEach(r => {
        const f = systems.find(s => s.id === r.from);
        const t = systems.find(s => s.id === r.to);
        
        const line = document.createElement('div');
        line.className = 'route';
        
        const dx = t.x - f.x;
        const dy = t.y - f.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        
        line.style.width = len + 'px';
        line.style.left = f.x + 15 + 'px';
        line.style.top = f.y + 15 + 'px';
        line.style.transform = `rotate(${ang}deg)`;
        
        map.appendChild(line);
    });
}

function drawStars() {
    systems.forEach(s => {
        const size = getStarSize(s.x, s.y);
        
        const star = document.createElement('div');
        star.className = `star star-${s.type}`;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = s.x + 'px';
        star.style.top = s.y + 'px';
        
        star.addEventListener('click', () => openMenu(s));
        map.appendChild(star);
    });
}

function openMenu(s) {
    document.getElementById('menu-title').textContent = s.name;
    document.getElementById('menu-info').textContent = s.info;
    menu.style.display = 'block';
    overlay.style.display = 'block';
}

function closeMenu() {
    menu.style.display = 'none';
    overlay.style.display = 'none';
}

overlay.addEventListener('click', closeMenu);

drawRoutes();
drawStars();