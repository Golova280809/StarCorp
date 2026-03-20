
const galaxy = {
    name: "Млечный путь",
    type: "spiral",
    x: 0,
    y: 0,
    info: "Спиральная галактика | 100-400 млрд звёзд | Возраст: 13.6 млрд лет"
};

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
    
    const screenX = wrapCoord(galaxy.x + offsetX, mapWidth);
    const screenY = wrapCoord(galaxy.y + offsetY, mapHeight);
    
    const g = document.createElement('div');
    g.className = 'galaxy';
    g.style.left = screenX + 'px';
    g.style.top = screenY + 'px';
    
    g.addEventListener('click', () => openMenu(galaxy));
    map.appendChild(g);
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