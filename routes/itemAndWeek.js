const express = require('express');
const router = express.Router({ mergeParams: true });
const itemAndWeek = require('../controllers/itemAndWeek');
const catchAsync = require('../utils/catchAsync');

router.get('/week/:num', catchAsync(itemAndWeek.renderWeek));

router.get('/item/:id', catchAsync(itemAndWeek.renderItem));

module.exports = router;