let main = document.querySelector('main');
let itemTemplate = document.querySelector('.itemTemplate');

for (let i = 0; i < 5; i++) {
    let item = document.createElement('div');
    item.className = "item";
    main.appendChild(item);

    let img = document.createElement('img');
    img.src = "images/geodude.jpg";
    item.appendChild(img);

    let aside = document.createElement('aside');
    item.appendChild(aside);

    let span = document.createElement('span');
    span.innerHTML = "This is maybe an item name we can put here.";
    aside.appendChild(span);

    let button = document.createElement('button');
    button.innerHTML = "Remove from cart";
    button.addEventListener('click', event => {
        item.remove();

        if (document.querySelectorAll('.item').length == 0) {
            emptyMsgFunc();
            document.querySelector(".checkoutBtn").remove();
        }


    });
    aside.appendChild(button);

}

let checkoutBtnTemp = document.querySelector('.checkoutBtnTemp');

if (document.querySelectorAll('.item').length > 0) {
    let checkoutBtn = document.createElement('button');
    checkoutBtn.innerHTML = "Proceed to Checkout";
    checkoutBtn.className = "checkoutBtn";

    main.appendChild(checkoutBtn);

    checkoutBtn.addEventListener("click", () => {
        window.open("checkout", "_top");
    });
}
else
    emptyMsgFunc();


function emptyMsgFunc() {
    let emptyMsg = document.createElement('p');
    emptyMsg.className = 'emptyMsg';
    emptyMsg.innerHTML = "There's nothing here!";

    main.appendChild(emptyMsg);
}