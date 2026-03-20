
// === КОНСТАНТЫ ===
const HEX_SIZE = 50;
const GRID_COLS = 10;
const GRID_ROWS = 10;

// === МАТЕМАТИКА КВАДРАТНОЙ СЕТКИ ===

function getCellPosition(col, row) {
    const x = col * HEX_SIZE * 1.8 + HEX_SIZE;
    const y = row * HEX_SIZE * 1.8 + HEX_SIZE;
    return { x, y };
}

function getCellFromClick(x, y) {
    const col = Math.floor(x / (HEX_SIZE * 1.8));
    const row = Math.floor(y / (HEX_SIZE * 1.8));
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
        return { col, row };
    }
    return null;
}

// === РИСОВАНИЕ ===

function drawCell(ctx, col, row, color, emoji, isSelected = false) {
    const { x, y } = getCellPosition(col, row);
    const size = HEX_SIZE - 5;

    // Квадрат
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 8);
    
    // Заливка
    ctx.fillStyle = color || '#1a1a2e';
    ctx.fill();

    // Обводка
    if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15;
    } else if (emoji) {
        ctx.strokeStyle = '#335';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
    } else {
        ctx.strokeStyle = '#223';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Эмодзи
    if (emoji) {
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x + size/2, y + size/2);
    }
}

function drawGrid(ctx, cells, selectedCell) {
    // Фон
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка
    for (let col = 0; col < GRID_COLS; col++) {
        for (let row = 0; row < GRID_ROWS; row++) {
            const key = `${col},${row}`;
            const cell = cells[key];
            const isSelected = selectedCell && selectedCell.col === col && selectedCell.row === row;
            drawCell(ctx, col, row, cell?.color || null, cell?.emoji || null, isSelected);
        }
    }
}