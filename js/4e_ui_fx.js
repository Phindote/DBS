let particleCtx = null;
let particles = [];

function updateCrackStage() {
    if(!gameState || !gameState.user) return;
    const hp = gameState.user.hp;
    const box = document.getElementById("questionBox");
    if(!box) return;

    box.className = "question-box"; 
    if (hp <= 80 && hp > 60) box.classList.add("crack-stage-1");
    else if (hp <= 60 && hp > 40) box.classList.add("crack-stage-2");
    else if (hp <= 40 && hp > 20) box.classList.add("crack-stage-3");
    else if (hp <= 20 && hp > 0) box.classList.add("crack-stage-4");
    else if (hp <= 0) box.classList.add("crack-stage-5");
}

function resizeCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
function createParticle(x, y, color, type) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
        x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1.0, color: color, type: type
    });
}
function fireBeam(startX, startY, endX, endY, color) {
    const steps = 20;
    for (let i = 0; i < steps; i++) {
        setTimeout(() => {
            const progress = i / steps;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            for(let j=0; j<5; j++) {
                particles.push({
                    x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                    life: 0.8, color: color, type: 'beam'
                });
            }
        }, i * 15);
    }
}
function loopParticles() {
    if(!particleCtx) return;
    particleCtx.clearRect(0, 0, particleCtx.canvas.width, particleCtx.canvas.height);
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        particleCtx.globalAlpha = p.life;
        particleCtx.fillStyle = p.color;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.type === 'beam' ? 3 : 5, 0, Math.PI * 2);
        particleCtx.fill();
    }
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(loopParticles);
}
function triggerAnimation(element, className) {
    if(!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
}
