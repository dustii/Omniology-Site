if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const schedule = require('node-schedule');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);

const ExpressError = require('./utils/ExpressError');
const db = require('./mongoose/mongoosedb');
const User = require('./models/user');
const Homepage = require('./models/homepage');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const generalRoutes = require('./routes/general');
const itemAndWeekRoutes = require('./routes/itemAndWeek');


const app = express();


app.set('view engine', 'ejs'); //uses ejs as the view engine
app.set('views', path.join(__dirname, 'views')); //informs absolute location of views directory

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/omniology';
const secret = process.env.SECRET || 'nonefornow';
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(err) {
    console.log("Session Store Error", err);
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //forces https, doesn't work on localhost
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //cookie expires in one week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.cart = req.session.cart;
    next();
});

app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.static(path.join(__dirname, 'public'))); //provides static directory to respond with assets
app.use(express.urlencoded({ extended: true })); //allows parsing of POST body
app.use(express.json());

app.engine('ejs', ejsMate);

app.use('/', generalRoutes);
app.use('/admin', adminRoutes);
app.use('/', userRoutes);
app.use('/', itemAndWeekRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', { err });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const job = schedule.scheduleJob('* * * 1 *', async() => {
    const homepage = await Homepage.findOne({});
    homepage.thisMonth = homepage.nextMonth;
    homepage.nextMonth = homepage.nextNextMonth;
    homepage.save();
});