let currentInvTab = 'all';
let itemToDeleteIndex = -1;
let smeltSlots = [null, null, null, null];

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const radialContainer = document.getElementById("radialMenuContainer");
    if (radialContainer) {
        if (id === 'screen-menu') {
            radialContainer.style.display = 'block';
        } else {
            radialContainer.style.display = 'none';
        }
        closeRadialMenu();
    }

    if (id === 'screen-game') {
        resizeCanvas();
    } else if (id === 'screen-result') {
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
    const u = gameState.user;
    document.getElementById("menuName").innerText = u.name;
    document.getElementById("menuClass").innerText = u.class;
    document.getElementById("menuLevel").innerText = u.level;
    document.getElementById("menuTitle").innerText = u.title;
    document.getElementById("menuXP").innerText = u.xp;
    const xpPercent = (u.xp / GAME_CONFIG.MAX_XP) * 100;
    document.getElementById("menuXPBar").style.width = xpPercent + "%";
    document.getElementById("menuEnergy").innerText = u.energy;
    document.getElementById("menuEnergyBar").style.width = u.energy + "%";
    const info = `${u.name} (${u.class})`;
    document.getElementById("gameUser").innerText = info;
    document.getElementById("gameTitle").innerText = u.title;
    document.getElementById("gameLevelNum").innerText = u.level;
}

function updateBars() {
    const xpPercent = (gameState.user.xp / GAME_CONFIG.MAX_XP) * 100;
    document.getElementById("xpBar").style.width = xpPercent + "%";
    document.getElementById("xpText").innerText = `${gameState.user.xp}/${GAME_CONFIG.MAX_XP}`;
    const hpPercent = gameState.user.hp;
    document.getElementById("hpBar").style.width = hpPercent + "%";
    document.getElementById("hpText").innerText = `${gameState.user.hp}/100`;
    document.getElementById("hpBar").style.background = hpPercent > 30 ? "var(--hp-green)" : "var(--hp-red)";
    document.getElementById("battleEnergyBar").style.width = gameState.user.energy + "%";
    document.getElementById("battleEnergyText").innerText = `${gameState.user.energy}/100`;
}

function updateCrackStage() {
    const hp = gameState.user.hp;
    const box = document.getElementById("questionBox");
    box.className = "question-box"; 
    if (hp <= 80 && hp > 60) box.classList.add("crack-stage-1");
    else if (hp <= 60 && hp > 40) box.classList.add("crack-stage-2");
    else if (hp <= 40 && hp > 20) box.classList.add("crack-stage-3");
    else if (hp <= 20 && hp > 0) box.classList.add("crack-stage-4");
    else if (hp <= 0) box.classList.add("crack-stage-5");
}

function updateMixStyles() {
    document.querySelectorAll(".mix-item").forEach(label => {
        const chk = label.querySelector("input");
        if(chk.checked) label.classList.add("active");
        else label.classList.remove("active");
    });
}

function showSubMenu(type) {
    document.querySelector(".menu-layout").style.display = "none";
    const profileCard = document.querySelector(".profile-card");
    if(profileCard) profileCard.style.display = "none";
    
    const radialContainer = document.getElementById("radialMenuContainer");
    if (radialContainer) radialContainer.style.display = 'none';

    if(type === 'single') {
        document.getElementById("subMenuSingle").style.display = "flex";
        renderSingleList();
    } else {
        document.getElementById("subMenuMix").style.display = "flex";
        renderMixList();
    }
}

function resetMenu() {
    document.getElementById("subMenuSingle").style.display = "none";
    document.getElementById("subMenuMix").style.display = "none";
    document.querySelector(".menu-layout").style.display = "grid";
    const profileCard = document.querySelector(".profile-card");
    if(profileCard) profileCard.style.display = "flex";
    
    const radialContainer = document.getElementById("radialMenuContainer");
    if (radialContainer) radialContainer.style.display = 'block';

    document.getElementById("singleConfirmArea").style.display = "none";
    document.querySelectorAll(".chapter-btn").forEach(b => b.classList.remove("active"));
    pendingSingleChapterKey = "";
    gameState.mixSelectedKeys = [];
    const chks = document.querySelectorAll("#mixChapterList input");
    chks.forEach(c => c.checked = false);
    document.getElementById("mixCount").innerText = "已選：0";
}

