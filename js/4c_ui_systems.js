function showPokedex() {
    switchScreen("screen-pokedex");
    checkAchievements();
    const db = window.questionsDB || {};
    const container = document.getElementById("pokedexContainer");
    container.innerHTML = "";
    Object.keys(db).forEach(key => {
        const item = db[key];
        const jrKey = key + '_junior';
        const srKey = key + '_senior';
        const isMastered = gameState.masteredChapters.includes(jrKey) && gameState.masteredChapters.includes(srKey);
        const countProgress = (list) => {
            if (!list) return { total: 0, solved: 0 };
            let solved = 0;
            list.forEach(q => {
                if(gameState.solvedQuestionIds.includes(q.id)) solved++;
            });
            return { total: list.length, solved: solved };
        };
        const jrData = countProgress(item.junior || []);
        const srData = countProgress(item.senior || []);
        createPokedexCard(container, item.title, item.img, isMastered, key, jrData, srData);
    });
    const isMixMastered = gameState.masteredChapters.includes('mix');
    createPokedexCard(container, "《混合試煉》", "dragon_mix.jpg", isMixMastered, "mix", null, null);
}

function createPokedexCard(container, title, img, unlocked, key, jrData, srData) {
    const card = document.createElement("div");
    card.className = "pokedex-card" + (unlocked ? " unlocked" : "");
    const imgSrc = unlocked ? "images/dragons/" + img : "images/dragons/dragon_unknown.jpg";
    let statsHTML = "";
    if (key === 'mix') {
        statsHTML = `<span class="stat-badge stat-jr">特殊挑戰</span>`;
    } else {
        statsHTML = `
        <div class="pokedex-stats">
        <span class="stat-badge stat-jr">初階: 全 ${jrData.total} | 已破 ${jrData.solved}</span>
        <span class="stat-badge stat-sr">高階: 全 ${srData.total} | 已破 ${srData.solved}</span>
        </div>
        `;
    }
    card.innerHTML = `
    <img src="${imgSrc}" class="pokedex-img" alt="Dragon" onerror="this.src='images/dragons/dragon_unknown.jpg'">
    <div class="pokedex-title">${title}</div>
    ${statsHTML}
    `;
    if (key !== 'mix') {
        card.onclick = () => showChapterContent(key);
    }
    container.appendChild(card);
}

function showChapterContent(key) {
    const db = window.questionsDB || {};
    const item = db[key];
    document.getElementById("modalTitle").innerText = item.title;
    document.getElementById("modalBody").innerText = item.content || "暫無內容";
    document.getElementById("contentModal").style.display = "flex";
    updateCoreButtonVisibility();
    
    pokedexSeconds = 0;
    updatePokedexBar();
    pokedexTimer = setInterval(() => {
        pokedexSeconds++;
        if(pokedexSeconds > 600) pokedexSeconds = 600;
        updatePokedexBar();
    }, 1000);
}

function updatePokedexBar() {
    const minutes = Math.floor(pokedexSeconds / 60);
    for(let i=0; i<10; i++) {
        const seg = document.getElementById("seg" + i);
        if (i < minutes) {
            if (!seg.classList.contains("filled")) {
                seg.classList.add("filled", "pulse");
                setTimeout(() => seg.classList.remove("pulse"), 500);
            }
        } else {
            seg.classList.remove("filled", "pulse");
        }
    }
}

function closeContentModal() {
    document.getElementById("contentModal").style.display = "none";
    updateCoreButtonVisibility();
    
    clearInterval(pokedexTimer);
    const minutes = Math.floor(pokedexSeconds / 60);
    if (minutes >= 1) { 
        const earned = Math.min(GAME_CONFIG.MAX_STUDY_MINS, minutes * GAME_CONFIG.ENERGY_REWARD_STUDY); 
        gameState.user.energy = Math.min(100, gameState.user.energy + earned);
        gameState.stats.totalStudyMins += minutes;
        gameState.stats.energyRecovered += earned;
        checkAchievements();
        
        let quest2 = gameState.dailyTasks.find(t => t.id === 2);
        if(quest2) {
            quest2.progress += minutes;
            saveGame();
        }

        saveGame();
        updateUserDisplay();
        alert(`溫習了 ${minutes} 分鐘，浩然之氣 +${earned}！`);
        if (minutes === 1 && !gameState.unlockedAchievements.includes("ach_34")) {
            gameState.unlockedAchievements.push("ach_34");
            saveGame();
        }
    } else {
        alert("溫習時間不足1分鐘，未獲得浩然之氣。");
    }
}

