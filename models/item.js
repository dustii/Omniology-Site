const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    InventoryId: String,
    Title: String,
    Description: String,
    PhotoThumbnails: [String],
    Weight: String,
    Measurements: String,
    AdditionalTests: String,
    PurchasedFrom: String,
    PurchasePrice: Number,
    ListPrice: Number,
    SoldPrice: Number,
    ShippingDate: Date
});

module.exports = mongoose.model('Item', itemSchema);