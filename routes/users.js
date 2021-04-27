const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');

router.get('/register', users.renderRegForm);

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLoginForm);

router.post('/login', users.login);

router.get('/logout', users.logout);

module.exports = router;
