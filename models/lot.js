const mongoose = require('mongoose');
const { Schema } = mongoose;

const lotSchema = new Schema({
    title: String,
    sold: {
        type: Boolean,
        default: false
    },
    listPrice: Number,
    lotPhoto: String,
    week: {
        type: Schema.Types.ObjectId,
        ref: 'Week'
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }]
});

lotSchema.virtual('PhotoSrc').get(function() {
    return `/images/items/${this.lotPhoto}`.split(" ").join("%20");
});

module.exports = mongoose.model('Lot', lotSchema);
    