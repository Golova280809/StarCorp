
const map = document.getElementById('star-map');
const menu = document.getElementById('system-menu');
const overlay = document.getElementById('overlay');

let mapWidth = window.innerWidth;
let mapHeight = window.innerHeight;
let offsetX = 0;
let offsetY = 0;
let scale = 1;
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
    
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    
    // Галактика
    const galaxy = document.createElement('div');
    galaxy.className = 'milky-way';
    galaxy.style.left = centerX + 'px';
    galaxy.style.top = centerY + 'px';
    galaxy.style.transform = `translate(-50%, -50%) scale(${scale})`;
    galaxy.addEventListener('click', () => openMenu());
    map.appendChild(galaxy);
    
    // Звёзды вокруг
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'bg-star';
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 300;
        const x = centerX + Math.cos(angle) * dist * scale;
        const y = centerY + Math.sin(angle) * dist * scale;
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        star.style.width = (1 + Math.random() * 2) + 'px';
        star.style.height = star.style.width;
        star.style.opacity = 0.3 + Math.random() * 0.7;
        map.appendChild(star);
    }
}

// Зум колёсиком
map.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.3, Math.min(3, scale * delta));
    render();
});

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
    if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    }
});

map.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        offsetX += e.touches[0].clientX - lastX;
        offsetY += e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        render();
    }
});

map.addEventListener('touchend', () => isDragging = false);

function openMenu() {
    document.getElementById('menu-title').textContent = 'Млечный путь';
    document.getElementById('menu-info').textContent = 'Спиральная галактика | 100-400 млрд звёзд | Возраст: 13.6 млрд лет';
    menu.style.display = 'block';
    overlay.style.display = 'block';
}

function closeMenu() {
    menu.style.display = 'none';
    overlay.style.display = 'none';
}

overlay.addEventListener('click', closeMenu);

render();