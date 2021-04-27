const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const regUser = await User.register(user, password);
        req.login(regUser, err => {
            if (err) return next(err);
            req.flash('success', "Welcome to the Omniology Collection!");
            res.redirect('/');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', "Invalid username/password combination");
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success', "Welcome back!");
            return res.redirect('/');
        });
    }) (req, res, next);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "See you later!");
    res.redirect('/');
}
