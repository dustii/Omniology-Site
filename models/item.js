const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    InventoryId: String,
    Title: String,
    Description: String,
    PhotoThumbnails: [String],
    Weight: Number,
    Length: Number,
    Width: Number,
    Height: Number,
    AdditionalTests: String,
    PurchasedFrom: String,
    PurchasePrice: Number,
    ListPrice: Number,
    SoldPrice: Number,
    ShippingDate: Date,
    Sold: {
        type: Boolean,
        default: false
    },
    Week: {
        type: Schema.Types.ObjectId,
        ref: 'Week'
    }
});

itemSchema.virtual('PhotosSrc').get(function() {
    return this.PhotoThumbnails.map((photo) => { return `/images/items/${photo}`.split(" ").join("%20"); });
});
itemSchema.virtual('StripePhotos').get(function() {
    return this.PhotoThumbnails.map((photo) => { return `http://localhost:3000/images/items/${photo}`.split(" ").join("%20"); });
});
itemSchema.virtual('YMDdate').get(function() {
    if (this.ShippingDate) {

        let year = this.ShippingDate.getFullYear();
        let month = this.ShippingDate.getMonth() + 1;
        let day = this.ShippingDate.getDate();

        if (month < 10)
            month = '0' + month;
        if (day.length < 10)
            day = '0' + day;

        return [year, month, day].join("-");
    }
});

module.exports = mongoose.model('Item', itemSchema);