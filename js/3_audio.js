const audioFiles = {
    theme: new Audio('audio/bgm/bgm_theme.mp3'),
    // Renamed to BGM as requested, controlled by Music Toggle
    bgm_battle_jr: new Audio('audio/bgm/bgm_battle_jr.mp3'),
    bgm_battle_sr: new Audio('audio/bgm/bgm_battle_sr.mp3'),
    bgm_victory: new Audio('audio/sfx/sfx_victory.mp3'), // Logic treats as BGM now
    bgm_success: new Audio('audio/sfx/sfx_success.mp3'), // Logic treats as BGM now
    bgm_defeat: new Audio('audio/sfx/sfx_defeat.mp3'),   // Logic treats as BGM now
    
    // Pure SFX
    click: new Audio('audio/sfx/sfx_click.mp3'),
    correct: new Audio('audio/sfx/sfx_correct.mp3'),
    wrong: new Audio('audio/sfx/sfx_wrong.mp3')
};

// Loop settings
audioFiles.theme.loop = true;
audioFiles.bgm_battle_jr.loop = true;
audioFiles.bgm_battle_sr.loop = true;
// Result music usually doesn't loop, but can if desired. Defaulting to once.
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
        // If there was a track supposed to be playing, resume it
        if (currentBGM) {
            currentBGM.play().catch(e=>{});
        }
    } else {
        btn.classList.add('off');
        // Pause whatever BGM is playing (Theme, Battle, or Result)
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

function stopAllBGM() {
    // Stop all tracks classified as BGM
    [
        audioFiles.theme, 
        audioFiles.bgm_battle_jr, 
        audioFiles.bgm_battle_sr, 
        audioFiles.bgm_victory, 
        audioFiles.bgm_success, 
        audioFiles.bgm_defeat
    ].forEach(a => {
        a.pause();
        a.currentTime = 0;
    });
}

function playMusic(type) {
    let target = null;
    
    // Map string types to audio objects
    if (type === 'theme') target = audioFiles.theme;
    else if (type === 'bgm_battle_jr') target = audioFiles.bgm_battle_jr;
    else if (type === 'bgm_battle_sr') target = audioFiles.bgm_battle_sr;
    else if (type === 'bgm_victory') target = audioFiles.bgm_victory;
    else if (type === 'bgm_success') target = audioFiles.bgm_success;
    else if (type === 'bgm_defeat') target = audioFiles.bgm_defeat;
    
    // CRITICAL LOGIC: Seamless Play
    // If the target music is ALREADY the current BGM and is playing, DO NOT RESTART.
    if (currentBGM === target && !target.paused) {
        return; 
    }
    
    // Stop any previous BGM
    stopAllBGM();
    
    // Set new BGM
    currentBGM = target;
    
    // Play if switch is ON
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
    // No longer needed for result music as they are now BGM, 
    // but kept for compatibility if other long SFX exist.
    // Currently empty as playMusic handles the switch.
}

function playSFX(name) {
    if (!isSFXEnabled) return;
    
    // Stop overlapping SFX for clarity
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
