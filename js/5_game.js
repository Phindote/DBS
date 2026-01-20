function handleLogin() {
    const n = document.getElementById("inputName").value.trim();
    const g = document.getElementById("inputGrade").value;
    const l = document.getElementById("inputClassLetter").value;
    if(!n || !g || !l) return alert("請輸入姓名及選擇班別");
    
    playMusic('theme');

    const c = g + l;
    gameState.user.name = n;
    gameState.user.class = c;
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
    const k = pendingSingleChapterKey;
    gameState.mode = 'single';
    gameState.currentChapterKey = k;
    switchScreen("screen-difficulty");
    const jrCost = GAME_CONFIG.ENERGY_COST_JR_SINGLE;
    const srCost = GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    document.getElementById("energyCostInfo").innerText = `消耗浩然之氣：初階 ${jrCost} / 高階 ${srCost}`;
}

function randomSelectMix() {
    deselectAllMix();
    const countVal = document.getElementById("mixRandomCount").value;
    const count = parseInt(countVal, 10);
    const allCheckboxes = Array.from(document.querySelectorAll("#mixChapterList input[type='checkbox']"));
    const totalChapters = allCheckboxes.length;
    if (totalChapters < 2) return;
    
    for (let i = totalChapters - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCheckboxes[i], allCheckboxes[j]] = [allCheckboxes[j], allCheckboxes[i]];
    }
    
    for (let i = 0; i < count; i++) {
        allCheckboxes[i].checked = true;
    }
    confirmMixMode();
}

function confirmMixMode() {
    const chks = document.querySelectorAll("#mixChapterList input:checked");
    if(chks.length < 2) return alert("最少選擇 2 篇！");
    gameState.mode = 'mix';
    gameState.currentChapterKey = "mix";
    gameState.mixSelectedKeys = Array.from(chks).map(c => c.value);
    switchScreen("screen-difficulty");
    const count = gameState.mixSelectedKeys.length;
    const jrCost = count * GAME_CONFIG.ENERGY_COST_JR_SINGLE;
    const srCost = count * GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    document.getElementById("energyCostInfo").innerText = `消耗浩然之氣：初階 ${jrCost} / 高階 ${srCost}`;
}

function initGame(diff) {
    let cost = 0;
    if (gameState.mode === 'single') {
        cost = (diff === 'junior') ? GAME_CONFIG.ENERGY_COST_JR_SINGLE : GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    } else {
        const count = gameState.mixSelectedKeys.length;
        cost = (diff === 'junior') ? count * GAME_CONFIG.ENERGY_COST_JR_SINGLE : count * GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    }
    if (gameState.user.energy < cost) {
        alert("浩然之氣不足！請前往惡龍圖鑑溫習。");
        return;
    }
    gameState.user.energy -= cost;
    gameState.stats.totalAttempts++;
    saveGame();
    gameState.difficulty = diff;
    gameState.user.hp = 100;
    gameState.currentIndex = 0;
    gameState.wrongCount = 0;
    gameState.history = [];
    let rawPool = [];
    if (gameState.mode === 'single') {
        const k = gameState.currentChapterKey;
        let arr = [];
        if (diff === 'junior') {
            arr = db[k].junior || [];
        } else {
            arr = db[k].senior || [];
        }
        rawPool = arr.map(q => ({...q, chapterTitle: db[k].title}));
        gameState.currentDragon = "images/dragons/" + db[k].img;
    } else {
        gameState.mixSelectedKeys.forEach(k => {
            let arr = [];
            if (diff === 'junior') {
                arr = db[k].junior || [];
            } else {
                arr = db[k].senior || [];
            }
            let tagged = arr.map(q => ({...q, chapterTitle: db[k].title}));
            rawPool = rawPool.concat(tagged);
        });
        gameState.currentDragon = "images/dragons/dragon_mix.jpg";
    }
    if (rawPool.length === 0) {
        alert("此模式/難度暫無題目！請檢查資料庫檔案。");
        return;
    }
    gameState.pool = JSON.parse(JSON.stringify(rawPool));
    for (let i = gameState.pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.pool[i], gameState.pool[j]] = [gameState.pool[j], gameState.pool[i]];
    }
    document.getElementById("bossImage").src = gameState.currentDragon;
    updateUserDisplay();
    updateBars();
    updateCrackStage();
    switchScreen("screen-game");
    renderQuestion();
}

