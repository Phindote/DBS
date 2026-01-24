function updateClassOptions() {
    const gradeSelect = document.getElementById("inputGrade");
    const classSelect = document.getElementById("inputClassLetter");
    const selectedGrade = parseInt(gradeSelect.value);
    const options = classSelect.options;

    for (let i = 0; i < options.length; i++) {
        if (options[i].value === 'R') {
            if (selectedGrade === 9) {
                options[i].style.display = 'block';
                options[i].disabled = false;
            } else {
                options[i].style.display = 'none';
                options[i].disabled = true;
                if (classSelect.value === 'R') {
                    classSelect.value = 'D';
                }
            }
        }
    }
}

function editProfile() {
    const cls = gameState.user.class;
    let grade = "";
    let letter = "";
    if (cls.length >= 2) {
        if (!isNaN(cls.substring(0, 2))) {
            grade = cls.substring(0, 2);
            letter = cls.substring(2);
        } else {
            grade = cls.substring(0, 1);
            letter = cls.substring(1);
        }
    }
    document.getElementById("inputName").value = gameState.user.name;
    document.getElementById("inputGrade").value = grade;
    updateClassOptions();
    document.getElementById("inputClassLetter").value = letter;
    switchScreen("screen-login");
}

function toggleRadialMenu() {
    const container = document.getElementById("radialMenuContainer");
    const bd = document.getElementById("floatingBackdrop");

    if (container.classList.contains("open")) {
        closeRadialMenu();
    } else {
        container.classList.add("open");
        if(bd) bd.classList.add("active");
    }
}

function closeRadialMenu() {
    const container = document.getElementById("radialMenuContainer");
    const bd = document.getElementById("floatingBackdrop");
    if (container) container.classList.remove("open");
    if (bd) bd.classList.remove("active");
}

document.addEventListener('click', function(e) {
    const radialContainer = document.getElementById("radialMenuContainer");
    const mainBtn = document.getElementById("radialMainBtn");
    
    if (radialContainer && radialContainer.classList.contains("open")) {
        if (!radialContainer.contains(e.target) && e.target !== mainBtn && !mainBtn.contains(e.target)) {
            closeRadialMenu();
        }
    }
});
