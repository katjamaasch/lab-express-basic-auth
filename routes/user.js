const { Router } = require('express');
const bcrypt = require('bcryptjs');
const router = Router();
const User = require('./../models/user');

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const data = req.body;
  console.log(data);
  User.findOne({ username: data.username })
    .then((user) => {
      if (user) {
        throw new Error('There is already a user with that email.');
      } else {
        return bcrypt.hash(data.password, 10);
      }
    })
    .then((passwordHashAndSalt) => {
      return User.create({
        username: data.username,
        passwordHashAndSalt: passwordHashAndSalt
      });
    })
    .then((user) => {
      //req.session.userId = user._id;
      res.render('confirmation');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/profile', (req, res, next) => {
  res.render('profile');
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const data = req.body;
  User.findOne({
    username: data.username
  })
    .then((user) => {
      //console.log('user: ', user);
      //console.log('user hash password: ', user.passwordHashAndSalt);
      //console.log('data.password: ', data.password);
      if (user) {
        return bcrypt.compare(data.password, user.passwordHashAndSalt);
      } else {
        throw new Error('Username does not exist');
      }
    })
    .then((result) => {
      if (result) {
        res.render('profile');
      } else {
        throw new Error('Wrong password!');
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/log-out', (req, res, next) => {
  const data = req.body;
  console.log(data);
  res.redirect('/');
});

module.exports = router;
