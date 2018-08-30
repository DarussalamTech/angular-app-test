const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const {User} = require('../sequelize');
const config = require('./database');

module.exports = (passport) => {
  let options = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };

  passport.use(new JwtStrategy(options, (jwt_payload, done) => {
    User.findById(jwt_payload.id).then(user => {
      if (user) {
        let signData = {
          id: user._id,
          username: user.username
        };
        return done(null, signData);
      } else {
        return done(null, false);
      }
    });
  }));
};
