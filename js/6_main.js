function preloadAssets(callback) {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_LOAD.length + Object.keys(audioFiles).length;
    const updateProgress = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalAssets) * 100);
        document.getElementById('loadingBar').style.width = percent + '%';
        document.getElementById('loadingText').innerText = percent + '%';
        if (loadedCount >= totalAssets) {
            setTimeout(() => {
                document.getElementById('screen-loading').classList.remove('active');
                if(gameState.user.name) {
                    resetMenu();
                    switchScreen('screen-menu');
                } else {
                    document.getElementById('screen-login').classList.add('active');
                }
                callback();
            }, 500);
        }
    };
    ASSETS_TO_LOAD.forEach(src => {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
    });
    Object.values(audioFiles).forEach(audio => {
        if (audio.readyState >= 3) {
            updateProgress();
        } else {
            audio.addEventListener('canplaythrough', updateProgress, { once: true });
            audio.addEventListener('error', updateProgress, { once: true });
            audio.load();
        }
    });
}

function initDraggableMenu() {
    const dragItem = document.getElementById("floatingMenuContainer");
    const container = document.body;
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // Set initial Position (Right side)
    xOffset = 0; 
    yOffset = 0; 

    const mainBtn = document.getElementById("floatingMainBtn");
    const subMenu = document.getElementById("floatingSubMenu");

    mainBtn.addEventListener("click", (e) => {
        if(!dragItem.classList.contains("dragging")) {
            const rect = dragItem.getBoundingClientRect();
            const isTopHalf = rect.top < window.innerHeight / 2;
            if(isTopHalf) {
                dragItem.style.flexDirection = "column";
            } else {
                dragItem.style.flexDirection = "column-reverse";
            }
            subMenu.classList.toggle("visible");
        }
    });

    container.addEventListener("touchstart", dragStart, {passive: false});
    container.addEventListener("touchend", dragEnd, {passive: false});
    container.addEventListener("touchmove", drag, {passive: false});
    container.addEventListener("mousedown", dragStart);
    container.addEventListener("mouseup", dragEnd);
    container.addEventListener("mousemove", drag);

    function dragStart(e) {
        if (e.target === mainBtn || mainBtn.contains(e.target) || e.target === dragItem) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            if (e.target === mainBtn || mainBtn.contains(e.target)) {
                active = true;
            }
        }
    }

    function dragEnd(e) {
        if(!active) return;
        initialX = currentX;
        initialY = currentY;
        active = false;
        dragItem.classList.remove("dragging");

        // --- SNAP BACK LOGIC (強制歸位) ---
        // 1. Always snap to Right edge (X = 0)
        currentX = 0;
        xOffset = 0; 

        // 2. Bound Y position between Header and Footer
        const headerHeight = document.querySelector('.header-bar').offsetHeight;
        const footerRect = document.querySelector('.footer-bar').getBoundingClientRect();
        // Calculate bounds relative to the initial position (bottom: 60px, right: 20px)
        // Since we use transform translate, we need to calculate offset relative to start.
        // But simpler approach: keep X=0 (right:20px), just clamp Y.
        
        // We need to check actual screen bounds for Y
        const rect = dragItem.getBoundingClientRect();
        let newTop = rect.top;
        
        const minTop = headerHeight + 10; // 10px buffer below header
        const maxTop = footerRect.top - rect.height - 10; // 10px buffer above footer

        let correctionY = 0;
        
        // Convert client rect back to translate Y
        // Current Transform Y = currentY (stored in variable)
        
        // It's tricky to clamp 'translate' directly without knowing absolute positions perfectly.
        // Instead, we simply clamp the *visual* position logic we used in drag().
        // In drag(), we already clamped Y. So on drop, we just ensure X is reset.
        
        // Re-run the clamp logic one last time to be safe
        const itemHeight = dragItem.offsetHeight;
        const minY = headerHeight - (window.innerHeight - 60 - 20); // Approx based on CSS bottom:60px
        // Actually, let's just stick to the drag logic's clamp constraints.
        // The most important thing is resetting X.
        
        setTranslate(0, currentY, dragItem); // Force X to 0 (Right side)
    }

    function drag(e) {
        if (active) {
            e.preventDefault();
            dragItem.classList.add("dragging");
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            // --- BOUNDARY LOGIC (邊界限制) ---
            const headerHeight = document.querySelector('.header-bar').offsetHeight || 100;
            const footer = document.querySelector('.footer-bar');
            const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
            
            const rect = dragItem.getBoundingClientRect();
            
            // We want to limit the *visual* movement. 
            // The item is positioned at bottom: 60px.
            // Translate Y moves it relative to that.
            // +Y moves down, -Y moves up.
            
            // Limit Top edge: Must be below Header
            // Current Top = (WindowHeight - 60 - Height) + currentY
            // We want Current Top > HeaderHeight
            // => currentY > HeaderHeight - (WindowHeight - 60 - Height)
            const baseTop = window.innerHeight - 60 - rect.height;
            const limitMinY = headerHeight - baseTop;

            // Limit Bottom edge: Must be above Footer
            // Current Bottom = (WindowHeight - 60) + currentY
            // We want Current Bottom < FooterTop
            // => currentY < FooterTop - (WindowHeight - 60)
            const baseBottom = window.innerHeight - 60;
            const limitMaxY = footerTop - baseBottom - 10; // 10px buffer

            if (currentY < limitMinY) currentY = limitMinY;
            if (currentY > limitMaxY) currentY = limitMaxY;

            // Update Y only, allow X to move freely during drag, but dragEnd will snap it.
            // Actually user wants it restricted *during* drag too? "不能拖出"
            // Let's restrict X to not go off screen right.
            // It starts at right:20px. 
            // +X moves right (off screen), -X moves left (into screen).
            // Max X should be 0 (stick to right margin).
            if (currentX > 0) currentX = 0; 
            
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, dragItem);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}

