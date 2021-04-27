const button = document.querySelector("#addToCart");

button.onclick = () => {
    const url = window.location.pathname;
    const id = url.split('/')[url.split('/').length - 1];

    axios({
        method: 'POST',
        url: '/addToCart',
        withCredentials: true,
        data: { id }
    })
    .then(res => { location.reload() })
    .catch(err => console.log(err));
}