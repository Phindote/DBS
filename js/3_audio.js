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
function stopAllMusic() {
    [audioFiles.theme, audioFiles.battleJr, audioFiles.battleSr, audioFiles.victory, audioFiles.success, audioFiles.defeat].forEach(a => {
        a.pause();
        a.currentTime = 0;
    });
}
function playMusic(type) {
    let target = null;
    if (type === 'theme') target = audioFiles.theme;
    else if (type === 'battleJr') target = audioFiles.battleJr;
    else if (type === 'battleSr') target = audioFiles.battleSr;
    else if (type === 'victory') target = audioFiles.victory;
    else if (type === 'success') target = audioFiles.success;
    else if (type === 'defeat') target = audioFiles.defeat;
    
    if (currentBGM === target && !target.paused) return;
    
    stopAllMusic();
    
    currentBGM = target;
    if (isMusicOn && currentBGM) {
        const playPromise = currentBGM.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio playback failed: " + error);
            });
        }
    }
}
function stopLongSFX() {
    stopAllMusic();
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
