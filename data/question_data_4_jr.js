// question_data_4_jr.js
// 篇章：念奴嬌‧赤壁懷古 (初階 - 多項選擇題)
// 題目數量：7

if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_niannu"] === 'undefined') {
    window.questionsDB["p_niannu"] = {};
}

window.questionsDB["p_niannu"].title = "《念奴嬌‧赤壁懷古》";
window.questionsDB["p_niannu"].img = "dragon_4.WEBP";
window.questionsDB["p_niannu"].content = `念奴嬌 赤壁懷古	蘇軾 

大江東去，浪淘盡、千古風流人物。故壘西邊，人道是、三國周郎赤壁。亂石穿空，驚濤拍岸，捲起千堆雪。江山如畫，一時多少豪傑！　　遙想公瑾當年，小喬初嫁了，雄姿英發。羽扇綸巾，談笑間、檣櫓灰飛煙滅。故國神遊，多情應笑我，早生華髮。人間如夢，一尊還酹江月。`;

window.questionsDB["p_niannu"].junior = [
    {
        id: "nian_jr_01",
        line: "「大江東去，浪淘盡，千古風流人物」中的「風流」，意思是？",
        word: "風流",
        answer: "傑出不凡",
        options: ["風度灑脫", "傑出不凡", "情愛", "隨風流逝"]
    },
    {
        id: "nian_jr_02",
        line: "「故壘西邊，人道是，三國周郎赤壁」中的「故」字，意思是？",
        word: "故",
        answer: "舊時的",
        options: ["所以", "舊時的", "故事", "故意"]
    },
    {
        id: "nian_jr_03",
        line: "「檣櫓灰飛煙滅」中的「檣」，意思是？",
        word: "檣",
        answer: "船桅",
        options: ["船帆", "船桅", "武器", "船艙"]
    },
    {
        id: "nian_jr_04",
        line: "「檣櫓灰飛煙滅」中的「櫓」，意思是？",
        word: "櫓",
        answer: "船槳",
        options: ["船身", "船槳", "盾牌", "甲板"]
    },
    {
        id: "nian_jr_05",
        line: "「故國神遊，多情應笑我，早生華髮」的「華」字，解釋是？",
        word: "華",
        answer: "花白",
        options: ["華麗", "中華", "花白", "浮華"]
    },
    {
        id: "nian_jr_06",
        line: "「一尊還酹江月」的「尊」字，在此處意為？",
        word: "尊",
        answer: "酒杯",
        options: ["尊敬", "尊貴", "酒杯", "地位"]
    },
    {
        id: "nian_jr_07",
        line: "「一尊還酹江月」的「酹」字，意思是？",
        word: "酹",
        answer: "把酒灑入江中祭奠",
        options: ["舉杯飲盡", "把酒灑入江中祭奠", "斟滿酒杯", "端起酒杯"]
    }
];