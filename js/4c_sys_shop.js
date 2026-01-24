let currentShopTab = 'buy'; 
let currentShopBuyFilter = 'all';
let isGachaAnimating = false;
let currentBuyItem = null;

// Re-defining here just in case, though shared context is better.
const ITEM_RARITY_COLORS = {
    'T4': '#333333',
    'T3': '#e74c3c',
    'T2': '#3498db',
    'T1': '#8e44ad',
    'T0': '#f1c40f',
    'SP': '#f1c40f'
};

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

    let count = 1;
    if (itemTemplate.type === 'coin') {
        count = itemTemplate.value;
        gameState.user.coins = Math.min(gameState.user.coins + count, GAME_CONFIG.MAX_COINS);
    } else {
        const existing = gameState.inventory.find(i => i.id === itemTemplate.id);
        if (existing) {
            if (existing.count >= 99) return;
            existing.count = Math.min(existing.count + 1, 99);
        } else {
            gameState.inventory.push({ ...itemTemplate, count: 1 });
        }
    }
    
    saveGame();
    updateShopUI();
    showDropModal(itemTemplate, count);
}

function showDropModal(item, count) {
    const modal = document.getElementById("dropModal");
    const body = document.getElementById("dropModalBody");
    const imgSrc = item.img ? `images/items/${item.img}` : `images/ui/icon_core.PNG`;
    
    const rarityText = RARITY_MAP[item.rarity] || "";
    const rarityColor = ITEM_RARITY_COLORS[item.rarity] || '#333';
    
    let textHTML = "";
    if (item.type === 'coin') {
        textHTML = `<div style="font-size:1.4rem; font-weight:bold; color:#f1c40f; margin-bottom: 5px;">${item.name} +${count}</div>`;
    } else {
        textHTML = `<div style="font-size:1.2rem; font-weight:bold; color:black; margin-bottom: 5px;">${item.name} x${count} <span style="font-size:0.9rem; color:${rarityColor};">${rarityText}</span></div>`;
    }

    body.innerHTML = `
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 0 15px rgba(46, 204, 113, 0.6));" onerror="this.src='images/ui/icon_core.PNG'">
        ${textHTML}
    `;
    const btn = modal.querySelector(".btn-main");
    if(btn) {
        btn.style.background = "#2ecc71";
        btn.style.color = "white";
        btn.innerText = "馬上收下！";
        btn.style.display = "block";
        btn.style.margin = "20px auto 0 auto"; 
    }
    modal.style.display = 'flex';
    updateCoreButtonVisibility();
    playSFX('success');
}

function showGachaModal(item) {
    const modal = document.getElementById("gachaModal");
    const body = document.getElementById("gachaModalBody");
    const imgSrc = item.img ? `images/items/${item.img}` : `images/ui/icon_core.PNG`;

    const rarityText = RARITY_MAP[item.rarity] || "";
    const rarityColor = ITEM_RARITY_COLORS[item.rarity] || '#333';

    body.innerHTML = `
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 0 15px rgba(241, 196, 15, 0.6));" onerror="this.src='images/ui/icon_core.PNG'">
        <div style="font-size:1.2rem; font-weight:bold; color:black; margin-bottom: 5px;">${item.name} x1 <span style="font-size:0.9rem; color:${rarityColor};">${rarityText}</span></div>
        <div style="font-size:1.6rem; font-weight:bold; color:#f1c40f; margin-top: 15px;">恭喜獲得！</div>
    `;
    modal.style.display = 'flex';
    updateCoreButtonVisibility();
    playSFX('success');
}

