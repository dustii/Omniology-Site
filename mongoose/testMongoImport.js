const mongoose = require('mongoose');
const Item = require('../models/item');

mongoose.connect('mongodb://localhost:27017/omniology', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connection successful");
});

const createItem = async () => {
    await Item.create({
        InventoryId: 'TestId',
        Title: 'Test Title',
        Description: 'Test Description',
        PhotoThumbnails: ['1stTestPhoto.jpg', '2ndTestPhoto.jpg'],
        Weight: '250 grams',
        Measurements: '12.7cm (5in) x 7.0cm (2.7in)',
        AdditionalTests: 'Test additional tests',
        PurchasedFrom: 'test store',
        PurchasedPrice: 35.54,
        ListPrice: 63.54,
        ShippingDate: '2021-06-14'
    });
    console.log(Item.find({}));
}

createItem();