
window.onload = function() {
    const progressFill = document.querySelector('.progress-fill');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('splash-screen').style.display = 'none';
            }, 500);
        }
        progressFill.style.width = progress + '%';
    }, 200);
};