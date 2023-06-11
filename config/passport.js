const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const UserModel = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },
      async function (email, password, done) {
        // Match user
        const user = await UserModel.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: 'No User Found' });
        }

        // match password
        const isMatched = await bcrypt.compare(password, user.password);
        if (isMatched) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password Incorrect' });
        }
      }
    )
  );

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user.id);
    });
  });

  passport.deserializeUser(async function (id, cb) {
    const user = await UserModel.findById(id);
    return cb(null, user);
  });
};
