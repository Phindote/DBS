function endGame() {
    const isDead = gameState.user.hp <= 0;
    const isTooManyWrong = gameState.wrongCount > (gameState.pool.length / 2);
    const isFail = isDead || isTooManyWrong;
    const isPerfect = (!isFail && gameState.wrongCount === 0);

    let resultImg = "img_defeat.PNG";
    let title = "挑戰失敗";
    let earnedCoins = 0;
    let gainedEnergy = 0;

    const db = window.questionsDB || {};

    if (isFail) {
        playMusic('bgm_defeat');
        title = "勝敗乃兵家常事...";
    } else {
        const totalQ = gameState.pool.length;
        const correctCount = gameState.history.filter(h => h.isCorrect).length;

        let baseCoins = correctCount * GAME_CONFIG.COIN_PER_Q;
        let multiplier = (correctCount === totalQ && totalQ > 0) ? 2 : 1;
        earnedCoins = baseCoins * multiplier;

        gameState.user.coins = Math.min(gameState.user.coins + earnedCoins, GAME_CONFIG.MAX_COINS);
        gameState.stats.totalPlayTime += 1;

        // [DROP SYSTEM] 情況4: 通關狀態掉落
        if (typeof triggerDrop === 'function') {
            if (isPerfect) triggerDrop('ON_CLEAR_PERFECT');
            else triggerDrop('ON_CLEAR_NORMAL');
            
            if (gameState.mode === 'mix') triggerDrop('ON_CLEAR_MIX');
        }

        let chapterCount = 1;
        if (gameState.mode === 'mix') {
            chapterCount = gameState.mixSelectedKeys.length;
        }

        let energyPerChapter = 0;
        if (gameState.difficulty === 'junior') {
            energyPerChapter = isPerfect ? 3 : 2;
        } else {
            energyPerChapter = isPerfect ? 6 : 4;
        }
        gainedEnergy = energyPerChapter * chapterCount;
        gameState.user.energy = Math.min(100, gameState.user.energy + gainedEnergy);

        if (isPerfect) {
            resultImg = "img_perfect.PNG";
            title = "完美通關！";
            playMusic('bgm_victory');

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

            if (gameState.difficulty === 'junior') {
                if (gameState.dailyTasks[2].progress < 5) {
                    if (!gameState.stats.perfectChapterIds.includes(modeKey + "_jr")) {
                        gameState.dailyTasks[2].progress++;
                        gameState.stats.perfectChapterIds.push(modeKey + "_jr");
                    }
                }
                const targetJr = gameState.dailyTasks.find(t => t.id === 6);
                if (targetJr && targetJr.targetKey === modeKey) {
                    targetJr.progress = 1;
                }
            } else {
                if (gameState.dailyTasks[3].progress < 5) {
                    if (!gameState.stats.perfectChapterIds.includes(modeKey + "_sr")) {
                        gameState.dailyTasks[3].progress++;
                        gameState.stats.perfectChapterIds.push(modeKey + "_sr");
                    }
                }
                const targetSr = gameState.dailyTasks.find(t => t.id === 7);
                if (targetSr && targetSr.targetKey === modeKey) {
                    targetSr.progress = 1;
                }
            }
        } else {
            resultImg = "img_success.PNG";
            title = "挑戰成功！";
            playMusic('bgm_success');
            gameState.stats.consecutivePerfect = 0;
        }

        if (gameState.mode === 'mix') {
            gameState.stats.mixWinCount++;
            if (gameState.mixSelectedKeys.length >= 5) gameState.stats.mixWinCount5++;
            if (gameState.mixSelectedKeys.length >= 10) gameState.stats.mixWinCount10++;
            if (gameState.mixSelectedKeys.length === Object.keys(db).length) gameState.stats.mixWinCount16++;

            const q5 = gameState.dailyTasks.find(t => t.id === 5);
            if (q5 && q5.progress < 2) q5.progress++;

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
    document.getElementById("endStatsRow").innerText = `獲得${gameState.currentSessionXP}點經驗，${earnedCoins}個金幣，回復${gainedEnergy}點浩然之氣！`;

    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";

    gameState.pool.forEach(q => {
        let record = null;
        for (let i = gameState.history.length - 1; i >= 0; i--) {
            if (gameState.history[i].q.id === q.id) {
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
    resetMenu();
    switchScreen("screen-menu");
    updateUserDisplay();
}
