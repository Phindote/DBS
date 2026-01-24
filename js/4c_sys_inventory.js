let currentSmeltSlotIndex = -1;
let currentSmeltFilter = 'all';
let currentRecipePage = 0;
const RECIPE_RARITY_ORDER = ["T4", "T3", "T2", "T1", "T0"];

function renderShopSmelt() {
    const container = document.getElementById("shopContentArea");
    container.innerHTML = `
        <div class="smelt-grid-container" id="smeltContainer" style="margin-top:10px;"></div>
        <div style="display:flex; gap:10px; margin-top:20px; justify-content:center;">
            <button class="btn-main" style="margin:0; background:#8e44ad; color:white;" onclick="showRecipes()">合成公式</button>
            <button class="btn-main" style="margin:0;" onclick="initSmelt()">開始合成</button>
        </div>
    `;
    const grid = document.getElementById("smeltContainer");
    
    for(let i=0; i<4; i++) {
        const slot = document.createElement("div");
        slot.className = "smelt-slot" + (smeltSlots[i] ? " filled" : "");
        if (smeltSlots[i]) {
            slot.innerHTML = `
                <img src="images/items/${smeltSlots[i].img}" style="width:60%; height:60%; object-fit:contain;" onerror="this.src='images/ui/icon_core.PNG'">
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

function switchSmeltFilter(filter) {
    currentSmeltFilter = filter;
    renderSmeltInventory();
}

function renderSmeltInventory() {
    const modalBody = document.querySelector("#smeltSelectModal .modal-body");
    
    let filterContainer = document.getElementById("smeltFilterTabs");
    if(!filterContainer) {
        filterContainer = document.createElement("div");
        filterContainer.id = "smeltFilterTabs";
        filterContainer.className = "inventory-tabs";
        filterContainer.style.marginTop = "0";
        modalBody.insertBefore(filterContainer, modalBody.firstChild);
    }

    filterContainer.innerHTML = `
        <button class="tab-btn ${currentSmeltFilter === 'all' ? 'active' : ''}" onclick="switchSmeltFilter('all')">全部</button>
        <button class="tab-btn ${currentSmeltFilter === 'fragment' ? 'active' : ''}" onclick="switchSmeltFilter('fragment')">素材</button>
        <button class="tab-btn ${currentSmeltFilter === 'product' ? 'active' : ''}" onclick="switchSmeltFilter('product')">成品</button>
    `;

    const grid = document.getElementById("smeltInventoryGrid");
    grid.innerHTML = "";
    
    gameState.inventory.forEach((item, index) => {
        if(!item) return;
        if(currentSmeltFilter === 'fragment' && item.type !== 'fragment') return;
        if(currentSmeltFilter === 'product' && item.type !== 'product') return;

        const usedCount = smeltSlots.filter(s => s && s.id === item.id).length;
        const availableCount = item.count - usedCount;
        
        if (availableCount <= 0) return;

        const card = document.createElement("div");
        card.className = "pokedex-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="pokedex-img" onerror="this.src='images/ui/icon_core.PNG'">
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
    
    if (currentInvTab === 'fragment') {
        filteredItems = filteredItems.filter(item => item && item.type === 'fragment');
    } else if (currentInvTab === 'item') {
        filteredItems = filteredItems.filter(item => item && item.type === 'product');
    }
    
    const slots = 100;
    
    for(let i=0; i<slots; i++) {
        const card = document.createElement("div");
        card.className = "pokedex-card"; 
        
        if(i < filteredItems.length && filteredItems[i]) {
            const item = filteredItems[i];
            const realIndex = item.originalIndex;
            
             card.innerHTML = `
                <img src="images/items/${item.img}" class="pokedex-img" onerror="this.src='images/ui/icon_core.PNG'">
                <div class="pokedex-title">${item.name}</div>
                <div class="inv-count-badge">x${item.count}</div>
                <button class="btn-inv-delete" onclick="promptSellItem(event, ${realIndex})" style="background:none; border:none; padding:0; width:25px; height:25px; display:flex; align-items:center; justify-content:center; z-index:10;">
                    <img src="images/ui/icon_coin.PNG" style="width:100%; height:100%; object-fit:contain;" onerror="this.src='images/ui/icon_core.PNG'">
                </button>
             `;
             card.onclick = (e) => {
                 if(!e.target.closest('.btn-inv-delete')) {
                     showItemDetail(realIndex);
                 }
             };
        } else {
             card.style.opacity = "0.5";
             card.innerHTML = `
                <div style="font-size:0.8rem; color:#ccc; margin-top:20px;">${i+1}</div>
             `;
        }
        container.appendChild(card);
    }
}

function showItemDetail(index) {
    const item = gameState.inventory[index];
    if(!item) return;
    
    const modal = document.getElementById("detailModal");
    const header = document.getElementById("detailModalHeader");
    const title = document.getElementById("detailModalTitle");
    const body = document.getElementById("detailModalBody");
    
    if(item.type === 'fragment') {
        title.innerText = "碎片";
        header.style.background = "#3498db";
    } else {
        title.innerText = "成品";
        header.style.background = "#2c3e50";
    }
    header.style.color = "white";

    body.innerHTML = `
        <img src="images/items/${item.img}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px;" onerror="this.src='images/ui/icon_core.PNG'">
        <div style="font-size:1.2rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${item.name}</div>
        <div style="font-size:0.9rem; color:#d35400; margin-bottom:10px;">${RARITY_MAP[item.rarity]}</div>
        <div style="color:#555; text-align:left; background:#f9f9f9; padding:10px; border-radius:8px;">${item.desc}</div>
    `;
    
    modal.style.display = "flex";
    updateCoreButtonVisibility();
}

function promptSellItem(event, index) {
    if(event) event.stopPropagation();
    itemToDeleteIndex = index;
    const item = gameState.inventory[index];
    
    const modal = document.getElementById("deleteModal");
    document.getElementById("deleteItemName").innerText = item.name;
    document.getElementById("deleteItemImg").src = "images/items/" + item.img;
    
    const slider = document.getElementById("deleteSlider");
    slider.min = 1;
    slider.max = item.count;
    slider.value = 1;
    
    updateSellPrice(1, 10);
    
    slider.oninput = function() {
        updateSellPrice(parseInt(this.value), 10);
    };

    const confirmBtn = document.getElementById("btnConfirmSell");
    if(confirmBtn) {
        confirmBtn.onclick = confirmSell;
    }
    
    modal.style.display = "flex";
    updateCoreButtonVisibility();
}

function updateSellPrice(count, pricePerUnit) {
    document.getElementById("delCountVal").innerText = count;
    document.getElementById("delTotalVal").innerText = count * pricePerUnit;
}

function confirmSell() {
    if (itemToDeleteIndex === -1) return;
    const slider = document.getElementById("deleteSlider");
    const count = parseInt(slider.value);
    const item = gameState.inventory[itemToDeleteIndex];

    if(count < 1 || count > item.count) {
        alert("無效的數量！");
        return;
    }

    const sellPrice = 10;
    const totalGain = sellPrice * count;
    gameState.user.coins += totalGain;

    if (count >= item.count) {
        gameState.inventory.splice(itemToDeleteIndex, 1);
    } else {
        item.count -= count;
    }
    saveGame();
    renderInventory();
    document.getElementById("deleteModal").style.display = "none";
    updateCoreButtonVisibility();
    alert(`成功出售 ${count} 個 ${item.name}，獲得 ${totalGain} 金幣！`);
}

function initSmelt() {
    const filledCount = smeltSlots.filter(s => s !== null).length;
    if (filledCount < 2) return alert("請最少放入 2 種材料！");
    document.getElementById("smeltConfirmModal").style.display = "flex";
    updateCoreButtonVisibility();
}

function executeSmelt() {
    document.getElementById("smeltConfirmModal").style.display = "none";
    
    const inputIds = smeltSlots.filter(s => s !== null).map(s => s.id).sort();
    
    smeltSlots.forEach(slotItem => {
        if(slotItem) {
            const targetItem = gameState.inventory.find(i => i.id === slotItem.id && i.count > 0);
            if(targetItem) {
                targetItem.count--;
            }
        }
    });
    gameState.inventory = gameState.inventory.filter(i => i.count > 0);
    
    let resultItem = null;
    let isAsh = true;
    let isPet = false;

    for (let i = 0; i < MASTER_ITEMS.length; i++) {
        const item = MASTER_ITEMS[i];
        if (item.recipe) {
            const recipeIds = [...item.recipe].sort();
            if (JSON.stringify(inputIds) === JSON.stringify(recipeIds)) {
                resultItem = item;
                isAsh = false;
                if (item.type === 'pet') isPet = true;
                break;
            }
        }
    }

    if (isAsh) {
        resultItem = MASTER_ITEMS.find(i => i.id === 'item_ash');
    }

    if (isPet) {
        if (!gameState.pets.includes(resultItem.id)) {
            gameState.pets.push(resultItem.id);
            alert(`合成成功！解鎖新龍魄靈獸：${resultItem.name}`);
        } else {
            alert(`合成成功！但你已經擁有 ${resultItem.name}，獲得 5000 金幣補償。`);
            gameState.user.coins += 5000;
        }
    } else {
        const existing = gameState.inventory.find(i => i.id === resultItem.id);
        if (existing) {
            existing.count++;
        } else {
            gameState.inventory.push({ ...resultItem, count: 1 });
        }
        if (isAsh) {
            alert("合成失敗！獲得：灰燼殘渣");
        } else {
            alert(`合成成功！獲得：${resultItem.name}`);
        }
    }

    saveGame();
    smeltSlots = [null, null, null, null];
    renderShop(); 
    updateCoreButtonVisibility();
}

function showRecipes() {
    document.getElementById("recipeModal").style.display = "flex";
    currentRecipePage = 0;
    renderRecipePage();
    updateCoreButtonVisibility();
}

function renderRecipePage() {
    const body = document.getElementById("recipeListBody");
    body.innerHTML = "";
    
    const rarity = RECIPE_RARITY_ORDER[currentRecipePage];
    const items = MASTER_ITEMS.filter(i => i.rarity === rarity && i.recipe);
    
    const pageTitle = document.createElement("div");
    pageTitle.style.cssText = "text-align:center; font-size:1.5rem; color:var(--primary-blue); margin:10px 0 20px 0; font-weight:bold;";
    pageTitle.innerText = "【" + RARITY_MAP[rarity] + "】";
    body.appendChild(pageTitle);

    if (items.length === 0) {
        const noData = document.createElement("div");
        noData.style.textAlign = "center";
        noData.style.color = "#999";
        noData.innerText = "暫無配方記錄";
        body.appendChild(noData);
    } else {
        items.forEach(item => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex; align-items:center; padding:15px; border-bottom:1px solid #eee; gap:15px; background:#fff; margin-bottom:10px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.05); width: 100%; max-width: 400px; margin-left: auto; margin-right: auto;";
            
            const recipeNames = item.recipe.map(rid => {
                const material = MASTER_ITEMS.find(m => m.id === rid);
                return material ? material.name : rid;
            }).join(" + ");
            
            row.innerHTML = `
                <img src="images/items/${item.img}" style="width:50px; height:50px; object-fit:contain;">
                <div style="flex:1;">
                    <div style="font-weight:bold; color:var(--primary-blue); font-size:1.1rem;">${item.name}</div>
                    <div style="font-size:0.9rem; color:#555; margin-top:5px;">公式: ${recipeNames}</div>
                </div>
            `;
            body.appendChild(row);
        });
    }
}

function nextRecipePage() {
    currentRecipePage = (currentRecipePage + 1) % RECIPE_RARITY_ORDER.length;
    renderRecipePage();
}

function prevRecipePage() {
    currentRecipePage = (currentRecipePage - 1 + RECIPE_RARITY_ORDER.length) % RECIPE_RARITY_ORDER.length;
    renderRecipePage();
}
