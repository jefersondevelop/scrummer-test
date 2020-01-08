const jwt = require('jsonwebtoken');
require('dotenv').config();

let verifyJWTToken = (req, res, next) => { //method to valid the jwt token

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.json({
                status: 401,
                message: 'El Token ya no es válido.'
            });
        }
        
        req.usuario = decoded.usuario;
        next();

    });



};

module.exports = {
    verifyJWTToken
}