const GAME_CONFIG = {
    XP_WIN: 9,
    HP_PENALTY: 5,
    HP_REWARD_CORRECT: 2,
    ENERGY_COST_JR_SINGLE: 1,
    ENERGY_COST_SR_SINGLE: 2,
    ENERGY_REWARD_PERFECT: 2,
    ENERGY_REWARD_SUCCESS: 1,
    ENERGY_REWARD_STUDY: 1,
    MAX_STUDY_MINS: 10,
    MAX_LEVEL: 99,
    MAX_XP: 9999
};

let db = window.questionsDB || {};
const TITLES = [
"初心新手", "鐵劍勇者", "龍影覓者", "鱗甲獵手", "龍息破者", 
"血爪鬥士", "翼刃騎士", "獵心守護", "龍牙勇將", "雷霆屠夫", 
"龍魂征服", "焚天劍豪", "滅鱗霸主", "龍血君王", "噬血龍將", 
"破空龍屠", "蒼穹滅士", "究極•屠龍者", "龍脈•降龍無悔"
];

// Achievements List
const ACHIEVEMENTS = [
    {id: "ach_1", title: "初入江湖", desc: "達到等級 5"},
    {id: "ach_2", title: "學富五車", desc: "獲得 5000 經驗值"},
    {id: "ach_3", title: "駐足常客", desc: "累積遊玩 15 分鐘"},
    {id: "ach_4", title: "流連忘返", desc: "累積遊玩 60 分鐘"},
    {id: "ach_5", title: "歲月如歌", desc: "累積遊玩 999 分鐘"},

    {id: "ach_6", title: "屠龍首殺", desc: "完成任意一篇試煉"},
    {id: "ach_7", title: "毫髮無傷", desc: "3篇不同篇章滿血通關"},
    {id: "ach_8", title: "險勝一籌", desc: "剩餘 HP < 10 通關"},
    {id: "ach_9", title: "絕地反擊", desc: "剩餘 HP < 5 通關"},
    {id: "ach_10", title: "完美一擊", desc: "3次不同篇章完美通關"},
    {id: "ach_11", title: "勢如破竹", desc: "連續5次不同篇章完美通關"},
    {id: "ach_12", title: "獨孤求敗", desc: "連續10次不同篇章完美通關"},

    {id: "ach_13", title: "雙修大師", desc: "同一篇章初階與高階皆通過"},
    {id: "ach_14", title: "初階制霸", desc: "完成所有 16 篇初階試煉"},
    {id: "ach_15", title: "高階制霸", desc: "完成所有 16 篇高階試煉"},
    {id: "ach_16", title: "全域制霸", desc: "完成全 16 篇初階及高階"},

    {id: "ach_17", title: "尋龍者", desc: "解鎖 1 張圖鑑"},
    {id: "ach_18", title: "龍族獵人", desc: "解鎖 8 張圖鑑"},
    {id: "ach_19", title: "龍之博物館", desc: "解鎖全部 16 張圖鑑"},

    {id: "ach_20", title: "小試牛刀", desc: "混合模式獲勝 1 次"},
    {id: "ach_21", title: "混合雙打", desc: "混合 5 篇以上獲勝 1 次"},
    {id: "ach_22", title: "十面埋伏", desc: "混合 10 篇以上獲勝 1 次"},
    {id: "ach_23", title: "大滿貫", desc: "混合 16 篇全選獲勝 1 次"},
    {id: "ach_24", title: "隨機應變", desc: "使用隨機功能獲勝 1 次"},
    {id: "ach_25", title: "命運之子", desc: "使用隨機功能獲勝 10 次"},

    {id: "ach_26", title: "書蟲出沒", desc: "累計答對 100 題 (不重複)"},
    {id: "ach_27", title: "勤奮學子", desc: "累計答對 500 題 (不重複)"},
    {id: "ach_28", title: "手不釋卷", desc: "累計答對 1000 題 (不重複)"},
    {id: "ach_29", title: "筆耕不輟", desc: "高階模式答對 100 題 (不重複)"},
    {id: "ach_30", title: "字字珠璣", desc: "高階模式答對 300 題 (不重複)"},
    {id: "ach_31", title: "入木三分", desc: "高階模式答對 500 題 (不重複)"},
    {id: "ach_32", title: "鐵硯磨穿", desc: "累計嘗試作答 3000 次"},
    {id: "ach_33", title: "屢敗屢戰", desc: "累計答錯 111 次"},

    {id: "ach_34", title: "恢復狀態", desc: "單篇溫習剛好 1 分鐘"},
    {id: "ach_35", title: "養精蓄銳", desc: "溫習累計回復 10 點能量"},
    {id: "ach_36", title: "精神抖擻", desc: "溫習累計回復 60 點能量"},
    {id: "ach_37", title: "天地同壽", desc: "溫習累計回復 180 點能量"},
    {id: "ach_38", title: "浴火重生", desc: "溫習累計回復 300 點能量"},
    {id: "ach_39", title: "浩然正氣", desc: "溫習累計回復 600 點能量"},

    {id: "ach_40", title: "龍脈覺醒", desc: "解鎖前 39 個成就"}
];

