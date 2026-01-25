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
    MAX_XP: 9999,
    COIN_PER_Q: 1,
    MAX_COINS: 9999999
};

const GACHA_CONFIG = {
    COST: 120,
    RATES: { T0: 0.0001, T1: 0.001, T2: 0.005, T3: 0.10, T4: 0.80 }
};

const RARITY_MAP = {
    T0: "【傳說】",
    T1: "【史詩】",
    T2: "【稀有】",
    T3: "【精良】",
    T4: "【普通】",
    SP: "【特殊】"
};

const DROP_SYSTEM_CONFIG = {
    ON_CLICK_ANY: 0.001,       
    ON_ANSWER_WRONG: 0.01,     
    ON_ANSWER_CORRECT: 0.05,   
    ON_CLEAR_NORMAL: 0.15,     
    ON_CLEAR_PERFECT: 0.30,    
    ON_CLEAR_MIX: 0.50,        
    ON_DAILY_LOGIN: 1.0,       
    ON_STUDY_MINUTE: 0.3,     
    ON_PLAY_TIME_10MIN: 0.1,  
    SPECIFIC_TIME_BONUS: 0.50, 
    LOGIN_MOMENT_BONUS: 0.80   
};

const SHOP_ITEMS = [];
const DROP_ITEMS_POOL = { T0: [], T1: [], T2: [], T3: [], T4: [] };

if (typeof MASTER_ITEMS !== 'undefined') {
    MASTER_ITEMS.forEach(item => {
        if (item.price && item.price > 0 && item.type !== 'pet' && item.rarity !== 'T0' && item.rarity !== 'T1' && item.id !== 'f_001') {
            SHOP_ITEMS.push(item);
        }
        if (item.rarity && DROP_ITEMS_POOL[item.rarity] && item.type !== 'pet') {
            DROP_ITEMS_POOL[item.rarity].push(item);
        }
    });
} else {
    console.error("Master Items not found");
}

const TITLES = [
    "初心新手", "鐵劍勇者", "龍影覓者", "鱗甲獵手", "龍息破者",
    "血爪鬥士", "翼刃騎士", "獵心守護", "龍牙勇將", "雷霆屠夫",
    "龍魂征服", "焚天劍豪", "滅鱗霸主", "龍血君王", "噬血龍將",
    "破空龍屠", "蒼穹滅士", "究極•屠龍者", "龍脈•降龍無悔"
];

const ACHIEVEMENTS = [
    {id: "ach_1", title: "初入江湖", desc: "達到等級 5"},
    {id: "ach_2", title: "學富五車", desc: "獲得 5000 經驗值"},
    {id: "ach_3", title: "駐足常客", desc: "累積遊玩 15 分鐘"},
    {id: "ach_4", title: "流連忘返", desc: "累積遊玩 60 分鐘"},
    {id: "ach_5", title: "歲月如歌", desc: "累積遊玩 999 分鐘"},
    {id: "ach_6", title: "初探龍巢", desc: "完成任意一篇試煉"},
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

const DAILY_QUESTS = [
    { id: 1, desc: "每日登入", target: 1, reward: 50, type: "login" },
    { id: 2, desc: "溫習惡龍圖鑑 10 分鐘", target: 10, reward: 80, type: "study" },
    { id: 3, desc: "初階完美通關 5 次 (不同篇)", target: 5, reward: 100, type: "perfect_jr_diff" },
    { id: 4, desc: "高階完美通關 5 次 (不同篇)", target: 5, reward: 150, type: "perfect_sr_diff" },
    { id: 5, desc: "混合篇章順利通關 2 次", target: 2, reward: 180, type: "mix_win" },
    { id: 6, desc: "指定篇章初階完美通關 1 次", target: 1, reward: 50, type: "target_jr" },
    { id: 7, desc: "指定篇章高階完美通關 1 次", target: 1, reward: 80, type: "target_sr" }
];

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
    'images/ui/icon_core.PNG',
    'images/ui/btn_daily.PNG',
    'images/ui/btn_store.PNG',
    'images/ui/btn_inventory.PNG',
    'images/ui/btn_smelt.PNG',
    'images/ui/btn_pet.PNG',
    'images/ui/icon_coin.PNG',
    'images/items/pet_unknown.PNG',
    'images/dragons/dragon_unknown.jpg',
    'images/dragons/dragon_mix.jpg',
    'images/results/img_perfect.PNG',
    'images/results/img_success.PNG',
    'images/results/img_defeat.PNG',
    'images/achievements/ach_locked.PNG'
];

if (typeof MASTER_ITEMS !== 'undefined') {
    MASTER_ITEMS.forEach(item => {
        if(item.img) ASSETS_TO_LOAD.push('images/items/' + item.img);
    });
}
for(let i=1; i<=40; i++) ASSETS_TO_LOAD.push(`images/achievements/ach_${i}.PNG`);
