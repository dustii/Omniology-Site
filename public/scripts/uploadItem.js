const week = document.querySelector("#week");
const month = document.querySelector("#month");
const year = document.querySelector("#year");

week.onchange = function() {
    if (this.value != "none") {
        month.disabled = false;
        year.disabled = false;
    }
    else {
        month.disabled = true;
        year.disabled = true;
    }
}