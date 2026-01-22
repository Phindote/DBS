let gameState = {
    user: { name: "", class: "", hp: 100, xp: 0, level: 1, title: "初心新手", energy: 100, unlockedReplayXP: false, coins: 50, lastLoginDate: "" },
    stats: {
        totalCorrect: 0, srCorrect: 0, consecutivePerfect: 0,
        mixWinCount: 0, mixWinCount5: 0, mixWinCount10: 0, mixWinCount16: 0, mixPerfect16: 0, randomWinCount: 0,
        totalStudyMins: 0, energyRecovered: 0, totalPlayTime: 0, tryCount: 0, wrongCountTotal: 0,
        perfectHistory: [], perfectChapterIds: [], lastPerfectChapter: ""
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
    unlockedAchievements: []
};
let pendingSingleChapterKey = ""; 
let inputLock = false; // 戰鬥鎖，防止連點
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
        unlockedAchievements: gameState.unlockedAchievements
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
    
    gameState.stats = parsed.stats || {};
    // 確保所有統計變數存在
    ['totalCorrect', 'srCorrect', 'consecutivePerfect', 'mixWinCount', 'mixWinCount5', 
     'mixWinCount10', 'mixWinCount16', 'mixPerfect16', 'randomWinCount', 'totalStudyMins', 
     'energyRecovered', 'totalPlayTime', 'tryCount', 'wrongCountTotal'].forEach(key => {
        if (typeof gameState.stats[key] === 'undefined') gameState.stats[key] = 0;
    });

    if(!Array.isArray(gameState.stats.perfectChapterIds)) gameState.stats.perfectChapterIds = [];

    gameState.inventory = Array.isArray(parsed.inventory) ? parsed.inventory : []; 
    gameState.pets = Array.isArray(parsed.pets) ? parsed.pets : [];
    gameState.dailyTasks = Array.isArray(parsed.dailyTasks) ? parsed.dailyTasks : [];
    gameState.masteredChapters = parsed.masteredChapters || [];
    gameState.solvedQuestionIds = parsed.solvedQuestionIds || [];
    gameState.unlockedAchievements = parsed.unlockedAchievements || [];
    
    // 如果有 UI 更新函數，就執行
    if(typeof updateUserDisplay === 'function') updateUserDisplay();
}

function checkAchievements() {
    // 確保只在 UI 載入後執行
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

    check(u.level >= 5, "ach_1");
    check(u.xp >= 5000, "ach_2");
    check(s.totalPlayTime >= 15, "ach_3");
    check(s.totalPlayTime >= 60, "ach_4");
    check(s.totalPlayTime >= 999, "ach_5");
    check(gameState.masteredChapters.length > 0, "ach_6"); 
    
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
    check(s.mixWinCount >= 1, "ach_20");
    check(s.totalCorrect >= 100, "ach_26");
    check(s.energyRecovered >= 10, "ach_35");

    if(newUnlock.length > 0) {
        newUnlock.forEach(id => gameState.unlockedAchievements.push(id));
        saveGame();
        if(typeof showUnlockNotification === 'function') {
            showUnlockNotification(newUnlock);
        }
    }
}
