const Item = require('../models/item');
const Week = require('../models/week');
const Homepage = require('../models/homepage');
const uniqid = require('uniqid');


module.exports.renderAdmin = (req, res) => {
    res.render('admin', { title: "Admin" });
}


module.exports.renderUpload = (req, res) => {
    res.render('uploadItem', { title: "Upload Item" });
}


module.exports.uploadItem = async(req, res) => {
    const itemBody = {
        InventoryId: req.body.InventoryId || uniqid.time(),
        Title: req.body.Title,
        Description: req.body.Description,
        Weight: req.body.Weight,
        Length: req.body.Length,
        Width: req.body.Width,
        Height: req.body.Height,
        AdditionalTests: req.body.AdditonalTests,
        PurchasedFrom: req.body.PurchasedFrom,
        PurchasePrice: req.body.PurchasePrice,
        ListPrice: req.body.ListPrice,
        SoldPrice: req.body.SoldPrice,
        ShippingDate: req.body.ShippingDate
    }
    const item = new Item(itemBody);
    
    item.PhotoThumbnails = [];
    req.files.forEach(file => {
        item.PhotoThumbnails.push(file.filename);
    });

    if (req.body.week !== "none") {
        let week = await Week.find({ number: req.body.week, month: req.body.month, year: req.body.year });
        if (week.length === 0) {
            week = new Week({ number: req.body.week, month: req.body.month, year: req.body.year });
            week.items = [item];
            await week.save();
        }
        else {
            week[0].items.push(item);
            await week[0].save();
        }

        item.Week = week;
    }

    await item.save();

    req.flash('success', "Uploaded new item");
    res.redirect('/admin');
}


module.exports.renderIndex = async(req, res) => {
    const items = await Item.find({});
    res.render('itemIndex', { items, title: "Item Index" });
}


module.exports.renderEdit = async(req, res) => {
    const { id } = req.params;
    const item = await Item.findById(id).populate('Week');
    res.render('itemEdit', { item, title: "Edit Item" });
}


module.exports.editItem = async(req, res) => {
    const item = await Item.findById(req.params.id);

    item.InventoryId = req.body.InventoryId;
    item.Title = req.body.Title;
    item.Description = req.body.Description;
    item.Weight = req.body.Weight;
    item.Length = req.body.Length;
    item.Width = req.body.Width;
    item.Height = req.body.Height;
    item.AdditionalTests = req.body.AdditionalTests;
    item.PurchasedFrom = req.body.PurchasedFrom;
    item.PurchasePrice = req.body.PurchasePrice;
    item.ListPrice = req.body.ListPrice;
    item.SoldPrice = req.body.SoldPrice;
    item.ShippingDate = req.body.ShippingDate;

    if (!Array.isArray(req.body.removePhoto))
        req.body.removePhoto = [req.body.removePhoto];
        
    for (let photo of req.body.removePhoto) {
        const index = item.PhotoThumbnails.indexOf(photo);
        item.PhotoThumbnails.splice(index, 1);
    }

    if (!Array.isArray(item.PhotoThumbnails))
        item.PhotoThumbnails = [];

    for (let file of req.files) {
        item.PhotoThumbnails.push(file.filename);
    }

    if (item.Week !== undefined) {
        const oldWeek = await Week.findById(item.Week);
        const index = oldWeek.items.indexOf(item._id);
        oldWeek.items.splice(index, 1);
        oldWeek.save();
    }

    if (req.body.week !== "none") {
        let week = await Week.findOne({ number: req.body.week, month: req.body.month, year: req.body.year });
        if (!week) {
            week = new Week({ number: req.body.week, month: req.body.month, year: req.body.year });
            week.items = [item];
            await week.save();
        }
        else {
            week.items.push(item);
            await week.save();
        }

        item.Week = week;
    }
    else
        delete item.Week;

    item.save();

    req.flash('success', "Item Updated");
    res.redirect('/admin');
}


module.exports.renderEditHomepage = async(req, res) => {
    const homepage = await Homepage.findOne({});
    res.render('editHomePage', { homepage });
}


module.exports.editHomepage = async(req, res) => {
    const homepage = await Homepage.findOne({});
    homepage.thisMonth = req.body.thisMonth;
    homepage.nextMonth = req.body.nextMonth;
    homepage.nextNextMonth = req.body.nextNextMonth;
    homepage.save();
    req.flash('success', "Edited Themes");
    res.redirect('/admin');
}