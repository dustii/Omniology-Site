const Homepage = require('../models/homepage');
const Item = require('../models/item');
const Lot = require('../models/lot');
const Order = require('../models/order');
const images = require('../images');
const ExpressError = require('../utils/ExpressError');
const db = require('../mongoose/mongoosedb');
const convert = require('xml-js');
const axios = require('axios');
const stripe = require('stripe')(process.env.NODE_ENV !== "production" ? process.env.SK_TEST : process.env.SK_LIVE);
const nodemailer = require('nodemailer');


function removeItemFromCart(req, itemId) {
    const index = req.session.cart.items.indexOf(itemId);
    req.session.cart.items.splice(index, 1);
}
function removeLotFromCart(req, lotId) {
    const index = req.session.cart.lots.indexOf(lotId);
    req.session.cart.lots.splice(index, 1);
}


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

    let line_items =    [];
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
            quantity: 1
        });

        let grams = item.Weight;
        let ounces = Math.round(grams / 28.34952); 
        let pounds = Math.floor(ounces / 16);
        ounces = ounces % 16;

        if (address.country == "US") {
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
                    <Width>${Math.round(item.Width)}</Width>
                    <Length>${Math.round(item.Length)}</Length>
                    <Height>${Math.round(item.Height) || 4}</Height>
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

        else if (address.country == "CA") {
            await axios.get('https://secure.shippingapis.com/shippingapi.dll', {
                params: {
                    API: 'IntlRateV2',
                    XML: `<IntlRateV2Request USERID="058THEOM7585">
                    <Revision>2</Revision>
                    <Package ID="1ST">
                    <Pounds>${pounds}</Pounds>
                    <Ounces>${ounces}</Ounces>
                    <MailType>Package</MailType>
                    <GXG>
                    <POBoxFlag>N</POBoxFlag>
                    <GiftFlag>N</GiftFlag>
                    </GXG>
                    <ValueOfContents>${item.ListPrice}</ValueOfContents>
                    <Country>Canada</Country>
                    <Width>${Math.round(item.Width)}</Width>
                    <Length>${Math.round(item.Length)}</Length>
                    <Height>${Math.round(item.Height) || 4}</Height>
                    <OriginZip>53158</OriginZip>
                    </Package>
                    </IntlRateV2Request>`
                }
            })
            .then(res => {
                let data = convert.xml2json(res.data, { compact: true });
                data = JSON.parse(data);
                shipRate += data.IntlRateV2Response.Package.Service[data.IntlRateV2Response.Package.Service.length - 1].Postage._text;
                console.log(data);
            })
            .catch (err => {
                const { statusCode = 500 } = err;
                if (!err.message) err.message = "Something went wrong.";
                res.status(statusCode).redirect('error', { err });
            });
        }
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
                        images: [lot.items[0].StripePhotos[0]]
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
    
            if (address.country == "US") {
    
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
                        <Width>${Math.round(width)}</Width>
                        <Length>${Math.round(length)}</Length>
                        <Height>${Math.round(height) || 4}</Height>
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

            else if (address.country == "CA") {
                await axios.get('https://secure.shippingapis.com/shippingapi.dll', {
                    params: {
                        API: 'IntlRateV2',
                        XML: `<IntlRateV2Request USERID="058THEOM7585">
                        <Revision>2</Revision>
                        <Package ID="1ST">
                        <Pounds>${pounds}</Pounds>
                        <Ounces>${ounces}</Ounces>
                        <MailType>Package</MailType>
                        <GXG>
                        <POBoxFlag>N</POBoxFlag>
                        <GiftFlag>N</GiftFlag>
                        </GXG>
                        <ValueOfContents>${lot.listPrice}</ValueOfContents>
                        <Country>Canada</Country>
                        <Width>${Math.round(length)}</Width>
                        <Length>${Math.round(height)}</Length>
                        <Height>${Math.round(width)}</Height>
                        <OriginZip>53158</OriginZip>
                        <AcceptanceDateTime>${new Date().toISOString()}</AcceptanceDateTime>
                        <DestinationPostalCode>${zip}</DestinationPostalCode>
                        </Package>
                        </IntlRateV2Request>`
                    }
                })
                .then(res => {
                    let data = convert.xml2json(res.data, { compact: true });
                    data = JSON.parse(data);
                    shipRate += data.IntlRateV2Response.Package.Service[data.IntlRateV2Response.Package.Service.length - 1].Postage._text;
                })
                .catch (err => {
                    const { statusCode = 500 } = err;
                    if (!err.message) err.message = "Something went wrong.";
                    res.status(statusCode).redirect('error', { err });
                });
            }
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
            payment_intent_data: {
                metadata: {
                    orderId: order._id.toString()
                }
            },
            metadata: {
                orderId: order._id.toString()
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
            line1: address.address1,
            line2: address.address2,
            postal_code: address.zip,
            stateOrProvince: address.state,
            country: address.country
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

    req.session.save(err => {
        console.log(err);
        res.send('success');
    });
}


module.exports.removeFromCart = (req, res) => {
    if (req.body.itemId) {
        removeItemFromCart(req, req.body.itemId);
    }
    else {
        removeLotFromCart(req, req.body.lotId);
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



const fullfillOrder = async(req, session) => {
    const order = await Order.findById(session.metadata.orderId);
    order.stripeSession = session;

    let htmlEmail = 
        `<b>Customer Email: </b> ${session.customer_details.email}
        <br><h2>Shipping Info</h2>
        <b>Name: </b> ${order.shipping.name}
        <br><b>Address1: </b> ${order.shipping.address.line1}
        <br><b>Address2: </b> ${order.shipping.address.line2}
        <br><b>City: </b> ${order.shipping.address.city}
        <br><b>State or Province: </b> ${order.shipping.address.stateOrProvince}
        <br><b>Postal Code: </b> ${order.shipping.address.postal_code}
        <br><b>Country: </b> ${order.shipping.address.country}
        <br><br>
        <h2>Items</h2>
        <ul>`;

    for (let itemId of order.items) {
        const item = await Item.findById(itemId);
        item.Sold = true;
        await item.save();
        htmlEmail += 
        `<li><b>InventoryId: </b>${item.InventoryId} <b>Title: </b>${item.Title} <a href="omniologycollection.com/item/${item._id}">Store Link</a></li>`;
    }

    htmlEmail += `</ul><br><br><h2>Lots</h2><ul>`;

    for (let lotId of order.lots) {
        const lot = await Lot.findById(lotId);
        lot.sold = true;
        await lot.save();
        htmlEmail += 
        `<li><b>Title: </b>${lot.title} <a href="omniologycollection.com/lot/${lot._id}">Store Link</a></li>`;
    }

    htmlEmail += `</ul>`;

    htmlEmail += 
    `<h2>Total Price: ${session.amount_total}</h2>`

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'admin@omniologycollection.com',
            pass: process.env.EMAIL_ADMIN_PW
        }
    });

    transporter.sendMail({
        from: '"DeAnna Lowe" <admin@omniologycollection.com>',
        to: 'admin@omniologycollection.com',
        subject: "New Order",
        html: htmlEmail
    },
    (err, info) => {
        if (err)
            console.log(err);
        else 
            console.log('Email sent: ' + info.response);
    });
}

module.exports.renderAltCheckout = async(req, res) => {
    res.render('altCheckout', { title: "Send Message" })
}

module.exports.altCheckout = async(req, res) => {

    const items = req.session.cart.items;
    const lots = req.session.cart.lots;

    let htmlEmail = 
        `<b>Customer Email: </b> ${req.body.email}
        <br><b>Name: </b> ${req.body.fullName}
        <br><b>Address1: </b> ${req.body.address1}
        <br><b>Address2: </b> ${req.body.address2}
        <br><b>City: </b> ${req.body.city}
        <br><b>State or Province: </b> ${req.body.state}
        <br><b>Postal Code: </b> ${req.body.zip}
        <br><b>Country: </b> ${req.body.country}
        <br><b>Additional Info</b><p>${req.body.msg}</p>
        <br><br>
        <b>Items: </b><br>`;

    if (items) {
        for (let itemId of items) {
            const item = await Item.findById(itemId);
            htmlEmail += `&emsp; <b>InventoryId: </b> ${item.InventoryId} <b>Title: </b> ${item.Title}<br> <a href="omniologycollection.com/item/${item_id}">Store Link</a>`;
        }
    }

    if (lots) {
        htmlEmail += `<br><b>Lots: </b><br>`;
        for (let lotId of lots) {
            const lot = await Lot.findById(lotId);
            htmlEmail += `&emsp; <b>Title: </b> ${lot.title}<br> <a href="omniologycollection.com/lot/${lot._id}">Store Link</a>`;
        }
    }

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "admin@omniologycollection.com",
            pass: process.env.EMAIL_ADMIN_PW
        }
    });

    transporter.sendMail({
        from: '"DeAnna Lowe" <admin@omniologycollection.com>',
        to: "admin@omniologycollection.com",
        subject: "Order from Outside US/Canada",
        html: htmlEmail
    },
    (err, info) => {
        if (err)
            console.log(err);
        else 
            console.log('Email sent: ' + info.response);
    });

    res.redirect("/");
}

module.exports.stripeWebhook = async(req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    // let event;
    // if (endpointSecret) {
        // try {
            // event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        // } catch (err) {
            // return res.status(400).send(`Webhook Error: ${err.message}`);
        // }
    // }

    if (payload.type === 'checkout.session.completed') {
        const session = payload.data.object;

        fullfillOrder(req, session);

        res.send();
    }
}
