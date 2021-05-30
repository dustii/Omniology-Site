const submit = document.querySelector("button");

submit.onclick = () => {
    const fullName = document.querySelector("#fullName").value;
    const address1 = document.querySelector("#address1").value;
    const address2 = document.querySelector("#address2").value;
    const city = document.querySelector("#city").value;
    const state = document.querySelector("#state").value;
    const zip = document.querySelector("#zip").value;
    const country = document.querySelector("#country").value;
    const email = document.querySelector("#email").value;
    const msg = document.querySelector("#message").value;
    const data = {
        fullName,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        email,
        msg
    };
    axios({
        method: 'post',
        url: 'altCheckout',
        withCredentials: true,
        data
    });
}