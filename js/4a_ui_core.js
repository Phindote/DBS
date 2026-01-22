let currentInvTab = 'all';
let itemToDeleteIndex = -1;
let smeltSlots = [null, null, null, null];
let achievementQueue = [];

function updateCoreButtonVisibility() {
    const coreBtn = document.getElementById("radialMenuContainer");
    const menuScreen = document.getElementById("screen-menu");
    if(!menuScreen) return; 

    const modals = document.querySelectorAll(".modal-backdrop, #contentModal, #statsModal, #titlesModal, #helpModal, #unlockModal, #dropModal");
    let isAnyModalOpen = false;
    modals.forEach(m => {
        if(m.style.display === 'flex' || m.style.display === 'block') isAnyModalOpen = true;
    });

    const subSingle = document.getElementById("subMenuSingle");
    const subMix = document.getElementById("subMenuMix");
    let isSubMenuOpen = false;
    if (subSingle && subSingle.style.display === 'flex') isSubMenuOpen = true;
    if (subMix && subMix.style.display === 'flex') isSubMenuOpen = true;

    if (menuScreen.classList.contains('active') && !isAnyModalOpen && !isSubMenuOpen) {
        if(coreBtn) coreBtn.style.display = 'block';
    } else {
        if(coreBtn) coreBtn.style.display = 'none';
        closeRadialMenu();
    }
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    if (id === 'screen-menu') {
        smeltSlots = [null, null, null, null];
    }

    updateCoreButtonVisibility();

    if (id === 'screen-game') {
        if(typeof resizeCanvas === 'function') resizeCanvas();
        updateBars(); 
    } else {
        if (id === 'screen-daily') playMusic('bgm_daily');
        else if (id === 'screen-shop') playMusic('bgm_store');
        else if (id === 'screen-inventory') playMusic('bgm_inventory');
        else if (id === 'screen-smelt') playMusic('bgm_smelt');
        else if (id === 'screen-pet') playMusic('bgm_pet');
        else if (id === 'screen-pokedex') playMusic('bgm_pokedex');
        else if (id === 'screen-achievements') playMusic('bgm_achievements');
        else playMusic('theme'); 
        
        if (id === 'screen-menu') checkAchievements();
    }
}

function updateUserDisplay() {
    if(!gameState || !gameState.user) return;
    const u = gameState.user;
    
    const els = {
        name: document.getElementById("menuName"),
        cls: document.getElementById("menuClass"),
        lv: document.getElementById("menuLevel"),
        title: document.getElementById("menuTitle"),
        xp: document.getElementById("menuXP"),
        xpBar: document.getElementById("menuXPBar"),
        energy: document.getElementById("menuEnergy"),
        energyBar: document.getElementById("menuEnergyBar"),
        gameUser: document.getElementById("gameUser"),
        gameTitle: document.getElementById("gameTitle"),
        gameLv: document.getElementById("gameLevelNum")
    };

    if(els.name) els.name.innerText = u.name;
    if(els.cls) els.cls.innerText = u.class;
    if(els.lv) els.lv.innerText = u.level;
    if(els.title) els.title.innerText = u.title;
    if(els.xp) els.xp.innerText = u.xp;
    
    if(els.xpBar) {
        const xpPercent = (u.xp / GAME_CONFIG.MAX_XP) * 100;
        els.xpBar.style.width = xpPercent + "%";
    }
    
    if(els.energy) els.energy.innerText = u.energy;
    if(els.energyBar) els.energyBar.style.width = u.energy + "%";
    
    if(els.gameUser) els.gameUser.innerText = `${u.name} (${u.class})`;
    if(els.gameTitle) els.gameTitle.innerText = u.title;
    if(els.gameLv) els.gameLv.innerText = u.level;
}

function updateBars() {
    if(!gameState || !gameState.user) return;
    
    const xpPercent = (gameState.user.xp / GAME_CONFIG.MAX_XP) * 100;
    const hpPercent = gameState.user.hp;
    
    const elXpBar = document.getElementById("xpBar");
    const elXpText = document.getElementById("xpText");
    const elHpBar = document.getElementById("hpBar");
    const elHpText = document.getElementById("hpText");
    const elEnergyBar = document.getElementById("battleEnergyBar");
    const elEnergyText = document.getElementById("battleEnergyText");

    if(elXpBar) elXpBar.style.width = xpPercent + "%";
    if(elXpText) elXpText.innerText = `${gameState.user.xp}/${GAME_CONFIG.MAX_XP}`;
    
    if(elHpBar) {
        elHpBar.style.width = hpPercent + "%";
        elHpBar.style.background = hpPercent > 30 ? "var(--hp-green)" : "var(--hp-red)";
    }
    if(elHpText) elHpText.innerText = `${gameState.user.hp}/100`;
    
    if(elEnergyBar) elEnergyBar.style.width = gameState.user.energy + "%";
    if(elEnergyText) elEnergyText.innerText = `${gameState.user.energy}/100`;
}
