
// Add images to grid
let main = document.querySelector('main');

for (let i = 0; i <= 16; i++) {
    let img = document.createElement('img');
    img.src = 'images/geodude.jpg';
    img.style.width = '200px';
    img.style.margin = '10px';

    img.addEventListener('click', event => {
        let dialog = document.createElement('dialog');
        let itemInfo = document.createElement('div');
        let galleryContainer = document.createElement('div');
        let mainImg = document.createElement('img');
        let gallery = document.createElement('div');
        let description = document.createElement('p');
        let cartBtn = document.createElement('button');
        let closeBtn = document.createElement('button');

        dialog.style.flexDirection = 'column';
        dialog.style.alignItems = 'center'

        itemInfo.style.display = 'flex';
        itemInfo.style.alignItems = 'center';
        itemInfo.style.flexWrap = 'wrap';
        itemInfo.style.justifyContent = 'center';
        dialog.appendChild(itemInfo);

        galleryContainer.style.paddingRight = '5px';
        galleryContainer.style.paddingLeft = '5px';
        galleryContainer.style.display = 'flex';
        galleryContainer.style.flexDirection = 'column';
        galleryContainer.style.alignItems = 'center';

        mainImg.src = 'images/geodude.jpg';
        galleryContainer.appendChild(mainImg);

        gallery.style.display = 'flex';
        gallery.style.flexWrap = 'nowrap';
        gallery.style.overflowX = 'auto';
        gallery.style.maxWidth = '200px';

        galleryContainer.appendChild(gallery);
        itemInfo.appendChild(galleryContainer);

        for (let j = 0; j < 5; j++) {
            let thumbNail = document.createElement('img');
            thumbNail.src = 'images/geodude.jpg';
            thumbNail.style.width = '80px';
            thumbNail.style.flex = '0 0 auto';
            gallery.appendChild(thumbNail);
        }

        description.innerHTML = "Geodude is a geological dude. He is a rock with a face and arms. He evolves but I don't remember what to. He's cool and very special to me. Geodude is love. Geodude is life. Praise Geodude.";
        description.style.maxWidth = '200px';
        description.style.paddingLeft = '5px';
        description.style.fontWeight = 'bold';
        itemInfo.appendChild(description);

        cartBtn.innerHTML = "Add to Cart";
        cartBtn.style.marginTop = '20px';
        cartBtn.style.border = 'none';
        cartBtn.style.padding = '12px';
        cartBtn.style.fontWeight = 'bold';
        cartBtn.style.color = 'white';
        cartBtn.style.backgroundColor = '#F4C314';
        cartBtn.style.marginLeft = 'auto';
        cartBtn.style.marginRight = 'auto';
        cartBtn.style.display = 'block';
        dialog.appendChild(cartBtn);

        closeBtn.innerHTML = "x";
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '0px';
        closeBtn.style.top = '0px';
        closeBtn.style.border = 'none';
        closeBtn.style.backgroundColor = 'white';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.fontWeight = 'bold';

        closeBtn.addEventListener('click', event => {
            dialog.close();
        });
        dialog.appendChild(closeBtn);

        main.appendChild(dialog);
        dialog.showModal();
    });

    main.appendChild(img);

}