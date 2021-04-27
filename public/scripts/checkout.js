const sameAddr = document.querySelector("#sameAddress");

sameAddr.onclick = function() {
    const sameInputs = document.querySelectorAll(".same");

    if (this.checked) {
        for (let input of sameInputs)
            input.disabled = true;
    }
    else
        for (let input of sameInputs)
            input.disabled = false;
}

const form = document.querySelector("#checkoutForm");

form.onsubmit = function(event) {
    if (sameAddr.checked) {
        event.preventDefault();
        const shipAddr = document.querySelector("#shipAddress");
        const shipState = document.querySelector("#shipState");
        const shipCity = document.querySelector("#shipCity");
        const shipZip = document.querySelector("#shipZip");
        const billAddr = document.querySelector("#billAddress");
        const billState = document.querySelector("#billState");
        const billCity = document.querySelector("#billCity");
        const billZip = document.querySelector("#billZip");

        billAddr.value = shipAddr.value;
        billState.value = shipState.value;
        billCity.value = shipCity.value;
        billZip.value = shipZip.value;

        this.submit();
    }
}

const stripe = Stripe("pk_test_51IS46OLUXB5NUgfg3xjTpaTSAbue4ifhgFRpYIEVB2BAywZqiIeC54bfObEuKcMySxSvU0PcjovZWnQDRX6gs4yC006qGrDelF");

