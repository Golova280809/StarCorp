
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let hexes = {};
let selectedHex = null;
let selectedEmoji = null;

const emojiColors = {
    '⚡': '#4af', '💎': '#d94a4a', '🏭': '#888', '🌱': '#4ad94a',
    '⭐': '#ffdd44', '💧': '#44adff', '🔥': '#ff6a4a', '❄️': '#aaddff',
    '🪐': '#d4a574', '🚀': '#f44', '👽': '#9f4ad4', '🤖': '#777',
    '💰': '#4ad94a', '🎯': '#f4a', '🔮': '#a4f', '🎲': '#888',
    '💡': '#ff4', '🎭': '#f88', '🌈': '#f88', '🔔': '#f4a'
};

function addEmoji(q, r, emoji) {
    hexes[`${q},${r}`] = { q, r, emoji, color: emojiColors[emoji] || '#4af' };
    drawGrid(ctx, hexes, selectedHex);
}

function deleteHex() {
    if (selectedHex) {
        delete hexes[`${selectedHex.q},${selectedHex.r}`];
        selectedHex = null;
        document.getElementById('selected-info').style.display = 'none';
        drawGrid(ctx, hexes, selectedHex);
    }
}

function clearAll() {
    hexes = {};
    selectedHex = null;
    document.getElementById('selected-info').style.display = 'none';
    drawGrid(ctx, hexes, selectedHex);
}

function randomFill() {
    const emojis = Object.keys(emojiColors);
    for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
        for (let r = Math.max(-GRID_RADIUS, -q - GRID_RADIUS); r <= Math.min(GRID_RADIUS, -q + GRID_RADIUS); r++) {
            if (Math.random() > 0.5) addEmoji(q, r, emojis[Math.floor(Math.random() * emojis.length)]);
        }
    }
}

function changeEmoji() {
    if (selectedHex && selectedEmoji) {
        const hex = hexes[`${selectedHex.q},${selectedHex.r}`];
        hex.emoji = selectedEmoji;
        hex.color = emojiColors[selectedEmoji];
        updateSelectedInfo();
        drawGrid(ctx, hexes, selectedHex);
    }
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'hex-grid.png';
    link.href = canvas.toDataURL();
    link.click();
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const hex = pixelToHex(e.clientX - rect.left - canvas.width / 2, e.clientY - rect.top - canvas.height / 2);
    const key = `${hex.q},${hex.r}`;

    if (!isInGrid(hex.q, hex.r)) {
        selectedHex = null;
        document.getElementById('selected-info').style.display = 'none';
        drawGrid(ctx, hexes, selectedHex);
        return;
    }

    if (hexes[key]) {
        selectedHex = hex;
        updateSelectedInfo();
        document.getElementById('selected-info').style.display = 'block';
    } else if (selectedEmoji) {
        addEmoji(hex.q, hex.r, selectedEmoji);
        selectedHex = hex;
        updateSelectedInfo();
        document.getElementById('selected-info').style.display = 'block';
    } else {
        selectedHex = null;
        document.getElementById('selected-info').style.display = 'none';
    }
    drawGrid(ctx, hexes, selectedHex);
});

function updateSelectedInfo() {
    if (selectedHex) {
        const hex = hexes[`${selectedHex.q},${selectedHex.r}`];
        document.getElementById('coords').textContent = `(${selectedHex.q}, ${selectedHex.r})`;
        document.getElementById('current-emoji').textContent = hex?.emoji || '-';
        document.getElementById('current-color').textContent = hex?.color || '-';
    }
}

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedEmoji = btn.dataset.emoji;
        if (selectedHex) { addEmoji(selectedHex.q, selectedHex.r, selectedEmoji); updateSelectedInfo(); }
    });
});

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; drawGrid(ctx, hexes, selectedHex); }
window.addEventListener('resize', resize);
resize();