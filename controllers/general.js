const Homepage = require('../models/homepage');
const Item = require('../models/item');
const images = require('../images');
const ExpressError = require('../utils/ExpressError');
const db = require('../mongoose/mongoosedb');

module.exports.renderHome = async(req, res) => {
    const date = new Date();
    let thisMonth = date.getMonth();
    let nextMonth = date.getMonth() + 1;
    let nextNextMonth = date.getMonth() + 2;

    const cnvMonth = (month) => {
        if (month == 0) return "January";
        if (month == 1) return "February";
        if (month == 2) return "March";
        if (month == 3) return "April";
        if (month == 4) return "May";
        if (month == 5) return "June";
        if (month == 6) return "July";
        if (month == 7) return "August";
        if (month == 8) return "September";
        if (month == 9) return "October";
        if (month == 10) return "November";
        if (month == 11) return "December";
    }

    thisMonth = cnvMonth(thisMonth);
    nextMonth = cnvMonth(nextMonth);
    nextNextMonth = cnvMonth(nextNextMonth);

    const homepage = await Homepage.findOne({});

    const img = images.randImg();
    res.render('index', { img, thisMonth, nextMonth, nextNextMonth, homepage, title: "Omniology" });
}


module.exports.renderCart = async(req, res) => {
    let items = [];
    if (req.session.cart) {
        for (let id of req.session.cart) {
            items.push(await Item.findById(id));
        }
    }
    res.render('cart', { items, title: "Cart" });
}


module.exports.addToCart = async(req, res) => {
    if (Array.isArray(req.session.cart)) {
        if (!req.session.cart.includes(req.body.id)) {
            req.session.cart.push(req.body.id);
            req.flash('success', "Item Added to Cart");
        }
        else
            req.flash('success', "Item Already in Cart");
    }
    else {
        req.session.cart = [req.body.id];
        req.flash('success', "Item Added to Cart");
    }

    res.send('success');
}


module.exports.removeFromCart = (req, res) => {
    const index = req.session.cart.indexOf(req.body.id);
    req.session.cart.splice(index, 1);

    req.flash('success', "Item Removed");
    res.send('success');
}


module.exports.renderCheckout = async(req, res) => {
    let items = [];
    for (let itemId of req.session.cart) {
        items.push(await Item.findById(itemId));
    }
    let total = 0;
    for (let item of items) {
        total += item.ListPrice;
    }
    res.render('checkout', { items, total, title: "Checkout" });
}


module.exports.stripeCheckout = async(req, res) => {
    let line_items = [];

    for (let itemId of req.body.itemIds) {
        let item = await Item.findById(itemId);

        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.Title,
                    images: item.StripePhotos
                },
                unit_amount: item.ListPrice * 100,
            },
            quantity: 1
        });
    }

    let stripeSession;
    try {
        stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/success.ejs',
            cancel_url: 'http://localhost:3000/cancel.ejs'
        });
    }
    catch(err) {
        console.log(err);
    }

    res.json({ id: stripeSession.id });
}

