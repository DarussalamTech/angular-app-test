const express = require('express');
const router = express.Router();
const {User} = require('../sequelize');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const config = require('../config/database');
const log = require('../log');

// register user
router.post('/register', (req, res, next) => {
  let response = {success: false};
  if (!(req.body.password === req.body.confirmPass)) {
      response.msg = "The passwords don\'t match";
      res.json(response);
  } else {
      let newUser = {
          username: req.body.username,
          password: req.body.password,
          role: req.body.Role,
          status:"Offline"
      };

      bcryptjs.genSalt(10, (err, salt) => {
          bcryptjs.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                  return callback({msg: "There was an error registering the new user"});
              }
              newUser.password = hash;
              isUsernameUnique(req.body.username).then(isUnique => {
                  if (isUnique) {
                      User.create(newUser).then(user => res.json(user));
                      response.success = true;
                      response.msg = "User registered successfully";
                      res.json(response);
                  } else {
                      response.success = false;
                      response.msg = "User already exist";
                      res.json(response);
                  }
              });
          });
      });
  }
});

function isUsernameUnique(username) {
    return User.count({where:{username: username}})
        .then(count => {
            if(count !== 0) {
                return false;
            }
            return true;
        });
}



//user login route
router.post("/authenticate", (req, res, next) => {

    let body = req.body;
    let response = {success: false};
    User.findOne({ where: {username: body.username} }).then(user => {
        if(!user){
            response.msg = "User not exist";
            res.json(response);
        } else {

            bcryptjs.compare(body.password, user.password, (err, result) => {
                if (result === true) {

                    //updating status Online
                    User.update({status: 'Online'},{where: {id: user.id}});

                    let signData = {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        status: 'Online'
                    };
                    let token = jwt.sign(signData, config.secret, {
                        expiresIn: 604800
                    });

                    response.token = "JWT " + token;
                    response.user = signData;
                    response.success = true;
                    response.msg = "User authenticated successfully";
                    console.log("[%s] authenticated successfully", user.username);
                    res.json(response);
                } else {
                    response.msg = "Wrong username or password";
                    res.json(response);
                }
            });
        }
    });
});

//user logout route
router.post("/logout", (req, res, next) => {

    let body = req.body;
    console.log(body);
    let response = {success: false};
    //updating status Online
    User.update({status: 'Offline'},{where: {id: body.id}});
    response.success = true;
    response.msg = "User Loggedout successfully";
    res.json(response);

});

// profile
router.get('/profile', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  response.msg = "Profile retrieved successfully";
  response.user = req.user;
  res.json(response);
});

// user list
router.get('/',  (req, res, next) => {
  User.findAll({where:{role:"Buyer"}}).then(user => {
      let response = {success: true, user: user};
      return res.json(response);
    }).catch(err => {
        console.log(err);
      log.err('mysql', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

// get online buyers
router.post('/getOnlineBuyers',  (req, res, next) => {
    User.findAll({where:{role:"Buyer",status:"Online"}},{attributes: ['username']}).then(user => {
        let response = {success: true, user: user};
        return res.json(response);
    }).catch(err => {
        console.log(err);
        log.err('mysql', 'failed to get users', err.message || err);
        return next(new Error('Failed to get users'));
    });
});

module.exports = router;