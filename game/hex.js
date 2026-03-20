
const CELL_SIZE = 60;
const COLS = 8;
const ROWS = 8;

function getPosition(col, row) {
    const x = 50 + col * (CELL_SIZE + 10);
    const y = 50 + row * (CELL_SIZE + 10);
    return { x, y };
}

function drawCell(ctx, col, row, color, emoji, isSelected = false) {
    const { x, y } = getPosition(col, row);
    
    ctx.beginPath();
    ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, 8);
    ctx.fillStyle = color || '#1a1a2e';
    ctx.fill();
    
    if (isSelected) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; }
    else if (emoji) { ctx.strokeStyle = '#335'; ctx.lineWidth = 2; }
    else { ctx.strokeStyle = '#223'; ctx.lineWidth = 1; }
    ctx.stroke();
    
    if (emoji) {
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, x + CELL_SIZE/2, y + CELL_SIZE/2);
    }
}

function drawGrid(ctx, cells, selected) {
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
            const key = `${col},${row}`;
            const cell = cells[key];
            const isSelected = selected && selected.col === col && selected.row === row;
            drawCell(ctx, col, row, cell?.color || null, cell?.emoji || null, isSelected);
        }
    }
}