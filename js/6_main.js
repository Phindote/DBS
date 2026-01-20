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
    const mainBtn = document.getElementById("floatingMainBtn");
    const subMenu = document.getElementById("floatingSubMenu");
    
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // 點擊事件：展開/收起
    mainBtn.addEventListener("click", (e) => {
        if(!dragItem.classList.contains("dragging")) {
            // 智能判斷展開方向
            const rect = dragItem.getBoundingClientRect();
            const isTopHalf = rect.top < window.innerHeight / 2;
            if(isTopHalf) {
                dragItem.style.flexDirection = "column"; // 向下展開
            } else {
                dragItem.style.flexDirection = "column-reverse"; // 向上展開
            }
            subMenu.classList.toggle("visible");
        }
    });

    // 拖曳事件綁定
    document.addEventListener("touchstart", dragStart, {passive: false});
    document.addEventListener("touchend", dragEnd, {passive: false});
    document.addEventListener("touchmove", drag, {passive: false});
    document.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    function dragStart(e) {
        if (e.target === mainBtn || mainBtn.contains(e.target)) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            active = true;
            // 拖曳開始時暫時移除過渡效果，避免延遲
            dragItem.style.transition = "none";
        }
    }

    function dragEnd(e) {
        if(!active) return;
        initialX = currentX;
        initialY = currentY;
        active = false;
        dragItem.classList.remove("dragging");

        // --- 核心修正：鬆手後強制歸位到右側，並限制在 Banner 與 Footer 之間 ---
        
        // 1. 取得邊界資訊
        const headerBar = document.querySelector('.header-bar');
        const footerBar = document.querySelector('.footer-bar');
        const headerHeight = headerBar ? headerBar.offsetHeight : 0;
        const footerRect = footerBar ? footerBar.getBoundingClientRect() : { top: window.innerHeight };
        
        // 2. 計算 Y 軸限制 (Banner 下 ~ Footer 上)
        const itemHeight = dragItem.offsetHeight;
        // 留 10px 緩衝
        const minY = headerHeight + 10; 
        // 畫面上方的 Y 座標 + 視窗高度 = Footer 的位置，這裡要用視窗相對座標
        // dragItem 是 fixed/absolute，這裡我們用相對於視窗左上角的 translate
        // 其實最簡單是用 getBoundingClientRect 計算目前的 top，然後修正
        
        // 由於我們是用 translate3d(x, y, 0)，初始位置 css bottom: 60px right: 20px
        // 這會讓計算變得很複雜。
        // 最穩健的方法：計算當前相對於視窗的 Y，然後強行調整 yOffset
        
        // 簡化方案：
        // 鬆手時，將 X 設為 0 (回到原本 CSS 定義的 right: 20px)
        // 將 Y 限制在安全區域
        
        // 恢復動畫效果
        dragItem.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        
        // 強制 X 回歸 0 (即 CSS 中的 right: 20px)
        xOffset = 0; 
        
        // 限制 Y 軸不遮擋 Banner (向上不能超過) 和 Footer (向下不能超過)
        // 由於 CSS 是 bottom: 60px，正 yOffset 代表向下移，負 yOffset 代表向上移
        // 初始位置(y=0) 的 top 是 window.innerHeight - 60 - itemHeight
        const initialTop = window.innerHeight - 60 - itemHeight;
        const currentTop = initialTop + yOffset;
        
        // 上邊界 (Banner 底部)
        if (currentTop < headerHeight) {
            yOffset = headerHeight - initialTop;
        }
        // 下邊界 (Footer 頂部)
        const footerTop = footerRect.top;
        if (currentTop + itemHeight > footerTop) {
            yOffset = footerTop - itemHeight - initialTop;
        }

        currentX = xOffset;
        currentY = yOffset;

        setTranslate(xOffset, yOffset, dragItem);
        
        // 動畫結束後清除 transition 以便下次拖曳
        setTimeout(() => {
            dragItem.style.transition = "";
        }, 300);
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
    // 點擊外部收起懸浮選單
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
            if (pwd === null) return; // 按取消直接退出，不報錯
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
