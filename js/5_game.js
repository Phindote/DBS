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
            
            gameState.dailyTasks.push({ id: 6, progress: 0, complete: false, claimed: false, targetKey: randomKey1 });
            gameState.dailyTasks.push({ id: 7, progress: 0, complete: false, claimed: false, targetKey: randomKey2 });
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

function initGame(modeOrDifficulty) {
    if(modeOrDifficulty === 'single' || modeOrDifficulty === 'mix') {
        gameState.mode = modeOrDifficulty;
        gameState.pool = [];
        gameState.history = [];
        gameState.wrongCount = 0;
        gameState.currentIndex = 0;
        
        const jrCost = GAME_CONFIG.ENERGY_COST_JR_SINGLE;
        const srCost = GAME_CONFIG.ENERGY_COST_SR_SINGLE;
        
        document.getElementById("energyCostInfo").innerText = `消耗：初階 ${jrCost} / 高階 ${srCost}`;
        switchScreen('screen-difficulty');
        return;
    }

    const difficulty = modeOrDifficulty;
    const mode = gameState.mode; 
    const db = window.questionsDB || {};
    
    let cost = (difficulty === 'junior') ? GAME_CONFIG.ENERGY_COST_JR_SINGLE : GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    
    if (gameState.user.energy < cost) return alert("浩然之氣不足！請前往圖鑑溫習。");
    
    gameState.user.energy -= cost;
    gameState.difficulty = difficulty;
    
    let selectedChapters = [];
    if (mode === 'single') {
        selectedChapters.push(pendingSingleChapterKey);
    } else {
        selectedChapters = gameState.mixSelectedKeys;
    }
    
    gameState.currentChapterKey = (mode === 'single') ? pendingSingleChapterKey : "mix"; 
    
    let allQs = [];
    selectedChapters.forEach(key => {
        if(db[key] && db[key][difficulty]) {
            const list = db[key][difficulty];
            allQs = allQs.concat(list);
        }
    });
    
    if (allQs.length === 0) return alert("該模式暫無題目數據！");
    
    gameState.pool = allQs.sort(() => 0.5 - Math.random()); 
    
    gameState.currentIndex = 0;
    gameState.wrongCount = 0;
    gameState.currentAttempts = 0;
    gameState.wrongAnswersHistory = [];
    gameState.history = [];
    
    // HP Reset Logic
    gameState.user.hp = 100;
    
    if (mode === 'single') {
        gameState.currentDragon = (db[pendingSingleChapterKey] && db[pendingSingleChapterKey].img) ? db[pendingSingleChapterKey].img : "dragon_unknown.jpg";
    } else {
        gameState.currentDragon = "dragon_mix.jpg";
    }
    
    document.getElementById("bossImage").src = "images/dragons/" + gameState.currentDragon;
    
    let titleText = "未知篇章";
    if(mode === 'single' && db[pendingSingleChapterKey]) titleText = db[pendingSingleChapterKey].title;
    else if(mode === 'mix') titleText = "混合試煉";

    document.getElementById("battleChapterText").innerText = `${titleText} (${difficulty === 'junior' ? '初階' : '高階'})`;
    
    playMusic(difficulty === 'junior' ? 'bgm_battle_jr' : 'bgm_battle_sr');
    switchScreen("screen-game");
    updateBars();
    renderQuestion();
}

function renderQuestion() {
    if (gameState.currentIndex >= gameState.pool.length) {
        endGame();
        return;
    }
    
    gameState.currentAttempts = 0;
    gameState.wrongAnswersHistory = [];
    inputLock = false;
    
    const q = gameState.pool[gameState.currentIndex];
    document.getElementById("gameProgress").innerText = `進度：${gameState.currentIndex + 1} / ${gameState.pool.length}`;
    document.getElementById("qLine").innerText = q.line;
    document.getElementById("qWord").innerText = q.word;
    document.getElementById("msgBox").innerText = "";
    
    const box = document.getElementById("questionBox");
    box.classList.remove("correct-flash", "shake-box", "player-attack");
    document.getElementById("bossImage").classList.remove("dragon-attack");
    updateCrackStage();
    
    const jrArea = document.getElementById("inputAreaJunior");
    const srArea = document.getElementById("inputAreaSenior");
    
    if (gameState.difficulty === 'junior') {
        srArea.style.display = 'none';
        jrArea.style.display = 'grid';
        jrArea.innerHTML = "";
        
        let opts = [...q.options];
        opts = opts.sort(() => 0.5 - Math.random());
        
        opts.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "mc-btn";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(opt, btn);
            jrArea.appendChild(btn);
        });
    } else {
        jrArea.style.display = 'none';
        srArea.style.display = 'block';
        document.getElementById("answerInput").value = "";
        document.getElementById("answerInput").focus();
    }
}

