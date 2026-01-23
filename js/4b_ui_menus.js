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
    document.getElementById("subMenuSingle").style.display = "none";
    document.getElementById("subMenuMix").style.display = "none";
    document.querySelector(".menu-layout").style.display = "grid";
    const profileCard = document.querySelector(".profile-card");
    if(profileCard) profileCard.style.display = "flex";
    
    setTimeout(updateCoreButtonVisibility, 50);

    document.getElementById("singleConfirmArea").style.display = "none";
    document.querySelectorAll(".chapter-btn").forEach(b => b.classList.remove("active"));
    pendingSingleChapterKey = "";
    gameState.mixSelectedKeys = [];
    const chks = document.querySelectorAll("#mixChapterList input");
    chks.forEach(c => c.checked = false);
    document.getElementById("mixCount").innerText = "已選：0";
}

function renderSingleList() {
    const db = window.questionsDB || {};
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
    const db = window.questionsDB || {};
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

function updateMixStyles() {
    document.querySelectorAll(".mix-item").forEach(label => {
        const chk = label.querySelector("input");
        if(chk.checked) label.classList.add("active");
        else label.classList.remove("active");
    });
}

function selectAllMix() {
    document.querySelectorAll("#mixChapterList input[type='checkbox']").forEach(c => c.checked = true);
    checkMixCount();
}

function deselectAllMix() {
    document.querySelectorAll("#mixChapterList input[type='checkbox']").forEach(c => c.checked = false);
    checkMixCount();
}

function randomSelectMix() {
    const count = parseInt(document.getElementById("mixRandomCount").value);
    const db = window.questionsDB || {};
    const keys = Object.keys(db);
    
    if (count > keys.length) return alert("選擇數量超過現有篇章總數！");
    
    gameState.mixSelectedKeys = [];
    const shuffled = keys.sort(() => 0.5 - Math.random());
    gameState.mixSelectedKeys = shuffled.slice(0, count);
    
    const jrCost = GAME_CONFIG.ENERGY_COST_JR_SINGLE;
    const srCost = GAME_CONFIG.ENERGY_COST_SR_SINGLE;
    
    const infoDiv = document.getElementById("energyCostInfo");
    infoDiv.innerHTML = "";
    
    const capsule = document.createElement("div");
    capsule.className = "mix-blue-wrapper";
    capsule.style.display = "inline-flex";
    capsule.innerHTML = `<span>消耗：初階 ${jrCost} / 高階 ${srCost}</span>`;
    infoDiv.appendChild(capsule);
    
    gameState.mode = 'mix';
    switchScreen('screen-difficulty');
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
    updateCoreButtonVisibility();
}
function closeHelp() {
    document.getElementById("helpModal").style.display = "none";
    updateCoreButtonVisibility();
}

function toggleRadialMenu() {
    const container = document.getElementById("radialMenuContainer");
    const bd = document.getElementById("floatingBackdrop");

    if (container.classList.contains("open")) {
        closeRadialMenu();
    } else {
        container.classList.add("open");
        if(bd) bd.classList.add("active");
    }
}

function closeRadialMenu() {
    const container = document.getElementById("radialMenuContainer");
    const bd = document.getElementById("floatingBackdrop");
    if (container) container.classList.remove("open");
    if (bd) bd.classList.remove("active");
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
