function showStatsModal() {
    document.getElementById("statsModal").style.display = "flex";
    updateCoreButtonVisibility();
    drawRadarChartSVG();
}

function closeStatsModal() {
    document.getElementById('statsModal').style.display='none';
    updateCoreButtonVisibility();
}

function calculateStats() {
    const db = window.questionsDB || {};
    const mapping = [
        {name: "唐詩三首", keys: ["p_shanshu", "p_yuexia", "p_denglou"]}, 
        {name: "儒家思想", keys: ["p_lunyu", "p_mengzi", "p_quanxue", "p_shishuo"]}, 
        {name: "記遊", keys: ["p_yueyang", "p_xishan"]}, 
        {name: "宋詞三首", keys: ["p_niannu", "p_shengman", "p_qinyuan"]}, 
        {name: "道家思想", keys: ["p_xiaoyao"]},
        {name: "政論文章", keys: ["p_liuguo", "p_chushi", "p_lianpo"]}
    ];

    let stats = [];
    mapping.forEach(group => {
        let totalQ = 0;
        let solvedQ = 0;
        group.keys.forEach(k => {
            if(db[k]) {
                if(db[k].junior) {
                    totalQ += db[k].junior.length;
                    db[k].junior.forEach(q => { if(gameState.solvedQuestionIds.includes(q.id)) solvedQ++; });
                }
                if(db[k].senior) {
                    totalQ += db[k].senior.length;
                    db[k].senior.forEach(q => { if(gameState.solvedQuestionIds.includes(q.id)) solvedQ++; });
                }
            }
        });
        stats.push(totalQ === 0 ? 0 : solvedQ / totalQ);
    });
    return stats;
}

function drawRadarChartSVG() {
    const container = document.getElementById("radarContainer");
    container.innerHTML = "";
    
    const width = 400;
    const height = 350;
    const cx = 200;
    const cy = 175;
    const radius = 95; 
    const stats = calculateStats();
    const labels = ["唐詩三首", "儒家思想", "記遊", "宋詞三首", "道家思想", "政論文章"];
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    
    const angleMap = [240, 300, 0, 60, 120, 180];

    const getCoords = (val, i) => {
        const angleDeg = angleMap[i];
        const angleRad = angleDeg * (Math.PI / 180);
        const x = cx + (radius * val) * Math.cos(angleRad);
        const y = cy + (radius * val) * Math.sin(angleRad);
        return {x, y};
    };

    let bgPoints = "";
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(1, i);
        bgPoints += `${x},${y} `;
    }
    const bgPoly = document.createElementNS(svgNS, "polygon");
    bgPoly.setAttribute("points", bgPoints.trim());
    bgPoly.setAttribute("fill", "rgba(238, 238, 238, 0.5)");
    bgPoly.setAttribute("stroke", "#ddd");
    svg.appendChild(bgPoly);
    
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(1, i);
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", cx);
        line.setAttribute("y1", cy);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#eee");
        svg.appendChild(line);
        
        const labelText = document.createElementNS(svgNS, "text");
        const lx = cx + (radius + 25) * Math.cos(angleMap[i] * (Math.PI / 180));
        const ly = cy + (radius + 25) * Math.sin(angleMap[i] * (Math.PI / 180));
        
        labelText.setAttribute("x", lx);
        labelText.setAttribute("y", ly);
        
        let anchor = "middle";
        let baseline = "middle";
        
        const deg = angleMap[i];
        if (deg === 180) { 
            anchor = "end"; 
        } else if (deg === 0) { 
            anchor = "start"; 
        } else if (deg > 0 && deg < 180) { 
            baseline = "hanging"; 
        } else { 
            baseline = "auto"; 
        }

        if(deg === 120) anchor = "end"; 
        if(deg === 60) anchor = "start"; 
        if(deg === 240) anchor = "end"; 
        if(deg === 300) anchor = "start"; 

        labelText.setAttribute("text-anchor", anchor);
        labelText.setAttribute("dominant-baseline", baseline);
        labelText.setAttribute("fill", "#333");
        labelText.setAttribute("font-family", "Microsoft JhengHei");
        labelText.setAttribute("font-size", "15"); 
        labelText.setAttribute("font-weight", "bold"); 
        labelText.textContent = labels[i];
        svg.appendChild(labelText);
    }
    
    const dataPoly = document.createElementNS(svgNS, "polygon");
    dataPoly.setAttribute("fill", "rgba(52, 152, 219, 0.6)");
    dataPoly.setAttribute("stroke", "#2980b9");
    dataPoly.setAttribute("stroke-width", "2");
    svg.appendChild(dataPoly);

    let startPoints = "";
    for(let i=0; i<6; i++) {
        startPoints += `${cx},${cy} `;
    }
    let endPoints = "";
    for(let i=0; i<6; i++) {
        const {x, y} = getCoords(stats[i], i);
        endPoints += `${x},${y} `;
    }

    const animate = document.createElementNS(svgNS, "animate");
    animate.setAttribute("attributeName", "points");
    animate.setAttribute("dur", "0.5s");
    animate.setAttribute("fill", "freeze");
    animate.setAttribute("from", startPoints.trim());
    animate.setAttribute("to", endPoints.trim());
    animate.setAttribute("calcMode", "spline");
    animate.setAttribute("keyTimes", "0;1");
    animate.setAttribute("keySplines", "0.25 0.1 0.25 1"); 
    
    dataPoly.appendChild(animate);
    animate.beginElement();
    
    container.appendChild(svg);
}
