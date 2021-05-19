const express = require('express');
const router = express.Router({ mergeParams: true });
const general = require('../controllers/general');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(general.renderHome));

router.get('/cart', catchAsync(general.renderCart));

router.get('/collectAddress', general.renderCollectAddress);

router.post('/prepareStripeCheckout', catchAsync(general.prepareStripeCheckout));

router.post('/addToCart', catchAsync(general.addToCart));

router.post('/removeFromCart', general.removeFromCart);

router.post('/toggleSidebar', general.toggleSidebar);

router.get('/checkout', catchAsync(general.renderCheckout));

router.post('/webhook', catchAsync(general.stripeWebhook));

module.exports = router;