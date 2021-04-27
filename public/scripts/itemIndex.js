let prev = document.getElementsByClassName("prev");
let next = document.getElementsByClassName("next");

for (let el of prev) {
    el.onclick = () => {
        plusPhotos(el, -1);
    }
}
for (let el of next) {
    el.onclick = () => {
        plusPhotos(el, 1);
    }
}

let photoIndices = [];
photoIndicesLength = prev.length;
for (let i = 0; i < photoIndicesLength; i++) {
    photoIndices[i] = 1;
}

for (let i = 0; i < photoIndicesLength; i++) {
    showPhotos(prev[i], photoIndices[i]);
}

function plusPhotos(el, n) {
    const carouselNum = el.id[el.id.length - 1];
    showPhotos(el, photoIndices[carouselNum] += n);
}

function showPhotos(el, n) {
    let i;
    const carouselNum = el.id[el.id.length - 1];
    let photos = document.getElementsByClassName("photoThumbnail" + carouselNum);

    if (photos.length > 0) {
        if (n > photos.length) photoIndices[carouselNum] = 1;
        if (n < 1) photoIndices[carouselNum] = photos.length;
        for (i = 0; i < photos.length; i++) {
            photos[i].style.display = "none";
        }
        photos[photoIndices[carouselNum] - 1].style.display = "block";
    }
}