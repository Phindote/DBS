let currentShopTab = 'buy'; 
let currentSmeltSlotIndex = -1;

function updateShopUI() {
    const coinEl = document.getElementById("coinDisplay");
    if(coinEl) coinEl.innerText = gameState.user.coins;
}

function triggerDrop(scenario) {
    if (!gameState.user.name) return;

    const rate = DROP_SYSTEM_CONFIG[scenario] || 0;
    if (Math.random() > rate) return; 

    const rand = Math.random();
    let rarity = 'R';
    if (rand < 0.05) rarity = 'SSR';
    else if (rand < 0.30) rarity = 'SR';

    const pool = DROP_ITEMS_POOL[rarity];
    if (!pool || pool.length === 0) return;
    const itemTemplate = pool[Math.floor(Math.random() * pool.length)];

    let msg = "";
    if (itemTemplate.type === 'coin') {
        gameState.user.coins = Math.min(gameState.user.coins + itemTemplate.value, GAME_CONFIG.MAX_COINS);
        msg = `獲得：${itemTemplate.name} (+${itemTemplate.value}金幣)`;
    } else {
        const existing = gameState.inventory.find(i => i.id === itemTemplate.id);
        if (existing) {
            existing.count++;
        } else {
            gameState.inventory.push({ ...itemTemplate, count: 1 });
        }
        msg = `獲得：${itemTemplate.name} x1`;
    }
    
    saveGame();
    updateShopUI();
    showDropModal(itemTemplate.img, msg);
}

function showDropModal(img, text) {
    const modal = document.getElementById("dropModal");
    const body = document.getElementById("dropModalBody");
    const imgSrc = img ? `images/items/${img}` : `images/ui/icon_core.PNG`;

    body.innerHTML = `
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 0 15px rgba(231, 76, 60, 0.6));">
        <div style="font-size:1.4rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${text}</div>
    `;
    const btn = modal.querySelector(".btn-main");
    if(btn) {
        btn.style.background = "#e74c3c";
        btn.innerText = "馬上收下！";
    }
    modal.style.display = 'flex';
    updateCoreButtonVisibility();
    playSFX('success');
}

function showGachaModal(img, text) {
    const modal = document.getElementById("gachaModal");
    const body = document.getElementById("gachaModalBody");
    const imgSrc = img ? `images/items/${img}` : `images/ui/icon_core.PNG`;

    body.innerHTML = `
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 0 15px rgba(46, 204, 113, 0.6));">
        <div style="font-size:1.4rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${text}</div>
    `;
    modal.style.display = 'flex';
    updateCoreButtonVisibility();
    playSFX('success');
}

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

let currentPokedexKey = null;

