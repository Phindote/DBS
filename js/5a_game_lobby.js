function handleLogin() {
    const n = document.getElementById("inputName").value.trim();
    const g = document.getElementById("inputGrade").value;
    const l = document.getElementById("inputClassLetter").value;
    if(!n || !g || !l) return alert("請輸入姓名及選擇班別");
    
    playMusic('theme'); 

    const c = g + l;
    gameState.user.name = n;
    gameState.user.class = c;
    
    const today = new Date().toDateString();
    if(gameState.user.lastLoginDate !== today) {
        gameState.user.lastLoginDate = today;
        gameState.dailyTasks = [];
        
        for(let i=1; i<=5; i++) {
            gameState.dailyTasks.push({ id: i, progress: 0, complete: false, claimed: false });
        }
        
        const db = window.questionsDB || {};
        const keys = Object.keys(db);
        if(keys.length > 0) {
            const randomKey1 = keys[Math.floor(Math.random() * keys.length)];
            const randomKey2 = keys[Math.floor(Math.random() * keys.length)];
            const randomKeyStudy = keys[Math.floor(Math.random() * keys.length)];
            
            let task2 = gameState.dailyTasks.find(t => t.id === 2);
            if(task2) task2.targetKey = randomKeyStudy;

            gameState.dailyTasks.push({ id: 6, progress: 0, complete: false, claimed: false, targetKey: randomKey1 });
            gameState.dailyTasks.push({ id: 7, progress: 0, complete: false, claimed: false, targetKey: randomKey2 });
        }

        const hour = new Date().getHours();
        if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
            setTimeout(() => {
                if (typeof triggerDrop === 'function') triggerDrop('LOGIN_MOMENT_BONUS');
            }, 1000);
        }
    }
    
    let loginTask = gameState.dailyTasks.find(t => t.id === 1);
    if(loginTask && loginTask.progress < 1) loginTask.progress = 1;

    saveGame();
    updateUserDisplay();
    
    setTimeout(() => {
        resetMenu();
        switchScreen("screen-menu");
    }, 10);
}

function updateLevel() {
    const newLevel = Math.floor(gameState.user.xp / 100) + 1;
    gameState.user.level = newLevel > GAME_CONFIG.MAX_LEVEL ? GAME_CONFIG.MAX_LEVEL : newLevel;
    if (gameState.user.level === GAME_CONFIG.MAX_LEVEL && gameState.user.xp >= GAME_CONFIG.MAX_XP) {
        gameState.user.title = "龍脈•降龍無悔";
    } else {
        let titleIndex = Math.floor((gameState.user.level - 1) / 5.5);
        if (titleIndex >= TITLES.length) titleIndex = TITLES.length - 1;
        gameState.user.title = TITLES[titleIndex];
    }
    if (gameState.user.level >= 99) {
        gameState.user.unlockedReplayXP = true;
    }
    checkAchievements();
    saveGame();
    updateUserDisplay();
    updateBars();
}

function confirmSingleGame() {
    if (!pendingSingleChapterKey) return;
    initGame('single');
}

function confirmMixMode() {
    const count = document.querySelectorAll("#mixChapterList input:checked").length;
    if (count < 2) return alert("請至少選擇 2 篇範文！");
    
    gameState.mixSelectedKeys = [];
    document.querySelectorAll("#mixChapterList input:checked").forEach(chk => {
        gameState.mixSelectedKeys.push(chk.value);
    });
    initGame('mix');
}

function goHome() {
    if(confirm("確定要逃跑嗎？這將視為戰敗！")) {
        switchScreen("screen-menu");
        updateUserDisplay(); 
    }
}
