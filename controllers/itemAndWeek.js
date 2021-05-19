const Item = require('../models/item');
const Lot = require('../models/lot');
const Week = require('../models/week');


module.exports.renderWeek = async(req, res) => {
    const { num } = req.params;
    const date = new Date();

    const week = await Week.findOne({ number: num, month: date.getMonth() + 1, year: date.getFullYear() })
        .populate('items')
        .populate({
            path: 'lots',
            populate: 'items'
        });

    res.render('week', { items: week.items, lots: week.lots, num, title: `Week ${num}` });
}


module.exports.renderItem = async(req, res) => {
    const { id } = req.params;
    const date = new Date();
    const item = await Item.findById(id)
    .populate({
        path: 'Lot',
        populate: 'week'
    });

    if (item.Lot && item.Lot.week.month == date.getMonth() + 1 && item.Lot.week.year == date.getFullYear())
        item.inLot = true;
    
    res.render('item', { item, title: "Item" });
}

module.exports.renderLot = async(req, res) => {
    const { id } = req.params;
    const lot = await Lot.findById(id).populate('items');
    res.render('lot', { lot, title: "Lot" });
}