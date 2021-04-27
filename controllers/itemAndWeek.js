const Item = require('../models/item');
const Week = require('../models/week');


module.exports.renderWeek = async(req, res) => {
    const { num } = req.params;
    const date = new Date();

    const week = await Week.find({ number: num, month: date.getMonth() + 1, year: date.getFullYear() }).populate('items');

    res.render('week', { items: week[0].items, num, title: `Week ${num}` });
}


module.exports.renderItem = async(req, res) => {
    const { id } = req.params;
    const item = await Item.findById(id);
    res.render('item', { item, title: "Item" });
}