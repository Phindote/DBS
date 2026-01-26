document.addEventListener("DOMContentLoaded", () => {
    loadGame();
    preloadAssets(() => {
        const backdrop = document.createElement("div");
        backdrop.id = "floatingBackdrop";
        backdrop.className = "floating-backdrop";
        backdrop.onclick = () => {
            const sub = document.getElementById("floatingSubMenu");
            const bd = document.getElementById("floatingBackdrop");
            const radial = document.getElementById("radialMenuContainer");

            if(sub) {
                sub.classList.remove("visible");
                sub.classList.add("hidden");
                setTimeout(() => { if(!sub.classList.contains("visible")) sub.style.display = "none"; }, 300);
            }
            if(radial) {
                radial.classList.remove("open");
            }
            if(bd) bd.classList.remove("active");
        };
        document.body.appendChild(backdrop);
        
        const spamModal = document.createElement("div");
        spamModal.id = "spamModal";
        spamModal.className = "modal-backdrop";
        spamModal.style.display = "none";
        spamModal.style.zIndex = "99999";
        spamModal.innerHTML = `
            <div class="modal-content" style="max-width:300px; text-align:center;">
                <div class="modal-header" style="background:#e74c3c; color:white; justify-content:center;">⚠️ 系統警告</div>
                <div class="modal-body" style="padding:20px; font-weight:bold; font-size:1.1rem; color:#2c3e50;">
                    手速太快了！放慢一點！
                </div>
                <div style="display:flex; justify-content:center; align-items:center; padding-bottom:25px; width:100%;">
                    <button class="btn-main" style="background:#e74c3c; color:white; margin:0; padding:10px 30px; border-radius:30px; box-shadow:none;" onclick="document.getElementById('spamModal').style.display='none'">我知道了</button>
                </div>
            </div>
        `;
        document.body.appendChild(spamModal);

        initDraggableMenu();
        if (gameState.user.name === "DBS_Chinese" && !window.godModeActive) {
            initGodMode();
        }
        
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            particleCtx = canvas.getContext('2d');
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            loopParticles();
        }
        
        const bgmBtn = document.getElementById("btnBGM");
        if(bgmBtn && !isMusicOn) bgmBtn.classList.add("off");
        const sfxBtn = document.getElementById("btnSFX");
        if(sfxBtn && !isSFXEnabled) sfxBtn.classList.add("off");
        
        const inputName = document.getElementById("inputName");
        if(inputName) {
            inputName.addEventListener("keyup", function(event) {
                if (event.key === "Enter") {
                    handleLogin();
                }
            });
        }
    });
    
    setInterval(async () => {
        if(typeof triggerDrop === 'function') {
            triggerDrop('ON_PLAY_TIME_10MIN');
            
            const h = new Date().getHours();
            if(h === 12) triggerDrop('SPECIFIC_TIME_BONUS');
            
            const modal = document.getElementById('contentModal');
            if(modal && modal.style.display === 'flex') {
                triggerDrop('ON_STUDY_MINUTE');
            }
        }
        
        if (!window.godModeActive) {
            gameState.dailyPlayTime = (gameState.dailyPlayTime || 0) + 1;
            if (gameState.dailyPlayTime >= 180) {
                saveGame();
                await window.alert("【系統公告】\n\n勇者啊，你今日的修煉時間已達上限（180分鐘）。\n休息是為了走更長遠的路，明日再來吧！");
                location.reload();
            } else {
                saveGame();
            }
        }
    }, 60000);
});

let clickSpamCount = 0;
let clickSpamTimer = null;

