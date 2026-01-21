const audioFiles = {
    theme: new Audio('audio/bgm/bgm_theme.mp3'),
    
    bgm_daily: new Audio('audio/bgm/bgm_shop.mp3'),
    bgm_store: new Audio('audio/bgm/bgm_store.mp3'),
    bgm_inventory: new Audio('audio/bgm/bgm_inventory.mp3'),
    bgm_smelt: new Audio('audio/bgm/bgm_smelt.mp3'),
    bgm_pet: new Audio('audio/bgm/bgm_pet.mp3'),
    
    bgm_pokedex: new Audio('audio/bgm/bgm_pokedex.mp3'),
    bgm_achievements: new Audio('audio/bgm/bgm_achievements.mp3'),
    
    bgm_battle_jr: new Audio('audio/bgm/bgm_battle_jr.mp3'),
    bgm_battle_sr: new Audio('audio/bgm/bgm_battle_sr.mp3'),
    bgm_victory: new Audio('audio/bgm/bgm_victory.mp3'), 
    bgm_success: new Audio('audio/bgm/bgm_success.mp3'), 
    bgm_defeat: new Audio('audio/bgm/bgm_defeat.mp3'),   
    
    click: new Audio('audio/sfx/sfx_click.mp3'),
    correct: new Audio('audio/sfx/sfx_correct.mp3'),
    wrong: new Audio('audio/sfx/sfx_wrong.mp3')
};

audioFiles.theme.loop = true;
audioFiles.bgm_daily.loop = true;
audioFiles.bgm_store.loop = true;
audioFiles.bgm_inventory.loop = true;
audioFiles.bgm_smelt.loop = true;
audioFiles.bgm_pet.loop = true;
audioFiles.bgm_pokedex.loop = true;
audioFiles.bgm_achievements.loop = true;
audioFiles.bgm_battle_jr.loop = true;
audioFiles.bgm_battle_sr.loop = true;

audioFiles.bgm_victory.loop = false;
audioFiles.bgm_success.loop = false;
audioFiles.bgm_defeat.loop = false;

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
    Object.values(audioFiles).forEach(a => {
        a.pause();
        a.currentTime = 0;
    });
}

function playMusic(type) {
    let target = null;
    
    if (type === 'theme') target = audioFiles.theme;
    else if (type === 'bgm_daily') target = audioFiles.bgm_daily;
    else if (type === 'bgm_store') target = audioFiles.bgm_store;
    else if (type === 'bgm_inventory') target = audioFiles.bgm_inventory;
    else if (type === 'bgm_smelt') target = audioFiles.bgm_smelt;
    else if (type === 'bgm_pet') target = audioFiles.bgm_pet;
    else if (type === 'bgm_pokedex') target = audioFiles.bgm_pokedex;
    else if (type === 'bgm_achievements') target = audioFiles.bgm_achievements;
    else if (type === 'bgm_battle_jr') target = audioFiles.bgm_battle_jr;
    else if (type === 'bgm_battle_sr') target = audioFiles.bgm_battle_sr;
    else if (type === 'bgm_victory') target = audioFiles.bgm_victory;
    else if (type === 'bgm_success') target = audioFiles.bgm_success;
    else if (type === 'bgm_defeat') target = audioFiles.bgm_defeat;
    
    if (currentBGM === target && !target.paused) {
        return; 
    }
    
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