function showPokedex() {
    switchScreen("screen-pokedex");
    checkAchievements();
    const container = document.getElementById("pokedexContainer");
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
    if (key === 'mix') {
        statsHTML = `<span class="stat-badge stat-jr">特殊挑戰</span>`;
    } else {
        statsHTML = `
        <div class="pokedex-stats">
        <span class="stat-badge stat-jr">初階: 全 ${jrData.total} | 已破 ${jrData.solved}</span>
        <span class="stat-badge stat-sr">高階: 全 ${srData.total} | 已破 ${srData.solved}</span>
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
    const item = db[key];
    document.getElementById("modalTitle").innerText = item.title;
    document.getElementById("modalBody").innerText = item.content || "暫無內容";
    document.getElementById("contentModal").style.display = "flex";
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
    clearInterval(pokedexTimer);
    const minutes = Math.floor(pokedexSeconds / 60);
    if (minutes >= 1) { 
        const earned = Math.min(GAME_CONFIG.MAX_STUDY_MINS, minutes * GAME_CONFIG.ENERGY_REWARD_STUDY); 
        gameState.user.energy = Math.min(100, gameState.user.energy + earned);
        gameState.stats.totalStudyMins += minutes;
        gameState.stats.energyRecovered += earned;
        checkAchievements();
        
        let quest2 = gameState.dailyTasks.find(t => t.id === 2);
        if(quest2) {
            quest2.progress += minutes;
            saveGame();
        }

        saveGame();
        updateUserDisplay();
        alert(`溫習了 ${minutes} 分鐘，浩然之氣 +${earned}！`);
        if (minutes === 1 && !gameState.unlockedAchievements.includes("ach_34")) {
            gameState.unlockedAchievements.push("ach_34");
            saveGame();
        }
    } else {
        alert("溫習時間不足1分鐘，未獲得浩然之氣。");
    }
}

function showAchievements() {
    switchScreen("screen-achievements");
    const list = document.getElementById("achievementList");
    list.innerHTML = "";
    TITLES.forEach((title, index) => {
        const div = document.createElement("div");
        const isCurrent = gameState.user.title === title;
        div.className = "achievement-item" + (isCurrent ? " active" : "");
        const startLv = Math.floor(index * 5.5) + 1;
        let endLv = Math.floor((index + 1) * 5.5);
        if (index === TITLES.length - 1) endLv = 99;
        let desc = `等級 ${startLv} - ${endLv}`;
        if (index === TITLES.length - 1) {
            desc = "等級 99 及 9999 經驗值";
        }
        div.innerHTML = `<span>${desc}</span><span>${title}</span>`;
        list.appendChild(div);
    });
}

function showDragonSeal() {
    checkAchievements(); 
    switchScreen("screen-achievements");
    const container = document.getElementById("sealContainer");
    container.innerHTML = "";
    
    ACHIEVEMENTS.forEach((ach, index) => {
        const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
        const card = document.createElement("div");
        card.className = "pokedex-card" + (isUnlocked ? " unlocked" : "");
        
        const imgSrc = isUnlocked ? `images/achievements/ach_${index+1}.PNG` : "images/achievements/ach_locked.PNG"; 
        
        card.innerHTML = `
            <img src="${imgSrc}" class="pokedex-img" alt="Seal" onerror="this.src='images/achievements/ach_locked.PNG'">
            <div class="pokedex-title">${ach.title}</div>
        `;
        card.onclick = () => {
            alert(`【${ach.title}】\n\n條件：${ach.desc}\n狀態：${isUnlocked ? "已解鎖" : "未解鎖"}`);
        };
        container.appendChild(card);
    });
}

function showTitlesModal() {
    document.getElementById("titlesModal").style.display = "flex";
    const radial = document.getElementById("radialMenuContainer");
    if(radial) radial.style.display = 'none';
    
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
    const menuScreen = document.getElementById("screen-menu");
    if (menuScreen.classList.contains('active')) {
        document.getElementById("radialMenuContainer").style.display = 'block';
    }
}

function renderSingleList() {
    const div = document.getElementById("singleChapterList");
    div.innerHTML = "";
    document.getElementById("singleConfirmArea").style.display = "none";
    Object.keys(db).forEach(k => {
        const btn = document.createElement("button");
        btn.className = "chapter-btn";
        btn.innerText = db[k].title;
        btn.onclick = () => selectSingleChapter(k, db[k].title, btn);
        div.appendChild(btn);
    });
}

function selectSingleChapter(key, title, btnElement) {
    document.querySelectorAll("#singleChapterList .chapter-btn").forEach(b => b.classList.remove("active"));
    btnElement.classList.add("active");
    pendingSingleChapterKey = key;
    document.getElementById("singleSelectedTitle").innerText = title;
    document.getElementById("singleConfirmArea").style.display = "block";
}

function renderMixList() {
    const div = document.getElementById("mixChapterList");
    div.innerHTML = "";
    Object.keys(db).forEach(k => {
        const label = document.createElement("label");
        label.className = "mix-item";
        label.innerHTML = `<input type="checkbox" value="${k}" onchange="checkMixCount()"> ${db[k].title}`;
        div.appendChild(label);
    });
    checkMixCount();
}

function checkMixCount() {
    const c = document.querySelectorAll("#mixChapterList input:checked").length;
    document.getElementById("mixCount").innerText = `已選：${c}`;
    updateMixStyles();
}

function selectAllMix() {
    document.querySelectorAll("#mixChapterList input[type='checkbox']").forEach(c => c.checked = true);
    checkMixCount();
}

function deselectAllMix() {
    document.querySelectorAll("#mixChapterList input[type='checkbox']").forEach(c => c.checked = false);
    checkMixCount();
}

function updateClassOptions() {
    const gradeSelect = document.getElementById("inputGrade");
    const classSelect = document.getElementById("inputClassLetter");
    const selectedGrade = parseInt(gradeSelect.value);
    const options = classSelect.options;

    for (let i = 0; i < options.length; i++) {
        if (options[i].value === 'R') {
            if (selectedGrade === 9) {
                options[i].style.display = 'block';
                options[i].disabled = false;
            } else {
                options[i].style.display = 'none';
                options[i].disabled = true;
                if (classSelect.value === 'R') {
                    classSelect.value = 'D';
                }
            }
        }
    }
}

function editProfile() {
    const cls = gameState.user.class;
    let grade = "";
    let letter = "";
    if (cls.length >= 2) {
        if (!isNaN(cls.substring(0, 2))) {
            grade = cls.substring(0, 2);
            letter = cls.substring(2);
        } else {
            grade = cls.substring(0, 1);
            letter = cls.substring(1);
        }
    }
    document.getElementById("inputName").value = gameState.user.name;
    document.getElementById("inputGrade").value = grade;
    updateClassOptions();
    document.getElementById("inputClassLetter").value = letter;
    switchScreen("screen-login");
}

function showHelp() {
    document.getElementById("helpModal").style.display = "flex";
    const radialContainer = document.getElementById("radialMenuContainer");
    if (radialContainer) radialContainer.style.display = 'none';
}
function closeHelp() {
    document.getElementById("helpModal").style.display = "none";
    const radialContainer = document.getElementById("radialMenuContainer");
    const menuScreen = document.getElementById("screen-menu");
    if (menuScreen.classList.contains('active') && radialContainer) {
        const menuLayout = document.querySelector(".menu-layout");
        if (menuLayout && menuLayout.style.display !== 'none') {
             radialContainer.style.display = 'block';
        }
    }
}

function showStatsModal() {
    document.getElementById("statsModal").style.display = "flex";
    const radial = document.getElementById("radialMenuContainer");
    if(radial) radial.style.display = 'none';
    drawRadarChartSVG();
}

function closeStatsModal() {
    document.getElementById('statsModal').style.display='none';
    const menuScreen = document.getElementById("screen-menu");
    if (menuScreen.classList.contains('active')) {
        document.getElementById("radialMenuContainer").style.display = 'block';
    }
}

function calculateStats() {
    const mapping = [
        {name: "唐詩三首", keys: ["p_shanshu", "p_yuexia", "p_denglou"]}, 
        {name: "儒家思想", keys: ["p_lunyu", "p_mengzi", "p_quanxue", "p_shishuo"]}, 
        {name: "記遊", keys: ["p_yueyang", "p_xishan"]}, 
        {name: "宋詞三首", keys: ["p_niannu", "p_shengman", "p_qinyuan"]}, 
        {name: "道家思想", keys: ["p_xiaoyao"]},
        {name: "政論文章", keys: ["p_liuguo", "p_chushi", "p_lianpo"]}
    ];

    let stats = [];
    mapping.forEach(group => {
        let totalQ = 0;
        let solvedQ = 0;
        group.keys.forEach(k => {
            if(db[k]) {
                if(db[k].junior) {
                    totalQ += db[k].junior.length;
                    db[k].junior.forEach(q => { if(gameState.solvedQuestionIds.includes(q.id)) solvedQ++; });
                }
                if(db[k].senior) {
                    totalQ += db[k].senior.length;
                    db[k].senior.forEach(q => { if(gameState.solvedQuestionIds.includes(q.id)) solvedQ++; });
                }
            }
        });
        stats.push(totalQ === 0 ? 0 : solvedQ / totalQ);
    });
    return stats;
}

function drawRadarChartSVG() {
    const container = document.getElementById("radarContainer");
    container.innerHTML = "";
    
    const width = 400;
    const height = 350;
    const cx = 200;
    const cy = 175;
    const radius = 95; 
    const stats = calculateStats();
    const labels = ["唐詩三首", "儒家思想", "記遊", "宋詞三首", "道家思想", "政論文章"];
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    
    const angleMap = [240, 300, 0, 60, 120, 180];

    const getCoords = (val, i) => {
        const angleDeg = angleMap[i];
        const angleRad = angleDeg * (Math.PI / 180);
        const x = cx + (radius * val) * Math.cos(angleRad);
        const y = cy + (radius * val) * Math.sin(angleRad);
        return {x, y};
    };

    let bgPoints = "";
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(1, i);
        bgPoints += `${x},${y} `;
    }
    const bgPoly = document.createElementNS(svgNS, "polygon");
    bgPoly.setAttribute("points", bgPoints.trim());
    bgPoly.setAttribute("fill", "rgba(238, 238, 238, 0.5)");
    bgPoly.setAttribute("stroke", "#ddd");
    svg.appendChild(bgPoly);
    
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(1, i);
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", cx);
        line.setAttribute("y1", cy);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#eee");
        svg.appendChild(line);
        
        const labelText = document.createElementNS(svgNS, "text");
        const lx = cx + (radius + 25) * Math.cos(angleMap[i] * (Math.PI / 180));
        const ly = cy + (radius + 25) * Math.sin(angleMap[i] * (Math.PI / 180));
        
        labelText.setAttribute("x", lx);
        labelText.setAttribute("y", ly);
        
        let anchor = "middle";
        let baseline = "middle";
        
        const deg = angleMap[i];
        if (deg === 180) { 
            anchor = "end"; 
        } else if (deg === 0) { 
            anchor = "start"; 
        } else if (deg > 0 && deg < 180) { 
            baseline = "hanging"; 
        } else { 
            baseline = "auto"; 
        }

        if(deg === 120) anchor = "end"; 
        if(deg === 60) anchor = "start"; 
        if(deg === 240) anchor = "end"; 
        if(deg === 300) anchor = "start"; 

        labelText.setAttribute("text-anchor", anchor);
        labelText.setAttribute("dominant-baseline", baseline);
        labelText.setAttribute("fill", "#333");
        labelText.setAttribute("font-family", "Microsoft JhengHei");
        labelText.setAttribute("font-size", "15"); 
        labelText.setAttribute("font-weight", "bold"); 
        labelText.textContent = labels[i];
        svg.appendChild(labelText);
    }
    
    const dataPoly = document.createElementNS(svgNS, "polygon");
    dataPoly.setAttribute("fill", "rgba(52, 152, 219, 0.6)");
    dataPoly.setAttribute("stroke", "#2980b9");
    dataPoly.setAttribute("stroke-width", "2");
    svg.appendChild(dataPoly);

    let startPoints = "";
    for(let i=0; i<6; i++) {
        startPoints += `${cx},${cy} `;
    }
    let endPoints = "";
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(stats[i], i);
        endPoints += `${x},${y} `;
    }

    const animate = document.createElementNS(svgNS, "animate");
    animate.setAttribute("attributeName", "points");
    animate.setAttribute("dur", "0.5s");
    animate.setAttribute("fill", "freeze");
    animate.setAttribute("from", startPoints.trim());
    animate.setAttribute("to", endPoints.trim());
    animate.setAttribute("calcMode", "spline");
    animate.setAttribute("keyTimes", "0;1");
    animate.setAttribute("keySplines", "0.25 0.1 0.25 1"); 
    
    dataPoly.appendChild(animate);
    animate.beginElement();
    
    container.appendChild(svg);
}

function resizeCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
function createParticle(x, y, color, type) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color,
        type: type
    });
}
function fireBeam(startX, startY, endX, endY, color) {
    const steps = 20;
    for (let i = 0; i < steps; i++) {
        setTimeout(() => {
            const progress = i / steps;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            for(let j=0; j<5; j++) {
                particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 0.8,
                    color: color,
                    type: 'beam'
                });
            }
        }, i * 15);
    }
}
function loopParticles() {
    if(!particleCtx) return;
    particleCtx.clearRect(0, 0, particleCtx.canvas.width, particleCtx.canvas.height);
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        particleCtx.globalAlpha = p.life;
        particleCtx.fillStyle = p.color;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.type === 'beam' ? 3 : 5, 0, Math.PI * 2);
        particleCtx.fill();
    }
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(loopParticles);
}
function triggerAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
}

function showUnlockNotification(newIds) {
    const body = document.getElementById("unlockModalBody");
    body.innerHTML = "";
    
    newIds.forEach(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if(ach) {
            const div = document.createElement("div");
            div.style.marginBottom = "30px";
            div.innerHTML = `
                <img src="images/achievements/${ach.id}.PNG" style="width:120px; height:120px; object-fit:contain; margin-bottom:15px; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));">
                <div style="font-size:1.4rem; font-weight:bold; color:var(--primary-blue); margin-bottom: 5px;">${ach.title}</div>
                <div style="font-size:1rem; color:#555;">${ach.desc}</div>
            `;
            body.appendChild(div);
        }
    });
    
    document.getElementById("unlockModal").style.display = "flex";
    playSFX('success');
}

function showShop() {
    renderShop();
}

function renderShop() {
    switchScreen("screen-shop");
    const container = document.getElementById("shopContainer");
    container.innerHTML = "";
    document.getElementById("coinDisplay").innerText = `金幣：${gameState.user.coins}`;
    
    SHOP_ITEMS.forEach(item => {
        const card = document.createElement("div");
        card.className = "shop-card";
        card.innerHTML = `
            <img src="images/items/${item.img}" class="shop-img" onerror="this.src='images/ui/icon_core.PNG'">
            <div class="shop-title">${item.name}</div>
            <div class="shop-price">$${item.price}</div>
            <button class="btn-secondary" style="width:100%; margin:5px 0 0 0;" onclick="alert('功能開發中...')">購買</button>
        `;
        container.appendChild(card);
    });
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
    
    let filteredItems = gameState.inventory.map((item, index) => ({...item, originalIndex: index}));
    
    if (currentInvTab !== 'all') {
        filteredItems = filteredItems.filter(item => item && item.type === currentInvTab);
    }
    
    const slots = 48;
    
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
                <div style="width:100%; height:100px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:2rem; font-weight:bold;">${i+1}</div>
                <div style="font-size:0.8rem; color:#ccc;">空</div>
             `;
        }
        container.appendChild(card);
    }
    
    if (gameState.inventory.length > 48) {
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
}