document.addEventListener('click', (e) => {
    const spamModal = document.getElementById("spamModal");
    if(spamModal && spamModal.style.display === "flex") return;
    
    if (gameState && gameState.stats) {
        gameState.stats.totalClicks = (gameState.stats.totalClicks || 0) + 1;
        if (gameState.stats.totalClicks === 10001 && !gameState.pets.includes('pet_002')) {
            gameState.pets.push('pet_002');
            gameState.collectionDates['pet_002'] = new Date().getTime();
            saveGame();
            
            const modal = document.getElementById('system-modal');
            if (modal) {
                const titleEl = document.getElementById('sys-modal-title');
                const headerEl = document.getElementById('sys-modal-header');
                const msgEl = document.getElementById('sys-modal-msg');
                const btnOk = document.getElementById('sys-btn-ok');
                const btnCancel = document.getElementById('sys-btn-cancel');
                const inputEl = document.getElementById('sys-modal-input');

                if (titleEl) titleEl.innerText = "特殊獎勵";
                if (headerEl) {
                    headerEl.style.background = "#8e44ad";
                    headerEl.style.color = "white";
                }
                if (msgEl) {
                    msgEl.innerHTML = `
                        <div style="font-weight:bold; color:#2c3e50; margin-bottom:10px;">青鳥</div>
                        <img src="images/items/pet_002.PNG" style="width:100px; height:100px; object-fit:contain; margin:10px 0;" onerror="this.src='images/ui/icon_core.PNG'">
                        <div style="font-size:0.9rem; color:#8e44ad; margin-top:5px;">這是你點擊 10,001 次的獎勵！</div>
                    `;
                }
                
                if (inputEl) inputEl.style.display = 'none';
                if (btnCancel) btnCancel.style.display = 'none';
                if (btnOk) {
                    btnOk.style.display = 'block';
                    btnOk.style.background = "#8e44ad";
                    btnOk.style.color = "white";
                    btnOk.innerText = '收下';
                    btnOk.onclick = () => {
                        modal.style.display = 'none';
                    };
                }
                modal.style.display = 'flex';
                playSFX('success');
            }
        }
    }

    clickSpamCount++;
    clearTimeout(clickSpamTimer);
    
    if (clickSpamCount >= 3) {
        if(spamModal) spamModal.style.display = "flex";
        clickSpamCount = 0;
    } else {
        clickSpamTimer = setTimeout(() => {
            clickSpamCount = 0;
        }, 300);
    }

    if(typeof triggerDrop === 'function') {
        triggerDrop('ON_CLICK_ANY');
    }

    const target = e.target.closest('button, .menu-btn, .shop-card, .pokedex-card, .title-node, .smelt-slot, .radial-sub-btn, #floatingMainBtn, .btn-main, .btn-secondary, .btn-edit, .btn-claim, .btn-inv-delete, .tab-btn, .difficulty-btn, .gacha-egg');
    
    if (target) {
        if (!target.classList.contains('mc-btn') && !target.classList.contains('btn-attack')) {
            playSFX('click');
        }
    }

    const floatContainer = document.getElementById("floatingMenuContainer");
    const subMenu = document.getElementById("floatingSubMenu");
    const mainBtn = document.getElementById("floatingMainBtn");
    const backdrop = document.getElementById("floatingBackdrop");
    
    if (subMenu && subMenu.classList.contains("visible")) {
        if (!floatContainer.contains(e.target) && !mainBtn.contains(e.target)) {
            subMenu.classList.remove("visible");
            subMenu.classList.add("hidden");
            if(backdrop) backdrop.classList.remove("active");
            setTimeout(() => {
                if(subMenu.classList.contains("hidden")) subMenu.style.display = "none";
            }, 300);
        }
    }
});

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
                
                document.getElementById('screen-login').classList.add('active');
                if (gameState.user.name) {
                    document.getElementById("inputName").value = gameState.user.name;
                    
                    const cls = gameState.user.class;
                    if (cls.length >= 2) {
                        let grade, letter;
                        if (!isNaN(cls.substring(0, 2))) {
                            grade = cls.substring(0, 2);
                            letter = cls.substring(2);
                        } else {
                            grade = cls.substring(0, 1);
                            letter = cls.substring(1);
                        }
                        const gSelect = document.getElementById("inputGrade");
                        const lSelect = document.getElementById("inputClassLetter");
                        if(gSelect) gSelect.value = grade;
                        updateClassOptions();
                        if(lSelect) lSelect.value = letter;
                    }
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
    const dragItem = document.getElementById("floatingMainBtn");
    const container = document.getElementById("floatingMenuContainer");
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    container.addEventListener("touchstart", dragStart, {passive: false});
    container.addEventListener("touchend", dragEnd, {passive: false});
    container.addEventListener("touchmove", drag, {passive: false});
    container.addEventListener("mousedown", dragStart, {passive: false});
    container.addEventListener("mouseup", dragEnd, {passive: false});
    container.addEventListener("mousemove", drag, {passive: false});

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        if (e.target === dragItem || dragItem.contains(e.target)) {
            active = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        active = false;
        
        let targetX = 0;
        let targetY = 0;
        
        xOffset = targetX;
        yOffset = targetY;
        setTranslate(targetX, targetY, container);
    }

    function drag(e) {
        if (active) {
            e.preventDefault();
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, container);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
    
    let subMenuVisible = false;
    dragItem.addEventListener('click', (e) => {
        if(Math.abs(xOffset) < 5 && Math.abs(yOffset) < 5) {
            subMenuVisible = !document.getElementById("floatingSubMenu").classList.contains("visible");
            const sub = document.getElementById("floatingSubMenu");
            const backdrop = document.getElementById("floatingBackdrop");
            
            if(subMenuVisible) {
                sub.style.display = "flex";
                sub.classList.remove("hidden");
                sub.classList.add("visible");
                if(backdrop) backdrop.classList.add("active");
            } else {
                sub.classList.remove("visible");
                sub.classList.add("hidden");
                if(backdrop) backdrop.classList.remove("active");
                setTimeout(() => {
                    if(!sub.classList.contains("visible")) sub.style.display = "none";
                }, 300);
            }
        }
    });
}

function showSystemModal(type, msg, placeholder = "") {
    return new Promise((resolve) => {
        const modal = document.getElementById('system-modal');
        const titleEl = document.getElementById('sys-modal-title');
        const headerEl = document.getElementById('sys-modal-header');
        const msgEl = document.getElementById('sys-modal-msg');
        const inputEl = document.getElementById('sys-modal-input');
        const btnOk = document.getElementById('sys-btn-ok');
        const btnCancel = document.getElementById('sys-btn-cancel');
        const btnContainer = btnOk.parentNode;

        msgEl.innerHTML = msg.replace(/\n/g, '<br>');
        modal.style.display = 'flex';
        inputEl.value = '';
        
        btnOk.style.display = 'block';
        btnCancel.style.display = 'none';

        const cleanup = () => {
            btnOk.onclick = null;
            btnCancel.onclick = null;
            inputEl.onkeydown = null;
            modal.style.display = 'none';
        };
        
        const warningKeywords = [
            "請輸入姓名", "時空秩序", "精力已耗盡", "系統公告", 
            "請至少選擇", "篇章數量不足", "浩然之氣不足", "該模式暫無", 
            "金幣不足", "該物品已達上限", "請最少放入", "合成失敗", 
            "無效的數量", "溫習時間不足", "密碼錯誤", "記憶正在清除", "背包空間不足"
        ];
        
        const isWarning = warningKeywords.some(keyword => msg.includes(keyword));
        const isClaim = msg.includes("領取成功");

        if (type === 'alert') {
            if (isClaim) {
                titleEl.innerText = '系統提示';
                headerEl.style.background = '#ffd700';
                headerEl.style.color = '#ffffff'; 
                btnOk.style.background = '#ffd700';
                btnOk.style.color = '#ffffff';
            } else if (isWarning) {
                titleEl.innerText = '系統警告';
                headerEl.style.background = '#e74c3c';
                headerEl.style.color = 'white';
                btnOk.style.background = '#e74c3c';
                btnOk.style.color = 'white';
            } else {
                titleEl.innerText = '系統提示';
                headerEl.style.background = 'var(--primary-blue)';
                headerEl.style.color = 'white';
                btnOk.style.background = 'var(--primary-blue)';
                btnOk.style.color = 'white';
            }
            inputEl.style.display = 'none';
            btnCancel.style.display = 'none';
            btnOk.innerText = '確定';
            btnOk.onclick = () => {
                cleanup();
                resolve(true);
            };
        } else if (type === 'confirm') {
            titleEl.innerText = '系統確認';
            headerEl.style.background = '#e74c3c';
            headerEl.style.color = 'white';
            inputEl.style.display = 'none';
            
            btnContainer.appendChild(btnOk);
            btnContainer.appendChild(btnCancel);
            
            btnCancel.style.display = 'block';
            btnOk.style.background = '#e74c3c';
            btnOk.style.color = 'white';
            btnOk.innerText = '確認';
            btnCancel.innerText = '取消';
            
            btnOk.onclick = () => {
                cleanup();
                resolve(true);
            };
            btnCancel.onclick = () => {
                cleanup();
                resolve(false);
            };
        } else if (type === 'prompt') {
            titleEl.innerText = '系統輸入';
            headerEl.style.background = '#f1c40f';
            headerEl.style.color = 'white';
            inputEl.style.display = 'block';
            inputEl.placeholder = placeholder;
            btnCancel.style.display = 'block';
            
            btnContainer.appendChild(btnOk);
            btnContainer.appendChild(btnCancel);
            
            btnOk.innerText = '提交';
            btnOk.style.background = 'var(--primary-blue)';
            btnOk.style.color = 'white';
            
            setTimeout(() => inputEl.focus(), 100);

            const submit = () => {
                const val = inputEl.value;
                cleanup();
                resolve(val);
            };

            btnOk.onclick = submit;
            btnCancel.onclick = () => {
                cleanup();
                resolve(null);
            };
            inputEl.onkeydown = (e) => {
                if(e.key === 'Enter') submit();
            };
        }
    });
}

window.alert = (msg) => showSystemModal('alert', msg);
window.confirm = (msg) => showSystemModal('confirm', msg);
window.prompt = (msg, placeholder) => showSystemModal('prompt', msg, placeholder);

async function handleFooterClick() {
    if (!document.getElementById('screen-login').classList.contains('active')) return;

    if (!window.footerClickCount) window.footerClickCount = 0;
    window.footerClickCount++;
    if (window.footerClickCount === 5) {
        const pass = await window.prompt("請輸入異世界密鑰：");
        
        if (pass === null) {
            window.footerClickCount = 0;
            return;
        }

        if (pass === "DBS_Chinese") {
            initGodMode();
        } else if (pass === "Clear") {
            const confirmed = await window.confirm("警告：此操作將回到重生的一刻！你確定嗎？");
            if(confirmed) {
                localStorage.removeItem("dbs_dragon_save_v3");
                await window.alert("記憶正在清除⋯⋯");
                location.reload();
            }
        } else if (pass === "Gold") {
            gameState.user.coins += 9999999;
            saveGame();
            if(typeof updateShopUI === 'function') updateShopUI();
            await window.alert("💰 已獲得 9,999,999 金幣！");
        } else {
            await window.alert("密碼錯誤");
        }
        window.footerClickCount = 0;
    }
    if (window.godModeActive && window.footerClickCount === 3) {
        const confirmed = await window.confirm("是否關閉超級模式並變回凡人？");
        if(confirmed) {
            revertGodMode();
        }
        window.footerClickCount = 0;
    }
}

window.claimDailyReward = function(id) {
    const task = gameState.dailyTasks.find(t => t.id === id);
    const config = DAILY_QUESTS.find(q => q.id === id);
    if (!task || !config) return;

    if (!task.complete && task.progress >= config.target) {
        task.complete = true;
    }

    if (task.complete && !task.claimed) {
        task.claimed = true;
        gameState.user.coins += config.reward;
        gameState.user.xp += 50; 
        saveGame();
        if(typeof renderDailyTasks === 'function') renderDailyTasks();
        if(typeof updateShopUI === 'function') updateShopUI();
        if(typeof updateUserDisplay === 'function') updateUserDisplay();
        alert(`領取成功！獲得 ${config.reward} 金幣！`);
        playSFX('coin');
    }
};

window.resetChapterSelectionUI = function() {
    if(typeof pendingSingleChapterKey !== 'undefined') pendingSingleChapterKey = null;
    const titleEl = document.getElementById("singleSelectedTitle");
    if(titleEl) {
        titleEl.innerText = "--";
        titleEl.style.color = "var(--primary-blue)";
    }
    document.querySelectorAll(".chapter-btn.active").forEach(btn => btn.classList.remove("active"));
    
    if(gameState) {
        gameState.mixSelectedKeys = [];
        const mixCountEl = document.getElementById("mixCount");
        if(mixCountEl) mixCountEl.innerText = "已選：0";
        document.querySelectorAll(".mix-item input").forEach(chk => chk.checked = false);
        document.querySelectorAll(".mix-item.active").forEach(div => div.classList.remove("active"));
    }
};

let backupGameState = null;
let devModeActive = false;

async function initGodMode() {
    if(window.godModeActive) return;
    if(!backupGameState) {
        backupGameState = JSON.parse(JSON.stringify(gameState));
    }
    
    const db = window.questionsDB || {};
    const now = new Date().getTime();

    window.godModeActive = true;
    gameState.user.level = 99;
    gameState.user.xp = 9999;
    gameState.user.energy = 100;
    gameState.user.coins = 9999999;
    gameState.user.title = TITLES[TITLES.length - 1];
    gameState.user.inventorySlots = 100;
    
    gameState.masteredChapters = [];
    gameState.solvedQuestionIds = [];
    gameState.solvedSrQuestionIds = [];
    
    if(!gameState.chapterLastPlayed) gameState.chapterLastPlayed = {};
    if(!gameState.collectionDates) gameState.collectionDates = {};
    
    gameState.chapterLastPlayed['mix'] = now;
    
    Object.keys(db).forEach(k => {
        gameState.masteredChapters.push(k + '_junior');
        gameState.masteredChapters.push(k + '_senior');
        gameState.masteredChapters.push('mix');
        
        gameState.chapterLastPlayed[k] = now;
        
        if(db[k].junior) db[k].junior.forEach(q => {
             if(!gameState.solvedQuestionIds.includes(q.id)) gameState.solvedQuestionIds.push(q.id);
        });
        if(db[k].senior) db[k].senior.forEach(q => {
             if(!gameState.solvedQuestionIds.includes(q.id)) gameState.solvedQuestionIds.push(q.id);
             if(!gameState.solvedSrQuestionIds.includes(q.id)) gameState.solvedSrQuestionIds.push(q.id);
        });
    });
    
    gameState.unlockedAchievements = ACHIEVEMENTS.map(a => a.id);
    gameState.unlockedAchievements.forEach(id => {
        gameState.collectionDates[id] = now;
    });

    gameState.stats.totalPlayTime = 99999;
    gameState.stats.mixWinCount = 999;
    
    DAILY_QUESTS.forEach(quest => {
        let task = gameState.dailyTasks.find(t => t.id === quest.id);
        if(!task) {
            task = { id: quest.id, progress: 0, complete: false, claimed: false };
            gameState.dailyTasks.push(task);
        }
        task.progress = quest.target;
        task.complete = false;
        task.claimed = false;
    });

    gameState.inventory = [];
    gameState.pets = [];
    if (typeof MASTER_ITEMS !== 'undefined') {
        MASTER_ITEMS.forEach(item => {
            if (item.type !== 'pet') {
                gameState.inventory.push({ ...item, count: 99 });
            } else {
                gameState.pets.push(item.id);
                gameState.collectionDates[item.id] = now;
            }
        });
    }

    updateLevel();
    if(typeof renderDailyTasks === 'function') renderDailyTasks();
    await window.alert("⚡ 超級模式已啟動 ⚡");
}

async function revertGodMode() {
    if(backupGameState) {
        gameState = JSON.parse(JSON.stringify(backupGameState));
        devModeActive = false;
        backupGameState = null;
        window.godModeActive = false;
        saveGame();
        updateUserDisplay();
        updateBars();
        if(typeof renderDailyTasks === 'function') renderDailyTasks();
        await window.alert("已還原至凡人狀態。");
    }
}
