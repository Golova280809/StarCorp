
function showSplash() {
    const splash = document.getElementById('splash-screen');
    const progressFill = document.querySelector('.progress-fill');
    splash.style.display = 'flex';
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = 'game/map.html';
            }, 500);
        }
        progressFill.style.width = progress + '%';
    }, 200);
}