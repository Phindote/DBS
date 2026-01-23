document.addEventListener("DOMContentLoaded", () => {
    loadGame();
    preloadAssets(() => {
        const backdrop = document.createElement("div");
        backdrop.id = "floatingBackdrop";
        backdrop.className = "floating-backdrop";
        backdrop.onclick = () => {
            const sub = document.getElementById("floatingSubMenu");
            const bd = document.getElementById("floatingBackdrop");
            if(sub) {
                sub.classList.remove("visible");
                sub.classList.add("hidden");
                setTimeout(() => { if(!sub.classList.contains("visible")) sub.style.display = "none"; }, 300);
            }
            if(bd) bd.classList.remove("active");
        };
        document.body.appendChild(backdrop);

        initDraggableMenu();
        if (gameState.user.name === "DBS_Chinese" && !window.godModeActive) {
            initGodMode();
        }
        
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            particleCtx = canvas.getContext('2d');
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            loopParticles();
        }
        
        const bgmBtn = document.getElementById("btnBGM");
        if(bgmBtn && !isMusicOn) bgmBtn.classList.add("off");
        const sfxBtn = document.getElementById("btnSFX");
        if(sfxBtn && !isSFXEnabled) sfxBtn.classList.add("off");
        
        const inputName = document.getElementById("inputName");
        if(inputName) {
            inputName.addEventListener("keyup", function(event) {
                if (event.key === "Enter") {
                    handleLogin();
                }
            });
        }
    });
    
    setInterval(() => {
        if(typeof triggerDrop === 'function') {
            triggerDrop('ON_PLAY_TIME_10MIN'); 
            
            const h = new Date().getHours();
            if(h === 12) triggerDrop('SPECIFIC_TIME_BONUS');
            
            const modal = document.getElementById('contentModal');
            if(modal && modal.style.display === 'flex') {
                triggerDrop('ON_STUDY_MINUTE');
            }
        }
    }, 60000); 
});

document.addEventListener('click', (e) => {
    if(typeof triggerDrop === 'function') {
        triggerDrop('ON_CLICK_ANY');
    }

    const target = e.target.closest('button, .menu-btn, .shop-card, .pokedex-card, .title-node, .smelt-slot, .radial-sub-btn, #floatingMainBtn, .btn-main, .btn-secondary, .btn-edit, .btn-claim, .btn-inv-delete, .tab-btn, .difficulty-btn, .gacha-egg');
    
    if (target) {
        if (!target.classList.contains('mc-btn') && !target.classList.contains('btn-attack')) {
            playSFX('click');
        }
    }

    const floatContainer = document.getElementById("floatingMenuContainer");
    const subMenu = document.getElementById("floatingSubMenu");
    const mainBtn = document.getElementById("floatingMainBtn");
    const backdrop = document.getElementById("floatingBackdrop");
    
    if (subMenu && subMenu.classList.contains("visible")) {
        if (!floatContainer.contains(e.target) && !mainBtn.contains(e.target)) {
            subMenu.classList.remove("visible");
            subMenu.classList.add("hidden");
            if(backdrop) backdrop.classList.remove("active");
            setTimeout(() => {
                if(subMenu.classList.contains("hidden")) subMenu.style.display = "none";
            }, 300);
        }
    }
});

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
                
                document.getElementById('screen-login').classList.add('active');
                if (gameState.user.name) {
                    document.getElementById("inputName").value = gameState.user.name;
                    
                    const cls = gameState.user.class;
                    if (cls.length >= 2) {
                        let grade, letter;
                        if (!isNaN(cls.substring(0, 2))) {
                            grade = cls.substring(0, 2);
                            letter = cls.substring(2);
                        } else {
                            grade = cls.substring(0, 1);
                            letter = cls.substring(1);
                        }
                        const gSelect = document.getElementById("inputGrade");
                        const lSelect = document.getElementById("inputClassLetter");
                        if(gSelect) gSelect.value = grade;
                        updateClassOptions();
                        if(lSelect) lSelect.value = letter;
                    }
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
    const dragItem = document.getElementById("floatingMainBtn");
    const container = document.getElementById("floatingMenuContainer");
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    container.addEventListener("touchstart", dragStart, {passive: false});
    container.addEventListener("touchend", dragEnd, {passive: false});
    container.addEventListener("touchmove", drag, {passive: false});
    container.addEventListener("mousedown", dragStart, {passive: false});
    container.addEventListener("mouseup", dragEnd, {passive: false});
    container.addEventListener("mousemove", drag, {passive: false});

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        if (e.target === dragItem || dragItem.contains(e.target)) {
            active = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        active = false;
        
        let targetX = 0;
        let targetY = 0;
        
        xOffset = targetX;
        yOffset = targetY;
        setTranslate(targetX, targetY, container);
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
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, container);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
    
    let subMenuVisible = false;
    dragItem.addEventListener('click', (e) => {
        if(Math.abs(xOffset) < 5 && Math.abs(yOffset) < 5) {
            subMenuVisible = !document.getElementById("floatingSubMenu").classList.contains("visible");
            const sub = document.getElementById("floatingSubMenu");
            const backdrop = document.getElementById("floatingBackdrop");
            
            if(subMenuVisible) {
                sub.style.display = "flex";
                sub.classList.remove("hidden");
                sub.classList.add("visible");
                if(backdrop) backdrop.classList.add("active");
            } else {
                sub.classList.remove("visible");
                sub.classList.add("hidden");
                if(backdrop) backdrop.classList.remove("active");
                setTimeout(() => {
                    if(!sub.classList.contains("visible")) sub.style.display = "none";
                }, 300);
            }
        }
    });
}

