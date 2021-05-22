const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    session: Object,
    stripeSession: Object,
    shipping: Object,
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
    lots: [{
        type: Schema.Types.ObjectId,
        ref: 'Lot'
    }]
});

module.exports = mongoose.model('Order', orderSchema);