function showAchievements() {
    switchScreen("screen-achievements");
    const list = document.getElementById("achievementList");
    list.innerHTML = "";
    TITLES.forEach((title, index) => {
        const div = document.createElement("div");
        const isCurrent = gameState.user.title === title;
        div.className = "achievement-item" + (isCurrent ? " active" : "");
        const startLv = Math.floor(index * 5.5) + 1;
        let endLv = Math.floor((index + 1) * 5.5);
        if (index === TITLES.length - 1) endLv = 99;
        let desc = `等級 ${startLv} - ${endLv}`;
        if (index === TITLES.length - 1) {
            desc = "等級 99 及 9999 經驗值";
        }
        div.innerHTML = `<span>${desc}</span><span>${title}</span>`;
        list.appendChild(div);
    });
}

function showDragonSeal() {
    checkAchievements(); 
    switchScreen("screen-achievements");
    const container = document.getElementById("sealContainer");
    container.innerHTML = "";
    
    ACHIEVEMENTS.forEach((ach, index) => {
        const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
        const card = document.createElement("div");
        card.className = "pokedex-card" + (isUnlocked ? " unlocked" : "");
        
        const imgSrc = isUnlocked ? `images/achievements/ach_${index+1}.PNG` : "images/achievements/ach_locked.PNG"; 
        
        card.innerHTML = `
            <img src="${imgSrc}" class="pokedex-img" alt="Seal" onerror="this.src='images/achievements/ach_locked.PNG'">
            <div class="pokedex-title">${ach.title}</div>
        `;
        card.onclick = () => {
            alert(`【${ach.title}】\n\n條件：${ach.desc}\n狀態：${isUnlocked ? "已解鎖" : "未解鎖"}`);
        };
        container.appendChild(card);
    });
}

