/* 【中央物品數據庫】
   以後加物品只需在此處新增一行，系統會自動分類到商店或掉落池。
   
   格式說明：
   id: 唯一標識符
   name: 顯示名稱
   img: 圖片檔名 (在 images/items/ 下)
   type: 'material'(材料) | 'coin'(金幣) | 'use'(消耗品) | 'xp'(經驗道具)
   desc: 物品描述
   price: (可選) 商店售價。如果不寫，就不會出現在商店。
   drop: (可選) 掉落稀有度 'SSR' | 'SR' | 'R'。如果不寫，就不會掉落。
   value: (可選) 金幣值或回復量
*/

const MASTER_ITEMS = [
    // === 藥水與消耗品 (可買 + 可掉落) ===
    { 
        id: "item_hp_potion", name: "生命藥水", img: "item_potion.PNG", 
        type: "use", desc: "戰鬥中恢復 50 HP", 
        price: 100, drop: "R", effect: { hp: 50 } 
    },
    { 
        id: "item_energy_drink", name: "浩然特飲", img: "item_drink.PNG", 
        type: "use", desc: "立即恢復 20 能量", 
        price: 200, drop: "SR", effect: { energy: 20 } 
    },
    { 
        id: "item_shield", name: "護身符", img: "item_shield.PNG", 
        type: "use", desc: "抵擋一次致命傷害", 
        price: 500, drop: "SR" 
    },
    { 
        id: "item_exp_book", name: "經驗書", img: "item_book.PNG", 
        type: "xp", desc: "獲得 500 經驗值", 
        price: 1000, drop: "SR", value: 500
    },

    // === 稀有合成材料 (只掉落，不設售價) ===
    { 
        id: "item_dragon_scale", name: "真龍逆鱗", img: "item_scale.PNG", 
        type: "material", desc: "傳說中巨龍的逆鱗，極其珍貴",
        drop: "SSR"
    },
    { 
        id: "item_ancient_gem", name: "太古晶石", img: "item_gem.PNG", 
        type: "material", desc: "蘊含太古能量的寶石",
        drop: "SSR"
    },
    { 
        id: "item_iron_wire", name: "精製鐵線", img: "item_wire.PNG", 
        type: "material", desc: "堅固的鐵線，用於合成",
        drop: "SR"
    },
    { 
        id: "item_leather", name: "硬化皮革", img: "item_leather.PNG", 
        type: "material", desc: "經過處理的皮革",
        drop: "SR"
    },
    { 
        id: "item_herb", name: "止血草", img: "item_herb.PNG", 
        type: "material", desc: "路邊常見的草藥",
        drop: "R"
    },
    { 
        id: "item_stone", name: "普通石塊", img: "item_stone.PNG", 
        type: "material", desc: "平平無奇的石頭",
        drop: "R"
    },

    // === 貨幣類 (掉落直接變錢) ===
    { 
        id: "item_gold_bar", name: "大金條 (500G)", img: "item_goldbar.PNG", 
        type: "coin", desc: "價值連城的金條",
        drop: "SSR", value: 500
    },
    { 
        id: "item_silver_coin", name: "銀幣袋 (100G)", img: "item_silver.PNG", 
        type: "coin", desc: "一袋沈甸甸的銀幣",
        drop: "SR", value: 100
    },
    { 
        id: "item_copper_coin", name: "銅板 (20G)", img: "item_copper.PNG", 
        type: "coin", desc: "零散的銅板",
        drop: "R", value: 20
    }
];
