import { getMill } from './countdown.js';

const main = document.querySelector("#weekMain");

if (getMill(weekNum) > 0) {
    main.innerHTML = "<h1>Sorry! This week hasn't been released yet.</h1>";
}