let db = window.questionsDB || {};
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

function saveGame() {
    if (window.godModeActive) return;
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
    
    if(typeof updateUserDisplay === 'function') updateUserDisplay();
}

function checkAchievements() {
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

    check(bothCount >= 1, "ach_17");
    check(bothCount >= 8, "ach_18");
    check(bothCount >= totalChapters, "ach_19");

    check(s.mixWinCount >= 1, "ach_20");
    check(s.mixWinCount5 >= 1, "ach_21");
    check(s.mixWinCount10 >= 1, "ach_22");
    check(s.mixWinCount16 >= 1, "ach_23");
    check(s.randomWinCount >= 1, "ach_24");
    check(s.randomWinCount >= 10, "ach_25");

    check(s.totalCorrect >= 100, "ach_26");
    check(s.totalCorrect >= 500, "ach_27");
    check(s.totalCorrect >= 1000, "ach_28");
    check(s.srCorrect >= 100, "ach_29");
    check(s.srCorrect >= 300, "ach_30");
    check(s.srCorrect >= 500, "ach_31");
    check(s.tryCount >= 3000, "ach_32");
    check(s.wrongCountTotal >= 111, "ach_33");

    check(s.energyRecovered >= 10, "ach_35");
    check(s.energyRecovered >= 60, "ach_36");
    check(s.energyRecovered >= 180, "ach_37");
    check(s.energyRecovered >= 300, "ach_38");
    check(s.energyRecovered >= 600, "ach_39");

    // Check ach_40 (All others)
    if(unlocked.length + newUnlock.length >= 39 && !unlocked.includes("ach_40") && !newUnlock.includes("ach_40")) {
        newUnlock.push("ach_40");
    }

    if(newUnlock.length > 0) {
        newUnlock.forEach(id => gameState.unlockedAchievements.push(id));
        saveGame();
        if(typeof showUnlockNotification === 'function') {
            showUnlockNotification(newUnlock);
        }
    }
}
