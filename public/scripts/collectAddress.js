const checkoutButton = document.querySelector("#goToCheckout");

checkoutButton.onclick = function() {

    axios({
        method: 'post',
        url: '/prepareStripeCheckout',
        withCredentials: true
    })
    .then(res => res.json())
    .then(session => stripe.redirectToCheckout({ sessionId: session.id }))
    .then((result) => {
        if (result.error) alert(result.error.message);
    })
    .catch(err => console.log("Error:", err));
}