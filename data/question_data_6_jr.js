// question_data_6_jr.js
// 篇章：青玉案 元夕 (初階 - 多項選擇題)
// 題目數量：3

if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

// 注意：這裡將 key 改為 p_qingyuan 以符合內容，圖片設為 dragon_6.jpg 代表第6關
if (typeof window.questionsDB["p_qingyuan"] === 'undefined') {
    window.questionsDB["p_qingyuan"] = {};
}

window.questionsDB["p_qingyuan"].title = "《青玉案 元夕》";
window.questionsDB["p_qingyuan"].img = "dragon_6.jpg";
window.questionsDB["p_qingyuan"].content = `青玉案 元夕 辛棄疾

東風夜放花千樹，更吹落、星如雨。
寶馬雕車香滿路。
鳳簫聲動，玉壺光轉，一夜魚龍舞。
蛾兒雪柳黃金縷，笑語盈盈暗香去。
眾裡尋他千百度，
驀然回首，那人卻在，燈火闌珊處。`;

window.questionsDB["p_qingyuan"].junior = [
    {
        id: "qing_jr_01",
        line: "「眾裡尋他千百度」中的「度」字，正確的意思是？",
        word: "度",
        answer: "次、回",
        options: ["度過", "次、回", "程度", "度量"]
    },
    {
        id: "qing_jr_02",
        line: "「驀然回首」的「驀然」，最恰當的解釋是？",
        word: "驀然",
        answer: "突然",
        options: ["突然", "靜靜地", "茫然地", "偶然"]
    },
    {
        id: "qing_jr_03",
        line: "「那人卻在、燈火闌珊處」的「闌珊」，正確的意思是？",
        word: "闌珊",
        answer: "零落",
        options: ["燦爛", "零落", "熱鬧", "明亮"]
    }
];
