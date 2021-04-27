const mongoose = require('mongoose');
const Week = require('../models/week');
const Item = require('../models/item');
const db = require('./mongoosedb');

const newWeek = async() => {
    const items = await Item.find({});
    const weekOne = new Week({
        number: '1',
        release: '2021/05/04',
        items: items
    });
    await weekOne.save();
}

newWeek();