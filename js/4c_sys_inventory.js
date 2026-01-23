let currentSmeltSlotIndex = -1;

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
        
        const usedCount = smeltSlots.filter(s => s && s.id === item.id).length;
        const availableCount = item.count - usedCount;
        
        if (availableCount <= 0) return;

        const card = document.createElement("div");
        card.className = "pokedex-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="pokedex-img">
            <div class="pokedex-title">${item.name}</div>
            <div class="inv-count-badge">x${availableCount}</div>
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
    container.className = "inventory-grid-compact";
    
    let filteredItems = gameState.inventory.map((item, index) => ({...item, originalIndex: index}));
    
    if (currentInvTab !== 'all') {
        filteredItems = filteredItems.filter(item => item && item.type === currentInvTab);
    }
    
    const slots = 100;
    
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
                <div style="font-size:0.8rem; color:#ccc; margin-top:20px;">${i+1}</div>
             `;
        }
        container.appendChild(card);
    }
    
    if (gameState.inventory.length > 100) {
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
