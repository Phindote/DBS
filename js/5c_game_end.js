function endGame() {
    const isDead = gameState.user.hp <= 0;
    const isTooManyWrong = gameState.wrongCount > (gameState.pool.length / 2);
    const isFail = isDead || isTooManyWrong;
    const isPerfect = (!isFail && gameState.wrongCount === 0);

    let resultImg = "img_defeat.PNG";
    let title = "挑戰失敗";
    let earnedCoins = 0;
    let gainedEnergy = 0;
    let finalMusic = 'bgm_success';

    const db = window.questionsDB || {};

    if (isFail) {
        finalMusic = 'bgm_defeat';
        title = "勝敗乃兵家常事...";
    } else {
        const totalQ = gameState.pool.length;
        const correctCount = gameState.history.filter(h => h.isCorrect).length;

        let baseCoins = correctCount * GAME_CONFIG.COIN_PER_Q;
        let multiplier = (correctCount === totalQ && totalQ > 0) ? 2 : 1;
        earnedCoins = baseCoins * multiplier;

        gameState.user.coins = Math.min(gameState.user.coins + earnedCoins, GAME_CONFIG.MAX_COINS);
        gameState.stats.totalPlayTime += 1;

        if (typeof triggerDrop === 'function') {
            if (isPerfect) triggerDrop('ON_CLEAR_PERFECT');
            else triggerDrop('ON_CLEAR_NORMAL');
            if (gameState.mode === 'mix') triggerDrop('ON_CLEAR_MIX');
        }

        let chapterCount = (gameState.mode === 'mix') ? gameState.mixSelectedKeys.length : 1;
        let energyPerChapter = (gameState.difficulty === 'junior') ? (isPerfect ? 3 : 2) : (isPerfect ? 6 : 4);
        gainedEnergy = energyPerChapter * chapterCount;
        gameState.user.energy = Math.min(100, gameState.user.energy + gainedEnergy);

        if (isPerfect) {
            resultImg = "img_perfect.PNG";
            title = "完美通關！";
            finalMusic = 'bgm_victory';

            gameState.stats.consecutivePerfect++;
            if (gameState.stats.consecutivePerfect >= 5) checkAchievements();

            const modeKey = gameState.mode === 'single' ? pendingSingleChapterKey : 'mix';
            if (modeKey !== 'mix') {
                let diffKey = modeKey + '_' + gameState.difficulty;
                if (!gameState.masteredChapters.includes(diffKey)) {
                    gameState.masteredChapters.push(diffKey);
                }
            }

            const dailyIdx = (gameState.difficulty === 'junior') ? 2 : 3;
            const targetIdx = (gameState.difficulty === 'junior') ? 6 : 7;
            
            if(gameState.dailyTasks[dailyIdx].progress < 5) {
                let diffTag = gameState.difficulty === 'junior' ? '_jr' : '_sr';
                if(!gameState.stats.perfectChapterIds.includes(modeKey + diffTag)) {
                    gameState.dailyTasks[dailyIdx].progress++;
                    gameState.stats.perfectChapterIds.push(modeKey + diffTag);
                }
            }
            const tQuest = gameState.dailyTasks.find(t => t.id === targetIdx);
            if(tQuest && tQuest.targetKey === modeKey) tQuest.progress = 1;

        } else {
            resultImg = "img_success.PNG";
            title = "挑戰成功！";
            finalMusic = 'bgm_success';
            gameState.stats.consecutivePerfect = 0;
        }

        if (gameState.mode === 'mix') {
            gameState.stats.mixWinCount++;
            const mixLen = gameState.mixSelectedKeys.length;
            if(mixLen >= 5) gameState.stats.mixWinCount5++;
            if(mixLen >= 10) gameState.stats.mixWinCount10++;
            if(mixLen === Object.keys(db).length) {
                gameState.stats.mixWinCount16++;
                if(isPerfect && !gameState.masteredChapters.includes('mix')) {
                    gameState.masteredChapters.push('mix');
                }
            }
            const q5 = gameState.dailyTasks.find(t => t.id === 5);
            if(q5 && q5.progress < 2) q5.progress++;
        }
    }

    saveGame();
    updateLevel(); 

    switchScreen("screen-result");
    playMusic(finalMusic); 

    document.getElementById("resultImg").src = "images/results/" + resultImg;
    document.getElementById("endTitle").innerText = title;
    document.getElementById("endStatsRow").innerText = `獲得${gameState.currentSessionXP}點經驗，${earnedCoins}個金幣，回復${gainedEnergy}點浩然之氣！`;

    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";
    gameState.pool.forEach(q => {
        const attempts = gameState.history.filter(h => h.q.id === q.id);
        const tr = document.createElement("tr");
        let userAnsCell = `<td style="color:gray;">未作答</td>`;
        
        if (attempts.length > 0) {
            const chain = attempts.map(a => a.userAns).join(" > ");
            const lastAttempt = attempts[attempts.length - 1];
            let cls = lastAttempt.isCorrect ? 'res-correct' : 'res-wrong';
            userAnsCell = `<td class="${cls}">${chain}</td>`;
        }
        
        tr.innerHTML = `<td>${q.line} <br><small>(${q.word})</small></td>${userAnsCell}<td>${q.answer}</td>`;
        tbody.appendChild(tr);
    });

    const existingBubble = document.querySelector(".result-tip-bubble");
    if(existingBubble) existingBubble.remove();
    
    const tipBubble = document.createElement("div");
    tipBubble.className = "result-tip-bubble";
    tipBubble.innerText = "同一條題目答錯超過三次也會算為戰敗喔！";
    tbody.parentElement.parentElement.appendChild(tipBubble);
}

function backToMenuFromEnd() {
    resetMenu();
    switchScreen("screen-menu");
    updateUserDisplay();
}
