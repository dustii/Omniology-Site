const button = document.querySelector("#addToCart");

button.onclick = () => {
    const url = window.location.pathname;
    const id = url.split('/')[url.split('/').length - 1];
    const lot = url.split('/')[url.split('/').length - 2] == 'lot';

    if (!lot) {
        axios({
            method: 'POST',
            url: '/addToCart',
            withCredentials: true,
            data: { itemId: id }
        })
        .then(res => { location.reload() })
        .catch(err => console.log(err));
    }
    else
        axios({
            method: 'POST',
            url: '/addToCart',
            withCredentials: true,
            data: { lotId: id }
        })
        .then(res => { location.reload() })
        .catch(err => console.log(err));
}