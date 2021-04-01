const dirTree = require('directory-tree');

const allImgSrc = () => {
    const images = dirTree('./public/images').children;
    const imagesSrc = [];
    for (let img of images) {
        imagesSrc.push(img.name);
    }
    return imagesSrc;
}

const randImg = () => {
    const allImgs = allImgSrc();
    return allImgs[Math.floor(Math.random() * allImgs.length)];
}

module.exports = {
    allImgSrc: allImgSrc,
    randImg: randImg
}