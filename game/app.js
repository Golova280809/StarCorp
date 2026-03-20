
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let cells = {};
let selected = null;
let selectedEmoji = null;

const emojiColors = {
    '⚡': '#4af', '💎': '#d94a4a', '🏭': '#888', '🌱': '#4ad94a',
    '⭐': '#ffdd44', '💧': '#44adff', '🔥': '#ff6a4a', '❄️': '#aaddff',
    '🪐': '#d4a574', '🚀': '#f44', '👽': '#9f4ad4', '🤖': '#777',
    '💰': '#4ad94a', '🎯': '#f4a', '🔮': '#a4f', '🎲': '#888',
    '💡': '#ff4', '🎭': '#f88', '🌈': '#f88', '🔔': '#f4a'
};

function addCell(col, row, emoji) {
    cells[`${col},${row}`] = { emoji, color: emojiColors[emoji] || '#4af' };
    drawGrid(ctx, cells, selected);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor((x - 50) / (CELL_SIZE + 10));
    const row = Math.floor((y - 50) / (CELL_SIZE + 10));
    
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        selected = { col, row };
        if (selectedEmoji) addCell(col, row, selectedEmoji);
        updateSelectedInfo();
        document.getElementById('selected-info').style.display = 'block';
    } else {
        selected = null;
        document.getElementById('selected-info').style.display = 'none';
    }
    drawGrid(ctx, cells, selected);
});

function updateSelectedInfo() {
    if (selected) {
        const cell = cells[`${selected.col},${selected.row}`];
        document.getElementById('coords').textContent = `(${selected.col}, ${selected.row})`;
        document.getElementById('current-emoji').textContent = cell?.emoji || '-';
        document.getElementById('current-color').textContent = cell?.color || '-';
    }
}

function deleteCell() {
    if (selected) { delete cells[`${selected.col},${selected.row}`]; selected = null; document.getElementById('selected-info').style.display = 'none'; drawGrid(ctx, cells, selected); }
}

function clearAll() { cells = {}; selected = null; document.getElementById('selected-info').style.display = 'none'; drawGrid(ctx, cells, selected); }

function randomFill() {
    const emojis = Object.keys(emojiColors);
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
            if (Math.random() > 0.5) addCell(col, row, emojis[Math.floor(Math.random() * emojis.length)]);
        }
    }
}

function downloadImage() { const link = document.createElement('a'); link.download = 'map.png'; link.href = canvas.toDataURL(); link.click(); }

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedEmoji = btn.dataset.emoji;
        if (selected) { addCell(selected.col, selected.row, selectedEmoji); updateSelectedInfo(); }
    });
});

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; drawGrid(ctx, cells, selected); }
window.addEventListener('resize', resize);
resize();