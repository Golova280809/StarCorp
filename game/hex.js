
// === КОНСТАНТЫ ===
const HEX_SIZE = 45;
const GRID_RADIUS = 7;

// === МАТЕМАТИКА ГЕКСАГОНОВ ===

function hexToPixel(q, r) {
    const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
    const y = HEX_SIZE * (3/2 * r);
    return { x, y };
}

function pixelToHex(x, y) {
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / HEX_SIZE;
    const r = (2/3 * y) / HEX_SIZE;
    return hexRound(q, r);
}

function hexRound(q, r) {
    let s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);
    
    if (qDiff > rDiff && qDiff > sDiff) rq = -rr - rs;
    else if (rDiff > sDiff) rr = -rq - rs;
    
    return { q: rq, r: rr };
}

function isInGrid(q, r) {
    const dist = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
    return dist <= GRID_RADIUS * 2;
}

// === РИСОВАНИЕ ===

function drawHex(ctx, q, r, color, emoji, isSelected = false) {
    const { x, y } = hexToPixel(q, r);
    const cx = canvas.width / 2 + x;
    const cy = canvas.height / 2 + y;
    
    // Гексагон
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30);
        const px = cx + (HEX_SIZE - 3) * Math.cos(angle);
        const py = cy + (HEX_SIZE - 3) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
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
        ctx.fillText(emoji, cx, cy);
    }
}

function drawGrid(ctx, hexes, selectedHex) {
    // Фон
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Сетка
    for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
        const r1 = Math.max(-GRID_RADIUS, -q - GRID_RADIUS);
        const r2 = Math.min(GRID_RADIUS, -q + GRID_RADIUS);
        
        for (let r = r1; r <= r2; r++) {
            const key = `${q},${r}`;
            const hex = hexes[key];
            const isSelected = selectedHex && selectedHex.q === q && selectedHex.r === r;
            
            drawHex(ctx, q, r, hex?.color || null, hex?.emoji || null, isSelected);
        }
    }
}