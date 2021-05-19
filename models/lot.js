const mongoose = require('mongoose');
const { Schema } = mongoose;

const lotSchema = new Schema({
    title: String,
    sold: {
        type: Boolean,
        default: false
    },
    listPrice: Number,
    week: {
        type: Schema.Types.ObjectId,
        ref: 'Week'
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }]
});

module.exports = mongoose.model('Lot', lotSchema);
    