function submitSeniorAnswer() {
    if(inputLock) return;
    const input = document.getElementById("answerInput").value.trim();
    if(!input) return;
    
    if(!/^[\u4e00-\u9fa5]+$/.test(input)) {
        document.getElementById("msgBox").innerText = "請輸入純中文答案！(不可包含符號/數字/英文)";
        document.getElementById("msgBox").style.color = "var(--primary-red)";
        playSFX('wrong');
        return;
    }
    
    if(gameState.wrongAnswersHistory.includes(input)) {
        document.getElementById("msgBox").innerText = "你已經嘗試過這個錯誤答案了！";
        document.getElementById("msgBox").style.color = "var(--primary-red)";
        playSFX('wrong');
        return;
    }

    inputLock = true;
    checkAnswer(input, null);
}

function checkAnswer(userAns, btnElement) {
    const q = gameState.pool[gameState.currentIndex];
    
    let isCorrect = false;
    if (gameState.difficulty === 'senior' && q.answer.includes('/')) {
        const possibleAnswers = q.answer.split('/');
        isCorrect = possibleAnswers.includes(userAns);
    } else {
        isCorrect = (userAns === q.answer);
    }
    
    if (isCorrect) {
        inputLock = true;
        gameState.history.push({ q: q, userAns: userAns, isCorrect: true });
        
        playSFX('correct');
        document.getElementById("msgBox").innerText = "正確！";
        document.getElementById("msgBox").style.color = "var(--hp-green)";
        
        gameState.user.hp = Math.min(100, gameState.user.hp + GAME_CONFIG.HP_REWARD_CORRECT);
        
        if(!gameState.solvedQuestionIds.includes(q.id) || gameState.user.unlockedReplayXP) {
            gameState.user.xp = Math.min(gameState.user.xp + 9, GAME_CONFIG.MAX_XP);
        }
        
        if(!gameState.solvedQuestionIds.includes(q.id)) {
            gameState.solvedQuestionIds.push(q.id);
        }
        
        gameState.stats.totalCorrect++;
        if(gameState.difficulty === 'senior') gameState.stats.srCorrect++;
        
        triggerAnimation(document.getElementById("questionBox"), "correct-flash");
        triggerAnimation(document.getElementById("questionBox"), "player-attack");
        
        updateBars();
        
        setTimeout(() => {
            gameState.currentIndex++;
            renderQuestion();
        }, 1500);
        
    } else {
        playSFX('wrong');
        gameState.user.hp = Math.max(0, gameState.user.hp - GAME_CONFIG.HP_PENALTY);
        
        gameState.wrongCount++;
        gameState.stats.wrongCountTotal++;
        gameState.stats.tryCount++;
        gameState.currentAttempts++;
        
        if(!gameState.wrongGuesses.includes(q.id)) gameState.wrongGuesses.push(q.id);
        if(gameState.difficulty === 'senior') gameState.wrongAnswersHistory.push(userAns);

        triggerAnimation(document.getElementById("bossImage"), "dragon-attack"); 
        fireBeam(window.innerWidth/2, 200, window.innerWidth/2, window.innerHeight - 200, '#e74c3c'); 
        triggerAnimation(document.getElementById("questionBox"), "shake-box");
        updateCrackStage();
        updateBars();

        if (gameState.user.hp <= 0) {
            endGame(); 
            return;
        }

        if (gameState.currentAttempts >= 3) {
            document.getElementById("msgBox").innerText = "多次嘗試失敗... 跳過此題";
            document.getElementById("msgBox").style.color = "var(--primary-red)";
            gameState.history.push({ q: q, userAns: userAns, isCorrect: false });
            
            if (gameState.difficulty === 'junior' && btnElement) {
                btnElement.disabled = true;
                btnElement.style.background = "#bdc3c7";
            }
            
            inputLock = true; 
            setTimeout(() => {
                gameState.currentIndex++;
                renderQuestion();
            }, 1500);
        } else {
            const remaining = 3 - gameState.currentAttempts;
            document.getElementById("msgBox").innerText = `錯誤！剩餘機會：${remaining}`;
            document.getElementById("msgBox").style.color = "var(--primary-red)";
            
            if (gameState.difficulty === 'junior' && btnElement) {
                btnElement.disabled = true;
                btnElement.style.background = "#e74c3c";
                btnElement.style.color = "white";
                inputLock = false; 
            }
            
            if (gameState.difficulty === 'senior') {
                inputLock = false;
                document.getElementById("answerInput").focus();
            }
        }
    }
}

function goHome() {
    if(confirm("確定要逃跑嗎？這將視為戰敗！")) {
        switchScreen("screen-menu");
    }
}