const audioFiles = {
theme: new Audio('audio/bgm/bgm_theme.mp3'),
battleJr: new Audio('audio/bgm/bgm_battle_jr.mp3'),
battleSr: new Audio('audio/bgm/bgm_battle_sr.mp3'),
click: new Audio('audio/sfx/sfx_click.mp3'),
correct: new Audio('audio/sfx/sfx_correct.mp3'),
wrong: new Audio('audio/sfx/sfx_wrong.mp3'),
victory: new Audio('audio/sfx/sfx_victory.mp3'),
success: new Audio('audio/sfx/sfx_success.mp3'),
defeat: new Audio('audio/sfx/sfx_defeat.mp3')
};
audioFiles.theme.loop = true;
audioFiles.battleJr.loop = true;
audioFiles.battleSr.loop = true;

Object.values(audioFiles).forEach(a => {
    a.preload = 'auto';
});

let isMusicOn = true;
let isSFXEnabled = true;
let currentBGM = null;

function toggleMusic() {
isMusicOn = !isMusicOn;
const btn = document.getElementById('btnBGM');
if (isMusicOn) {
btn.classList.remove('off');
if (currentBGM) {
currentBGM.currentTime = 0;
currentBGM.play().catch(e=>{});
}
} else {
btn.classList.add('off');
if (currentBGM) currentBGM.pause();
}
}
function toggleSFX() {
isSFXEnabled = !isSFXEnabled;
const btn = document.getElementById('btnSFX');
if (isSFXEnabled) {
btn.classList.remove('off');
} else {
btn.classList.add('off');
}
}
function playMusic(type) {
let target = null;
if (type === 'theme') target = audioFiles.theme;
else if (type === 'battleJr') target = audioFiles.battleJr;
else if (type === 'battleSr') target = audioFiles.battleSr;
else if (type === 'victory') target = audioFiles.victory;
else if (type === 'success') target = audioFiles.success;
else if (type === 'defeat') target = audioFiles.defeat;
if (currentBGM === target) {
if (isMusicOn && target.paused) target.play().catch(e=>{});
return;
}
[audioFiles.theme, audioFiles.battleJr, audioFiles.battleSr, audioFiles.victory, audioFiles.success, audioFiles.defeat].forEach(a => {
a.pause();
a.currentTime = 0;
});
currentBGM = target;
if (isMusicOn && currentBGM) {
currentBGM.play().catch(e=>{});
}
}
function stopLongSFX() {
audioFiles.victory.pause(); audioFiles.victory.currentTime = 0;
audioFiles.success.pause(); audioFiles.success.currentTime = 0;
audioFiles.defeat.pause(); audioFiles.defeat.currentTime = 0;
}
function playSFX(name) {
if (!isSFXEnabled) return;
if (name === 'correct') {
if (audioFiles.wrong) { audioFiles.wrong.pause(); audioFiles.wrong.currentTime = 0; }
}
if (name === 'wrong') {
if (audioFiles.correct) { audioFiles.correct.pause(); audioFiles.correct.currentTime = 0; }
}
const sfx = audioFiles[name];
if (sfx) {
if (name === 'click') {
const clone = sfx.cloneNode();
clone.volume = 0.8;
clone.play().catch(e => {});
} else {
sfx.currentTime = 0;
sfx.volume = 0.8;
sfx.play().catch(e => {});
}
}
}
document.addEventListener('click', function(e) {
const target = e.target.closest('button') || e.target.closest('.pokedex-card') || e.target.closest('.mix-blue-wrapper');
if (target) {
if (target.classList.contains('mc-btn') && !target.disabled) return;
if (target.classList.contains('btn-attack')) return;
playSFX('click');
}
});
let gameState = {
user: { name: "", class: "", hp: 100, xp: 0, level: 1, title: "初心新手", energy: 100, unlockedReplayXP: false },
stats: {
    totalCorrect: 0,
    srCorrect: 0,
    consecutivePerfect: 0,
    mixWinCount: 0,
    mixWinCount5: 0,
    mixWinCount10: 0,
    mixWinCount16: 0,
    mixPerfect16: 0,
    randomWinCount: 0,
    totalStudyMins: 0,
    energyRecovered: 0,
    totalPlayTime: 0,
    tryCount: 0,
    wrongCountTotal: 0,
    perfectHistory: [] 
},
mode: "", 
difficulty: "", 
pool: [],
currentIndex: 0,
wrongCount: 0,
history: [], 
currentDragon: "",
currentChapterKey: "",
masteredChapters: [],
solvedQuestionIds: [],
mixSelectedKeys: [],
wrongGuesses: [],
unlockedAchievements: []
};
let pendingSingleChapterKey = ""; 
let inputLock = false;
let particleCtx = null;
let particles = [];
let pokedexTimer = null;
let pokedexSeconds = 0;
let gamePlayTimer = null; 

