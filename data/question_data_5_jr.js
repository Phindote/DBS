if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_shengsheng"] === 'undefined') {
    window.questionsDB["p_shengsheng"] = {};
}

window.questionsDB["p_shengsheng"].title = "《聲聲慢‧秋情》";
window.questionsDB["p_shengsheng"].img = "dragon_5.WEBP";
window.questionsDB["p_shengsheng"].content = `聲聲慢 秋情	李清照 

尋尋覓覓，冷冷清清，悽悽慘慘戚戚。乍煖還寒時候，最難將息。三杯兩盞淡酒，怎敵他晚來風急！雁過也，正傷心，卻是舊時相識。　　滿地黃花堆積，憔悴損，如今有誰堪摘﹖守著窗兒，獨自怎生得黑！梧桐更兼細雨，到黃昏、點點滴滴。這次第，怎一箇愁字了得！`;

window.questionsDB["p_shengsheng"].junior = [
    {
        id: "sheng_jr_01",
        line: "「乍暖還寒時候」的「乍」字，正確解釋是？",
        word: "乍",
        answer: "剛剛",
        options: ["剛剛", "暫時", "張開", "怎"]
    },
    {
        id: "sheng_jr_02",
        line: "「最難將息」中的「將息」，意思是？",
        word: "將息",
        answer: "休息",
        options: ["將要休息", "休息", "喘息", "停止"]
    },
    {
        id: "sheng_jr_03",
        line: "「怎敵他、晚來風急」的「敵」字，意思是？",
        word: "敵",
        answer: "抵擋",
        options: ["敵人", "抵擋", "相當，匹敵", "攻擊"]
    },
    {
        id: "sheng_jr_04",
        line: "「滿地黃花堆積，憔悴損」的「損」字，在此處的詞義是？",
        word: "損",
        answer: "非常",
        options: ["減少", "損壞", "非常", "損傷"]
    },
    {
        id: "sheng_jr_05",
        line: "「如今有誰堪摘」的「誰」字，指的是？",
        word: "誰",
        answer: "何人",
        options: ["什麼", "何人", "為誰", "某人"]
    },
    {
        id: "sheng_jr_06",
        line: "「如今有誰堪摘」的「堪摘」意思是？",
        word: "堪摘",
        answer: "可以採摘",
        options: ["不堪採摘", "值得摘取", "忍受摘取", "可以採摘"]
    },
    {
        id: "sheng_jr_07",
        line: "「這次第，怎一個愁字了得！」的「次第」，意思是？",
        word: "次第",
        answer: "光景",
        options: ["順序", "一個接一個", "光景", "頃刻"]
    }
];