function confirmDelete() {
    if (itemToDeleteIndex === -1) return;
    const count = parseInt(document.getElementById("deleteCount").value);
    const item = gameState.inventory[itemToDeleteIndex];
    if (count >= item.count) {
        gameState.inventory.splice(itemToDeleteIndex, 1);
    } else {
        item.count -= count;
    }
    saveGame();
    renderInventory();
    document.getElementById("deleteModal").style.display = "none";
}

function renderDailyTasks() {
    switchScreen("screen-daily");
    const container = document.getElementById("dailyContainer");
    container.innerHTML = "";
    
    DAILY_QUESTS.forEach(quest => {
        let userState = gameState.dailyTasks.find(t => t.id === quest.id);
        
        if (!userState) {
            userState = { id: quest.id, progress: 0, complete: false, claimed: false };
            gameState.dailyTasks.push(userState);
        }

        let descText = quest.desc;
        if(quest.id === 6 || quest.id === 7) {
            const chapterKey = userState.targetKey;
            const chapterName = (chapterKey && db[chapterKey]) ? db[chapterKey].title : "隨機篇章";
            descText = descText.replace("指定篇章", chapterName);
        }

        const row = document.createElement("div");
        const isComplete = userState.progress >= quest.target;
        
        let rowClass = "task-row";
        if (userState.claimed) rowClass += " completed"; 
        else if (isComplete) rowClass += " can-claim";
        
        row.className = rowClass;
        
        let btnClass = "btn-claim";
        let btnText = "未完成";
        let disabled = "disabled";
        
        if (userState.claimed) {
            btnText = "已領取";
            btnClass += " yellow";
        } else if (isComplete) {
            btnText = "領取";
            btnClass += " red";
            disabled = "";
        } else {
            btnClass += " gray";
        }
        
        row.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span class="task-desc">${descText}</span>
                <span class="task-reward-info">獎勵: ${quest.reward} 金幣</span>
                <span style="font-size:0.8rem; color:#7f8c8d;">進度: ${userState.progress}/${quest.target}</span>
            </div>
            <button class="${btnClass}" ${disabled} onclick="claimTaskReward(${quest.id})">${btnText}</button>
        `;
        container.appendChild(row);
    });
}

function claimTaskReward(id) {
    const quest = DAILY_QUESTS.find(q => q.id === id);
    const userState = gameState.dailyTasks.find(t => t.id === id);
    
    if(quest && userState && !userState.claimed && userState.progress >= quest.target) {
        userState.claimed = true;
        gameState.user.coins = Math.min(gameState.user.coins + quest.reward, GAME_CONFIG.MAX_COINS);
        saveGame();
        playSFX('success');
        renderDailyTasks();
        alert(`成功領取獎勵：${quest.reward} 金幣！`);
    }
}

function renderSmelting() {
    switchScreen("screen-smelt");
    const container = document.getElementById("smeltContainer");
    container.innerHTML = "";
    
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
            if(!smeltSlots[i]) {
                alert("請從背包選擇物品添加 (功能開發中: 預設添加鐵線)");
                smeltSlots[i] = { name: "鐵線", img: "item_wire.PNG", count: 1 };
                renderSmelting();
            } else {
                smeltSlots[i] = null;
                renderSmelting();
            }
        };
        container.appendChild(slot);
    }
}

function initSmelt() {
    if (smeltSlots.every(s => s === null)) return alert("請先添加材料！");
    document.getElementById("smeltConfirmModal").style.display = "flex";
}

function executeSmelt() {
    document.getElementById("smeltConfirmModal").style.display = "none";
    smeltSlots = [null, null, null, null];
    renderSmelting();
    alert("熔煉成功！(獲得: 未知物品)");
}

function showRecipes() {
    document.getElementById("recipeModal").style.display = "flex";
}

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

function toggleRadialMenu() {
    const container = document.getElementById("radialMenuContainer");
    if (container.classList.contains("open")) {
        closeRadialMenu();
    } else {
        container.classList.add("open");
        // Removed manual playSFX('click') here to avoid double sound
    }
}

function closeRadialMenu() {
    const container = document.getElementById("radialMenuContainer");
    if (container) container.classList.remove("open");
}

document.addEventListener('click', function(e) {
    const radialContainer = document.getElementById("radialMenuContainer");
    const mainBtn = document.getElementById("radialMainBtn");
    
    if (radialContainer && radialContainer.classList.contains("open")) {
        if (!radialContainer.contains(e.target) && e.target !== mainBtn && !mainBtn.contains(e.target)) {
            closeRadialMenu();
        }
    }
});