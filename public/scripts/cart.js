const rmvBtns = document.querySelector(".cartText button");

rmvBtns.onclick = function() {
    const index = this.id[this.id.length - 1];
    const itemId = document.querySelector(`#itemId${index}`).innerHTML;
    
    axios({
        method: 'post',
        url: '/removeFromCart',
        withCredentials: true,
        data: { id: itemId }
    })
    .then(res => { location.reload() })
    .catch(err => console.log(err));
}

const stripe = Stripe("pk_test_51IS46OLUXB5NUgfg3xjTpaTSAbue4ifhgFRpYIEVB2BAywZqiIeC54bfObEuKcMySxSvU0PcjovZWnQDRX6gs4yC006qGrDelF");
const checkoutButton = document.querySelector("#goToCheckout");

checkoutButton.onclick = function() {
    const itemIdEls = document.querySelectorAll(".itemId");
    let itemIds = [];
    for (let itemId of itemIdEls) {
        itemIds.push(itemId.innerHTML);
    }

    axios({
        method: 'post',
        url: '/create-checkout-session',
        withCredentials: true,
        data: { itemIds }
    })
    .then(res => res.json())
    .then(session => stripe.redirectToCheckout({ sessionId: session.id }))
    .then((result) => {
        if (result.error) alert(result.error.message);
    })
    .catch(err => console.log("Error:", err));
}