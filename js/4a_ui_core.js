let currentInvTab = 'all';
let itemToDeleteIndex = -1;
let smeltSlots = [null, null, null, null];
let achievementQueue = [];

let currentHelpPage = 0;
const HELP_PAGES = [
    `
    <div style="text-align:center; font-weight:bold; font-size:1.1rem; margin-bottom:10px;">歡迎來到拔萃之魂的試煉世界。</div>
    <p>既然重生於此，你手中的十二篇古籍便是你馴化惡龍的唯一利器。這條路註定佈滿荊棘，唯有智者方能登頂⋯⋯</p>
    `,
    `
    <h3 style="color:var(--primary-blue); margin:10px 0 5px 0;">生存與代價⏳</h3>
    <p>你的生命值是你立足於此的根本，每一次對經文的誤解，都會引來惡龍的攻擊而受傷，歸零則意味著戰敗。而每一次發起挑戰，都需要消耗體內的浩然之氣。初階試煉消耗較少，高階試煉則倍之。若氣息耗盡，你將無法再戰。唯有通過勝利，或是在圖鑑中潛心溫習，方能重新凝聚這股天地正氣。</p>
    `,
    `
    <h3 style="color:var(--primary-blue); margin:10px 0 5px 0;">試煉的層級🔥</h3>
    <p>你可以選擇專注於獨立篇章的修煉，亦可發起多篇章的混合挑戰。初階試煉考驗你的分辨，你需從幻象選項中辨識真實答案；高階試煉則需要心無旁騖，一字不差地默寫出正確答案，這是通往強者的必經之路。</p>
    <p>若能在混合挑戰中選取所有篇章並完美獲勝，你將解鎖傳說中的無限經驗模式，不再受規則束縛，挑戰最高榮譽。</p>
    `,
    `
    <h3 style="color:var(--primary-blue); margin:10px 0 5px 0;">榮譽與印記🏆</h3>
    <p>並非所有的勝利都值得銘記，唯有那些毫髮無傷的完美通關，方能解開惡龍圖鑑上的封印。圖鑑中更有記載著古文真意，是你溫習並回復浩然之氣的場所。而你在此間的逗留，無論是等級的提升或是戰鬥的勝利，皆會被記錄在龍印寶典之中。當你的實力達到一定條件，龍印自會為你點亮，那是強者的證明。</p>
    `,
    `
    <h3 style="color:var(--primary-blue); margin:10px 0 5px 0;">成長之路🚩</h3>
    <p>在這條漫長的歷煉之路上，時刻審視自我至關重要。輕觸你的稱號，便可窺見這條晉升之路的全貌，知曉自己身處何方。若想知曉自己在理解古文的造詣深淺，只需點擊校徽，六角星芒陣自會顯現你真實的屬性，六邊形戰士由此誕生⋯⋯</p>
    `,
    `
    <div style="text-align:center; color:var(--primary-red); font-weight:bold; margin-top:20px; line-height:1.6;">
    勇者啊，握緊手中的知識之劍，<br>
    去征服那些盤踞在古籍中的惡龍吧！
    </div>
    `
];

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

function showHelp() {
    const modal = document.getElementById("helpModal");
    modal.style.display = "flex";

    const header = modal.querySelector(".modal-header");
    if(header) header.style.background = "#2c3e50";

    const body = document.getElementById("helpBody");
    if(body) body.style.justifyContent = "center";

    currentHelpPage = 0;
    renderHelpPage();
    updateCoreButtonVisibility();
}

function renderHelpPage() {
    const body = document.getElementById("helpBody");
    body.innerHTML = HELP_PAGES[currentHelpPage];
}

function nextHelpPage() {
    currentHelpPage = (currentHelpPage + 1) % HELP_PAGES.length;
    renderHelpPage();
}

function prevHelpPage() {
    currentHelpPage = (currentHelpPage - 1 + HELP_PAGES.length) % HELP_PAGES.length;
    renderHelpPage();
}
