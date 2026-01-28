// question_data_3_jr.js
// 篇章：山居秋暝 (初階 - 多項選擇題)
// 題目數量：10

if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_shanju"] === 'undefined') {
    window.questionsDB["p_shanju"] = {};
}

window.questionsDB["p_shanju"].title = "《山居秋暝》";
window.questionsDB["p_shanju"].img = "dragon_3.WEBP";
window.questionsDB["p_shanju"].content = `山居秋暝  王維

空山新雨後，天氣晚來秋。
明月松間照，清泉石上流。
竹喧歸浣女，蓮動下漁舟。
隨意春芳歇，王孫自可留。`;

window.questionsDB["p_shanju"].junior = [
    {
        id: "shan_jr_01",
        line: "「空山新雨後」中的「空」字，最恰當的解釋是？",
        word: "空",
        answer: "空曠",
        options: ["空虛", "空曠", "無人", "靈動"]
    },
    {
        id: "shan_jr_02",
        line: "「明月松間照」中的「明」字，意思是？",
        word: "明",
        answer: "皎潔明亮",
        options: ["明天", "照亮", "皎潔明亮", "顯現"]
    },
    {
        id: "shan_jr_03",
        line: "「清泉石上流」中的「清」字，意思是？",
        word: "清",
        answer: "清澈",
        options: ["清澈", "清涼", "清靜", "清脆"]
    },
    {
        id: "shan_jr_04",
        line: "「竹喧歸浣女」中的「喧」字，解釋為？",
        word: "喧",
        answer: "喧鬧",
        options: ["喧鬧", "鳴叫", "歡笑聲", "吵雜聲"]
    },
    {
        id: "shan_jr_05",
        line: "「蓮動下漁舟」中的「下」字，解釋為？",
        word: "下",
        answer: "下來",
        options: ["下面", "下來", "順流而下", "放下漁網"]
    },
    {
        id: "shan_jr_06",
        line: "「隨意春芳歇」中的「隨意」，意思是？",
        word: "隨意",
        answer: "任憑",
        options: ["有意見地", "跟著別人", "任憑", "輕鬆悠閒"]
    },
    {
        id: "shan_jr_07",
        line: "「王孫自可留」中的「王孫」，在此詩中指？",
        word: "王孫",
        answer: "歸隱的人",
        options: ["貴族子弟", "遊子", "朋友", "歸隱的人"]
    },
    {
        id: "shan_jr_08",
        line: "詩題《山居秋暝》中的「暝」字，正確的解釋是？",
        word: "暝",
        answer: "暮色",
        options: ["夜晚", "暮色", "昏暗", "閉眼"]
    },
    {
        id: "shan_jr_09",
        line: "「空山新雨後」一句中的「新」字，意思與下列何者最近？",
        word: "新",
        answer: "剛剛",
        options: ["新鮮的", "剛剛", "重新", "清潔如新"]
    },
    {
        id: "shan_jr_10",
        line: "「隨意春芳歇」的「歇」字，在此處的含義是？",
        word: "歇",
        answer: "凋謝",
        options: ["休息", "停歇", "凋謝", "盡頭"]
    }
];