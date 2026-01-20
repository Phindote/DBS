// question_data_9_jr.js
// 篇章：勸學 (初階 - 多項選擇題)
// 題目數量：34

if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_quanxue"] === 'undefined') {
    window.questionsDB["p_quanxue"] = {};
}

window.questionsDB["p_quanxue"].title = "《勸學》";
window.questionsDB["p_quanxue"].img = "dragon_9.jpg";
window.questionsDB["p_quanxue"].content = `勸學（節錄） 荀子

君子曰：學不可以已。青，取之於藍，而青於藍；冰，水為之，而寒於水。木直中繩，輮以為輪，其曲中規；雖有槁暴、不復挺者，輮使之然也。故木受繩則直，金就礪則利，君子博學而日參省乎己，則知明而行無過矣。

吾嘗終日而思矣，不如須臾之所學也；吾嘗跂而望矣，不如登高之博見也。登高而招，臂非加長也，而見者遠。順風而呼，聲非加疾也，而聞者彰。假輿馬者，非利足也，而致千里；假舟楫者，非能水也，而絕江河。君子生非異也，善假於物也。

積土成山，風雨興焉；積水成淵，蛟龍生焉；積善成德，而神明自得，聖心備焉。故不積跬步，無以至千里；不積小流，無以成江海。騏驥一躍，不能十步；駑馬十駕，功在不舍。鍥而舍之，朽木不折；鍥而不舍，金石可鏤。螾無爪牙之利，筋骨之強，上食埃土，下飲黃泉，用心一也。蟹六跪而二螯，非蛇蟺之穴無可寄託者，用心躁也。`;

