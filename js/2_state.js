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