function renderQuestion() {
    inputLock = false;
    gameState.wrongGuesses = [];
    const input = document.getElementById("answerInput");
    const mcDiv = document.getElementById("inputAreaJunior");
    input.value = "";
    input.classList.remove("correct-flash");
    mcDiv.innerHTML = "";
    document.getElementById("msgBox").innerText = "";
    const bossImg = document.getElementById("bossImage");
    bossImg.classList.remove("dragon-attack");
    bossImg.classList.remove("boss-damage");
    const qBox = document.getElementById("questionBox");
    qBox.classList.remove("player-attack");
    qBox.classList.remove("shake-box");
    if(gameState.currentIndex >= gameState.pool.length) {
        endGame(true);
        return;
    }
    document.getElementById("gameProgress").innerText = `進度：${gameState.currentIndex + 1} / ${gameState.pool.length}`;
    const q = gameState.pool[gameState.currentIndex];
    document.getElementById("battleChapterText").innerText = q.chapterTitle;
    document.getElementById("qLine").innerText = q.line;
    document.getElementById("qWord").innerText = q.word;
    gameState.wrongCount = 0;
    if(gameState.difficulty === 'senior') {
        document.getElementById("inputAreaSenior").style.display = "block";
        document.getElementById("inputAreaJunior").style.display = "none";
        input.focus();
    } else {
        document.getElementById("inputAreaSenior").style.display = "none";
        document.getElementById("inputAreaJunior").style.display = "grid";
        generateMC(q);
    }
}

function generateMC(q) {
    const div = document.getElementById("inputAreaJunior");
    div.innerHTML = "";
    let opts = [];
    if (q.options && q.options.length > 0) {
        opts = [...q.options];
    } else {
        opts = [q.answer];
    }
    opts.sort(() => Math.random() - 0.5);
    opts.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "mc-btn";
        btn.innerText = opt;
        btn.onclick = (e) => checkAnswer(opt, e.target);
        div.appendChild(btn);
    });
}

function submitSeniorAnswer() {
    const input = document.getElementById("answerInput");
    const val = input.value.trim();
    if(!/^[\u4e00-\u9fa5]+$/.test(val)) {
        const msg = document.getElementById("msgBox");
        msg.innerText = "請輸入純中文字，不可包含符號或英文！";
        triggerAnimation(document.querySelector(".question-box"), "shake-box");
        return;
    }
    checkAnswer(val, input);
}

