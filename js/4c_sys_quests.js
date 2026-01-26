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

async function claimTaskReward(id) {
    const quest = DAILY_QUESTS.find(q => q.id === id);
    const userState = gameState.dailyTasks.find(t => t.id === id);
    
    if(quest && userState && !userState.claimed && userState.progress >= quest.target) {
        userState.claimed = true;
        gameState.user.coins = Math.min(gameState.user.coins + quest.reward, GAME_CONFIG.MAX_COINS);
        gameState.user.xp += 50; 
        saveGame();
        playSFX('coin');
        updateShopUI();
        renderDailyTasks();
        
        await showSystemModal('alert', `領取成功！獲得 ${quest.reward} 金幣！`);
        
        if (id === 1 && !gameState.pets.includes('pet_001')) {
            gameState.pets.push('pet_001');
            gameState.collectionDates['pet_001'] = new Date().getTime();
            saveGame();
            playSFX('success');

            const modal = document.getElementById('system-modal');
            if (modal) {
                const titleEl = document.getElementById('sys-modal-title');
                const headerEl = document.getElementById('sys-modal-header');
                const msgEl = document.getElementById('sys-modal-msg');
                const btnOk = document.getElementById('sys-btn-ok');
                const btnCancel = document.getElementById('sys-btn-cancel');
                const inputEl = document.getElementById('sys-modal-input');

                if (titleEl) titleEl.innerText = "首登獎勵";
                if (headerEl) {
                    headerEl.style.background = "#8e44ad";
                    headerEl.style.color = "white";
                }
                
                msgEl.innerHTML = `
                    <div style="font-weight:bold; color:#2c3e50; margin-bottom:10px;">荒原孤狼</div>
                    <img src="images/items/pet_001.PNG" style="width:100px; height:100px; object-fit:contain; margin:10px 0;" onerror="this.src='images/ui/icon_core.PNG'">
                `;
                
                if (inputEl) inputEl.style.display = 'none';
                if (btnCancel) btnCancel.style.display = 'none';
                if (btnOk) {
                    btnOk.style.display = 'block';
                    btnOk.style.background = "#8e44ad";
                    btnOk.style.color = "white";
                    btnOk.innerText = '收下';
                    
                    modal.style.display = 'flex';
                    
                    btnOk.onclick = () => {
                        modal.style.display = 'none';
                    };
                }
            } else {
                alert("恭喜獲得：荒原孤狼！");
            }
        }
    }
}