function showChapterContent(key) {
    const db = window.questionsDB || {};
    const item = db[key];
    currentPokedexKey = key;
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
        if(quest2 && quest2.targetKey === currentPokedexKey) {
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
    currentPokedexKey = null;
}

function showAchievements() {
    switchScreen("screen-achievements");
    const list = document.getElementById("achievementList");
    if(list) {
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

function renderShop() {
    switchScreen("screen-shop");
    updateShopUI();
    
    ['tabBuy', 'tabSmelt', 'tabGacha'].forEach(id => document.getElementById(id).classList.remove('active'));
    
    if (currentShopTab === 'buy') {
        document.getElementById('tabBuy').classList.add('active');
        renderShopBuy();
    } else if (currentShopTab === 'smelt') {
        document.getElementById('tabSmelt').classList.add('active');
        renderShopSmelt();
    } else if (currentShopTab === 'gacha') {
        document.getElementById('tabGacha').classList.add('active');
        renderShopGacha();
    }
}

function switchShopTab(tab) {
    currentShopTab = tab;
    renderShop();
    playSFX('click');
}

function renderShopBuy() {
    const container = document.getElementById("shopContentArea");
    container.innerHTML = `<div class="pokedex-grid" id="shopGrid"></div>`;
    const grid = document.getElementById("shopGrid");
    
    SHOP_ITEMS.forEach(item => {
        const card = document.createElement("div");
        card.className = "shop-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="shop-img" onerror="this.src='images/ui/icon_core.PNG'">
            <div class="shop-title">${item.name}</div>
            <div class="shop-price">$${item.price}</div>
            <button class="btn-secondary" style="width:100%; margin:5px 0 0 0;" onclick="alert('功能開發中...')">購買</button>
        `;
        grid.appendChild(card);
    });
}

function renderShopSmelt() {
    const container = document.getElementById("shopContentArea");
    container.innerHTML = `
        <div class="smelt-grid-container" id="smeltContainer" style="margin-top:10px;"></div>
        <div style="display:flex; gap:10px; margin-top:20px; justify-content:center;">
            <button class="btn-main" style="margin:0; background:#8e44ad;" onclick="showRecipes()">合成功式</button>
            <button class="btn-main" style="margin:0;" onclick="initSmelt()">開始合成</button>
        </div>
    `;
    const grid = document.getElementById("smeltContainer");
    
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
            currentSmeltSlotIndex = i;
            document.getElementById("smeltSelectModal").style.display = "flex";
            renderSmeltInventory();
        };
        grid.appendChild(slot);
    }
}

function renderSmeltInventory() {
    const grid = document.getElementById("smeltInventoryGrid");
    grid.innerHTML = "";
    gameState.inventory.forEach((item, index) => {
        if(!item) return;
        const card = document.createElement("div");
        card.className = "pokedex-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="pokedex-img">
            <div class="pokedex-title">${item.name}</div>
            <div class="inv-count-badge">x${item.count}</div>
        `;
        card.onclick = () => selectSmeltItem(index);
        grid.appendChild(card);
    });
}

function selectSmeltItem(invIndex) {
    const item = gameState.inventory[invIndex];
    if(item) {
        smeltSlots[currentSmeltSlotIndex] = { ...item, originalIndex: invIndex }; 
        document.getElementById("smeltSelectModal").style.display = "none";
        renderShop();
    }
}

function renderShopGacha() {
    const container = document.getElementById("shopContentArea");
    container.innerHTML = `
        <div class="gacha-container">
            <div id="gachaEgg" class="css-golden-egg"></div>
            <div id="gachaFlash" class="gacha-flash"></div>
            <div style="text-align:center; color:var(--primary-blue); font-weight:bold; margin-bottom:10px;">
                龍蛋祈願 (花費: ${GACHA_CONFIG.COST} 金幣)
            </div>
            <button class="btn-main" style="background:#f1c40f; color:#d35400;" onclick="playGacha()">立即祈願</button>
        </div>
    `;
}

function playGacha() {
    if (gameState.user.coins < GACHA_CONFIG.COST) {
        return alert("金幣不足！");
    }
    
    gameState.user.coins -= GACHA_CONFIG.COST;
    saveGame();
    updateShopUI(); 
    
    const egg = document.getElementById("gachaEgg");
    const flash = document.getElementById("gachaFlash");
    
    egg.classList.add("gacha-shake");
    playSFX('click'); 
    
    setTimeout(() => {
        egg.classList.remove("gacha-shake");
        flash.classList.add("active");
        playSFX('correct'); 
        
        const rand = Math.random();
        let rarity = 'R';
        if (rand < GACHA_CONFIG.RATES.SSR) rarity = 'SSR';
        else if (rand < (GACHA_CONFIG.RATES.SSR + GACHA_CONFIG.RATES.SR)) rarity = 'SR';
        
        const pool = DROP_ITEMS_POOL[rarity];
        const item = pool[Math.floor(Math.random() * pool.length)];
        const rarityText = RARITY_MAP[rarity]; 

        let msg = "";
        if (item.type === 'coin') {
            gameState.user.coins += item.value;
            msg = `${rarityText}\n恭喜獲得：${item.name} (+${item.value}金幣)`;
        } else {
            const existing = gameState.inventory.find(i => i.id === item.id);
            if (existing) existing.count++;
            else gameState.inventory.push({ ...item, count: 1 });
            msg = `${rarityText}\n恭喜獲得：${item.name}`;
        }
        
        saveGame();
        updateShopUI();
        showGachaModal(item.img, msg.replace('\n', '<br>'));
    }, 1500);
}

function renderSmelting() {
    currentShopTab = 'smelt';
    renderShop();
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

    if(count < 1 || count > item.count) {
        alert("無效的數量！");
        return;
    }

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

function initSmelt() {
    if (smeltSlots.every(s => s === null)) return alert("請先添加材料！");
    document.getElementById("smeltConfirmModal").style.display = "flex";
    updateCoreButtonVisibility();
}

function executeSmelt() {
    document.getElementById("smeltConfirmModal").style.display = "none";
    
    smeltSlots.forEach(slotItem => {
        if(slotItem) {
            const targetItem = gameState.inventory.find(i => i.name === slotItem.name && i.count > 0);
            if(targetItem) {
                targetItem.count--;
            }
        }
    });
    gameState.inventory = gameState.inventory.filter(i => i.count > 0);
    saveGame();

    smeltSlots = [null, null, null, null];
    renderShop(); 
    alert("熔煉成功！(獲得: 未知物品)");
    updateCoreButtonVisibility();
}

function showRecipes() {
    document.getElementById("recipeModal").style.display = "flex";
    updateCoreButtonVisibility();
}