window.questionsDB["p_quanxue"].junior = [
    {
        id: "quan_jr_01",
        line: "「學不可以已」的「已」，意思是？",
        word: "已",
        answer: "停止",
        options: ["已經", "停止", "完成", "結束"]
    },
    {
        id: "quan_jr_02",
        line: "「木直中繩」的「中」，意思是？",
        word: "中",
        answer: "合乎",
        options: ["中間", "擊中", "合乎", "內在"]
    },
    {
        id: "quan_jr_03",
        line: "「輮以為輪」的「輮」，指什麼工序？",
        word: "輮",
        answer: "用火烤木使之彎曲",
        options: ["雕刻", "用火烤木使之彎曲", "切割", "打磨"]
    },
    {
        id: "quan_jr_04",
        line: "「其曲中規」的「規」，指什麼工具？",
        word: "規",
        answer: "圓規",
        options: ["尺子", "圓規", "規矩", "法度"]
    },
    {
        id: "quan_jr_05",
        line: "「雖有槁暴」的「槁」，意思是？",
        word: "槁",
        answer: "枯乾",
        options: ["枯乾", "煮熟", "高聳", "衰老"]
    },
    {
        id: "quan_jr_06",
        line: "「雖有槁暴」的 「暴」字的意思是？",
        word: "暴",
        answer: "曬乾",
        options: ["暴力", "暴躁", "曬乾", "暴露"]
    },
    {
        id: "quan_jr_07",
        line: "「不復挺者」的「挺」，意思是？",
        word: "挺",
        answer: "直",
        options: ["挺拔", "直", "突出", "堅持"]
    },
    {
        id: "quan_jr_08",
        line: "「金就礪則利」的「就」，意思是？",
        word: "就",
        answer: "靠近",
        options: ["成就", "靠近", "完成", "立即"]
    },
    {
        id: "quan_jr_09",
        line: "「金就礪則利」的「礪」是指？",
        word: "礪",
        answer: "磨刀石",
        options: ["磨刀石", "礪石山", "磨損", "鋒利"]
    },
    {
        id: "quan_jr_10",
        line: "「君子博學而日參省乎己」的「參」，意思是？",
        word: "參",
        answer: "檢視",
        options: ["參加", "檢視", "一次", "參考"]
    },
    {
        id: "quan_jr_11",
        line: "「君子博學而日參省乎己」的「省」的意思是？",
        word: "省",
        answer: "反省",
        options: ["節省", "省份", "反省", "檢查"]
    },
    {
        id: "quan_jr_12",
        line: "「則知明而行無過矣」的「知」，通什麼字？",
        word: "知",
        answer: "智",
        options: ["智", "志", "致", "治"]
    },
    {
        id: "quan_jr_13",
        line: "「則知明而行無過矣」的「行」的意思是？",
        word: "行",
        answer: "行為",
        options: ["行走", "行為", "行程", "實行"]
    },
    {
        id: "quan_jr_14",
        line: "「吾嘗終日而思矣」的「嘗」，意思是？",
        word: "嘗",
        answer: "曾經",
        options: ["嘗試", "曾經", "品嘗", "經歷"]
    },
    {
        id: "quan_jr_15",
        line: "「不如須臾之所學也」的「須臾」，指？",
        word: "須臾",
        answer: "片刻",
        options: ["長久", "必須", "片刻", "等待"]
    },
    {
        id: "quan_jr_16",
        line: "「吾嘗跂而望矣」的「跂」，意思是？",
        word: "跂",
        answer: "踮起腳跟",
        options: ["跛腳", "踮起腳跟", "站立", "企圖"]
    },
    {
        id: "quan_jr_17",
        line: "「聲非加疾也」的「疾」，意思是？",
        word: "疾",
        answer: "宏亮",
        options: ["疾病", "快速", "宏亮", "嫉妒"]
    },
    {
        id: "quan_jr_18",
        line: "「而聞者彰」的「彰」，意思是？",
        word: "彰",
        answer: "清晰",
        options: ["表彰", "明白", "清晰", "張揚"]
    },
    {
        id: "quan_jr_19",
        line: "「假輿馬者」的「假」，意思是？",
        word: "假",
        answer: "借用",
        options: ["假期", "虛假", "借用", "假設"]
    },
    {
        id: "quan_jr_20",
        line: "「非利足也」的「利」，意思是？",
        word: "利",
        answer: "便利",
        options: ["利益", "鋒利", "便利", "順利"]
    },
    {
        id: "quan_jr_21",
        line: "「而致千里」的「致」，意思是？",
        word: "致",
        answer: "達到",
        options: ["導致", "精緻", "達到", "招致"]
    },
    {
        id: "quan_jr_22",
        line: "「非能水也」的「能」，意思是？",
        word: "能",
        answer: "善於",
        options: ["能夠", "善於", "才能", "可能"]
    },
    {
        id: "quan_jr_23",
        line: "「而絕江河」的「絕」，意思是？",
        word: "絕",
        answer: "橫渡",
        options: ["斷絕", "橫渡", "絕對", "絕技"]
    },
    {
        id: "quan_jr_24",
        line: "「君子生非異也」的「生」，意思是？",
        word: "生",
        answer: "天性",
        options: ["天性", "姓", "勝", "甥"]
    },
    {
        id: "quan_jr_25",
        line: "「不積跬步」的「跬步」，指？",
        word: "跬步",
        answer: "半步",
        options: ["一步", "半步", "小步", "漫步"]
    },
    {
        id: "quan_jr_26",
        line: "「騏驥一躍」的「騏驥」，指？",
        word: "騏驥",
        answer: "駿馬",
        options: ["麒麟", "駿馬", "猛獸", "良犬"]
    },
    {
        id: "quan_jr_27",
        line: "「駑馬十駕」的「駑馬」，指？",
        word: "駑馬",
        answer: "鈍馬",
        options: ["鈍馬", "戰馬", "野馬", "小馬"]
    },
    {
        id: "quan_jr_28",
        line: "「鍥而舍之」的「舍」，指？",
        word: "舍",
        answer: "捨",
        options: ["捨", "赦", "拾", "給"]
    },
    {
        id: "quan_jr_29",
        line: "「鍥而不舍」的「鍥」，意思是？",
        word: "鍥",
        answer: "雕刻",
        options: ["切割", "雕刻", "鍥約", "鍥入"]
    },
    {
        id: "quan_jr_30",
        line: "「金石可鏤」的「鏤」，意思是？",
        word: "鏤",
        answer: "雕飾",
        options: ["漏洞", "雕飾", "鏤空", "穿透"]
    },
    {
        id: "quan_jr_31",
        line: "「螾無爪牙之利」的「螾」，通什麼字？",
        word: "螾",
        answer: "蚓",
        options: ["蚓", "引", "螢", "隱"]
    },
    {
        id: "quan_jr_32",
        line: "「用心躁也」的「躁」，意思是？",
        word: "躁",
        answer: "浮躁",
        options: ["暴躁", "浮躁", "躁動", "急躁"]
    },
    {
        id: "quan_jr_33",
        line: "「非能水也」中的「水」字，意思是？",
        word: "水",
        answer: "游泳",
        options: ["水流", "游泳", "潮濕的", "次數"]
    },
    {
        id: "quan_jr_34",
        line: "「積善成德，而神明自得，聖心備焉」中的「備」字，意思是？",
        word: "備",
        answer: "具備",
        options: ["準備", "詳盡", "具備", "防備"]
    }
];