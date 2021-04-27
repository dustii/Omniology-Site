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

if (getMill(2) > 0) {
    week2anc.innerHTML = getCountdown(2);
}
if (getMill(3) > 0) {
    week3anc.innerHTML = getCountdown(3);
}
if (getMill(4) > 0) {
    week4anc.innerHTML = getCountdown(4);
}

setInterval(() => {
    if (getMill(2) > 0) {
        week2anc.innerHTML = getCountdown(2);
    }
    if (getMill(3) > 0) {
        week3anc.innerHTML = getCountdown(3);
    }
    if (getMill(4) > 0) {
        week4anc.innerHTML = getCountdown(4);
    }
}, 1000);


export { getMill };