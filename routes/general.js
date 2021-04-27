const express = require('express');
const router = express.Router({ mergeParams: true });
const general = require('../controllers/general');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(general.renderHome));

router.get('/cart', catchAsync(general.renderCart));

router.post('/addToCart', catchAsync(general.addToCart));

router.post('/removeFromCart', general.removeFromCart);

router.get('/checkout', catchAsync(general.renderCheckout));

router.post('/create-checkout-session', catchAsync(general.stripeCheckout));

module.exports = router;