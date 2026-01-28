function initGame(modeOrDifficulty) {
    if(modeOrDifficulty === 'single' || modeOrDifficulty === 'mix') {
        gameState.mode = modeOrDifficulty;
        gameState.pool = [];
        gameState.history = [];
        gameState.wrongCount = 0;
        gameState.currentIndex = 0;
        
        let jrCost = GAME_CONFIG.ENERGY_COST_JR_SINGLE;
        let srCost = GAME_CONFIG.ENERGY_COST_SR_SINGLE;

        if (modeOrDifficulty === 'mix') {
            const count = gameState.mixSelectedKeys.length;
            jrCost *= count;
            srCost *= count;
        }
        
        const infoBox = document.getElementById("energyCostInfo");
        infoBox.innerHTML = `
            <div style="display:inline-flex; align-items:center; justify-content:center; gap:15px; background:white; padding:10px 25px; border-radius:50px; border:2px solid #1abc9c; box-shadow:0 5px 15px rgba(26, 188, 156, 0.2);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:12px; height:12px; background:#1abc9c; border-radius:50%; box-shadow:0 0 8px #1abc9c;"></div>
                    <span style="font-weight:bold; color:#16a085; font-size:1.1rem;">浩然之氣</span>
                </div>
                <div style="height:20px; width:2px; background:#eee;"></div>
                <div style="display:flex; gap:15px;">
                    <div style="display:flex; align-items:baseline; gap:4px; font-weight:bold; color:#2980b9;">
                        <span style="font-size:1rem;">初階</span>
                        <span style="font-size:1.4rem; line-height:1;">-${jrCost}</span>
                    </div>
                    <div style="display:flex; align-items:baseline; gap:4px; font-weight:bold; color:#c0392b;">
                        <span style="font-size:1rem;">高階</span>
                        <span style="font-size:1.4rem; line-height:1;">-${srCost}</span>
                    </div>
                </div>
            </div>
        `;

        switchScreen('screen-difficulty');
        return;
    }

    const difficulty = modeOrDifficulty;
    const mode = gameState.mode; 
    const db = window.questionsDB || {};
    
    let cost = 0;
    let unitCost = (difficulty === 'junior') ? GAME_CONFIG.ENERGY_COST_JR_SINGLE : GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    
    if (mode === 'single') {
        cost = unitCost;
    } else {
        cost = unitCost * gameState.mixSelectedKeys.length;
    }
    
    if (gameState.user.energy < cost) return alert("浩然之氣不足！到惡龍圖鑑溫習即可回復。");
    
    gameState.user.energy -= cost;
    saveGame();

    gameState.difficulty = difficulty;
    
    let selectedChapters = [];
    if (mode === 'single') {
        selectedChapters.push(pendingSingleChapterKey);
        if(!gameState.chapterLastPlayed) gameState.chapterLastPlayed = {};
        gameState.chapterLastPlayed[pendingSingleChapterKey] = new Date().getTime();
    } else {
        selectedChapters = gameState.mixSelectedKeys;
        if(!gameState.chapterLastPlayed) gameState.chapterLastPlayed = {};
        gameState.chapterLastPlayed['mix'] = new Date().getTime();
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
    gameState.currentSessionXP = 0;
    
    gameState.user.hp = 100;
    
    if (mode === 'single') {
        gameState.currentDragon = (db[pendingSingleChapterKey] && db[pendingSingleChapterKey].img) ? db[pendingSingleChapterKey].img : "dragon_unknown.jpg";
    } else {
        gameState.currentDragon = "dragon_mix.WEBP";
    }
    
    const bossImg = document.getElementById("bossImage");
    if(bossImg) bossImg.src = "images/dragons/" + gameState.currentDragon;
    
    let titleText = "未知篇章";
    if(mode === 'single' && db[pendingSingleChapterKey]) titleText = db[pendingSingleChapterKey].title;
    else if(mode === 'mix') titleText = "混合試煉";

    document.getElementById("battleChapterText").innerText = `${titleText} (${difficulty === 'junior' ? '初階' : '高階'})`;
    
    playMusic(difficulty === 'junior' ? 'bgm_battle_jr' : 'bgm_battle_sr');
    switchScreen("screen-game");
    updateBars();
    renderQuestion();
}

function updateStatsBar(q) {
    if(!gameState.questionStats) gameState.questionStats = {};
    const stats = gameState.questionStats[q.id] || { t: 0, c: 0, w: 0 };
    
    const progressEl = document.getElementById("gameProgress");
    progressEl.innerHTML = `
        <div class="q-stats-bar">
            <div class="q-stat-seg q-stat-blue">關卡進度：<span style="color:black">${gameState.currentIndex + 1}/${gameState.pool.length}題</span></div>
            <div class="q-stat-seg q-stat-yellow">曾經作答次數：<span style="color:black">${stats.t}</span></div>
            <div class="q-stat-seg q-stat-red">曾經答錯次數：<span style="color:black">${stats.w}</span></div>
            <div class="q-stat-seg q-stat-green">曾經答對次數：<span style="color:black">${stats.c}</span></div>
        </div>
    `;
    progressEl.className = "progress-display"; 
    progressEl.style.background = "transparent";
}

function renderQuestion() {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    
    if (gameState.currentIndex >= gameState.pool.length) {
        endGame();
        return;
    }
    
    gameState.currentAttempts = 0;
    gameState.wrongAnswersHistory = [];
    inputLock = false;
    
    const q = gameState.pool[gameState.currentIndex];
    
    updateStatsBar(q);
    
    document.getElementById("qLine").innerText = q.line;
    document.getElementById("qWord").innerText = q.word;
    document.getElementById("msgBox").innerText = "";
    
    const box = document.getElementById("questionBox");
    box.classList.remove("correct-flash", "shake-box", "player-attack");
    void box.offsetWidth; 
    const boss = document.getElementById("bossImage");
    boss.classList.remove("dragon-attack");
    boss.style.filter = ""; 
    
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
            btn.style.background = ""; 
            btn.style.color = "";
            btn.innerText = opt;
            btn.disabled = false;
            btn.onclick = () => checkAnswer(opt, btn);
            jrArea.appendChild(btn);
        });
    } else {
        jrArea.style.display = 'none';
        srArea.style.display = 'block';
        const inputField = document.getElementById("answerInput");
        inputField.value = "";
        inputField.disabled = false;
        document.querySelector(".btn-attack").disabled = false;
        inputField.focus();
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

    checkAnswer(input, null);
}