function handleFooterClick() {
    if (!document.getElementById('screen-login').classList.contains('active')) return;

    if (!window.footerClickCount) window.footerClickCount = 0;
    window.footerClickCount++;
    if (window.footerClickCount === 5) {
        const pass = prompt("請輸入開發者密碼：");
        
        if (pass === null) {
            window.footerClickCount = 0;
            return;
        }

        if (pass === "DBS_Chinese") {
            initGodMode();
        } else {
            alert("密碼錯誤");
        }
        window.footerClickCount = 0;
    }
    if (window.godModeActive && window.footerClickCount === 3) {
        if(confirm("是否關閉上帝模式並還原存檔？")) {
            revertGodMode();
        }
        window.footerClickCount = 0;
    }
}

let backupGameState = null;
let devModeActive = false;

function initGodMode() {
    if(window.godModeActive) return;
    if(!backupGameState) {
        backupGameState = JSON.parse(JSON.stringify(gameState));
    }
    
    const db = window.questionsDB || {};

    window.godModeActive = true;
    gameState.user.level = 99;
    gameState.user.xp = 9999;
    gameState.user.energy = 100;
    gameState.user.coins = 9999999;
    gameState.user.title = TITLES[TITLES.length - 1];
    
    gameState.masteredChapters = [];
    gameState.solvedQuestionIds = [];
    
    Object.keys(db).forEach(k => {
        gameState.masteredChapters.push(k + '_junior');
        gameState.masteredChapters.push(k + '_senior');
        gameState.masteredChapters.push('mix');
        if(db[k].junior) db[k].junior.forEach(q => gameState.solvedQuestionIds.push(q.id));
        if(db[k].senior) db[k].senior.forEach(q => gameState.solvedQuestionIds.push(q.id));
    });
    
    gameState.unlockedAchievements = ACHIEVEMENTS.map(a => a.id);
    gameState.stats.totalPlayTime = 99999;
    gameState.stats.mixWinCount = 999;
    
    DAILY_QUESTS.forEach(quest => {
        let task = gameState.dailyTasks.find(t => t.id === quest.id);
        if(!task) {
            task = { id: quest.id, progress: 0, complete: false, claimed: false };
            gameState.dailyTasks.push(task);
        }
        task.progress = quest.target; 
        task.complete = false; 
        task.claimed = false; 
    });

    updateLevel();
    if(typeof renderDailyTasks === 'function') renderDailyTasks();
    alert("⚡ 上帝模式已啟動 ⚡\n所有能力、金幣已全滿，每日任務已可領取！(點擊底部 3 次可還原)");
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
        if(typeof renderDailyTasks === 'function') renderDailyTasks();
        alert("已還原至備份狀態。");
    }
}
