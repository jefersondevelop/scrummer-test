require('dotenv').config();
const Connection = require("../../config/mysql");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class ApplicationController {

  constructor() {
    this.connection = Connection();
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.userRegistered = this.userRegistered.bind(this);
  }

  async login(req, res, next) {

    let {email, password} = req.body

    if(email===null || email===undefined || password===null || password===undefined){
      return res.json({
        status: 500,
        message: "Sorry, email and password must be provideed."
      })
    }


    this.connection.query(
      `SELECT id, email, password, status FROM user WHERE email = '${ email }'`,
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err });
        }

        if(result.length === 0 || !bcrypt.compareSync(password, result[0].password)){
          return res.json({ 
            status: 500,
            message: 'Email or password is incorrect.'
          }); 
        }

        if(parseInt(result[0].status) !== 1 ){
          return res.status(200).json({
            status: 500,
            message: 'User is inactive.'
          })
        }        

        delete result[0].password

        let session_token = jwt.sign({
            usuario: result[0]
        }, process.env.SEED, { expiresIn: process.env.TOKEN_TIME_EXPIRATION });

        res.status(200).json({
          status: 200,
          massage: "User found.",
          user: result[0],
          token: session_token
        });
      }
    );
  }

  async userRegistered(req, res, next){
    const {email} = req.body

    if(email===null || email===undefined){
      return res.json({
        status: 500,
        message: "Sorry, email must be provideed."
      })
    }

    this.connection.query(`SELECT * FROM user WHERE email = '${ email }'`, (err, result) => {
      
      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }

      if(result.length !== 0){
        return res.json({
          status:500,
          message: 'Sorry, email has already been registered',
        })
      }

      next();
    })

  }

  async register(req, res, next){

    const body = req.body

    if(Object.keys(body).length === 0 || body.constructor !== Object || body === "" || body === null || body === undefined){
      return res.json({
        status: 500,
        message: "Data must be provided"
      })
    }

    if(body.email === "" || body.email === undefined || body.email === null || 
        body.password === "" || body.password === undefined || body.password === null || 
          body.confirm_password === "" || body.confirm_password === undefined || body.confirm_password === null ){
      
      return res.json({
        status: 500,
        message: "Sorry, password and confirm_password must be provided"
      })
    }

    if(body.password !== body.confirm_password) {
      return res.json({
        status: 500,
        message: "Password and confirm_password must be equals."
      })
    }

    let {email, password, confirm_password} = body

    this.connection.query(`INSERT INTO user(email, password) VALUES('${ email }', '${ bcrypt.hashSync(password, 10) }')`, (err, result) => {

      if(err){
        return res.status(500).json({
          status: 500,
          err
        })
      }  

      this.connection.query(`SELECT id, email, password, status FROM user WHERE id = ${ result.insertId }`, (err, resultUser) => {
        if(err){
          return res.status(500).json({
            status: 500,
            err
          })
        }

        delete resultUser[0].password

        return res.status(200).json({
          status:200,
          message: 'User has been registered succesully.',
          user: resultUser[0]
        })
      })
    });
  }

}

module.exports = new ApplicationController();
