
const canvas = document.getElementById('gameField');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const sectorColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'];
const sectorNames = ['СЕКТОР 1', 'СЕКТОР 2', 'СЕКТОР 3', 'СЕКТОР 4'];
const productPrices = [30, 40, 50, 60];
const resourcePrices = [10, 15, 20, 25, 30, 35];

let productRisk = 0;
let resourceRisk = 0;

function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 4; i++) drawSector(i);
    drawCore();
    drawRisks();
}

function drawSector(index) {
    const startAngle = (index * 90 - 90) * Math.PI / 180;
    const endAngle = ((index + 1) * 90 - 90) * Math.PI / 180;
    
    for (let ring = 1; ring <= 5; ring++) {
        const innerR = 50 + ring * 45;
        const outerR = 50 + (ring + 1) * 45;
        const cells = ring + 1;
        
        for (let cell = 0; cell < cells; cell++) {
            const cellStart = startAngle + (cell / cells) * (endAngle - startAngle);
            const cellEnd = startAngle + ((cell + 1) / cells) * (endAngle - startAngle);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, outerR, cellStart, cellEnd);
            ctx.arc(centerX, centerY, innerR, cellEnd, cellStart, true);
            ctx.closePath();
            
            ctx.fillStyle = ring < 5 ? 'hsl(' + (index * 90) + ', 50%, ' + (30 + ring * 8) + '%)' : '#1a1a2e';
            ctx.fill();
            
            const angle = (cellStart + cellEnd) / 2;
            const textR = (innerR + outerR) / 2;
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const price = ring < 5 ? productPrices[cell] : resourcePrices[cell];
            if (price) ctx.fillText(price, centerX + Math.cos(angle) * textR, centerY + Math.sin(angle) * textR);
        }
    }
    
    const sectorAngle = (startAngle + endAngle) / 2;
    ctx.fillStyle = sectorColors[index];
    ctx.font = 'bold 14px monospace';
    ctx.fillText(sectorNames[index], centerX + Math.cos(sectorAngle) * 280, centerY + Math.sin(sectorAngle) * 280);
}

function drawCore() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a15';
    ctx.fill();
    ctx.strokeStyle = '#7df';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#7df';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ХРОНОС', centerX, centerY - 8);
    ctx.font = '16px monospace';
    ctx.fillText('●', centerX, centerY + 10);
}

function drawRisks() {
    const pa = (productRisk / 6) * Math.PI * 0.4 - Math.PI * 0.7;
    const pr = 50 + 2 * 45 + 22;
    ctx.save();
    ctx.translate(centerX + Math.cos(pa) * pr, centerY + Math.sin(pa) * pr);
    ctx.rotate(pa + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.restore();
    
    const ra = (resourceRisk / 6) * Math.PI * 0.4 - Math.PI * 0.7;
    const rr = 50 + 5 * 45 + 22;
    ctx.save();
    ctx.translate(centerX + Math.cos(ra) * rr, centerY + Math.sin(ra) * rr);
    ctx.rotate(ra + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = '#b388ff';
    ctx.fill();
    ctx.restore();
}

function animateRisks() {
    productRisk = (productRisk + 0.01) % 6;
    resourceRisk = (resourceRisk + 0.015) % 6;
    drawField();
    requestAnimationFrame(animateRisks);
}

drawField();
animateRisks();