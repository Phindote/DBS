let gameState = {
    user: { name: "", class: "", hp: 100, xp: 0, level: 1, title: "初心新手", energy: 100, unlockedReplayXP: false, coins: 50, lastLoginDate: "", inventorySlots: 5 },
    stats: {
        totalCorrect: 0, srCorrect: 0, consecutivePerfect: 0,
        mixWinCount: 0, mixWinCount5: 0, mixWinCount10: 0, mixWinCount16: 0, mixPerfect16: 0, randomWinCount: 0,
        totalStudyMins: 0, energyRecovered: 0, totalPlayTime: 0, tryCount: 0, wrongCountTotal: 0,
        perfectHistory: [], perfectChapterIds: [], perfectFullHpChapterIds: [], lastPerfectChapter: ""
    },
    inventory: [],
    pets: [],
    dailyTasks: [],
    mode: "",
    difficulty: "",
    pool: [],
    currentIndex: 0,
    currentAttempts: 0,
    wrongAnswersHistory: [],
    wrongCount: 0,
    history: [],
    currentDragon: "",
    currentChapterKey: "",
    masteredChapters: [],
    solvedQuestionIds: [],
    mixSelectedKeys: [],
    wrongGuesses: [],
    unlockedAchievements: [],
    chapterLastPlayed: {}, 
    chapterFirstPerfect: {},
    collectionDates: {},
    isRandomSelection: false // 追蹤隨機模式旗標
};
let pendingSingleChapterKey = "";
let inputLock = false;
let pokedexTimer = null;
let pokedexSeconds = 0;

function saveGame() {
    if (window.godModeActive) return;
    const data = {
        user: gameState.user,
        stats: gameState.stats,
        inventory: gameState.inventory,
        pets: gameState.pets,
        dailyTasks: gameState.dailyTasks,
        masteredChapters: gameState.masteredChapters,
        solvedQuestionIds: gameState.solvedQuestionIds,
        unlockedAchievements: gameState.unlockedAchievements,
        chapterLastPlayed: gameState.chapterLastPlayed,
        chapterFirstPerfect: gameState.chapterFirstPerfect,
        collectionDates: gameState.collectionDates
    };
    localStorage.setItem("dbs_dragon_save_v3", btoa(encodeURIComponent(JSON.stringify(data))));
}

function loadGame() {
    const data = localStorage.getItem("dbs_dragon_save_v3");
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
    if (typeof gameState.user.coins === 'undefined') gameState.user.coins = 50;
    if (typeof gameState.user.inventorySlots === 'undefined') gameState.user.inventorySlots = 5;
    
    gameState.stats = parsed.stats || {};
    // 初始化所有統計欄位，確保不為 undefined
    ['totalCorrect', 'srCorrect', 'consecutivePerfect', 'mixWinCount', 'mixWinCount5',
     'mixWinCount10', 'mixWinCount16', 'mixPerfect16', 'randomWinCount', 'totalStudyMins',
     'energyRecovered', 'totalPlayTime', 'tryCount', 'wrongCountTotal'].forEach(key => {
        if (typeof gameState.stats[key] === 'undefined') gameState.stats[key] = 0;
    });

    if(!Array.isArray(gameState.stats.perfectChapterIds)) gameState.stats.perfectChapterIds = [];
    if(!Array.isArray(gameState.stats.perfectFullHpChapterIds)) gameState.stats.perfectFullHpChapterIds = [];

    gameState.inventory = Array.isArray(parsed.inventory) ? parsed.inventory : [];
    gameState.pets = Array.isArray(parsed.pets) ? parsed.pets : [];
    gameState.dailyTasks = Array.isArray(parsed.dailyTasks) ? parsed.dailyTasks : [];
    gameState.masteredChapters = parsed.masteredChapters || [];
    gameState.solvedQuestionIds = parsed.solvedQuestionIds || [];
    gameState.unlockedAchievements = parsed.unlockedAchievements || [];
    gameState.chapterLastPlayed = parsed.chapterLastPlayed || {};
    gameState.chapterFirstPerfect = parsed.chapterFirstPerfect || {};
    gameState.collectionDates = parsed.collectionDates || {};
    gameState.isRandomSelection = false;
    
    if(typeof updateUserDisplay === 'function') updateUserDisplay();
}

