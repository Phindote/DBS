function renderPets() {
    switchScreen("screen-pet");
    const container = document.getElementById("petContainer");
    container.className = "pokedex-grid-4";
    container.innerHTML = "";
    
    const allPets = MASTER_ITEMS.filter(i => i.type === 'pet');
    
    for(let i=0; i<20; i++) {
        const card = document.createElement("div");
        const petData = allPets[i];
        
        if(petData) {
            const isUnlocked = gameState.pets.includes(petData.id);
            if (isUnlocked) {
                const date = gameState.collectionDates[petData.id];
                const dateStr = date ? getFormattedDate(date) : "舊有記錄";
                
                // 格式優化：換行顯示
                card.className = "pokedex-card";
                card.innerHTML = `
                    <img src="images/items/${petData.img}" class="pokedex-img" onerror="this.src='images/ui/icon_core.PNG'">
                    <div class="pokedex-title">${petData.name}</div>
                    <span class="stat-badge stat-pet-date">
                        <div>獲得時間：</div>
                        <div style="font-weight:normal; font-size:90%;">${dateStr}</div>
                    </span>
                `;
                card.onclick = () => showPetDetail(petData);
            } else {
                card.className = "pokedex-card";
                card.style.opacity = "0.5";
                card.innerHTML = `
                    <img src="images/items/pet_unknown.PNG" class="pokedex-img" onerror="this.src='images/ui/icon_core.PNG'">
                    <div class="pokedex-title">未獲得</div>
                `;
                card.onclick = () => showPetDetail(petData, false);
            }
        } else {
             card.className = "pokedex-card";
             card.style.opacity = "0.2";
             card.innerHTML = `<div class="shop-title">未開放</div>`;
        }
        container.appendChild(card);
    }
}

function showPetDetail(pet, unlocked = true) {
    const modal = document.getElementById("detailModal");
    const header = document.getElementById("detailModalHeader");
    const title = document.getElementById("detailModalTitle");
    const body = document.getElementById("detailModalBody");

    title.innerText = "靈獸";
    header.style.background = "#8e44ad";
    header.style.color = "white";

    const imgSrc = unlocked ? `images/items/${pet.img}` : `images/items/pet_unknown.PNG`;
    const nameStr = unlocked ? pet.name : "未獲得";
    const descStr = unlocked ? pet.desc : "???";
    
    let dateInfo = "";
    if(unlocked && gameState.collectionDates[pet.id]) {
        dateInfo = `<div style="margin-top:10px; font-size:0.9rem; color:#2ecc71; font-weight:bold;">獲得於：${getFormattedDate(gameState.collectionDates[pet.id])}</div>`;
    }

    body.innerHTML = `
        <img src="${imgSrc}" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px;" onerror="this.src='images/ui/icon_core.PNG'">
        <div style="font-size:1.2rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${nameStr}</div>
        <div style="color:#555; text-align:left; background:#f9f9f9; padding:10px; border-radius:8px;">${descStr}</div>
        ${dateInfo}
    `;

    modal.style.display = "flex";
    updateCoreButtonVisibility();
}
