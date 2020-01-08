require('dotenv').config();
const expressValidator = require('express-validator');
const bodyParser = require("body-parser");
const RouteLoader = require("./routes");
const fileUpload = require('express-fileupload');
const express = require('express');

const path = require('path');

let app = express();

const port = process.env.NODE_PORT || 3000;

app.use(bodyParser.json());
app = RouteLoader.load(app);

app.listen(port, (err) => {

    if (err) throw new Error(err);
    console.log(`Servidor corriendo en puerto ${ port }`);

});