const ASSETS_TO_LOAD = [
    'images/ui/banner.jpg',
    'images/bg/login_bg.jpg',
    'images/ui/loading_icon.PNG',
    'images/ui/btn_setting.PNG',
    'images/ui/btn_music.PNG',
    'images/ui/btn_sound.PNG',
    'images/ui/btn_menu.PNG', 
    'images/ui/school_logo.jpg',
    'images/ui/icon_single.PNG',
    'images/ui/icon_mix.PNG',
    'images/ui/icon_book.PNG',
    'images/ui/icon_trophy.PNG',
    'images/dragons/dragon_unknown.jpg',
    'images/dragons/dragon_mix.jpg',
    'images/results/img_perfect.PNG',
    'images/results/img_success.PNG',
    'images/results/img_defeat.PNG',
    'images/achievements/ach_locked.PNG'
];
for(let i=1; i<=40; i++) ASSETS_TO_LOAD.push(`images/achievements/ach_${i}.PNG`);

function preloadAssets(callback) {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_LOAD.length + Object.keys(audioFiles).length;
    
    const updateProgress = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalAssets) * 100);
        document.getElementById('loadingBar').style.width = percent + '%';
        document.getElementById('loadingText').innerText = percent + '%';
        if (loadedCount >= totalAssets) {
            setTimeout(() => {
                document.getElementById('screen-loading').classList.remove('active');
                if(gameState.user.name) {
                    resetMenu();
                    switchScreen('screen-menu');
                } else {
                    document.getElementById('screen-login').classList.add('active');
                }
                callback();
            }, 500);
        }
    };

    ASSETS_TO_LOAD.forEach(src => {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress; 
        img.src = src;
    });

    Object.values(audioFiles).forEach(audio => {
        if (audio.readyState >= 3) {
            updateProgress();
        } else {
            audio.addEventListener('canplaythrough', updateProgress, { once: true });
            audio.addEventListener('error', updateProgress, { once: true });
            audio.load();
        }
    });
}

function initDraggableMenu() {
    const dragItem = document.getElementById("floatingMenuContainer");
    const container = document.body;
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const mainBtn = document.getElementById("floatingMainBtn");
    const subMenu = document.getElementById("floatingSubMenu");

    mainBtn.addEventListener("click", (e) => {
        if(!dragItem.classList.contains("dragging")) {
            subMenu.classList.toggle("visible");
        }
    });

    container.addEventListener("touchstart", dragStart, {passive: false});
    container.addEventListener("touchend", dragEnd, {passive: false});
    container.addEventListener("touchmove", drag, {passive: false});

    container.addEventListener("mousedown", dragStart);
    container.addEventListener("mouseup", dragEnd);
    container.addEventListener("mousemove", drag);

    function dragStart(e) {
        if (e.target === mainBtn || mainBtn.contains(e.target) || e.target === dragItem) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            if (e.target === mainBtn || mainBtn.contains(e.target)) {
                active = true;
            }
        }
    }

    function dragEnd(e) {
        if(!active) return;
        initialX = currentX;
        initialY = currentY;
        active = false;
        
        const rect = dragItem.getBoundingClientRect();
        dragItem.style.transition = "transform 0.3s ease-out";
        xOffset = 0; 
        setTranslate(xOffset, yOffset, dragItem);
        setTimeout(() => {
            dragItem.style.transition = ""; 
        }, 300);
    }

    function drag(e) {
        if (active) {
            e.preventDefault();
            dragItem.classList.add("dragging");
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, dragItem);
        } else {
            dragItem.classList.remove("dragging");
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}

