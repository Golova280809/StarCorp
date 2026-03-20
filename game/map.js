
const mapEl = document.getElementById('game-map');
const menu = document.getElementById('hex-menu');
const overlay = document.getElementById('overlay');

const RESOLUTION = 4;
const CENTER_H3 = h3.geoToH3(55.7558, 37.6173, RESOLUTION);

let mapWidth = window.innerWidth;
let mapHeight = window.innerHeight;
let offsetX = 0;
let offsetY = 0;
let scale = 1;
let isDragging = false;
let lastX, lastY;
let hexagons = [];
let territories = {};

window.addEventListener('resize', () => {
    mapWidth = window.innerWidth;
    mapHeight = window.innerHeight;
});
function generateHexagons() {
    const ring = h3.kRing(CENTER_H3, 8);
    hexagons = ring.map(h3Index => {
        const [lat, lng] = h3.h3ToGeo(h3Index);
        return { h3Index, lat, lng };
    });
}

function latLngToPixel(lat, lng) {
    const centerLat = 55.7558;
    const centerLng = 37.6173;
    const scaleFactor = 3000 * scale;
    
    const x = mapWidth / 2 + (lng - centerLng) * Math.cos(centerLat * Math.PI / 180) * scaleFactor + offsetX;
    const y = mapHeight / 2 + (centerLat - lat) * scaleFactor + offsetY;
    
    return { x, y };
}
function render() {
    mapEl.innerHTML = '';
    
    hexagons.forEach(hex => {
        const { x, y } = latLngToPixel(hex.lat, hex.lng);
        
        const hexEl = document.createElement('div');
        hexEl.className = 'hex';
        
        const size = 30 * scale;
        hexEl.style.width = size + 'px';
        hexEl.style.height = size + 'px';
        hexEl.style.left = x + 'px';
        hexEl.style.top = y + 'px';
        
        const territory = territories[hex.h3Index];
        if (territory) {
            hexEl.classList.add(`owner-${territory.owner}`);
        }
        
        hexEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenu(hex);
        });
        
        mapEl.appendChild(hexEl);
    });
}
// Зум колёсиком
mapEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.3, Math.min(3, scale * delta));
    render();
});

// Мышь
mapEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

mapEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offsetX += e.clientX - lastX;
    offsetY += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    render();
});

mapEl.addEventListener('mouseup', () => isDragging = false);
mapEl.addEventListener('mouseleave', () => isDragging = false);

// Тач
let initialDistance = 0;
let initialScale = 1;

mapEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = scale;
    }
});

mapEl.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
        offsetX += e.touches[0].clientX - lastX;
        offsetY += e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        scale = Math.max(0.3, Math.min(3, initialScale * (distance / initialDistance)));
    }
    
    render();
});

mapEl.addEventListener('touchend', () => isDragging = false);
function openMenu(hex) {
    document.getElementById('menu-title').textContent = 'Гексан ' + hex.h3Index.slice(-6);
    document.getElementById('menu-info').textContent = `Ш: ${hex.lat.toFixed(4)}, Д: ${hex.lng.toFixed(4)}`;
    menu.style.display = 'block';
    overlay.style.display = 'block';
}

function closeMenu() {
    menu.style.display = 'none';
    overlay.style.display = 'none';
}

overlay.addEventListener('click', closeMenu);

generateHexagons();
render();