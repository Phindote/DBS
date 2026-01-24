function endGame() {
    const isDead = gameState.user.hp <= 0;
    const isTooManyWrong = gameState.wrongCount > (gameState.pool.length / 2);
    const isFail = isDead || isTooManyWrong;
    const isPerfect = (!isFail && gameState.wrongCount === 0);

    let resultImg = "images/results/img_defeat.PNG";
    let title = "挑戰失敗";
    let earnedCoins = 0;
    let gainedEnergy = 0;
    let finalMusic = 'bgm_success';

    const db = window.questionsDB || {};

    // --- 成就檢查邏輯 ---
    if (!isFail) {
        if (gameState.user.hp < 10) checkAndUnlock("ach_8");
        if (gameState.user.hp < 5) checkAndUnlock("ach_9");
    }

    if (!isFail && gameState.user.hp === 100 && gameState.mode === 'single') {
        if (!gameState.stats.perfectFullHpChapterIds.includes(gameState.currentChapterKey)) {
            gameState.stats.perfectFullHpChapterIds.push(gameState.currentChapterKey);
        }
        if (gameState.stats.perfectFullHpChapterIds.length >= 3) checkAndUnlock("ach_7");
    }
    // --- 成就檢查結束 ---

    if (isFail) {
        finalMusic = 'bgm_defeat';
        title = "勝敗乃兵家常事...";
        gameState.stats.consecutivePerfect = 0; 
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
        
        if (isPerfect) {
            resultImg = "images/results/img_perfect.PNG";
            title = "完美通關！";
            gainedEnergy = GAME_CONFIG.ENERGY_REWARD_PERFECT * chapterCount;
            gameState.stats.consecutivePerfect++;
            finalMusic = 'bgm_victory';
            
            if(!gameState.chapterFirstPerfect) gameState.chapterFirstPerfect = {};
            const chKey = gameState.mode === 'single' ? gameState.currentChapterKey : 'mix';
            if(!gameState.chapterFirstPerfect[chKey]) {
                gameState.chapterFirstPerfect[chKey] = new Date().getTime();
            }

            if (gameState.mode === 'single') {
                const jrKey = gameState.currentChapterKey + '_junior';
                const srKey = gameState.currentChapterKey + '_senior';
                
                if (!gameState.stats.perfectChapterIds.includes(gameState.currentChapterKey)) {
                    gameState.stats.perfectChapterIds.push(gameState.currentChapterKey);
                }
                if (gameState.stats.perfectChapterIds.length >= 3) checkAndUnlock("ach_10");

                gameState.stats.lastPerfectChapter = gameState.currentChapterKey;

                if (gameState.difficulty === 'junior') {
                    if (!gameState.masteredChapters.includes(jrKey)) gameState.masteredChapters.push(jrKey);
                } else {
                    if (!gameState.masteredChapters.includes(srKey)) gameState.masteredChapters.push(srKey);
                }
            } else {
                if (countMixSelect(16) && isPerfect) gameState.stats.mixPerfect16++;
                if (countMixSelect(16)) checkAndUnlock("ach_23"); 
            }
            
            if (gameState.stats.consecutivePerfect >= 5) checkAndUnlock("ach_11");
            if (gameState.stats.consecutivePerfect >= 10) checkAndUnlock("ach_12");

        } else {
            resultImg = "images/results/img_success.PNG";
            title = "挑戰成功！";
            gainedEnergy = GAME_CONFIG.ENERGY_REWARD_SUCCESS * chapterCount;
            gameState.stats.consecutivePerfect = 0; 
        }

        gameState.user.energy = Math.min(100, gameState.user.energy + gainedEnergy);
        gameState.stats.energyRecovered += gainedEnergy;

        if (gameState.mode === 'mix') {
            gameState.stats.mixWinCount++;
            if (countMixSelect(5)) {
                gameState.stats.mixWinCount5++;
                checkAndUnlock("ach_21");
            }
            if (countMixSelect(10)) {
                gameState.stats.mixWinCount10++;
                checkAndUnlock("ach_22");
            }
            if (countMixSelect(16)) {
                gameState.stats.mixWinCount16++;
            }
            if (gameState.isRandomSelection) {
                gameState.stats.randomWinCount++;
                checkAndUnlock("ach_24");
                if (gameState.stats.randomWinCount >= 10) checkAndUnlock("ach_25");
            }
        }
    }

    gameState.chapterLastPlayed[gameState.mode === 'single' ? gameState.currentChapterKey : 'mix'] = new Date().getTime();

    checkAchievements();
    saveGame();
    updateUserDisplay();

    switchScreen("screen-result");
    playMusic(finalMusic);

    document.getElementById("endTitle").innerText = title;
    document.getElementById("resultImg").src = resultImg;

    const statsRow = document.getElementById("endStatsRow");
    let statsHtml = `獲得金幣：${earnedCoins}`;
    if (gainedEnergy > 0) {
        statsHtml += ` | 回復浩然之氣：${gainedEnergy}`;
    }
    statsRow.innerText = statsHtml;

    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";
    gameState.pool.forEach(q => {
        const attempts = gameState.history.filter(h => h.q.id === q.id);
        const tr = document.createElement("tr");
        let userAnsCell = `<td style="color:gray;">未作答</td>`;
        
        if (attempts.length > 0) {
            let chainHtml = attempts.map((a, i) => {
                let color = a.isCorrect ? 'var(--hp-green)' : 'var(--primary-red)';
                let arrow = (i < attempts.length - 1) ? '<span style="color:black; margin:0 5px;">&gt;</span>' : '';
                return `<span style="color:${color}; font-weight:bold;">${a.userAns}</span>${arrow}`;
            }).join("");
            userAnsCell = `<td>${chainHtml}</td>`;
        }
        
        tr.innerHTML = `<td>${q.line} <br><small>(${q.word})</small></td>${userAnsCell}<td>${q.answer}</td>`;
        tbody.appendChild(tr);
    });

    const existingBubble = document.querySelector(".result-tip-bubble");
    if(existingBubble) existingBubble.remove();
    
    // 改回單行格式
    let firstPerfectHTML = "";
    const chKey = gameState.mode === 'single' ? gameState.currentChapterKey : 'mix';
    if (gameState.chapterFirstPerfect && gameState.chapterFirstPerfect[chKey]) {
        const date = gameState.chapterFirstPerfect[chKey];
        firstPerfectHTML = `<div class="stat-perfect-date">首次完美通關：${getFormattedDate(date)}</div>`;
    }

    let tipText = "超過一半題目曾經錯誤或同一道題目答錯超過兩次，也算為戰敗喔！";
    if (isPerfect) {
        tipText = "努力保持這種水準，答案一擊即中就是完美！";
    } else if (!isFail) {
        tipText = "假如曾經答錯，也不算完美喔！繼續加油！";
    }

    const resultContainer = document.getElementById("screen-result");
    const existingDate = resultContainer.querySelector(".stat-perfect-date");
    if(existingDate) existingDate.remove();

    // 調整插入位置：StatsRow 之後 (即紅色獲得金幣文字下方)
    if (firstPerfectHTML) {
        const dateDiv = document.createElement("div");
        dateDiv.innerHTML = firstPerfectHTML;
        dateDiv.style.textAlign = "center";
        statsRow.parentNode.insertBefore(dateDiv, statsRow.nextSibling);
    }

    const tableContainer = document.querySelector("#screen-result > div[style*='overflow-y:auto']");
    const tipDiv = document.createElement("div");
    tipDiv.className = "result-tip-bubble";
    tipDiv.innerText = tipText;
    tableContainer.parentNode.insertBefore(tipDiv, tableContainer.nextSibling);
}

function backToMenuFromEnd() {
    gameState.currentIndex = 0;
    gameState.wrongCount = 0;
    gameState.history = [];
    resetMenu();
    switchScreen("screen-menu");
}

function countMixSelect(num) {
    return gameState.mixSelectedKeys.length >= num;
}

function checkAndUnlock(id) {
    if (!gameState.unlockedAchievements.includes(id)) {
        gameState.unlockedAchievements.push(id);
        gameState.collectionDates[id] = new Date().getTime();
        showUnlockNotification([id]);
    }
}