function renderShop() {
    switchScreen("screen-shop");
    updateShopUI();
    
    ['tabBuy', 'tabSmelt', 'tabGacha'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active');
        el.style.backgroundColor = '';
        el.style.color = '';
    });
    
    if (currentShopTab === 'buy') {
        document.getElementById('tabBuy').classList.add('active');
        renderShopBuy();
    } else if (currentShopTab === 'smelt') {
        const el = document.getElementById('tabSmelt');
        el.classList.add('active');
        el.style.backgroundColor = '#8e44ad';
        el.style.color = 'white';
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
        const color = ITEM_RARITY_COLORS[item.rarity] || '#333';
        
        card.innerHTML = `
            <img src="images/items/${item.img}" class="shop-img" onerror="this.src='images/ui/icon_core.PNG'">
            <div class="shop-title" style="color:${color}">${item.name}</div>
            <div class="shop-price">$${item.price}</div>
            <button class="btn-main" style="width:100%; margin:5px 0 0 0; background-color: #e74c3c; color: white;" onclick="buyItem('${item.id}', ${item.price})">購買</button>
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

    currentBuyItem = { ...targetItem, price: price };
    
    const maxAfford = Math.floor(gameState.user.coins / price);
    const existing = gameState.inventory.find(i => i.id === itemId);
    const currentCount = existing ? existing.count : 0;
    const maxSpace = 99 - currentCount;
    const maxBuy = Math.min(maxAfford, maxSpace);

    if (maxBuy < 1) {
        if (maxSpace <= 0) return alert("該物品已達上限 (99個)！");
        return alert("金幣不足！");
    }

    const modal = document.getElementById("buyModal");
    document.getElementById("buyItemName").innerText = targetItem.name;
    document.getElementById("buyItemImg").src = "images/items/" + targetItem.img;
    
    const slider = document.getElementById("buySlider");
    slider.min = 1;
    slider.max = maxBuy;
    slider.value = 1;
    
    updateBuyPrice(1, price);
    
    slider.oninput = function() {
        updateBuyPrice(parseInt(this.value), price);
    };

    const confirmBtn = document.getElementById("btnConfirmBuy");
    confirmBtn.onclick = confirmBuy;
    
    modal.style.display = "flex";
    updateCoreButtonVisibility();
}

function updateBuyPrice(count, price) {
    document.getElementById("buyCountVal").innerText = count;
    document.getElementById("buyTotalVal").innerText = count * price;
}

function confirmBuy() {
    if (!currentBuyItem) return;
    
    const slider = document.getElementById("buySlider");
    const count = parseInt(slider.value);
    const totalPrice = count * currentBuyItem.price;

    if (gameState.user.coins < totalPrice) {
        return alert("金幣不足！");
    }

    gameState.user.coins -= totalPrice;
    const existing = gameState.inventory.find(i => i.id === currentBuyItem.id);
    
    if (existing) {
        existing.count += count;
    } else {
        gameState.inventory.push({ ...currentBuyItem, count: count });
    }
    
    saveGame();
    updateShopUI();
    playSFX('success');
    document.getElementById("buyModal").style.display = "none";
    updateCoreButtonVisibility();
    alert(`成功購買 ${count} 個 ${currentBuyItem.name}！`);
}

function renderShopGacha() {
    const container = document.getElementById("shopContentArea");
    container.innerHTML = `
        <div class="gacha-container">
            <div id="gachaEgg" class="css-golden-egg"></div>
            <div id="gachaFlash" class="gacha-flash"></div>
            <div style="text-align:center; color:var(--primary-blue); font-weight:bold; margin-bottom:10px;">
                龍蛋祈願
            </div>
            <button class="btn-main" style="background:#f1c40f; color:white; margin-bottom:5px;" onclick="playGacha()">立即祈願</button>
            <div style="font-size:0.8rem; color:#999; text-align:center;">花費 ${GACHA_CONFIG.COST} 金幣</div>
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
        
        const existing = gameState.inventory.find(i => i.id === item.id);
        if (existing) {
            if (existing.count < 99) existing.count++;
        } else {
            gameState.inventory.push({ ...item, count: 1 });
        }
        
        saveGame();
        updateShopUI();
        
        setTimeout(() => {
            showGachaModal(item);
            egg.classList.remove("cracked");
            flash.classList.remove("active");
            isGachaAnimating = false;
        }, 100);
    }, 800);
}