function goHome() {
    if(confirm("確定要返回主目錄嗎？本次試煉進度將會中斷。")) {
        resetMenu();
        switchScreen("screen-menu");
    }
}

function backToMenuFromEnd() {
    stopLongSFX();
    resetMenu();
    switchScreen("screen-menu");
    playMusic('theme');
}

window.onload = function() {
    db = window.questionsDB || {};
    loadGame();
    preloadAssets(() => {
        const canvas = document.getElementById('particleCanvas');
        particleCtx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        loopParticles();
        initDraggableMenu();
        setInterval(() => {
            if(document.visibilityState === 'visible') {
                gameState.stats.totalPlayTime = (gameState.stats.totalPlayTime || 0) + 1;
                if(gameState.stats.totalPlayTime % 60 === 0) {
                    saveGame();
                    checkAchievements();
                }
            }
        }, 1000 * 60);
    });
};

document.addEventListener('click', function(e) {
    const floatContainer = document.getElementById("floatingMenuContainer");
    const subMenu = document.getElementById("floatingSubMenu");
    if (floatContainer && subMenu && subMenu.classList.contains("visible")) {
        if (!floatContainer.contains(e.target)) {
            subMenu.classList.remove("visible");
        }
    }
    const target = e.target.closest('button') || e.target.closest('.pokedex-card') || e.target.closest('.mix-blue-wrapper');
    if (target) {
        if (target.classList.contains('mc-btn') && !target.disabled) return;
        if (target.classList.contains('btn-attack')) return;
        playSFX('click');
    }
});

document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

document.getElementById("answerInput").addEventListener("keypress", function(e) {
    if(e.key === "Enter") submitSeniorAnswer();
});

let footerClickCount = 0;
let devModeActive = false;
let backupGameState = null;

function handleFooterClick() {
    footerClickCount++;
    if (!devModeActive) {
        if (footerClickCount >= 10) {
            footerClickCount = 0;
            const pwd = prompt("請輸入開發者密碼：");
            if (pwd === null) return; // Cancel does nothing
            if (pwd === "DBS_Chinese") {
                activateGodMode();
            } else {
                alert("密碼錯誤！");
            }
        }
    } else {
        if (footerClickCount >= 3) {
            footerClickCount = 0;
            revertGodMode();
        }
    }
}

function activateGodMode() {
    window.godModeActive = true;
    backupGameState = JSON.parse(JSON.stringify(gameState));
    devModeActive = true;
    gameState.user.level = 99;
    gameState.user.xp = 9999;
    gameState.user.energy = 100;
    gameState.user.title = TITLES[TITLES.length - 1];
    gameState.masteredChapters = [];
    gameState.solvedQuestionIds = [];
    gameState.solvedSeniorQuestionIds = [];
    Object.keys(db).forEach(k => {
        gameState.masteredChapters.push(k + '_junior');
        gameState.masteredChapters.push(k + '_senior');
        gameState.masteredChapters.push('mix');
        if(db[k].junior) db[k].junior.forEach(q => gameState.solvedQuestionIds.push(q.id));
        if(db[k].senior) {
            db[k].senior.forEach(q => {
                gameState.solvedQuestionIds.push(q.id);
                gameState.solvedSeniorQuestionIds.push(q.id);
            });
        }
    });
    gameState.unlockedAchievements = ACHIEVEMENTS.map(a => a.id);
    gameState.stats.totalPlayTime = 99999;
    gameState.stats.mixWinCount = 999;
    updateLevel();
    alert("⚡ 上帝模式已啟動 ⚡\n所有能力已全滿！(點擊底部 3 次可還原)");
}

function revertGodMode() {
    if(backupGameState) {
        gameState = JSON.parse(JSON.stringify(backupGameState));
        devModeActive = false;
        backupGameState = null;
        window.godModeActive = false;
        saveGame();
        updateUserDisplay();
        updateBars();
        alert("已回復至凡人模式。");
    }
}

setTimeout(() => {
    const footer = document.querySelector('.footer-bar');
    if(footer) {
        footer.addEventListener('click', handleFooterClick);
    }
}, 1000);
