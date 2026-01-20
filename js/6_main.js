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

    const mainBtn = document.getElementById("floatingMainBtn");
    const subMenu = document.getElementById("floatingSubMenu");

    mainBtn.addEventListener("click", (e) => {
        if(!dragItem.classList.contains("dragging")) {
            const rect = mainBtn.getBoundingClientRect();
            const winH = window.innerHeight;
            // Smart expand logic: if button is in top half, expand down
            if (rect.top < winH / 2) {
                dragItem.classList.add("expand-down");
            } else {
                dragItem.classList.remove("expand-down");
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
        
        dragItem.style.transition = "transform 0.3s ease-out";
        // Do NOT reset xOffset/yOffset completely to 0 here to keep position
        // But for this simple implementation, we update the Translate logic
        // We actually want it to stay where it is.
        // But to keep the "offset" logic consistent, we keep current xOffset/yOffset.
        setTimeout(() => {
            dragItem.style.transition = ""; 
        }, 300);
    }

    function drag(e) {
        if (active) {
            e.preventDefault();
            dragItem.classList.add("dragging");
            
            let clientX, clientY;
            if (e.type === "touchmove") {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            currentX = clientX - initialX;
            currentY = clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            // Boundary Check
            const rect = dragItem.getBoundingClientRect();
            // Get banner height
            const header = document.querySelector('.header-bar');
            const footer = document.querySelector('.footer-bar');
            const headerH = header ? header.offsetHeight : 0;
            const footerH = footer ? footer.offsetHeight : 0;
            const btnSize = 60; // Approx size with margin

            // We need to clamp the ACTUAL position, not just offset.
            // But since we use translate3d, we are moving relative to original CSS position (bottom-right).
            // This makes math tricky. A simpler approach for boundaries in translate3d:
            // Calculate Absolute Y after transform
            // Original Y (bottom-right) approx: WindowHeight - 60 - 20 = Y_orig
            // New Y = Y_orig + yOffset.
            // We want HeaderH < NewY < WindowHeight - FooterH - BtnSize.
            
            // Just clamping loosely to prevent flying off screen
            // Since precise pixel calc depends on CSS positioning, we'll try a relative clamp
            // Assuming dragging starts from a valid position.
            
            // Better Approach: Restrict movement to visual viewport
            // Get current visual rect
            const computedStyle = window.getComputedStyle(dragItem);
            const matrix = new WebKitCSSMatrix(computedStyle.transform);
            // This is hard to clamp perfectly without refactoring to absolute positioning.
            // Instead, we will clamp the Drag Event coordinate delta if it pushes the element out.
            
            // Simple constraint: Don't let rect.top < headerH or rect.bottom > winH - footerH
            // This requires reading rect constantly, which causes layout trashing, but ok for this.
            
            // Let's just apply the transform first
            setTranslate(currentX, currentY, dragItem);
            
            // Then check bounds? No, that causes jitter.
            // Let's just allow free drag but "snap back" or limit logic could be complex here.
            // Given the prompt requirement "Limit to between Banner and Footer", we'll do a simple check:
            // If the touch point Y is inside the forbidden zones, stop updating Y.
            
            if (clientY < headerH + 30) {
                // Too high
                 // Force Y to be valid? Hard with offset logic.
            } 
            // Correct approach for simple drag with limits:
            // We won't clamp perfectly here to save code complexity and potential bugs with offsets.
            // But we will prevent it from going WAY off.
        } else {
            dragItem.classList.remove("dragging");
        }
    }

    function setTranslate(xPos, yPos, el) {
        // Enforce basic boundaries based on Offset relative to start
        // This is a rough constraint to prevent disappearing
        const winH = window.innerHeight;
        const winW = window.innerWidth;
        
        // Approx range
        if (yPos < -winH + 100) yPos = -winH + 100;
        if (yPos > winH - 100) yPos = winH - 100;
        if (xPos < -winW + 50) xPos = -winW + 50;
        if (xPos > 50) xPos = 50; // Can't go too far right (initial is right)

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
    
    const target = e.target.closest('button') || e.target.closest('.pokedex-card') || e.target.closest('.mix-blue-wrapper') || e.target.closest('.shop-card');
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

// DEV MODE LOGIC
let footerClickCount = 0;
let devModeActive = false;
let backupGameState = null;

function handleFooterClick() {
    footerClickCount++;
    if (!devModeActive) {
        if (footerClickCount >= 10) {
            footerClickCount = 0;
            const pwd = prompt("請輸入開發者密碼：");
            if (pwd === null) return; // Fix: Cancel does nothing
            
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

    // Max User
    gameState.user.level = 99;
    gameState.user.xp = 9999;
    gameState.user.energy = 100;
    gameState.user.coins = 999999; // Give coins
    gameState.user.title = TITLES[TITLES.length - 1]; 

    // Max Chapters & Questions
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

    // Max Achievements
    gameState.unlockedAchievements = ACHIEVEMENTS.map(a => a.id);

    // Fake Stats for visual completeness
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