window.onload = function() {
    db = window.questionsDB || {};
    loadGame();
    preloadAssets(() => {
        const canvas = document.getElementById('particleCanvas');
        particleCtx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        loopParticles();
        initDraggableMenu(); 
        
        setInterval(() => {
            if(document.visibilityState === 'visible') {
                gameState.stats.totalPlayTime = (gameState.stats.totalPlayTime || 0) + 1;
                if(gameState.stats.totalPlayTime % 60 === 0) { 
                    saveGame(); 
                    checkAchievements();
                }
            }
        }, 1000 * 60); 
    });
};
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
function saveGame() {
    const data = {
        user: gameState.user,
        stats: gameState.stats,
        masteredChapters: gameState.masteredChapters,
        solvedQuestionIds: gameState.solvedQuestionIds,
        unlockedAchievements: gameState.unlockedAchievements
    };
    localStorage.setItem("dbs_dragon_save_v2", btoa(encodeURIComponent(JSON.stringify(data))));
}
function loadGame() {
    const data = localStorage.getItem("dbs_dragon_save_v2");
    if (data) {
        try {
            const parsed = JSON.parse(decodeURIComponent(atob(data)));
            applyGameData(parsed);
        } catch (e) {
            try {
                const parsed = JSON.parse(data);
                applyGameData(parsed);
            } catch (e2) {}
        }
    }
}
function applyGameData(parsed) {
    gameState.user = parsed.user;
    if (typeof gameState.user.energy === 'undefined') gameState.user.energy = 100;
    if (typeof gameState.user.unlockedReplayXP === 'undefined') gameState.user.unlockedReplayXP = false;
    
    gameState.stats = parsed.stats || {
        totalCorrect: 0, srCorrect: 0, consecutivePerfect: 0,
        mixWinCount: 0, mixWinCount5: 0, mixWinCount10: 0, mixWinCount16: 0, mixPerfect16: 0,
        randomWinCount: 0, totalStudyMins: 0, energyRecovered: 0, totalPlayTime: 0, tryCount: 0, wrongCountTotal: 0, perfectHistory: []
    };
    if(typeof gameState.stats.totalPlayTime === 'undefined') gameState.stats.totalPlayTime = 0;
    if(typeof gameState.stats.tryCount === 'undefined') gameState.stats.tryCount = 0;
    if(typeof gameState.stats.wrongCountTotal === 'undefined') gameState.stats.wrongCountTotal = 0;
    if(!Array.isArray(gameState.stats.perfectHistory)) gameState.stats.perfectHistory = [];

    gameState.masteredChapters = parsed.masteredChapters || [];
    gameState.solvedQuestionIds = parsed.solvedQuestionIds || [];
    gameState.unlockedAchievements = parsed.unlockedAchievements || [];
    updateUserDisplay();
}
function checkAchievements() {
    const u = gameState.user;
    const s = gameState.stats;
    const unlocked = gameState.unlockedAchievements;
    const newUnlock = [];

    if(u.level >= 5 && !unlocked.includes("ach_1")) newUnlock.push("ach_1");
    if(u.xp >= 5000 && !unlocked.includes("ach_2")) newUnlock.push("ach_2");
    if(s.totalPlayTime >= 15 && !unlocked.includes("ach_3")) newUnlock.push("ach_3");
    if(s.totalPlayTime >= 60 && !unlocked.includes("ach_4")) newUnlock.push("ach_4");
    if(s.totalPlayTime >= 999 && !unlocked.includes("ach_5")) newUnlock.push("ach_5");

    if(gameState.masteredChapters.length > 0 && !unlocked.includes("ach_6")) newUnlock.push("ach_6"); 
    
    let jrCount = 0, srCount = 0, bothCount = 0;
    Object.keys(db).forEach(k => {
        const jr = gameState.masteredChapters.includes(k+'_junior');
        const sr = gameState.masteredChapters.includes(k+'_senior');
        if(jr) jrCount++;
        if(sr) srCount++;
        if(jr && sr) bothCount++;
    });
    const totalChapters = Object.keys(db).length;

    if(bothCount >= 1 && !unlocked.includes("ach_13")) newUnlock.push("ach_13");
    if(jrCount >= totalChapters && !unlocked.includes("ach_14")) newUnlock.push("ach_14");
    if(srCount >= totalChapters && !unlocked.includes("ach_15")) newUnlock.push("ach_15");
    if(bothCount >= totalChapters && !unlocked.includes("ach_16")) newUnlock.push("ach_16");

    if(bothCount >= 1 && !unlocked.includes("ach_17")) newUnlock.push("ach_17");
    if(bothCount >= 8 && !unlocked.includes("ach_18")) newUnlock.push("ach_18");
    if(bothCount >= totalChapters && !unlocked.includes("ach_19")) newUnlock.push("ach_19");

    if(s.mixWinCount >= 1 && !unlocked.includes("ach_20")) newUnlock.push("ach_20");
    if(s.mixWinCount5 >= 1 && !unlocked.includes("ach_21")) newUnlock.push("ach_21");
    if(s.mixWinCount10 >= 1 && !unlocked.includes("ach_22")) newUnlock.push("ach_22");
    if(s.mixWinCount16 >= 1 && !unlocked.includes("ach_23")) newUnlock.push("ach_23");
    if(s.randomWinCount >= 1 && !unlocked.includes("ach_24")) newUnlock.push("ach_24");
    if(s.randomWinCount >= 10 && !unlocked.includes("ach_25")) newUnlock.push("ach_25");

    if(s.totalCorrect >= 100 && !unlocked.includes("ach_26")) newUnlock.push("ach_26");
    if(s.totalCorrect >= 500 && !unlocked.includes("ach_27")) newUnlock.push("ach_27");
    if(s.totalCorrect >= 1000 && !unlocked.includes("ach_28")) newUnlock.push("ach_28");
    if(s.srCorrect >= 100 && !unlocked.includes("ach_29")) newUnlock.push("ach_29");
    if(s.srCorrect >= 300 && !unlocked.includes("ach_30")) newUnlock.push("ach_30");
    if(s.srCorrect >= 500 && !unlocked.includes("ach_31")) newUnlock.push("ach_31");
    if(s.tryCount >= 3000 && !unlocked.includes("ach_32")) newUnlock.push("ach_32");
    if(s.wrongCountTotal >= 111 && !unlocked.includes("ach_33")) newUnlock.push("ach_33");

    if(s.energyRecovered >= 10 && !unlocked.includes("ach_35")) newUnlock.push("ach_35");
    if(s.energyRecovered >= 60 && !unlocked.includes("ach_36")) newUnlock.push("ach_36");
    if(s.energyRecovered >= 180 && !unlocked.includes("ach_37")) newUnlock.push("ach_37");
    if(s.energyRecovered >= 300 && !unlocked.includes("ach_38")) newUnlock.push("ach_38");
    if(s.energyRecovered >= 600 && !unlocked.includes("ach_39")) newUnlock.push("ach_39");

    if(gameState.unlockedAchievements.length >= 39 && !unlocked.includes("ach_40")) {
        newUnlock.push("ach_40");
    }

    if(newUnlock.length > 0) {
        newUnlock.forEach(id => gameState.unlockedAchievements.push(id));
        saveGame();
    }
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
function handleLogin() {
    const n = document.getElementById("inputName").value.trim();
    const g = document.getElementById("inputGrade").value;
    const l = document.getElementById("inputClassLetter").value;
    if(!n || !g || !l) return alert("請輸入姓名及選擇班別");
    
    playMusic('theme'); 

    const c = g + l;
    gameState.user.name = n;
    gameState.user.class = c;
    saveGame();
    updateUserDisplay();
    
    setTimeout(() => {
        resetMenu();
        switchScreen("screen-menu");
    }, 10);
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
}
function closeHelp() {
document.getElementById("helpModal").style.display = "none";
}
function showComingSoon() {
    alert("暫未開放");
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
function showStatsModal() {
    document.getElementById("statsModal").style.display = "flex";
    drawRadarChartSVG();
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
    
    // Increased canvas size to fit text
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
    
    let dataPoints = "";
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(stats[i], i);
        dataPoints += `${x},${y} `;
    }
    const dataPoly = document.createElementNS(svgNS, "polygon");
    dataPoly.setAttribute("points", dataPoints.trim());
    dataPoly.setAttribute("fill", "rgba(52, 152, 219, 0.6)");
    dataPoly.setAttribute("stroke", "#2980b9");
    dataPoly.setAttribute("stroke-width", "2");
    svg.appendChild(dataPoly);
    
    container.appendChild(svg);
}
function showTitlesModal() {
    document.getElementById("titlesModal").style.display = "flex";
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
function switchScreen(id) {
document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
document.getElementById(id).classList.add('active');
if (id !== 'screen-result') {
stopLongSFX();
}
if (id === 'screen-game') {
resizeCanvas();
if (gameState.difficulty === 'junior') playMusic('battleJr');
else playMusic('battleSr');
} else if (id === 'screen-menu') {
playMusic('theme'); 
checkAchievements();
}
}
function goHome() {
if(confirm("確定要返回主目錄嗎？本次試煉進度將會中斷。")) {
resetMenu();
switchScreen("screen-menu");
}
}
function backToMenuFromEnd() {
stopLongSFX();
resetMenu();
switchScreen("screen-menu");
playMusic('theme');
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
checkAchievements();
saveGame();
updateUserDisplay();
updateBars();
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
function confirmSingleGame() {
if (!pendingSingleChapterKey) return;
const k = pendingSingleChapterKey;
gameState.mode = 'single';
gameState.currentChapterKey = k;
switchScreen("screen-difficulty");
const jrCost = GAME_CONFIG.ENERGY_COST_JR_SINGLE;
const srCost = GAME_CONFIG.ENERGY_COST_SR_SINGLE;
document.getElementById("energyCostInfo").innerText = `消耗浩然之氣：初階 ${jrCost} / 高階 ${srCost}`;
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
function randomSelectMix() {
    deselectAllMix();
    const countVal = document.getElementById("mixRandomCount").value;
    const count = parseInt(countVal, 10);
    const allCheckboxes = Array.from(document.querySelectorAll("#mixChapterList input[type='checkbox']"));
    const totalChapters = allCheckboxes.length;
    if (totalChapters < 2) return;
    
    for (let i = totalChapters - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCheckboxes[i], allCheckboxes[j]] = [allCheckboxes[j], allCheckboxes[i]];
    }
    
    for (let i = 0; i < count; i++) {
        allCheckboxes[i].checked = true;
    }
    confirmMixMode(); 
}
function confirmMixMode() {
const chks = document.querySelectorAll("#mixChapterList input:checked");
if(chks.length < 2) return alert("最少選擇 2 篇！");
gameState.mode = 'mix';
gameState.currentChapterKey = "mix";
gameState.mixSelectedKeys = Array.from(chks).map(c => c.value);
switchScreen("screen-difficulty");
const count = gameState.mixSelectedKeys.length;
const jrCost = count * GAME_CONFIG.ENERGY_COST_JR_SINGLE;
const srCost = count * GAME_CONFIG.ENERGY_COST_SR_SINGLE;
document.getElementById("energyCostInfo").innerText = `消耗浩然之氣：初階 ${jrCost} / 高階 ${srCost}`;
}
function initGame(diff) {
let cost = 0;
if (gameState.mode === 'single') {
cost = (diff === 'junior') ? GAME_CONFIG.ENERGY_COST_JR_SINGLE : GAME_CONFIG.ENERGY_COST_SR_SINGLE;
} else {
const count = gameState.mixSelectedKeys.length;
cost = (diff === 'junior') ? count * GAME_CONFIG.ENERGY_COST_JR_SINGLE : count * GAME_CONFIG.ENERGY_COST_SR_SINGLE;
}
if (gameState.user.energy < cost) {
alert("浩然之氣不足！請前往惡龍圖鑑溫習。");
return;
}
gameState.user.energy -= cost;
gameState.stats.totalAttempts++; 
saveGame();
gameState.difficulty = diff;
gameState.user.hp = 100;
gameState.currentIndex = 0;
gameState.wrongCount = 0;
gameState.history = [];
let rawPool = [];
if (gameState.mode === 'single') {
const k = gameState.currentChapterKey;
let arr = [];
if (diff === 'junior') {
arr = db[k].junior || [];
} else {
arr = db[k].senior || [];
}
rawPool = arr.map(q => ({...q, chapterTitle: db[k].title}));
gameState.currentDragon = "images/dragons/" + db[k].img;
} else {
gameState.mixSelectedKeys.forEach(k => {
let arr = [];
if (diff === 'junior') {
arr = db[k].junior || [];
} else {
arr = db[k].senior || [];
}
let tagged = arr.map(q => ({...q, chapterTitle: db[k].title}));
rawPool = rawPool.concat(tagged);
});
gameState.currentDragon = "images/dragons/dragon_mix.jpg";
}
if (rawPool.length === 0) {
alert("此模式/難度暫無題目！請檢查資料庫檔案。");
return;
}
gameState.pool = JSON.parse(JSON.stringify(rawPool));
for (let i = gameState.pool.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[gameState.pool[i], gameState.pool[j]] = [gameState.pool[j], gameState.pool[i]];
}
document.getElementById("bossImage").src = gameState.currentDragon;
updateUserDisplay();
updateBars();
updateCrackStage();
switchScreen("screen-game");
renderQuestion();
}
function renderQuestion() {
inputLock = false;
gameState.wrongGuesses = [];
const input = document.getElementById("answerInput");
const mcDiv = document.getElementById("inputAreaJunior");
input.value = "";
input.classList.remove("correct-flash");
mcDiv.innerHTML = "";
document.getElementById("msgBox").innerText = "";
const bossImg = document.getElementById("bossImage");
bossImg.classList.remove("dragon-attack");
bossImg.classList.remove("boss-damage");
const qBox = document.getElementById("questionBox");
qBox.classList.remove("player-attack");
qBox.classList.remove("shake-box");
if(gameState.currentIndex >= gameState.pool.length) {
endGame(true);
return;
}
document.getElementById("gameProgress").innerText = `進度：${gameState.currentIndex + 1} / ${gameState.pool.length}`;
const q = gameState.pool[gameState.currentIndex];
document.getElementById("battleChapterText").innerText = q.chapterTitle;
document.getElementById("qLine").innerText = q.line;
document.getElementById("qWord").innerText = q.word;
gameState.wrongCount = 0;
if(gameState.difficulty === 'senior') {
document.getElementById("inputAreaSenior").style.display = "block";
document.getElementById("inputAreaJunior").style.display = "none";
input.focus();
} else {
document.getElementById("inputAreaSenior").style.display = "none";
document.getElementById("inputAreaJunior").style.display = "grid";
generateMC(q);
}
}
function generateMC(q) {
const div = document.getElementById("inputAreaJunior");
div.innerHTML = "";
let opts = [];
if (q.options && q.options.length > 0) {
opts = [...q.options];
} else {
opts = [q.answer]; 
}
opts.sort(() => Math.random() - 0.5);
opts.forEach(opt => {
const btn = document.createElement("button");
btn.className = "mc-btn";
btn.innerText = opt;
btn.onclick = (e) => checkAnswer(opt, e.target);
div.appendChild(btn);
});
}
function submitSeniorAnswer() {
const input = document.getElementById("answerInput");
const val = input.value.trim();
if(!/^[\u4e00-\u9fa5]+$/.test(val)) {
const msg = document.getElementById("msgBox");
msg.innerText = "請輸入純中文字，不可包含符號或英文！";
triggerAnimation(document.querySelector(".question-box"), "shake-box");
return;
}
checkAnswer(val, input);
}
function getCenter(element) {
const rect = element.getBoundingClientRect();
return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
function checkAnswer(userVal, uiElement) {
if (inputLock) return;
if (gameState.difficulty === 'senior' && gameState.wrongGuesses.includes(userVal)) {
document.getElementById("msgBox").innerText = "此答案已嘗試過，請嘗試其他答案！";
document.getElementById("msgBox").style.color = "var(--primary-blue)";
return;
}
const currentQ = gameState.pool[gameState.currentIndex];
const bossImg = document.getElementById("bossImage");
const qBox = document.getElementById("questionBox");
const correctAnswers = currentQ.answer.split('/').map(s => s.trim());

gameState.stats.tryCount++;

if(correctAnswers.includes(userVal)) {
inputLock = true;
playSFX('correct'); 
triggerAnimation(uiElement, "correct-flash");
triggerAnimation(qBox, "player-attack");
setTimeout(() => {
triggerAnimation(bossImg, "boss-damage");
if (!gameState.solvedQuestionIds.includes(currentQ.id) || gameState.user.unlockedReplayXP) {
gameState.user.xp += GAME_CONFIG.XP_WIN;
document.getElementById("msgBox").innerText = `正確！+${GAME_CONFIG.XP_WIN} XP`;
} else {
document.getElementById("msgBox").innerText = "正確！(已獲得過經驗)";
}
if (!gameState.solvedQuestionIds.includes(currentQ.id)) {
gameState.solvedQuestionIds.push(currentQ.id);
}
if(gameState.difficulty === 'senior') {
    if (!gameState.solvedSeniorQuestionIds.includes(currentQ.id)) {
        gameState.solvedSeniorQuestionIds.push(currentQ.id);
    }
}
gameState.user.hp = Math.min(100, gameState.user.hp + GAME_CONFIG.HP_REWARD_CORRECT);
updateLevel(); 
updateCrackStage();
recordHistory(userVal, true);
document.getElementById("msgBox").style.color = "var(--primary-blue)";
setTimeout(() => {
gameState.currentIndex++;
renderQuestion();
}, 800);
}, 300);
} else {
playSFX('wrong');
gameState.stats.wrongCountTotal++;

if (gameState.difficulty === 'junior') {
uiElement.disabled = true;
} else {
gameState.wrongGuesses.push(userVal);
}
const bossRect = bossImg.getBoundingClientRect();
const startX = bossRect.left + bossRect.width / 2;
const startY = bossRect.bottom - 20; 
const end = getCenter(qBox);
fireBeam(startX, startY, end.x, end.y, '#e74c3c');
setTimeout(() => {
for(let i=0; i<10; i++) createParticle(end.x, end.y, '#e74c3c', 'spark');
gameState.wrongCount++;
gameState.stats.totalWrong++;
gameState.user.hp -= GAME_CONFIG.HP_PENALTY;
updateBars();
updateCrackStage();
const overlay = document.getElementById("damageOverlay");
overlay.style.opacity = 1;
setTimeout(() => overlay.style.opacity = 0, 200);
triggerAnimation(bossImg, "dragon-attack");
triggerAnimation(qBox, "shake-box");
if(gameState.user.hp <= 0) {
inputLock = true;
qBox.classList.add("anim-explode");
recordHistory(userVal, false);
setTimeout(() => endGame(false), 600);
return;
}
if(gameState.wrongCount >= 3) {
inputLock = true;
recordHistory(userVal, false);
document.getElementById("msgBox").innerText = "錯誤次數過多！跳過此題";
document.getElementById("msgBox").style.color = "var(--primary-red)";
setTimeout(() => {
gameState.currentIndex++;
renderQuestion();
}, 1000);
} else {
document.getElementById("msgBox").innerText = `錯誤！-${GAME_CONFIG.HP_PENALTY} HP (剩餘機會：${3 - gameState.wrongCount})`;
document.getElementById("msgBox").style.color = "var(--primary-red)";
}
}, 300);
}
}
function triggerAnimation(element, className) {
element.classList.remove(className);
void element.offsetWidth;
element.classList.add(className);
}
function recordHistory(val, isCorrect) {
gameState.history.push({
q: gameState.pool[gameState.currentIndex],
userAns: val,
isCorrect: isCorrect
});
}
function endGame(win) {
let resultType = 'defeat';
if (win) {
const hasSkip = gameState.history.some(h => !h.isCorrect);
if (!hasSkip) resultType = 'perfect';
else resultType = 'success';
}

if (resultType === 'perfect') {
playMusic('victory');
document.getElementById("resultImg").src = "images/results/img_perfect.PNG";
document.getElementById("endTitle").innerText = "完美通關！";
document.getElementById("endTitle").style.color = "#f1c40f";
gameState.user.energy = Math.min(100, gameState.user.energy + GAME_CONFIG.ENERGY_REWARD_PERFECT);

const currentChapKey = gameState.mode === 'single' ? gameState.currentChapterKey : 'mix';
if (currentChapKey !== 'mix') { 
    if (gameState.stats.lastPerfectChapter !== currentChapKey) {
        gameState.consecutivePerfectCount++;
        gameState.stats.lastPerfectChapter = currentChapKey;
    } else {
        gameState.consecutivePerfectCount = 0; 
        gameState.stats.lastPerfectChapter = ""; 
    }
}
if (!gameState.stats.perfectChapterIds.includes(currentChapKey) && currentChapKey !== 'mix') {
    gameState.stats.perfectChapterIds.push(currentChapKey);
}

} else if (resultType === 'success') {
playMusic('success');
document.getElementById("resultImg").src = "images/results/img_success.PNG";
document.getElementById("endTitle").innerText = "順利通關！";
document.getElementById("endTitle").style.color = "#2ecc71";
gameState.user.energy = Math.min(100, gameState.user.energy + GAME_CONFIG.ENERGY_REWARD_SUCCESS);
gameState.consecutivePerfectCount = 0;
gameState.stats.lastPerfectChapter = "";
} else {
playMusic('defeat');
document.getElementById("resultImg").src = "images/results/img_defeat.PNG";
document.getElementById("endTitle").innerText = "力竭戰敗...";
document.getElementById("endTitle").style.color = "#e74c3c";
gameState.consecutivePerfectCount = 0;
gameState.stats.lastPerfectChapter = "";
}

if(win && gameState.user.hp === 100 && !gameState.unlockedAchievements.includes("ach_7")) {
    if(gameState.stats.perfectChapterIds.length >= 3) gameState.unlockedAchievements.push("ach_7");
}
if(win && gameState.user.hp < 10 && !gameState.unlockedAchievements.includes("ach_8")) gameState.unlockedAchievements.push("ach_8");
if(win && gameState.user.hp < 5 && !gameState.unlockedAchievements.includes("ach_9")) gameState.unlockedAchievements.push("ach_9");

if (gameState.mode === 'mix' && win) {
    gameState.stats.mixWinCount++;
    const count = gameState.mixSelectedKeys.length;
    if(count >= 5) gameState.stats.mixWinCount5++;
    if(count >= 10) gameState.stats.mixWinCount10++;
    if(count >= 16) gameState.stats.mixWinCount16++;
}

if(document.getElementById("mixRandomCount").value && gameState.mode === 'mix' && win) {
   gameState.stats.randomWinCount++;
}

if (gameState.mode === 'mix' && gameState.mixSelectedKeys.length === 16 && (resultType === 'perfect' || resultType === 'success')) {
if (!gameState.user.unlockedReplayXP) {
gameState.user.unlockedReplayXP = true;
alert("恭喜！您已通過16篇混合試煉，解鎖「無限經驗」模式！重複答題現在也可獲得經驗值。");
}
}
checkAchievements();
saveGame();
switchScreen("screen-result");
if(resultType === 'perfect') {
if (gameState.mode === 'single') {
const key = gameState.currentChapterKey + '_' + gameState.difficulty;
if (!gameState.masteredChapters.includes(key)) {
gameState.masteredChapters.push(key);
saveGame();
}
} else if (gameState.mode === 'mix') {
if (gameState.mixSelectedKeys.length === Object.keys(db).length) {
if (!gameState.masteredChapters.includes('mix')) {
gameState.masteredChapters.push('mix');
saveGame();
alert("恭喜！混合試煉完美通關，成功解鎖混合試煉惡龍！");
}
}
}
}
document.getElementById("endLevel").innerText = gameState.user.level;
document.getElementById("endXP").innerText = gameState.user.xp;
const tbody = document.getElementById("resultBody");
tbody.innerHTML = "";
gameState.pool.forEach(q => {
let record = null;
for(let i=gameState.history.length-1; i>=0; i--) {
if(gameState.history[i].q.id === q.id) {
record = gameState.history[i];
break;
}
}
const tr = document.createElement("tr");
let userAnsCell = `<td style="color:gray;">未作答</td>`;
if (record) {
const cls = record.isCorrect ? 'res-correct' : 'res-wrong';
userAnsCell = `<td class="${cls}">${record.userAns}</td>`;
}
tr.innerHTML = `
<td>${q.line} <br><small>(${q.word})</small></td>
${userAnsCell}
<td class="res-correct">${q.answer}</td>
`;
tbody.appendChild(tr);
});
}
document.getElementById("answerInput").addEventListener("keypress", function(e) {
if(e.key === "Enter") submitSeniorAnswer();
});

// DEV MODE LOGIC
let footerClickCount = 0;
let devModeActive = false;
let backupGameState = null;

function handleFooterClick() {
    footerClickCount++;
    if (!devModeActive) {
        if (footerClickCount >= 10) {
            footerClickCount = 0;
            const pwd = prompt("請輸入開發者密碼：");
            if (pwd === "DBS_Chinese") {
                activateGodMode();
            } else {
                alert("密碼錯誤！");
            }
        }
    } else {
        if (footerClickCount >= 3) {
            footerClickCount = 0;
            revertGodMode();
        }
    }
}

function activateGodMode() {
    backupGameState = JSON.parse(JSON.stringify(gameState)); 
    devModeActive = true;

    // Max User
    gameState.user.level = 99;
    gameState.user.xp = 9999;
    gameState.user.energy = 100;
    gameState.user.title = TITLES[TITLES.length - 1]; 

    // Max Chapters & Questions
    gameState.masteredChapters = [];
    gameState.solvedQuestionIds = [];
    gameState.solvedSeniorQuestionIds = [];

    Object.keys(db).forEach(k => {
        gameState.masteredChapters.push(k + '_junior');
        gameState.masteredChapters.push(k + '_senior');
        gameState.masteredChapters.push('mix');

        if(db[k].junior) db[k].junior.forEach(q => gameState.solvedQuestionIds.push(q.id));
        if(db[k].senior) {
            db[k].senior.forEach(q => {
                gameState.solvedQuestionIds.push(q.id);
                gameState.solvedSeniorQuestionIds.push(q.id);
            });
        }
    });

    // Max Achievements
    gameState.unlockedAchievements = ACHIEVEMENTS.map(a => a.id);

    // Fake Stats for visual completeness
    gameState.stats.totalPlayTime = 99999;
    gameState.stats.mixWinCount = 999;
    
    updateLevel(); 
    alert("⚡ 上帝模式已啟動 ⚡\n所有能力已全滿！(點擊底部 3 次可還原)");
}

function revertGodMode() {
    if(backupGameState) {
        gameState = JSON.parse(JSON.stringify(backupGameState));
        devModeActive = false;
        backupGameState = null;
        saveGame();
        updateUserDisplay();
        updateBars();
        alert("已回復至凡人模式。");
    }
}

setTimeout(() => {
    const footer = document.querySelector('.footer-bar');
    if(footer) {
        footer.addEventListener('click', handleFooterClick);
    }
}, 1000);