function showTitlesModal() {
    document.getElementById("titlesModal").style.display = "flex";
    updateCoreButtonVisibility();
    
    const container = document.getElementById("titleRoadContainer");
    container.innerHTML = "";
    
    let userIndex = TITLES.indexOf(gameState.user.title);
    if(userIndex === -1) userIndex = 0;

    TITLES.forEach((t, i) => {
        const div = document.createElement("div");
        let status = "locked"; 
        let icon = "🔒";
        if (i < userIndex) { status = "passed"; icon = "✅"; }
        else if (i === userIndex) { status = "active"; icon = "📍"; }

        div.className = `title-node ${status}`;
        
        let range = "";
        if (i === TITLES.length - 1) range = "Lv.99 (Max)";
        else {
            const s = Math.floor(i * 5.5) + 1;
            const e = Math.floor((i + 1) * 5.5);
            range = `Lv.${s} - ${e}`;
        }

        div.innerHTML = `
            <div class="node-level">${range}</div>
            <div class="node-name">${t}</div>
            <div class="node-status">${icon}</div>
        `;
        container.appendChild(div);
    });

    setTimeout(() => {
        const activeNode = container.querySelector(".title-node.active");
        if(activeNode) activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function closeTitlesModal() {
    document.getElementById('titlesModal').style.display='none';
    updateCoreButtonVisibility();
}

function showUnlockNotification(newIds) {
    if(!Array.isArray(newIds) || newIds.length === 0) return;
    
    newIds.forEach(id => {
        if(!achievementQueue.includes(id)) {
            achievementQueue.push(id);
        }
    });
    
    const modal = document.getElementById("unlockModal");
    if(modal.style.display !== 'flex') {
        processNextUnlock();
    }
}

function processNextUnlock() {
    const modal = document.getElementById("unlockModal");
    const body = document.getElementById("unlockModalBody");
    
    if(achievementQueue.length === 0) {
        modal.style.display = 'none';
        updateCoreButtonVisibility();
        return;
    }
    
    const id = achievementQueue.shift();
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    
    if(ach) {
        body.innerHTML = `
            <img src="images/achievements/${ach.id}.PNG" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));">
            <div style="font-size:1.4rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${ach.title}</div>
            <div style="font-size:1rem; color:#555;">${ach.desc}</div>
        `;
        modal.style.display = 'flex';
        updateCoreButtonVisibility();
        playSFX('success');
    } else {
        processNextUnlock();
    }
}

function showShop() {
    renderShop();
}

function renderShop() {
    switchScreen("screen-shop");
    const container = document.getElementById("shopContainer");
    container.innerHTML = "";
    document.getElementById("coinDisplay").innerText = `金幣：${gameState.user.coins}`;
    
    SHOP_ITEMS.forEach(item => {
        const card = document.createElement("div");
        card.className = "shop-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="shop-img" onerror="this.src='images/ui/icon_core.PNG'">
            <div class="shop-title">${item.name}</div>
            <div class="shop-price">$${item.price}</div>
            <button class="btn-secondary" style="width:100%; margin:5px 0 0 0;" onclick="alert('功能開發中...')">購買</button>
        `;
        container.appendChild(card);
    });
}

function filterInventory(type, btn) {
    currentInvTab = type;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderInventory();
}

function renderInventory() {
    switchScreen("screen-inventory");
    const container = document.getElementById("inventoryContainer");
    container.innerHTML = "";
    
    let filteredItems = gameState.inventory.map((item, index) => ({...item, originalIndex: index}));
    
    if (currentInvTab !== 'all') {
        filteredItems = filteredItems.filter(item => item && item.type === currentInvTab);
    }
    
    const slots = 48;
    
    for(let i=0; i<slots; i++) {
        const card = document.createElement("div");
        card.className = "pokedex-card"; 
        
        if(i < filteredItems.length && filteredItems[i]) {
            const item = filteredItems[i];
            const realIndex = item.originalIndex;
            
             card.innerHTML = `
                <img src="images/items/${item.img}" class="pokedex-img">
                <div class="pokedex-title">${item.name}</div>
                <div class="inv-count-badge">x${item.count}</div>
                <button class="btn-inv-delete" onclick="promptDeleteItem(${realIndex})">×</button>
             `;
        } else {
             card.style.opacity = "0.5";
             card.innerHTML = `
                <div style="width:100%; height:100px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:2rem; font-weight:bold;">${i+1}</div>
                <div style="font-size:0.8rem; color:#ccc;">空</div>
             `;
        }
        container.appendChild(card);
    }
    
    if (gameState.inventory.length > 48) {
        alert("警告：背包已滿，請清理物品！");
    }
}

function promptDeleteItem(index) {
    itemToDeleteIndex = index;
    const item = gameState.inventory[index];
    document.getElementById("deleteItemName").innerText = item.name + " (擁有: " + item.count + ")";
    document.getElementById("deleteCount").value = 1;
    document.getElementById("deleteCount").max = item.count;
    document.getElementById("deleteModal").style.display = "flex";
    updateCoreButtonVisibility();
}

function confirmDelete() {
    if (itemToDeleteIndex === -1) return;
    const count = parseInt(document.getElementById("deleteCount").value);
    const item = gameState.inventory[itemToDeleteIndex];
    if (count >= item.count) {
        gameState.inventory.splice(itemToDeleteIndex, 1);
    } else {
        item.count -= count;
    }
    saveGame();
    renderInventory();
    document.getElementById("deleteModal").style.display = "none";
    updateCoreButtonVisibility();
}

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
        renderDailyTasks();
        alert(`成功領取獎勵：${quest.reward} 金幣！`);
    }
}

function renderSmelting() {
    switchScreen("screen-smelt");
    const container = document.getElementById("smeltContainer");
    container.innerHTML = "";
    
    for(let i=0; i<4; i++) {
        const slot = document.createElement("div");
        slot.className = "smelt-slot" + (smeltSlots[i] ? " filled" : "");
        
        if (smeltSlots[i]) {
            slot.innerHTML = `
                <img src="images/items/${smeltSlots[i].img}" style="width:60%; height:60%; object-fit:contain;">
                <div style="font-size:0.8rem; font-weight:bold;">${smeltSlots[i].name}</div>
            `;
        } else {
            slot.innerHTML = `<div class="smelt-plus">+</div>`;
        }
        
        slot.onclick = () => {
            if(!smeltSlots[i]) {
                alert("請從背包選擇物品添加 (功能開發中: 預設添加鐵線)");
                smeltSlots[i] = { name: "鐵線", img: "item_wire.PNG", count: 1 };
                renderSmelting();
            } else {
                smeltSlots[i] = null;
                renderSmelting();
            }
        };
        container.appendChild(slot);
    }
}

function initSmelt() {
    if (smeltSlots.every(s => s === null)) return alert("請先添加材料！");
    document.getElementById("smeltConfirmModal").style.display = "flex";
    updateCoreButtonVisibility();
}

function executeSmelt() {
    document.getElementById("smeltConfirmModal").style.display = "none";
    smeltSlots = [null, null, null, null];
    renderSmelting();
    alert("熔煉成功！(獲得: 未知物品)");
    updateCoreButtonVisibility();
}

function showRecipes() {
    document.getElementById("recipeModal").style.display = "flex";
    updateCoreButtonVisibility();
}

function renderPets() {
    switchScreen("screen-pet");
    const container = document.getElementById("petContainer");
    container.innerHTML = "";
    
    for(let i=0; i<20; i++) {
        const card = document.createElement("div");
        card.className = "pokedex-card";
        
        if(gameState.pets[i]) {
            card.innerHTML = `
                <img src="images/pets/${gameState.pets[i].img}" class="pokedex-img">
                <div class="pokedex-title">${gameState.pets[i].name}</div>
            `;
        } else {
            card.style.opacity = "0.5";
            card.innerHTML = `
                <div style="width:100%; height:100px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:2rem; font-weight:bold;">?</div>
                <div class="shop-title">寵物位 ${i+1}</div>
            `;
        }
        container.appendChild(card);
    }
}
