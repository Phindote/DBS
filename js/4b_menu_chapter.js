function showSubMenu(type) {
    document.querySelector(".menu-layout").style.display = "none";
    const profileCard = document.querySelector(".profile-card");
    if(profileCard) profileCard.style.display = "none";
    
    if(type === 'single') {
        document.getElementById("subMenuSingle").style.display = "flex";
        renderSingleList();
    } else {
        document.getElementById("subMenuMix").style.display = "flex";
        renderMixList();
    }
    updateCoreButtonVisibility();
}

function backToChapterSelection() {
    switchScreen('screen-menu');
    
    if(gameState.mode === 'single') {
        showSubMenu('single');
        if(pendingSingleChapterKey) {
             const btns = document.querySelectorAll("#singleChapterList .chapter-btn");
             btns.forEach(b => {
                 if(b.onclick.toString().includes(pendingSingleChapterKey)) {
                     b.classList.add("active");
                 }
             });
             document.getElementById("singleConfirmArea").style.display = "block";
        }
    } else {
        showSubMenu('mix');
        if(gameState.mixSelectedKeys && gameState.mixSelectedKeys.length > 0) {
             const inputs = document.querySelectorAll("#mixChapterList input");
             inputs.forEach(inp => {
                 if(gameState.mixSelectedKeys.includes(inp.value)) inp.checked = true;
             });
             checkMixCount();
        }
    }
}

function resetMenu() {
    document.querySelector(".menu-layout").style.display = "grid";
    const profileCard = document.querySelector(".profile-card");
    if(profileCard) profileCard.style.display = "flex";
    
    document.getElementById("subMenuSingle").style.display = "none";
    document.getElementById("subMenuMix").style.display = "none";
    
    pendingSingleChapterKey = "";
    gameState.mixSelectedKeys = [];
    gameState.isRandomSelection = false;
    
    updateCoreButtonVisibility();
}

function renderSingleList() {
    const list = document.getElementById("singleChapterList");
    list.innerHTML = "";
    const db = window.questionsDB || {};
    
    Object.keys(db).forEach(key => {
        const item = db[key];
        const btn = document.createElement("button");
        btn.className = "chapter-btn";
        btn.innerText = item.title;
        btn.onclick = () => selectSingleChapter(key, item.title, btn);
        list.appendChild(btn);
    });
}

function selectSingleChapter(key, title, btn) {
    pendingSingleChapterKey = key;
    document.getElementById("singleSelectedTitle").innerText = title;
    
    const all = document.querySelectorAll("#singleChapterList .chapter-btn");
    all.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    document.getElementById("singleConfirmArea").style.display = "block";
}

function renderMixList() {
    const list = document.getElementById("mixChapterList");
    list.innerHTML = "";
    const db = window.questionsDB || {};
    
    Object.keys(db).forEach(key => {
        const item = db[key];
        const label = document.createElement("label");
        label.className = "mix-item";
        label.innerHTML = `
            <input type="checkbox" value="${key}" onchange="playSFX('click'); checkMixCount()">
            <span>${item.title}</span>
        `;
        list.appendChild(label);
    });
    checkMixCount();
}

function checkMixCount() {
    const allInputs = document.querySelectorAll("#mixChapterList input");
    const checkedInputs = [];
    allInputs.forEach(input => {
        if(input.checked) {
            input.parentElement.classList.add("active");
            checkedInputs.push(input);
        } else {
            input.parentElement.classList.remove("active");
        }
    });
    
    gameState.mixSelectedKeys = checkedInputs.map(i => i.value);
    document.getElementById("mixCount").innerText = "已選：" + gameState.mixSelectedKeys.length;
}

function selectAllMix() {
    const inputs = document.querySelectorAll("#mixChapterList input");
    inputs.forEach(i => i.checked = true);
    checkMixCount();
}

function deselectAllMix() {
    const inputs = document.querySelectorAll("#mixChapterList input");
    inputs.forEach(i => i.checked = false);
    checkMixCount();
}

function randomSelectMix() {
    playSFX('click');
    const countSelect = document.getElementById("mixRandomCount");
    const count = parseInt(countSelect.value);
    const db = window.questionsDB || {};
    const keys = Object.keys(db);
    
    if (keys.length < count) return alert("篇章數量不足！");
    
    deselectAllMix();
    
    gameState.mixSelectedKeys = [];
    while(gameState.mixSelectedKeys.length < count) {
        const r = keys[Math.floor(Math.random() * keys.length)];
        if(!gameState.mixSelectedKeys.includes(r)) {
            gameState.mixSelectedKeys.push(r);
        }
    }
    
    gameState.isRandomSelection = true;
    
    saveGame();
    initGame('mix'); 
}

function updateLevel() {
    const newLevel = Math.floor(gameState.user.xp / 100) + 1;
    gameState.user.level = newLevel > GAME_CONFIG.MAX_LEVEL ? GAME_CONFIG.MAX_LEVEL : newLevel;
    if (gameState.user.level === GAME_CONFIG.MAX_LEVEL && gameState.user.xp >= GAME_CONFIG.MAX_XP) {
        gameState.user.title = "龍脈•降龍無悔";
    } else {
        let titleIndex = Math.floor((gameState.user.level - 1) / 5.5);
        if (titleIndex >= TITLES.length) titleIndex = TITLES.length - 1;
        gameState.user.title = TITLES[titleIndex];
    }
    if (gameState.user.level >= 99) {
        gameState.user.unlockedReplayXP = true;
    }
    checkAchievements();
    saveGame();
    updateUserDisplay();
    updateBars();
}

function confirmSingleGame() {
    if (!pendingSingleChapterKey) return;
    initGame('single');
}

function confirmMixMode() {
    const count = document.querySelectorAll("#mixChapterList input:checked").length;
    if (count < 2) return alert("請至少選擇 2 篇範文！");
    
    gameState.mixSelectedKeys = [];
    document.querySelectorAll("#mixChapterList input:checked").forEach(i => {
        gameState.mixSelectedKeys.push(i.value);
    });
    
    gameState.isRandomSelection = false;
    
    initGame('mix');
}
