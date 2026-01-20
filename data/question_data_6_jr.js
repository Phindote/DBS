// question_data_6_jr.js
// 篇章：青玉案‧元夕 (初階 - 多項選擇題)
// 題目數量：3

if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_qingyu"] === 'undefined') {
    window.questionsDB["p_qingyu"] = {};
}

window.questionsDB["p_qingyu"].title = "《青玉案‧元夕》";
window.questionsDB["p_qingyu"].img = "dragon_6.jpg";
window.questionsDB["p_qingyu"].content = `青玉案 元夕	辛棄疾 

東風夜放花千樹，更吹落、星如雨。寶馬雕車香滿路。鳳簫聲動，玉壺光轉，一夜魚龍舞。　　蛾兒雪柳黃金縷，笑語盈盈暗香去。眾裏尋他千百度；驀然迴首，那人卻在、燈火闌珊處。`;

window.questionsDB["p_qingyu"].junior = [
    {
        id: "qing_jr_01",
        line: "「東風夜放花千樹」的「花千樹」是形容什麼景象？",
        word: "花千樹",
        answer: "燈火繁多",
        options: ["花朵盛開", "燈火繁多", "星星閃爍", "樹木茂盛"]
    },
    {
        id: "qing_jr_02",
        line: "「驀然迴首，那人卻在、燈火闌珊處」的「驀然」，意思是？",
        word: "驀然",
        answer: "忽然",
        options: ["寂寞", "忽然", "冷漠", "雖然"]
    },
    {
        id: "qing_jr_03",
        line: "「那人卻在、燈火闌珊處」的「闌珊」，意思是？",
        word: "闌珊",
        answer: "零落稀疏",
        options: ["燦爛奪目", "零落稀疏", "熱鬧非凡", "昏暗不明"]
    }
];