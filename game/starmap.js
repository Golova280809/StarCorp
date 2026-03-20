
const systems = [
    { id: 1, name: "Альфа Центавра", type: "yellow", x: 200, y: 300, info: "Население: 5.2 млрд" },
    { id: 2, name: "Сириус", type: "blue", x: 600, y: 200, info: "Население: 1.8 млрд" },
    { id: 3, name: "Вега", type: "white", x: 1000, y: 500, info: "Население: 3.1 млрд" },
    { id: 4, name: "Антарес", type: "red", x: 150, y: 450, info: "Население: 0.8 млрд" },
    { id: 5, name: "Бетельгейзе", type: "orange", x: 700, y: 400, info: "Население: 2.3 млрд" }
];

const map = document.getElementById('star-map');
const menu = document.getElementById('system-menu');
const overlay = document.getElementById('overlay');

let mapWidth = window.innerWidth;
let mapHeight = window.innerHeight;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX, lastY;

window.addEventListener('resize', () => {
    mapWidth = window.innerWidth;
    mapHeight = window.innerHeight;
});

function wrapCoord(val, max) {
    return ((val % max) + max) % max;
}

function render() {
    map.innerHTML = '';
    
    systems.forEach(s => {
        const screenX = wrapCoord(s.x + offsetX, mapWidth);
        const screenY = wrapCoord(s.y + offsetY, mapHeight);
        
        const star = document.createElement('div');
        star.className = `star star-${s.type}`;
        star.style.width = '32px';
        star.style.height = '32px';
        star.style.left = screenX + 'px';
        star.style.top = screenY + 'px';
        
        star.addEventListener('click', () => openMenu(s));
        map.appendChild(star);
    });
}

// Перетаскивание
map.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

map.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offsetX += e.clientX - lastX;
    offsetY += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    render();
});

map.addEventListener('mouseup', () => isDragging = false);
map.addEventListener('mouseleave', () => isDragging = false);

// Тач
map.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
});

map.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    offsetX += e.touches[0].clientX - lastX;
    offsetY += e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    render();
});

map.addEventListener('touchend', () => isDragging = false);

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

render();