function getCenter(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function checkAnswer(userVal, uiElement) {
    if (inputLock) return;
    if (gameState.difficulty === 'senior' && gameState.wrongGuesses.includes(userVal)) {
        document.getElementById("msgBox").innerText = "此答案已嘗試過，請嘗試其他答案！";
        document.getElementById("msgBox").style.color = "var(--primary-blue)";
        return;
    }
    const currentQ = gameState.pool[gameState.currentIndex];
    const bossImg = document.getElementById("bossImage");
    const qBox = document.getElementById("questionBox");
    const correctAnswers = currentQ.answer.split('/').map(s => s.trim());

    gameState.stats.tryCount++;

    if(correctAnswers.includes(userVal)) {
        inputLock = true;
        playSFX('correct');
        triggerAnimation(uiElement, "correct-flash");
        triggerAnimation(qBox, "player-attack");
        setTimeout(() => {
            triggerAnimation(bossImg, "boss-damage");
            if (!gameState.solvedQuestionIds.includes(currentQ.id) || gameState.user.unlockedReplayXP) {
                gameState.user.xp += GAME_CONFIG.XP_WIN;
                document.getElementById("msgBox").innerText = `正確！+${GAME_CONFIG.XP_WIN} XP`;
            } else {
                document.getElementById("msgBox").innerText = "正確！(已獲得過經驗)";
            }
            if (!gameState.solvedQuestionIds.includes(currentQ.id)) {
                gameState.solvedQuestionIds.push(currentQ.id);
            }
            if(gameState.difficulty === 'senior') {
                if (!gameState.solvedSeniorQuestionIds.includes(currentQ.id)) {
                    gameState.solvedSeniorQuestionIds.push(currentQ.id);
                }
            }
            gameState.user.hp = Math.min(100, gameState.user.hp + GAME_CONFIG.HP_REWARD_CORRECT);
            updateLevel();
            updateCrackStage();
            recordHistory(userVal, true);
            document.getElementById("msgBox").style.color = "var(--primary-blue)";
            setTimeout(() => {
                gameState.currentIndex++;
                renderQuestion();
            }, 800);
        }, 300);
    } else {
        playSFX('wrong');
        gameState.stats.wrongCountTotal++;

        if (gameState.difficulty === 'junior') {
            uiElement.disabled = true;
        } else {
            gameState.wrongGuesses.push(userVal);
        }
        const bossRect = bossImg.getBoundingClientRect();
        const startX = bossRect.left + bossRect.width / 2;
        const startY = bossRect.bottom - 20;
        const end = getCenter(qBox);
        fireBeam(startX, startY, end.x, end.y, '#e74c3c');
        setTimeout(() => {
            for(let i=0; i<10; i++) createParticle(end.x, end.y, '#e74c3c', 'spark');
            gameState.wrongCount++;
            gameState.stats.totalWrong++;
            gameState.user.hp -= GAME_CONFIG.HP_PENALTY;
            updateBars();
            updateCrackStage();
            const overlay = document.getElementById("damageOverlay");
            overlay.style.opacity = 1;
            setTimeout(() => overlay.style.opacity = 0, 200);
            triggerAnimation(bossImg, "dragon-attack");
            triggerAnimation(qBox, "shake-box");
            if(gameState.user.hp <= 0) {
                inputLock = true;
                qBox.classList.add("anim-explode");
                recordHistory(userVal, false);
                setTimeout(() => endGame(false), 600);
                return;
            }
            if(gameState.wrongCount >= 3) {
                inputLock = true;
                recordHistory(userVal, false);
                document.getElementById("msgBox").innerText = "錯誤次數過多！跳過此題";
                document.getElementById("msgBox").style.color = "var(--primary-red)";
                setTimeout(() => {
                    gameState.currentIndex++;
                    renderQuestion();
                }, 1000);
            } else {
                document.getElementById("msgBox").innerText = `錯誤！-${GAME_CONFIG.HP_PENALTY} HP (剩餘機會：${3 - gameState.wrongCount})`;
                document.getElementById("msgBox").style.color = "var(--primary-red)";
            }
        }, 300);
    }
}

function recordHistory(val, isCorrect) {
    gameState.history.push({
        q: gameState.pool[gameState.currentIndex],
        userAns: val,
        isCorrect: isCorrect
    });
}

function endGame(win) {
    let resultType = 'defeat';
    if (win) {
        const hasSkip = gameState.history.some(h => !h.isCorrect);
        if (!hasSkip) resultType = 'perfect';
        else resultType = 'success';
    }

    if (resultType === 'perfect') {
        playMusic('victory');
        document.getElementById("resultImg").src = "images/results/img_perfect.PNG";
        document.getElementById("endTitle").innerText = "完美通關！";
        document.getElementById("endTitle").style.color = "#f1c40f";
        gameState.user.energy = Math.min(100, gameState.user.energy + GAME_CONFIG.ENERGY_REWARD_PERFECT);

        const currentChapKey = gameState.mode === 'single' ? gameState.currentChapterKey : 'mix';
        if (currentChapKey !== 'mix') {
            if (gameState.stats.lastPerfectChapter !== currentChapKey) {
                gameState.consecutivePerfectCount++;
                gameState.stats.lastPerfectChapter = currentChapKey;
            } else {
                gameState.consecutivePerfectCount = 0;
                gameState.stats.lastPerfectChapter = "";
            }
        }
        if (!gameState.stats.perfectChapterIds.includes(currentChapKey) && currentChapKey !== 'mix') {
            gameState.stats.perfectChapterIds.push(currentChapKey);
        }

    } else if (resultType === 'success') {
        playMusic('success');
        document.getElementById("resultImg").src = "images/results/img_success.PNG";
        document.getElementById("endTitle").innerText = "順利通關！";
        document.getElementById("endTitle").style.color = "#2ecc71";
        gameState.user.energy = Math.min(100, gameState.user.energy + GAME_CONFIG.ENERGY_REWARD_SUCCESS);
        gameState.consecutivePerfectCount = 0;
        gameState.stats.lastPerfectChapter = "";
    } else {
        playMusic('defeat');
        document.getElementById("resultImg").src = "images/results/img_defeat.PNG";
        document.getElementById("endTitle").innerText = "力竭戰敗...";
        document.getElementById("endTitle").style.color = "#e74c3c";
        gameState.consecutivePerfectCount = 0;
        gameState.stats.lastPerfectChapter = "";
    }

    if(win && gameState.user.hp === 100 && !gameState.unlockedAchievements.includes("ach_7")) {
        if(gameState.stats.perfectChapterIds.length >= 3) gameState.unlockedAchievements.push("ach_7");
    }
    if(win && gameState.user.hp < 10 && !gameState.unlockedAchievements.includes("ach_8")) gameState.unlockedAchievements.push("ach_8");
    if(win && gameState.user.hp < 5 && !gameState.unlockedAchievements.includes("ach_9")) gameState.unlockedAchievements.push("ach_9");

    if (gameState.mode === 'mix' && win) {
        gameState.stats.mixWinCount++;
        const count = gameState.mixSelectedKeys.length;
        if(count >= 5) gameState.stats.mixWinCount5++;
        if(count >= 10) gameState.stats.mixWinCount10++;
        if(count >= 16) gameState.stats.mixWinCount16++;
    }

    if(document.getElementById("mixRandomCount").value && gameState.mode === 'mix' && win) {
       gameState.stats.randomWinCount++;
    }

    if (gameState.mode === 'mix' && gameState.mixSelectedKeys.length === 16 && (resultType === 'perfect' || resultType === 'success')) {
        if (!gameState.user.unlockedReplayXP) {
            gameState.user.unlockedReplayXP = true;
            alert("恭喜！您已通過16篇混合試煉，解鎖「無限經驗」模式！重複答題現在也可獲得經驗值。");
        }
    }
    checkAchievements();
    saveGame();
    switchScreen("screen-result");
    if(resultType === 'perfect') {
        if (gameState.mode === 'single') {
            const key = gameState.currentChapterKey + '_' + gameState.difficulty;
            if (!gameState.masteredChapters.includes(key)) {
                gameState.masteredChapters.push(key);
                saveGame();
            }
        } else if (gameState.mode === 'mix') {
            if (gameState.mixSelectedKeys.length === Object.keys(db).length) {
                if (!gameState.masteredChapters.includes('mix')) {
                    gameState.masteredChapters.push('mix');
                    saveGame();
                    alert("恭喜！混合試煉完美通關，成功解鎖混合試煉惡龍！");
                }
            }
        }
    }
    document.getElementById("endLevel").innerText = gameState.user.level;
    document.getElementById("endXP").innerText = gameState.user.xp;
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
        <td class="res-correct">${q.answer}</td>
        `;
        tbody.appendChild(tr);
    });
}
