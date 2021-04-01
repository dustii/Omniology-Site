const mongoose = require('mongoose');
const Item = require('../models/item');

mongoose.connect('mongodb://localhost:27017/omniology', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connection successful");
});

const convertToArray = async () => {
    let ops = [];
    let thumbnails;
    Item.find({ "PhotoThumbnails": { "$type": 2 } }).then(docs => docs.forEach( async (doc) => {

        if (doc.PhotoThumbnails[0].split(',').length == 1)
            return;
        
        thumbnails = doc.PhotoThumbnails[0].split(',');
        thumbnails = thumbnails.map(nail => nail.trim());

        await Item.updateOne({ _id: doc._id }, { PhotoThumbnails: thumbnails });

        // ops.push({
        //     "updateOne": {
        //         "filter": { "_id": doc._id },
        //         "update": { "$set": { "PhotoThumbnails": thumbnails } }
        //     }
        // });
        
        // if (ops.length >= 1000) {
        //     Item.bulkWrite(ops);
        //     ops = [];
        // }
    })).catch(err => console.log(err));

    // if (ops.length > 0) {
    //     Item.bulkWrite(ops);
    //     ops = [];
    // }

    Item.find({}).then(data => console.log(data));
}

convertToArray();

const testConvertToArray = async () => {
    const doc = await Item.findOne({});
    
    console.log(doc);
    console.log(doc.PhotoThumbnails);
    //const thumbnails = doc.PhotoThumbnails.split(',');
    //console.log(thumbnails);

}

// testConvertToArray();