const stripe = Stripe("pk_test_51IS46OLUXB5NUgfg3xjTpaTSAbue4ifhgFRpYIEVB2BAywZqiIeC54bfObEuKcMySxSvU0PcjovZWnQDRX6gs4yC006qGrDelF");
const checkoutButton = document.querySelector("#goToCheckout");
const sendMsgButton = document.querySelector("#sendMessage");

checkoutButton.onclick = function() {
    const fullName = document.querySelector("#fullName").value
    const address1 = document.querySelector("#address1").value;
    const address2 = document.querySelector("#address2").value;
    const city = document.querySelector("#city").value;
    const state = document.querySelector("#state").value;
    const zip = document.querySelector("#zip").value;
    const country = document.querySelector("#country").value;

    if (fullName && address1 && city && state && zip) {
        axios({
            method: 'post',
            url: '/prepareStripeCheckout',
            withCredentials: true,
            data: {
                fullName,
                address1,
                address2,
                city,
                state,
                zip,
                country
            }
        })
        .then(res => res.data)
        .then(session => stripe.redirectToCheckout({ sessionId: session.id }))
        .then((result) => {
            if (result.error) alert(result.error.message);
        })
        .catch(err => console.log("Error:", err));
    }
    else {
        alert("Please fill in required information.");
    }
}

sendMsgButton.onclick = () => {
    window.location.replace('/altCheckout');
}