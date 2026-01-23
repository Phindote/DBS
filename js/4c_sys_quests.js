function renderDailyTasks() {
    switchScreen("screen-daily");
    const container = document.getElementById("dailyContainer");
    container.innerHTML = "";
    
    const db = window.questionsDB || {};
    
    DAILY_QUESTS.forEach(quest => {
        let userState = gameState.dailyTasks.find(t => t.id === quest.id);
        
        if (!userState) {
            userState = { id: quest.id, progress: 0, complete: false, claimed: false };
            gameState.dailyTasks.push(userState);
        }

        let descText = quest.desc;
        if(quest.id === 6 || quest.id === 7) {
            const chapterKey = userState.targetKey;
            const chapterName = (chapterKey && db[chapterKey]) ? db[chapterKey].title : "隨機篇章";
            descText = descText.replace("指定篇章", chapterName);
        } else if (quest.id === 2) {
            const chapterKey = userState.targetKey;
            const chapterName = (chapterKey && db[chapterKey]) ? db[chapterKey].title : "隨機篇章";
            descText = `到惡龍圖鑑溫習 ${chapterName} 10分鐘`;
        }

        const row = document.createElement("div");
        const isComplete = userState.progress >= quest.target;
        
        let rowClass = "task-row";
        if (userState.claimed) rowClass += " completed"; 
        else if (isComplete) rowClass += " can-claim";
        
        row.className = rowClass;
        
        let btnClass = "btn-claim";
        let btnText = "未完成";
        let disabled = "disabled";
        
        if (userState.claimed) {
            btnText = "已領取";
            btnClass += " yellow";
        } else if (isComplete) {
            btnText = "領取";
            btnClass += " red";
            disabled = "";
        } else {
            btnClass += " gray";
        }
        
        row.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span class="task-desc">${descText}</span>
                <span class="task-reward-info">獎勵: ${quest.reward} 金幣</span>
                <span style="font-size:0.8rem; color:#7f8c8d;">進度: ${userState.progress}/${quest.target}</span>
            </div>
            <button class="${btnClass}" ${disabled} onclick="claimTaskReward(${quest.id})">${btnText}</button>
        `;
        container.appendChild(row);
    });
}

function claimTaskReward(id) {
    const quest = DAILY_QUESTS.find(q => q.id === id);
    const userState = gameState.dailyTasks.find(t => t.id === id);
    
    if(quest && userState && !userState.claimed && userState.progress >= quest.target) {
        userState.claimed = true;
        gameState.user.coins = Math.min(gameState.user.coins + quest.reward, GAME_CONFIG.MAX_COINS);
        saveGame();
        playSFX('success');
        updateShopUI();
        renderDailyTasks();
        alert(`成功領取獎勵：${quest.reward} 金幣！`);
    }
}
