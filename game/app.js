
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let cells = {};
let selectedCell = null;
let selectedEmoji = null;

const emojiColors = {
    '⚡': '#4af', '💎': '#d94a4a', '🏭': '#888', '🌱': '#4ad94a',
    '⭐': '#ffdd44', '💧': '#44adff', '🔥': '#ff6a4a', '❄️': '#aaddff',
    '🪐': '#d4a574', '🚀': '#f44', '👽': '#9f4ad4', '🤖': '#777',
    '💰': '#4ad94a', '🎯': '#f4a', '🔮': '#a4f', '🎲': '#888',
    '💡': '#ff4', '🎭': '#f88', '🌈': '#f88', '🔔': '#f4a'
};

function addEmoji(col, row, emoji) {
    cells[`${col},${row}`] = { col, row, emoji, color: emojiColors[emoji] || '#4af' };
    drawGrid(ctx, cells, selectedCell);
}

function deleteCell() {
    if (selectedCell) {
        delete cells[`${selectedCell.col},${selectedCell.row}`];
        selectedCell = null;
        document.getElementById('selected-info').style.display = 'none';
        drawGrid(ctx, cells, selectedCell);
    }
}

function clearAll() { cells = {}; selectedCell = null; document.getElementById('selected-info').style.display = 'none'; drawGrid(ctx, cells, selectedCell); }

function randomFill() {
    const emojis = Object.keys(emojiColors);
    for (let col = 0; col < GRID_COLS; col++) {
        for (let row = 0; row < GRID_ROWS; row++) {
            if (Math.random() > 0.5) addEmoji(col, row, emojis[Math.floor(Math.random() * emojis.length)]);
        }
    }
}

function changeEmoji() {
    if (selectedCell && selectedEmoji) {
        const cell = cells[`${selectedCell.col},${selectedCell.row}`];
        cell.emoji = selectedEmoji;
        cell.color = emojiColors[selectedEmoji];
        updateSelectedInfo();
        drawGrid(ctx, cells, selectedCell);
    }
}

function downloadImage() { const link = document.createElement('a'); link.download = 'grid.png'; link.href = canvas.toDataURL(); link.click(); }

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cell = getCellFromClick(e.clientX - rect.left, e.clientY - rect.top);
    const key = `${cell?.col},${cell?.row}`;

    if (!cell) { selectedCell = null; document.getElementById('selected-info').style.display = 'none'; drawGrid(ctx, cells, selectedCell); return; }

    if (cells[key]) { selectedCell = cell; updateSelectedInfo(); document.getElementById('selected-info').style.display = 'block'; }
    else if (selectedEmoji) { addEmoji(cell.col, cell.row, selectedEmoji); selectedCell = cell; updateSelectedInfo(); document.getElementById('selected-info').style.display = 'block'; }
    else { selectedCell = null; document.getElementById('selected-info').style.display = 'none'; }
    drawGrid(ctx, cells, selectedCell);
});

function updateSelectedInfo() {
    if (selectedCell) {
        const cell = cells[`${selectedCell.col},${selectedCell.row}`];
        document.getElementById('coords').textContent = `(${selectedCell.col}, ${selectedCell.row})`;
        document.getElementById('current-emoji').textContent = cell?.emoji || '-';
        document.getElementById('current-color').textContent = cell?.color || '-';
    }
}

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedEmoji = btn.dataset.emoji;
        if (selectedCell) { addEmoji(selectedCell.col, selectedCell.row, selectedEmoji); updateSelectedInfo(); }
    });
});

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; drawGrid(ctx, cells, selectedCell); }
window.addEventListener('resize', resize);
resize();