function checkAnswer(userAns, btnElement) {
    if(inputLock) return;
    inputLock = true;
    
    if(btnElement) btnElement.blur();

    const btns = document.querySelectorAll(".mc-btn");
    btns.forEach(b => b.disabled = true);
    document.getElementById("answerInput").disabled = true;
    document.querySelector(".btn-attack").disabled = true;

    const q = gameState.pool[gameState.currentIndex];
    
    if(!gameState.questionStats) gameState.questionStats = {};
    if(!gameState.questionStats[q.id]) gameState.questionStats[q.id] = { t: 0, c: 0, w: 0 };
    
    gameState.stats.tryCount++;
    gameState.questionStats[q.id].t++;

    let isCorrect = false;
    if (gameState.difficulty === 'senior' && q.answer.includes('/')) {
        const possibleAnswers = q.answer.split('/');
        isCorrect = possibleAnswers.includes(userAns);
    } else {
        isCorrect = (userAns === q.answer);
    }
    
    if (isCorrect) {
        gameState.history.push({ q: q, userAns: userAns, isCorrect: true });
        gameState.questionStats[q.id].c++;
        
        updateStatsBar(q);

        playSFX('correct');

        if (btnElement) {
            btnElement.style.background = "#2ecc71";
            btnElement.style.color = "white";
        }
        
        if (typeof triggerDrop === 'function') triggerDrop('ON_ANSWER_CORRECT');
        
        let gain = 0;
        if(!gameState.solvedQuestionIds.includes(q.id) || gameState.user.unlockedReplayXP) {
            gain = 9;
            gameState.user.xp = Math.min(gameState.user.xp + gain, GAME_CONFIG.MAX_XP);
            gameState.currentSessionXP += gain;
        }

        document.getElementById("msgBox").innerText = "正確！(+" + gain + " XP)";
        document.getElementById("msgBox").style.color = "var(--hp-green)";
        
        gameState.user.hp = Math.min(100, gameState.user.hp + GAME_CONFIG.HP_REWARD_CORRECT);
        
        if(!gameState.solvedQuestionIds.includes(q.id)) {
            gameState.solvedQuestionIds.push(q.id);
        }
        
        if(gameState.difficulty === 'senior') {
             if(!gameState.solvedSrQuestionIds) gameState.solvedSrQuestionIds = [];
             if(!gameState.solvedSrQuestionIds.includes(q.id)) {
                 gameState.solvedSrQuestionIds.push(q.id);
             }
        }
        
        gameState.stats.totalCorrect++; 
        if(gameState.difficulty === 'senior') {
            gameState.stats.srCorrect++; 
        }
        
        const box = document.getElementById("questionBox");
        box.classList.remove("correct-flash"); 
        void box.offsetWidth;
        box.classList.add("correct-flash"); 
        
        const vfxLayer = document.getElementById("vfxLayer");
        if(vfxLayer) {
            vfxLayer.innerHTML = '';
            const slash = document.createElement("div");
            slash.className = "slash-cross active";
            vfxLayer.appendChild(slash);
            setTimeout(() => {
                 slash.remove();
            }, 600);
        }

        const boss = document.getElementById("bossImage");
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            flashCount++;
            if(flashCount % 2 === 1) {
                boss.style.filter = "brightness(2.5) hue-rotate(90deg)";
            } else {
                boss.style.filter = "";
            }
            if(flashCount >= 6) {
                clearInterval(flashInterval);
                boss.style.filter = ""; 
            }
        }, 100);

        updateBars();
        checkAchievements();
        
        setTimeout(() => {
            gameState.currentIndex++;
            renderQuestion();
        }, 2000);
        
    } else {
        gameState.history.push({ q: q, userAns: userAns, isCorrect: false });
        gameState.questionStats[q.id].w++;
        
        updateStatsBar(q);

        playSFX('wrong');
        
        if (typeof triggerDrop === 'function') triggerDrop('ON_ANSWER_WRONG');

        gameState.user.hp = Math.max(0, gameState.user.hp - GAME_CONFIG.HP_PENALTY);
        
        gameState.wrongCount++;
        gameState.stats.wrongCountTotal++; 
        gameState.currentAttempts++;
        
        if(!gameState.wrongGuesses.includes(q.id)) gameState.wrongGuesses.push(q.id);
        if(gameState.difficulty === 'senior') gameState.wrongAnswersHistory.push(userAns);

        const dragonRect = document.getElementById("bossImage").getBoundingClientRect();
        const boxRect = document.getElementById("questionBox").getBoundingClientRect();
        
        const startX = dragonRect.left + dragonRect.width / 2;
        const startY = dragonRect.bottom - 50; 
        const endX = boxRect.left + boxRect.width / 2;
        const endY = boxRect.top + boxRect.height / 2;

        triggerAnimation(document.getElementById("bossImage"), "dragon-attack"); 
        fireBeam(startX, startY, endX, endY, '#e74c3c'); 
        triggerAnimation(document.getElementById("questionBox"), "shake-box");
        updateCrackStage();
        updateBars();
        
        checkAchievements();

        if (gameState.user.hp <= 0) {
            setTimeout(endGame, 1000); 
            return;
        }

        if (gameState.currentAttempts >= 3) {
            document.getElementById("msgBox").innerText = "多次嘗試失敗⋯⋯跳過此題";
            document.getElementById("msgBox").style.color = "var(--primary-red)";
            
            if (gameState.difficulty === 'junior' && btnElement) {
                btnElement.style.background = "#e74c3c";
                btnElement.style.color = "white";
            }
            
            setTimeout(() => {
                gameState.currentIndex++;
                renderQuestion();
            }, 2000);
        } else {
            const remaining = 3 - gameState.currentAttempts;
            document.getElementById("msgBox").innerText = `錯誤！剩餘機會：${remaining}`;
            document.getElementById("msgBox").style.color = "var(--primary-red)";
            
            if (gameState.difficulty === 'junior' && btnElement) {
                btnElement.style.background = "#e74c3c";
                btnElement.style.color = "white";
            }
            
            setTimeout(() => {
                inputLock = false;
                if(gameState.difficulty === 'junior') {
                    const allBtns = document.querySelectorAll(".mc-btn");
                    allBtns.forEach(b => {
                        if(b.style.background !== "rgb(231, 76, 60)" && b.style.background !== "#e74c3c" && b.style.background !== "rgb(46, 204, 113)" && b.style.background !== "#2ecc71") { 
                            b.disabled = false;
                        }
                    });
                } else {
                    document.getElementById("answerInput").disabled = false;
                    document.querySelector(".btn-attack").disabled = false;
                    document.getElementById("answerInput").focus();
                }
            }, 1000);
        }
    }
}

async function goHome() {
    if(await confirm("確定要逃跑嗎？這將視為戰敗！")) {
         updateUserDisplay();
         resetMenu();
         switchScreen('screen-menu');
    }
}
