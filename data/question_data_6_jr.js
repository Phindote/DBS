if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_qingyu"] === 'undefined') {
    window.questionsDB["p_qingyu"] = {};
}

window.questionsDB["p_qingyu"].title = "《青玉案·元夕》";
window.questionsDB["p_qingyu"].img = "dragon_6.WEBP";
window.questionsDB["p_qingyu"].content = `青玉案·元夕 辛棄疾

東風夜放花千樹，更吹落，星如雨。
寶馬雕車香滿路。鳳簫聲動，玉壺光轉，一夜魚龍舞。
蛾兒雪柳黃金縷，笑語盈盈暗香去。
眾裡尋他千百度，驀然回首，那人卻在，燈火闌珊處。`;

window.questionsDB["p_qingyu"].junior = [
    {
        id: "qing_jr_01",
        line: "「眾裡尋他千百度」",
        word: "度",
        answer: "次、回",
        options: ["度過", "次、回", "程度", "度量"]
    },
    {
        id: "qing_jr_02",
        line: "「驀然回首」",
        word: "驀然",
        answer: "突然",
        options: ["突然", "靜靜地", "茫然地", "偶然"]
    },
    {
        id: "qing_jr_03",
        line: "「那人卻在、燈火闌珊處」",
        word: "闌珊",
        answer: "零落",
        options: ["燦爛", "零落", "熱鬧", "明亮"]
    }
];
