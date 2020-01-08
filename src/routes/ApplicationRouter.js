const express = require('express');
const app = express();

const ApplicationController = require('../controllers/ApplicationController');
const {verifyJWTToken} = require('../middlewares/Authentication');

app.post('/login', ApplicationController.login);
app.post('/register', ApplicationController.userRegistered, ApplicationController.register);

module.exports = app;