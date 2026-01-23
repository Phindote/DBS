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
