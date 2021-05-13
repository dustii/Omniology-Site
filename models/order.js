const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    session: Object,
    order: Object
});

module.exports = mongoose.model('Order', orderSchema);