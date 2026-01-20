if (typeof window.questionsDB === 'undefined') {
    window.questionsDB = {};
}

if (typeof window.questionsDB["p_denglou"] === 'undefined') {
    window.questionsDB["p_denglou"] = {};
}

window.questionsDB["p_denglou"].title = "《登樓》";
window.questionsDB["p_denglou"].img = "dragon_2.jpg";
window.questionsDB["p_denglou"].content = `登樓 杜甫
 
花近高樓傷客心，萬方多難此登臨。
錦江春色來天地，玉壘浮雲變古今。
北極朝廷終不改，西山寇盜莫相侵。
可憐後主還祠廟，日暮聊為梁甫吟。`;

window.questionsDB["p_denglou"].junior = [
    {
        id: "deng_jr_01",
        line: "「花近高樓傷客心」中的「客」字，在此處具體指代誰？",
        word: "客",
        answer: "客居在外的杜甫",
        options: ["泛指所有旅居他鄉的人", "客居在外的杜甫", "來訪的客人", "客觀的立場"]
    },
    {
        id: "deng_jr_02",
        line: "「萬方多難此登臨」中的「難」字，意思是？",
        word: "難",
        answer: "憂患",
        options: ["困難，不易", "憂患", "責難，質問", "敵軍（通「儺」）"]
    },
    {
        id: "deng_jr_03",
        line: "「錦江春色來天地」的「來」字，意思是？",
        word: "來",
        answer: "湧來",
        options: ["到來", "湧來", "來自", "展現"]
    },
    {
        id: "deng_jr_04",
        line: "「玉壘浮雲變古今」的「變」字，意思是？",
        word: "變",
        answer: "變幻無常",
        options: ["變幻無常", "轉", "動盪", "更替"]
    },
    {
        id: "deng_jr_05",
        line: "「北極朝廷終不改」中的「北極」 ，意思是？",
        word: "北極",
        answer: "北極星，代指唐皇朝",
        options: ["北方的邊疆", "北極星，代指唐皇朝", "北方政權", "固定的方位"]
    },
    {
        id: "deng_jr_06",
        line: "「北極朝廷終不改」中的「終」字，意思是？",
        word: "終",
        answer: "始終",
        options: ["結束", "始終", "自從", "最後"]
    },
    {
        id: "deng_jr_07",
        line: "「西山寇盜莫相侵」的「西山寇盜」指什麼？",
        word: "西山寇盜",
        answer: "吐蕃",
        options: ["西山上的強盜", "泛指所有叛軍", "吐蕃", "西方的敵人"]
    },
    {
        id: "deng_jr_08",
        line: "「可憐後主還祠廟」中的「可憐」，應解釋為？",
        word: "可憐",
        answer: "可歎",
        options: ["值得同情", "可惜", "可歎", "可愛"]
    },
    {
        id: "deng_jr_09",
        line: "「可憐後主還祠廟」中的「還」字的意思是什麼？",
        word: "還",
        answer: "仍有",
        options: ["返回", "仍有", "歸還", "還是"]
    },
    {
        id: "deng_jr_10",
        line: "「日暮聊為《梁甫吟》」中的「日暮」，在詩句中最準確的解釋是？",
        word: "日暮",
        answer: "黃昏",
        options: ["老年", "黃昏", "晚上", "受傷的時候"]
    },
    {
        id: "deng_jr_11",
        line: "最末句「聊為《梁甫吟》」的「聊」字，正確解釋是？",
        word: "聊",
        answer: "姑且",
        options: ["悠閒地", "認真地", "姑且", "樂意地"]
    },
    {
        id: "deng_jr_12",
        line: "「西山寇盜莫相侵」中的「莫」字，正確解釋是？",
        word: "莫",
        answer: "不要",
        options: ["沒有", "不要", "不能", "莫非"]
    }
];