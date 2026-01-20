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
    let isDragging = false; // Flag to distinguish click from drag

    const mainBtn = document.getElementById("floatingMainBtn");
    const subMenu = document.getElementById("floatingSubMenu");

    // Click handler: Only toggle if NOT dragging
    mainBtn.addEventListener("click", (e) => {
        if (!isDragging) {
            subMenu.classList.toggle("visible");
        }
        isDragging = false; // Reset
    });

    container.addEventListener("touchstart", dragStart, {passive: false});
    container.addEventListener("touchend", dragEnd, {passive: false});
    container.addEventListener("touchmove", drag, {passive: false});
    container.addEventListener("mousedown", dragStart);
    container.addEventListener("mouseup", dragEnd);
    container.addEventListener("mousemove", drag);

    function dragStart(e) {
        // Only start drag if touching the main button
        if (e.target === mainBtn || mainBtn.contains(e.target)) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            active = true;
            isDragging = false; // Assume click initially
        }
    }

    function dragEnd(e) {
        if(!active) return;
        initialX = currentX;
        initialY = currentY;
        active = false;

        // SNAP BACK LOGIC
        // 1. Force X back to 0 (Right Edge)
        currentX = 0;
        xOffset = 0;

        // 2. Bound Y position to keep it on screen
        const header = document.querySelector('.header-bar');
        const footer = document.querySelector('.footer-bar');
        const headerHeight = header ? header.offsetHeight : 100;
        const footerRect = footer ? footer.getBoundingClientRect() : {top: window.innerHeight};
        const dragItemRect = dragItem.getBoundingClientRect();
        
        // Calculate safe Y bounds
        // Base screen Y (where translate Y=0 lands) = WindowHeight - 60 - Height
        const baseScreenY = window.innerHeight - 60 - dragItemRect.height;
        const minTranslateY = headerHeight + 10 - baseScreenY;
        const maxTranslateY = footerRect.top - baseScreenY - dragItemRect.height - 10;

        // Clamp Y
        if (currentY < minTranslateY) currentY = minTranslateY;
        if (currentY > maxTranslateY) currentY = maxTranslateY;
        // Fallback if window is too small
        if (minTranslateY > maxTranslateY) currentY = minTranslateY;

        yOffset = currentY;

        // Apply Snap Animation
        dragItem.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        setTranslate(0, currentY, dragItem);
        
        // Remove transition after animation finishes so dragging feels instant again
        setTimeout(() => {
            dragItem.style.transition = "";
        }, 300);
    }

    function drag(e) {
        if (active) {
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            // Mark as dragging if moved significantly
            if (Math.abs(currentX) > 5 || Math.abs(currentY) > 5) {
                isDragging = true;
                // If dragging, hide submenu immediately to avoid visual clutter
                subMenu.classList.remove("visible");
            }

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
    // Close submenu if clicked outside
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
            if (pwd === null) return; 
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
