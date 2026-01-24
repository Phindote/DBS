let currentPokedexKey = null;

function showPokedex() {
    switchScreen("screen-pokedex");
    checkAchievements();
    const db = window.questionsDB || {};
    const container = document.getElementById("pokedexContainer");
    container.className = "pokedex-grid-4";
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
    
    const lastTime = gameState.chapterLastPlayed && gameState.chapterLastPlayed[key];
    const timeStr = lastTime ? getFormattedDate(lastTime) : "尚未挑戰";

    // 格式優化：換行顯示
    if (key === 'mix') {
        statsHTML = `
            <span class="stat-badge stat-jr">特殊挑戰</span>
            <span class="stat-badge stat-last">
                <div>上回挑戰：</div>
                <div style="font-weight:normal; font-size:90%;">${timeStr}</div>
            </span>
        `;
    } else {
        statsHTML = `
        <div class="pokedex-stats">
        <span class="stat-badge stat-jr">初階: 全 ${jrData.total} | 已破 ${jrData.solved}</span>
        <span class="stat-badge stat-sr">高階: 全 ${srData.total} | 已破 ${srData.solved}</span>
        <span class="stat-badge stat-last">
            <div>上回挑戰：</div>
            <div style="font-weight:normal; font-size:90%;">${timeStr}</div>
        </span>
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
        
        // 檢查 ach_34 (剛好1分鐘)
        if (minutes === 1 && !gameState.unlockedAchievements.includes("ach_34")) {
            gameState.unlockedAchievements.push("ach_34");
            if(!gameState.collectionDates["ach_34"]) gameState.collectionDates["ach_34"] = new Date().getTime();
            saveGame();
            showUnlockNotification(["ach_34"]);
        }

        checkAchievements();
        
        let quest2 = gameState.dailyTasks.find(t => t.id === 2);
        if(quest2 && quest2.targetKey === currentPokedexKey) {
            quest2.progress += minutes;
            saveGame();
        }

        saveGame();
        updateUserDisplay();
        alert(`溫習了 ${minutes} 分鐘，浩然之氣 +${earned}！`);
    } else {
        alert("溫習時間不足1分鐘，未獲得浩然之氣。");
    }
    currentPokedexKey = null;
}

function showAchievements() {
    switchScreen("screen-achievements");
}

function showDragonSeal() {
    checkAchievements();
    switchScreen("screen-achievements");
    const container = document.getElementById("sealContainer");
    container.className = "pokedex-grid-4";
    container.innerHTML = "";
    
    ACHIEVEMENTS.forEach((ach, index) => {
        const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
        const card = document.createElement("div");
        card.className = "pokedex-card" + (isUnlocked ? " unlocked" : "");
        
        const imgSrc = isUnlocked ? `images/achievements/ach_${index+1}.PNG` : "images/achievements/ach_locked.PNG";
        
        let dateHTML = "";
        if(isUnlocked) {
            const date = gameState.collectionDates[ach.id];
            const dateStr = date ? getFormattedDate(date) : "舊有記錄";
            // 格式優化：換行顯示
            dateHTML = `
            <span class="stat-badge stat-ach-date">
                <div>獲得時間：</div>
                <div style="font-weight:normal; font-size:90%;">${dateStr}</div>
            </span>`;
        }

        card.innerHTML = `
            <img src="${imgSrc}" class="pokedex-img" alt="Seal" onerror="this.src='images/achievements/ach_locked.PNG'">
            <div class="pokedex-title">${ach.title}</div>
            ${dateHTML}
        `;
        card.onclick = () => {
            let status = isUnlocked ? "已解鎖" : "未解鎖";
            if(isUnlocked && gameState.collectionDates[ach.id]) {
                status += `\n時間：${getFormattedDate(gameState.collectionDates[ach.id])}`;
            }
            alert(`【${ach.title}】\n\n條件：${ach.desc}\n狀態：${status}`);
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
