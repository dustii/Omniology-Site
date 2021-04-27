const mongoose = require('mongoose');
const { Schema } = mongoose;

const homepageSchema = new Schema({
    thisMonth: String,
    nextMonth: String,
    nextNextMonth: String
});

module.exports = mongoose.model('Homepage', homepageSchema);