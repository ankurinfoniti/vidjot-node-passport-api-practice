const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

const UserModel = require('../models/User');

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

router.post('/register', async (req, res) => {
  let errors = {};

  if (!req.body.name) {
    errors.name = ['Please add user name'];
  }

  if (!req.body.email) {
    errors.email = ['Please add email'];
  }

  if (!req.body.password) {
    errors.password = ['Please add password'];
  }

  if (req.body.password.length < 4 && !errors.password) {
    errors.password = ['Password must be at least 4 character'];
  }

  if (req.body.password != req.body.password2 && !errors.password) {
    errors.password = ['Password do not match'];
  }

  if (errors.name || errors.email || errors.password) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2,
    });
  } else {
    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (existingUser !== null) {
      req.flash('success_msg', 'Email already registered');
      res.redirect('/users/login');
      return;
    }

    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };

    newUser.password = await bcrypt.hash(newUser.password, 10);

    const user = new UserModel(newUser);
    await user.save();

    req.flash('success_msg', 'You are now registerd and can login');
    res.redirect('/users/login');
  }
});

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
