const mongoose = require('mongoose');
// const dbUrl = 'mongodb://localhost:27017/omniology';
const dbUrl = 'mongodb+srv://Dustin:Ud^rX^!s48eE@omniology.giuza.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

// mongoose.connect('mongodb://localhost:27017/omniology', {
mongoose.connect(dbUrl, {
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

module.exports = db;