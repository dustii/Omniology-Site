const express = require('express');
const router = express.Router({ mergeParams: true });
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const Item = require('../models/item');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'images/items',
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// router.use((req, res, next) => {
//     if (isAdmin === true) {
//         next();
//     }
//     else
//         return next(new ExpressError("Forbidden", 403));
// });

router.get('/', (req, res) => {
    res.render('admin');
});

router.get('/upload', (req, res) => {
    res.render('uploadItem');
});

router.post('/upload', upload.array('PhotoThumbnails'), catchAsync(async(req, res) => {
    const item = new Item(req.body);
    item.PhotoThumbnails = [];

    req.files.forEach(file => {
        item.PhotoThumbnails.push(file.filename);
    });

    await item.save();
    req.flash('success', "Uploaded new item");
    res.redirect('/admin');
}));

router.get('/index', catchAsync(async(req, res) => {
    const items = await Item.find({});
    for(let item of items) {
        for(let x = 0; x < item.PhotoThumbnails.length; x++) {
            item.PhotoThumbnails[x] = `/images/items/${item.PhotoThumbnails[x]}`;
        }
    }
    res.render('itemIndex', { items });
}));

module.exports = router;