const getMill = weekNum => {
    const date = new Date();

    if (weekNum == 1)
        return -1;

    let releaseDay;
    if (weekNum == 2)
        releaseDay = 8;
    else if (weekNum == 3)
        releaseDay = 15;
    else if (weekNum == 4)
        releaseDay = 22;

    const weekRelease = new Date(date.getFullYear(), date.getMonth(), releaseDay);

    return weekRelease - date;
}

const getCountdown = (weekNum) => {
    const mill = getMill(weekNum);

    let hours = Math.floor(mill / 1000 / 60 / 60);
    let minutes = Math.floor(mill / 1000 / 60 % 60);
    let seconds = Math.floor(mill / 1000 % 60);

    if (hours < 10) 
        hours = '0' + hours;
    if (minutes < 10) 
        minutes = '0' + minutes;
    if (seconds < 10) 
        seconds = '0' + seconds;

    return `${hours}:${minutes}:${seconds}`;
}

const week2anc = document.querySelector("#week2anc");
const week3anc = document.querySelector("#week3anc");
const week4anc = document.querySelector("#week4anc");
const countdown2 = document.querySelector("#countdown2");
const countdown3 = document.querySelector("#countdown3");
const countdown4 = document.querySelector("#countdown4");

if (getMill(2) > 0) {
    countdown2.innerHTML = getCountdown(2);

    week2anc.onmouseover = () => {
        countdown2.style.display = "block";
    }
    week2anc.onmouseout = () => {
        countdown2.style.display = "none";
    }
    // week2anc.innerHTML = getCountdown(2);
}
if (getMill(3) > 0) {
    countdown3.innerHTML = getCountdown(3);

    week3anc.onmouseover = () => {
        countdown3.style.display = "block";
    }
    week3anc.onmouseout = () => {
        countdown3.style.display = "none";
    }

    // week3anc.innerHTML = getCountdown(3);
}
if (getMill(4) > 0) {
    countdown4.innerHTML = getCountdown(4);

    week4anc.onmouseover = () => {
        countdown4.style.display = "block";
    }
    week4anc.onmouseout = () => {
        countdown4.style.display = "none";
    }
    // week4anc.innerHTML = getCountdown(4);
}

setInterval(() => {
    if (getMill(2) > 0) {
        countdown2.innerHTML = getCountdown(2);

        week2anc.onmouseover = () => {
            countdown2.style.display = "block";
        }
        week2anc.onmouseout = () => {
            countdown2.style.display = "none";
        }
        // week2anc.innerHTML = getCountdown(2);
    }
    if (getMill(3) > 0) {
        countdown3.innerHTML = getCountdown(3);
    
        week3anc.onmouseover = () => {
            countdown3.style.display = "block";
        }
        week3anc.onmouseout = () => {
            countdown3.style.display = "none";
        }

        // week3anc.innerHTML = getCountdown(3);
    }
    if (getMill(4) > 0) {
        countdown4.innerHTML = getCountdown(4);

        week4anc.onmouseover = () => {
            countdown4.style.display = "block";
        }
        week4anc.onmouseout = () => {
            countdown4.style.display = "none";
        }
        // week4anc.innerHTML = getCountdown(4);
    }
}, 1000);


export { getMill };