function endGame() {
    const isDead = gameState.user.hp <= 0;
    const isPerfect = (gameState.wrongCount === 0 && !isDead);
    let resultImg = "img_defeat.PNG";
    let title = "挑戰失敗";
    let gainedXP = 0; 
    let earnedCoins = 0;
    
    const db = window.questionsDB || {};
    
    if (isDead) {
        playMusic('bgm_defeat');
        title = "勝敗乃兵家常事...";
    } else {
        const totalQ = gameState.pool.length;
        const correctCount = gameState.history.filter(h => h.isCorrect).length;
        
        let baseCoins = correctCount * GAME_CONFIG.COIN_PER_Q;
        let multiplier = (correctCount === totalQ && totalQ > 0) ? 2 : 1;
        earnedCoins = baseCoins * multiplier;
        
        gameState.user.coins = Math.min(gameState.user.coins + earnedCoins, GAME_CONFIG.MAX_COINS);
        
        gainedXP = GAME_CONFIG.XP_WIN; 
        if (isPerfect) gainedXP += 5; 
        
        gameState.user.xp = Math.min(gameState.user.xp + gainedXP, GAME_CONFIG.MAX_XP);
        gameState.stats.totalPlayTime += 1; 
        
        if (isPerfect) {
            resultImg = "img_perfect.PNG";
            title = "完美通關！";
            playMusic('bgm_victory');
            gameState.user.energy = Math.min(100, gameState.user.energy + GAME_CONFIG.ENERGY_REWARD_PERFECT);
            
            gameState.stats.consecutivePerfect++;
            if (gameState.stats.consecutivePerfect >= 5) checkAchievements();
            
            const modeKey = gameState.mode === 'single' ? pendingSingleChapterKey : 'mix';
            if (modeKey !== 'mix') {
                let diffKey = modeKey + '_' + gameState.difficulty;
                if (!gameState.masteredChapters.includes(diffKey)) {
                    gameState.masteredChapters.push(diffKey);
                    saveGame();
                }
            }
            
            if(gameState.difficulty === 'junior') {
                if(gameState.dailyTasks[2].progress < 5) {
                    if(!gameState.stats.perfectChapterIds.includes(modeKey + "_jr")) {
                        gameState.dailyTasks[2].progress++;
                        gameState.stats.perfectChapterIds.push(modeKey + "_jr"); 
                    }
                }
                const targetJr = gameState.dailyTasks.find(t => t.id === 6);
                if(targetJr && targetJr.targetKey === modeKey) {
                    targetJr.progress = 1;
                }
            } else {
                if(gameState.dailyTasks[3].progress < 5) {
                    if(!gameState.stats.perfectChapterIds.includes(modeKey + "_sr")) {
                        gameState.dailyTasks[3].progress++;
                        gameState.stats.perfectChapterIds.push(modeKey + "_sr"); 
                    }
                }
                const targetSr = gameState.dailyTasks.find(t => t.id === 7);
                if(targetSr && targetSr.targetKey === modeKey) {
                    targetSr.progress = 1;
                }
            }

        } else {
            resultImg = "img_success.PNG";
            title = "挑戰成功！";
            playMusic('bgm_success');
            gameState.user.energy = Math.min(100, gameState.user.energy + GAME_CONFIG.ENERGY_REWARD_SUCCESS);
            gameState.stats.consecutivePerfect = 0;
        }
        
        if (gameState.mode === 'mix') {
            gameState.stats.mixWinCount++;
            if(gameState.mixSelectedKeys.length >= 5) gameState.stats.mixWinCount5++;
            if(gameState.mixSelectedKeys.length >= 10) gameState.stats.mixWinCount10++;
            if(gameState.mixSelectedKeys.length === Object.keys(db).length) gameState.stats.mixWinCount16++;
            
            const q5 = gameState.dailyTasks.find(t => t.id === 5);
            if(q5 && q5.progress < 2) q5.progress++;
            
            if (gameState.mixSelectedKeys.length === Object.keys(db).length && isPerfect) {
                if (!gameState.masteredChapters.includes('mix')) {
                    gameState.masteredChapters.push('mix');
                    saveGame();
                    alert("恭喜！混合試煉完美通關，成功解鎖混合試煉惡龍！");
                }
            }
        }
    }
    
    updateLevel();
    
    switchScreen("screen-result");
    document.getElementById("resultImg").src = "images/results/" + resultImg;
    document.getElementById("endTitle").innerText = title;
    
    let extraMsg = "";
    if(!isDead) extraMsg = ` (+${earnedCoins} 金幣)`;
    
    document.getElementById("endLevel").innerText = gameState.user.level;
    document.getElementById("endXP").innerText = `${gameState.user.xp} (+${gainedXP} 額外)${extraMsg}`;
    
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";
    
    gameState.pool.forEach(q => {
        let record = null;
        for(let i=gameState.history.length-1; i>=0; i--) {
            if(gameState.history[i].q.id === q.id) {
                record = gameState.history[i];
                break;
            }
        }
        
        const tr = document.createElement("tr");
        let userAnsCell = `<td style="color:gray;">未作答</td>`;
        if (record) {
            const cls = record.isCorrect ? 'res-correct' : 'res-wrong';
            userAnsCell = `<td class="${cls}">${record.userAns}</td>`;
        }
        
        tr.innerHTML = `
        <td>${q.line} <br><small>(${q.word})</small></td>
        ${userAnsCell}
        <td>${q.answer}</td>
        `;
        tbody.appendChild(tr);
    });
}

function backToMenuFromEnd() {
    switchScreen("screen-menu");
    updateUserDisplay();
}
