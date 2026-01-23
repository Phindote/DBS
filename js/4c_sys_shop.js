let currentShopTab = 'buy'; 
let currentShopBuyFilter = 'all';
let isGachaAnimating = false;

function updateShopUI() {
    const coinEl = document.getElementById("coinDisplay");
    if(coinEl) coinEl.innerText = gameState.user.coins;
}

function triggerDrop(scenario) {
    const loginScreen = document.getElementById("screen-login");
    if (loginScreen && (loginScreen.style.display === "flex" || loginScreen.classList.contains("active"))) {
        return;
    }

    if (!gameState.user.name) return;

    const rate = DROP_SYSTEM_CONFIG[scenario] || 0;
    if (Math.random() > rate) return; 

    const rand = Math.random();
    let rarity = 'T4';
    if (rand < 0.001) rarity = 'T0';
    else if (rand < 0.01) rarity = 'T1';
    else if (rand < 0.05) rarity = 'T2';
    else if (rand < 0.20) rarity = 'T3';

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
            if (existing.count >= 99) return;
            existing.count = Math.min(existing.count + 1, 99);
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
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 0 15px rgba(231, 76, 60, 0.6));" onerror="this.src='images/ui/icon_core.PNG'">
        <div style="font-size:1.4rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${text}</div>
    `;
    const btn = modal.querySelector(".btn-main");
    if(btn) {
        btn.style.background = "#e74c3c";
        btn.innerText = "馬上收下！";
        btn.style.display = "block";
        btn.style.margin = "20px auto 0 auto"; 
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
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 0 15px rgba(46, 204, 113, 0.6));" onerror="this.src='images/ui/icon_core.PNG'">
        <div style="font-size:1.4rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${text}</div>
    `;
    modal.style.display = 'flex';
    updateCoreButtonVisibility();
    playSFX('success');
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

function switchBuyFilter(filter) {
    currentShopBuyFilter = filter;
    renderShopBuy();
}

function renderShopBuy() {
    const container = document.getElementById("shopContentArea");
    container.innerHTML = `
        <div class="inventory-tabs" style="margin-bottom:10px;">
            <button class="tab-btn ${currentShopBuyFilter === 'all' ? 'active' : ''}" onclick="switchBuyFilter('all')">全部</button>
            <button class="tab-btn ${currentShopBuyFilter === 'fragment' ? 'active' : ''}" onclick="switchBuyFilter('fragment')">素材</button>
            <button class="tab-btn ${currentShopBuyFilter === 'product' ? 'active' : ''}" onclick="switchBuyFilter('product')">成品</button>
        </div>
        <div class="pokedex-grid" id="shopGrid" style="width:100%; margin:0; padding:0;"></div>
    `;
    
    const grid = document.getElementById("shopGrid");
    
    SHOP_ITEMS.forEach(item => {
        if (currentShopBuyFilter === 'fragment' && item.type !== 'fragment') return;
        if (currentShopBuyFilter === 'product' && item.type !== 'product') return;

        const card = document.createElement("div");
        card.className = "shop-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="shop-img" onerror="this.src='images/ui/icon_core.PNG'">
            <div class="shop-title">${item.name}</div>
            <div class="shop-price">$${item.price}</div>
            <button class="btn-main" style="width:100%; margin:5px 0 0 0; background-color: #e74c3c;" onclick="buyItem('${item.id}', ${item.price})">購買</button>
        `;
        grid.appendChild(card);
    });
}

function buyItem(itemId, price) {
    if (gameState.user.coins < price) {
        return alert("金幣不足！");
    }
    
    const targetItem = MASTER_ITEMS.find(i => i.id === itemId);
    if(!targetItem) return;

    const existing = gameState.inventory.find(i => i.id === itemId);
    if (existing && existing.count >= 99) {
        return alert("該物品已達上限 (99個)！");
    }

    gameState.user.coins -= price;
    if (existing) {
        existing.count++;
    } else {
        gameState.inventory.push({ ...targetItem, count: 1 });
    }
    
    saveGame();
    updateShopUI();
    playSFX('success');
    alert(`成功購買 ${targetItem.name}！`);
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
    if (isGachaAnimating) return;
    if (gameState.user.coins < GACHA_CONFIG.COST) {
        return alert("金幣不足！");
    }
    
    isGachaAnimating = true;
    gameState.user.coins -= GACHA_CONFIG.COST;
    saveGame();
    updateShopUI(); 
    
    const egg = document.getElementById("gachaEgg");
    const flash = document.getElementById("gachaFlash");
    
    egg.classList.remove("cracked");
    egg.classList.add("gacha-shake");
    playSFX('click'); 
    
    setTimeout(() => {
        egg.classList.remove("gacha-shake");
        egg.classList.add("cracked"); 
        flash.classList.add("active");
        playSFX('correct'); 
        
        const rand = Math.random();
        let rarity = 'T4';
        if (rand < GACHA_CONFIG.RATES.T0) rarity = 'T0';
        else if (rand < (GACHA_CONFIG.RATES.T0 + GACHA_CONFIG.RATES.T1)) rarity = 'T1';
        else if (rand < (GACHA_CONFIG.RATES.T0 + GACHA_CONFIG.RATES.T1 + GACHA_CONFIG.RATES.T2)) rarity = 'T2';
        else if (rand < (GACHA_CONFIG.RATES.T0 + GACHA_CONFIG.RATES.T1 + GACHA_CONFIG.RATES.T2 + GACHA_CONFIG.RATES.T3)) rarity = 'T3';
        
        const pool = DROP_ITEMS_POOL[rarity];
        const item = pool[Math.floor(Math.random() * pool.length)];
        const rarityText = RARITY_MAP[rarity]; 

        let msg = "";
        const existing = gameState.inventory.find(i => i.id === item.id);
        if (existing) {
            if (existing.count < 99) existing.count++;
        } else {
            gameState.inventory.push({ ...item, count: 1 });
        }
        msg = `${rarityText}\n恭喜獲得：${item.name}`;
        
        saveGame();
        updateShopUI();
        
        setTimeout(() => {
            showGachaModal(item.img, msg.replace('\n', '<br>'));
            egg.classList.remove("cracked");
            flash.classList.remove("active");
            isGachaAnimating = false;
        }, 100);
    }, 800);
}