function checkAchievements() {
    if (typeof window.questionsDB === 'undefined') return;
    
    const db = window.questionsDB || {};
    const u = gameState.user;
    const s = gameState.stats;
    const unlocked = gameState.unlockedAchievements;
    const newUnlock = [];

    const check = (condition, id) => {
        if(condition && !unlocked.includes(id) && !newUnlock.includes(id)) {
            newUnlock.push(id);
        }
    };

    // 1. 成長與累積類
    check(u.level >= 5, "ach_1");
    check(u.xp >= 5000, "ach_2");
    check(s.totalPlayTime >= 15, "ach_3");
    check(s.totalPlayTime >= 60, "ach_4");
    check(s.totalPlayTime >= 999, "ach_5");
    check(gameState.masteredChapters.length > 0, "ach_6");
    
    // 2. 篇章制霸類 (統計 masteredChapters)
    let jrCount = 0, srCount = 0, bothCount = 0;
    Object.keys(db).forEach(k => {
        const jr = gameState.masteredChapters.includes(k+'_junior');
        const sr = gameState.masteredChapters.includes(k+'_senior');
        if(jr) jrCount++;
        if(sr) srCount++;
        if(jr && sr) bothCount++;
    });
    const totalChapters = Object.keys(db).length;

    check(bothCount >= 1, "ach_13");
    check(jrCount >= totalChapters, "ach_14");
    check(srCount >= totalChapters, "ach_15");
    check(bothCount >= totalChapters, "ach_16");

    // 3. 圖鑑收集類 (ach_17 ~ ach_19)
    // 解鎖圖鑑定義為：該篇章初階與高階皆通過 (bothCount)
    check(bothCount >= 1, "ach_17");
    check(bothCount >= 8, "ach_18");
    check(bothCount >= totalChapters, "ach_19");

    // 4. 混合模式基本 (ach_20)
    check(s.mixWinCount >= 1, "ach_20");

    // 5. 答題數據類 (ach_26 ~ ach_33)
    check(s.totalCorrect >= 100, "ach_26");
    check(s.totalCorrect >= 500, "ach_27");
    check(s.totalCorrect >= 1000, "ach_28");
    check(s.srCorrect >= 100, "ach_29");
    check(s.srCorrect >= 300, "ach_30");
    check(s.srCorrect >= 500, "ach_31");
    check(s.tryCount >= 3000, "ach_32");
    check(s.wrongCountTotal >= 111, "ach_33");

    // 6. 溫習系統能量類 (ach_35 ~ ach_39)
    check(s.energyRecovered >= 10, "ach_35");
    check(s.energyRecovered >= 60, "ach_36");
    check(s.energyRecovered >= 180, "ach_37");
    check(s.energyRecovered >= 300, "ach_38");
    check(s.energyRecovered >= 600, "ach_39");

    // 7. 終極成就 (ach_40) - 需解鎖前 39 個
    // 計算已解鎖數量 (不含 ach_40 本身)
    let unlockedCount = unlocked.length + newUnlock.length;
    if (unlocked.includes("ach_40")) unlockedCount--; 
    if (newUnlock.includes("ach_40")) unlockedCount--; // 避免重複計算

    // 如果總共有 39 個其他成就已解鎖
    if (unlockedCount >= 39) {
        check(true, "ach_40");
    }

    if(newUnlock.length > 0) {
        const now = new Date().getTime();
        newUnlock.forEach(id => {
            gameState.unlockedAchievements.push(id);
            if(!gameState.collectionDates[id]) {
                gameState.collectionDates[id] = now;
            }
        });
        saveGame();
        if(typeof showUnlockNotification === 'function') {
            showUnlockNotification(newUnlock);
        }
    }
}
