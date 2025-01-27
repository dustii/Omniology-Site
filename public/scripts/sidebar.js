const thisMonthTheme = document.querySelector("#thisMonthTheme");

thisMonthTheme.onclick = () => {
    const weekAncs = document.querySelectorAll(".weekBtn");
    for (anc of weekAncs) {
        if (anc.style.display == "none" || anc.style.display == "")
            anc.style.display = "block";
        else
            anc.style.display = "none";
    }
}

const nextMonthTheme = document.querySelector("#nextMonthTheme");

nextMonthTheme.onclick = () => {
    const nextMnthRls = document.querySelector("#nextMnthRls");
    if (nextMnthRls.style.display == "none" || nextMnthRls.style.display == "")
        nextMnthRls.style.display = "block";
    else
        nextMnthRls.style.display = "none";
}

const nextNextMonthTheme = document.querySelector("#nextNextMonthTheme");

nextNextMonthTheme.onclick = () => {
    const nxtNxtMnthRls = document.querySelector("#nxtNxtMnthRls");
    if (nxtNxtMnthRls.style.display == "none" || nxtNxtMnthRls.style.display == "")
        nxtNxtMnthRls.style.display = "block";
    else
        nxtNxtMnthRls.style.display = "none";
}


const sidebar = document.querySelector("#sidebar");
const tglArrow = document.querySelector("#tglArrow");

tglArrow.style.top = (sidebar.scrollHeight / 2) - (tglArrow.scrollHeight / 2) + 'px';

const sidebarState = document.querySelector("#sidebarState");

if (sidebarState.dataset.sidebarstate == "collapse") {
    sidebar.style.display = "none";
    tglArrow.style.left = '0';
}
else {
    sidebar.style.display = "flex";
    tglArrow.style.left = sidebar.scrollWidth + 1 + 'px';
}

tglArrow.onclick = () => {
    if (sidebar.style.display == "flex" || sidebar.style.display == "") {
        sidebar.style.display = "none";
        tglArrow.style.left = '0';
        axios({
            method: 'post',
            url: '/toggleSidebar',
            withCredentials: true,
            data: { toggle: "collapse" }
        })
        .catch(err => console.log(err));
    }
    else {
        sidebar.style.display = "flex";
        tglArrow.style.left = sidebar.scrollWidth + 1 + 'px';
        axios({
            method: 'post',
            url: '/toggleSidebar',
            withCredentials: true,
            data: { toggle: "expand" }
        })
        .catch(err => console.log(err));
    }
}