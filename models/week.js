const mongoose = require('mongoose');
const { Schema } = mongoose;

const weekSchema = new Schema({
    number: {
        type: String,
        enum: ['1', '2', '3', '4', 'none']
    },
    month: Number,
    year: Number,
    items: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Item'
        }
    ]
});

module.exports = mongoose.model('Week', weekSchema);