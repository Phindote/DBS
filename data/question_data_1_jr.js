// question_data_1_jr.js
// 篇章：月下獨酌 (初階 - 多項選擇題)
// 題目數量：13

if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_yuexia"] === 'undefined') {
    window.questionsDB["p_yuexia"] = {};
}

window.questionsDB["p_yuexia"].title = "《月下獨酌》";
window.questionsDB["p_yuexia"].img = "dragon_1.WEBP"; 
window.questionsDB["p_yuexia"].content = `月下獨酌 (其一) 李白
 
花間一壺酒，獨酌無相親。
舉杯邀明月，對影成三人。
月既不解飲，影徒隨我身。
暫伴月將影，行樂須及春。
我歌月徘徊，我舞影零亂。
醒時同交歡，醉後各分散。
永結無情遊，相期邈雲漢。`;

window.questionsDB["p_yuexia"].junior = [
    {
        id: "yue_jr_01",
        line: "「花間一壺酒，獨酌無相親」中的「酌」字，意思是？",
        word: "酌",
        answer: "喝酒",
        options: ["斟酒", "喝酒", "斟酌", "品嚐"]
    },
    {
        id: "yue_jr_02",
        line: "「花間一壺酒，獨酌無相親」中的「相親」意思是？",
        word: "相親",
        answer: "可親近的人",
        options: ["親人", "可親近的人", "與人親近", "覺得孤單"]
    },
    {
        id: "yue_jr_03",
        line: "「舉杯邀明月」的「邀」字，最恰當的解釋是？",
        word: "邀",
        answer: "邀請",
        options: ["請求", "邀請", "迎請", "祈求"]
    },
    {
        id: "yue_jr_04",
        line: "「月既不解飲」的「解」字，意思是？",
        word: "解",
        answer: "懂得",
        options: ["懂得", "解開", "解答", "解釋"]
    },
    {
        id: "yue_jr_05",
        line: "「影徒隨我身」的「徒」字，意思是？",
        word: "徒",
        answer: "徒然",
        options: ["門徒", "或者", "追隨", "徒然"]
    },
    {
        id: "yue_jr_06",
        line: "「暫伴月將影」的「將」字，意思與下列何者相同？",
        word: "將",
        answer: "和",
        options: ["將要", "和", "持、拿", "帶領"]
    },
    {
        id: "yue_jr_07",
        line: "「行樂須及春」的「及」字，正確解釋是？",
        word: "及",
        answer: "趁著",
        options: ["等到", "以及", "趁著", "到達"]
    },
    {
        id: "yue_jr_08",
        line: "「我歌月徘徊」的「徘徊」一詞，描寫什麼狀態？",
        word: "徘徊",
        answer: "來回走動",
        options: ["猶豫不決", "來回走動", "流連忘返", "環繞不去"]
    },
    {
        id: "yue_jr_09",
        line: "「我舞影零亂」的「零亂」，在此形容？",
        word: "零亂",
        answer: "零落散亂",
        options: ["心情煩亂", "零落散亂", "雜亂無序", "破碎分散"]
    },
    {
        id: "yue_jr_10",
        line: "「醒時同交歡」的「交歡」，意思是？",
        word: "交歡",
        answer: "一齊歡樂",
        options: ["交往歡樂", "互相歡好", "一齊歡樂", "結交朋友"]
    },
    {
        id: "yue_jr_11",
        line: "「相期邈雲漢」的「期」，在此指什麼？",
        word: "期",
        answer: "約",
        options: ["日期", "期望", "約", "期限"]
    },
    {
        id: "yue_jr_12",
        line: "「相期邈雲漢」中的「邈」字，正確的解釋是？",
        word: "邈",
        answer: "遙遠",
        options: ["渺小", "遙遠", "邈視", "追尋"]
    },
    {
        id: "yue_jr_13",
        line: "「相期邈雲漢」中的「雲漢」一詞，正確的解釋是？",
        word: "雲漢",
        answer: "銀河",
        options: ["高高的雲端", "銀河", "浩瀚的雲海", "遙遠的星空"]
    }
];