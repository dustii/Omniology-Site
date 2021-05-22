const Homepage = require('../models/homepage');
const Item = require('../models/item');
const Lot = require('../models/lot');
const Order = require('../models/order');
const images = require('../images');
const ExpressError = require('../utils/ExpressError');
const db = require('../mongoose/mongoosedb');
const convert = require('xml-js');
const axios = require('axios');
const stripe = require('stripe')('sk_test_51IS46OLUXB5NUgfgYl4UIm7gWL6hl0GrpqyU7BgjmbyKHEZVPQ6FLEasAPkD9vkelQxLlCmOgsXHsJFEWm20vN5P00GXRGIxoR');
const nodemailer = require('nodemailer');

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
    let shipRate = 0;
    const address = req.body;
    const zip = address.zip;

    const order = new Order();

    for (let itemId of req.session.cart.items) {
        let item = await Item.findById(itemId);

        order.items.push(item);

        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.Title,
                    images: item.StripePhotos
                },
                unit_amount: Math.round(item.ListPrice * 100)
            },
            quantity: 1,
            // itemId //not sure if this custom property will work. If not try session.metadata
        });

        let grams = item.Weight;
        let ounces = Math.round(grams / 28.34952); 
        let pounds = Math.floor(ounces / 16);
        ounces = ounces % 16;

        await axios.get('https://secure.shippingapis.com/shippingapi.dll', {
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
                <Height>${item.Height || 4}</Height>
                <Girth></Girth>
                <Machinable>false</Machinable>
                </Package>
                </RateV4Request>`
            }
        })
        .then(res => {
            let data =  convert.xml2json(res.data, { compact: true });
            data = JSON.parse(data);
            console.log(data);
            shipRate += data.RateV4Response.Package.Postage.Rate._text;
            console.log(shipRate);
        }) 
        .catch(err => {
            const { statusCode = 500 } = err;
            if (!err.message) err.message = "Something went wrong.";
            res.status(statusCode).redirect('error', { err });
        });
    }

    if (req.session.cart.lots) {
    for (let lotId of req.session.cart.lots) {
        const lot = await Lot.findById(lotId).populate('items');

        order.lots.push(lot);

        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: lot.title,
                    images: lot.items[0].StripePhotos[0]
                },
                unit_amount: Math.round(lot.listPrice * 100)
            },
            quantity: 1
        });

        let grams = 0;
        let length = 0;
        let height = 0;
        let width = 0;
        for (let item of lot.items) {
            grams += item.Weight;
            length += item.Length;
            height = item.Height > height ? item.Height : height;
            width = item.Width > width ? item.Width : width;
        }
        let ounces = Math.round(grams / 28.34952);
        let pounds = Math.floor(ounces / 16);
        ounces = ounces % 16;

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
                <Width>${width}</Width>
                <Length>${length}</Length>
                <Height>${height}</Height>
                <Girth></Girth>
                <Machinable>false</Machinable>
                </Package>
                </RateV4Request>`
            }
        })
        .then(res => {
            let data = convert.xml2json(res.data, { compact: true });
            data = JSON.parse(data);
            shipRate += data.RateV4Response.Package.Postage.Rate._text;
        }) 
        .catch(err => {
            const { statusCode = 500 } = err;
            if (!err.message) err.message = "Something went wrong.";
            res.status(statusCode).redirect('error', { err });
        });
    }
    }

    line_items.push({
        price_data: {
            currency: 'usd',
            product_data: {
                name: "Shipping"
            },
            unit_amount: Math.round(shipRate * 100)
        },
        quantity: 1
    });


    let stripeSession;
    try {
        stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            // shipping: {
                // name: address.fullName,
                // address: {
                    // city: address.city,
                    // country: address.country,
                    // line1: address.address1,
                    // line2: address.address2,
                    // postal_code: address.zip,
                    // state: address.state
                // }
            // }, 
            payment_intent_data: {
                metadata: {
                    orderId: order._id.toString()
                }
            },
            success_url: 'http://localhost:3000/checkoutSuccess',
            cancel_url: 'http://localhost:3000/checkoutCancel'
        });
    }
    catch(err) {
        console.log(err);
    }

    order.shipping = {
        name: address.fullName,
        address: {
            city: address.city,
            country: address.country,
            line1: address.address2,
            postal_code: address.zip,
            state: address.state
        }
    }

    await order.save();

    res.json({ id: stripeSession.id });

}

module.exports.checkoutSuccess = (req, res) => {
    res.render('success', { title: "Success" });
}

module.exports.checkoutCancel = (req, res) => {
    res.render('cancel', { title: "Cancel" });
}


module.exports.addToCart = async(req, res) => {
    if (req.body.itemId) {
        if (req.session.cart && Array.isArray(req.session.cart.items)) {
            if (!req.session.cart.items.includes(req.body.itemId)) {
                req.session.cart.items.push(req.body.itemId);
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



const fullfillOrder = async(session) => {
    const order = await Order.findById(session.metadata.orderId);
    order.stripeSession = session;

    for (let itemId of order.items) {
        const item = await Item.findById(itemId);
        item.sold = true;
        await item.save();
    }
    for (let lotId of order.lots) {
        const lot = await Lot.findById(lotId);
        lot.sold = true;
        await lot.save();
    }

    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: "webber.dustin@gmail.com",
            clientId: "241403620162-q1p7s2rhh514dhqf03sevjk8lpsserga.apps.googleusercontent.com",
            clientSecret: "KDy0GUg9X0PUOwX2fLby47ZY",
            refreshToken: "1//04PJd_Nb18ccECgYIARAAGAQSNwF-L9IrQtaUuehwqrzoA--mMCM6YqG7GKIP7IggtCXLwY9Ri_H0t3L5qzV53fGCy469VCg1f6Q"
        }
    });

    let info = await transporter.sendMail({
        from: '"Dustin Webber" <webber.dustin@gmail.com>',
        to: "webber.dustin@gmail.com",
        subject: "Testing Nodemailer",
        text: "Testing Nodemailer",
        html: "<b>Testing HTML Nodemailer</b>"
    });

    console.log(`Message sent: ${info.messageId}`);
}

module.exports.stripeWebhook = async(req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    // if (endpointSecret) {
    //     try {
    //         event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    //     } catch (err) {
    //         return res.status(400).send(`Webhook Error: ${err.message}`);
    //     }
    // }

    // if (event.type === 'checkout.session.completed') {
        const session = payload.data.object;

        fullfillOrder(session);
    // }
}
