const Homepage = require('../models/homepage');
const Item = require('../models/item');
const Lot = require('../models/lot');
const Order = require('../models/order');
const images = require('../images');
const ExpressError = require('../utils/ExpressError');
const db = require('../mongoose/mongoosedb');
const convert = require('xml-js');
const axios = require('axios');

module.exports.renderHome = async(req, res) => {
    const homepage = await Homepage.findOne({});

    const img = images.randImg();
    res.render('index', { img, homepage, title: "Omniology" });
}


module.exports.renderCart = async(req, res) => {
    let items = [];
    let lots = [];
    if (req.session.cart && req.session.cart.items) {
        for (let itemId of req.session.cart.items) {
            items.push(await Item.findById(itemId));
        }
    }
    if (req.session.cart && req.session.cart.lots) {
        for (let lotId of req.session.cart.lots) {
            lots.push(await Lot.findById(lotId).populate('items'));
        }
    }
    res.render('cart', { items, lots, title: "Cart" });
}

module.exports.renderCollectAddress = (req, res) => {
    res.render('collectAddress');
}

module.exports.prepareStripeCheckout = async(req, res) => {

    let line_items = [];

    for (let itemId of req.session.cart) {
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
            quantity: 1,
            itemId //not sure if this custom property will work. If not try session.metadata
        });

        let grams = item.Weight;
        let ounces = Math.round(grams / 28.34952); 
        let pounds = Math.floor(ounces / 16);
        ounces = ounces % 16;

        let shipRate;
        const address = req.body;
        const zip = address.zip;

        axios.get('https://secure.shippingapis.com/shippingapi.dll', {
            params: {
                API: 'RateV4',
                XML: `<RateV4Request USERID="058THEOM7585">
                <Revision>2</Revision>
                <Package ID="1ST">
                <Service>PRIORITY</Service>
                <ZipOrigination>53158</ZipOrigination>
                <ZipDestination>${zip}</ZipDestination>
                <Pounds>${pounds}</Pounds>
                <Ounces>${ounces}</Ounces>
                <Container></Container>
                <Width>${item.Width}</Width>
                <Length>${item.Length}</Length>
                <Height>4</Height>
                <Girth></Girth>
                <Machinable>false</Machinable>
                </Package>
                </RateV4Request>`
            }
        })
        .then(res => {
            const data = convert.xml2json(res.data, { compact: true });
            //shipRate = data. ... .rate
        }) 
        .catch(err => {
            const { statusCode = 500 } = err;
            if (!err.message) err.message = "Something went wrong.";
            res.status(statusCode).redirect('error', { err });
        });
    }

    let stripeSession;
    try {
        stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            shipping: {
                name: address.fullName,
                address: {
                    city: address.city,
                    country: address.country,
                    line1: address.address1,
                    line2: address.address2,
                    postal_code: address.zip,
                    state: address.state
                }
            }, 
            success_url: 'http://localhost:3000/success.ejs',
            cancel_url: 'http://localhost:3000/cancel.ejs'
        });
    }
    catch(err) {
        console.log(err);
    }

    res.json({ id: stripeSession.id });

}

module.exports.addToCart = async(req, res) => {
    if (req.body.itemId) {
        if (req.session.cart && Array.isArray(req.session.cart.items)) {
            if (!req.session.cart.items.includes(req.body.itemId)) {
                req.session.cart.items.push(req.body.id);
                req.flash('success', "Item Added to Cart");
            }
            else
                req.flash('success', "Item Already in Cart");
        }
        else if (!req.session.cart) {
            req.session.cart = {
                items: [req.body.itemId]
            }
            req.flash('success', "Item Added to Cart");
        }
    }
    else {
        if (!req.session.cart) {
            req.session.cart = {
                lots: [req.body.lotId]
            }
        }
        else {
            if (req.session.cart && Array.isArray(req.session.cart.lots)) {
                if (!req.session.cart.lots.includes(req.body.lotId)) {
                    req.session.cart.lots.push(req.body.lotId);
                    req.flash('success', "Lot Added to Cart");
                }
                else
                    req.flash('success', "Lot Already in Cart");
            }
            else {
                req.session.cart.lots = [req.body.lotId];
                req.flash('success', "Lot Added to Cart");
            }
        }
    }

    res.send('success');
}


module.exports.removeFromCart = (req, res) => {
    if (req.body.itemId) {
        const index = req.session.cart.items.indexOf(req.body.itemId);
        req.session.cart.items.splice(index, 1);
    }
    else {
        const index = req.session.cart.lots.indexOf(req.body.lotId);
        req.session.cart.lots.splice(index, 1);
    }

    req.flash('success', "Item Removed");
    res.send('success');
}


module.exports.toggleSidebar = (req, res) => {
    req.session.sidebarState = req.body.toggle;
    res.send('success');
}


module.exports.renderCheckout = async(req, res) => {
    let items = [];
    let lots = [];
    for (let itemId of req.session.cart.items) {
        let item = await Item.findById(itemId);

        if (item.sold) {
            let index = req.session.cart.items.indexOf(itemId);
            req.session.cart.items.splice(index, 1);
        }
        else
            items.push(await Item.findById(itemId));
    }
    for (let lotId of req.session.cart.lots) {
        let lot = await Lot.findById(lotId);

        if (lot.sold) {
            let index = req.session.cart.lots.indexOf(lotId);
            req.session.cart.lots.splice(index, 1);
        }
        else
            lots.push(await Lot.findById(lotId));
    }

    let total = 0;
    for (let item of items) {
        total += item.ListPrice;
    }
    for (let lot of lots) {
        total += lot.ListPrice;
    }
    res.render('checkout', { items, lots, total, title: "Checkout" });
}


module.exports.stripeCheckout = async(req, res) => {
}

const endpointSecret = 'whsec_OHB4CX42x9GxnjKLEJvuiLObHi0H1ZnD';

const fullfillOrder = async(session) => {
    const order = new Order({ session });
    await order.save();

    for (let line_item of session.line_items) {
        let item = await Item.findById(line_item.itemId);
        item.sold = true;
        await item.save();
    }


}

module.exports.stripeWebhook = async(req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        fulfillOrder(session);
    }

    console.log("Got payload: " + payload);

    res.status(200);
}
