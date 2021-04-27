const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const admin = require('../controllers/admin');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: 'public/images/items',
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.admin !== true) {
        req.flash('error', "Not Authorized");
        res.redirect('/');
    }
    next();
}

router.get('/', isAdmin, admin.renderAdmin);

router.get('/upload', isAdmin, admin.renderUpload);

router.post('/upload', isAdmin, upload.array('PhotoThumbnails'), catchAsync(admin.uploadItem));

router.get('/index', isAdmin, catchAsync(admin.renderIndex));

router.get('/item/edit/:id', isAdmin, catchAsync(admin.renderEdit));

router.post('/item/edit/:id', isAdmin, upload.array('PhotoThumbnails'), catchAsync(admin.editItem));

router.get('/homepage', isAdmin, catchAsync(admin.renderEditHomepage));

router.post('/homepage', isAdmin, catchAsync(admin.editHomepage));

module.exports = router;