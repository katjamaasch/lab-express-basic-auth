const { Router } = require('express');
const bcrypt = require('bcryptjs');
const router = Router();
const User = require('./../models/user');

router.get('/main', (req, res, next) => {
  res.render('main');
});

router.get('/private', (req, res, next) => {
  res.render('private');
});

router.post('/edit', (req, res, next) => {
  const data = req.body;
  console.log(req.body);
  User.findByIdAndUpdate(req.session.userId, {
    username: data.newName
  })
    .then(() => {
      res.redirect('/user/profile');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const data = req.body;
  console.log(data);
  User.findOne({ username: data.username })
    .then((userobject) => {
      if (userobject) {
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
    .then(() => {
      //req.session.userId = user._id;
      res.render('confirmation');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/profile', (req, res, next) => {
  //property userId only exists when user is authenticated
  //as its created in the log-in process
  const user = req.user;
  //this is because of the deserialisation middleware!
  //there the user is defined as req.user
  if (user) {
    res.render('profile', { user });
  } else {
    next(new Error('You are not logged in.'));
  }
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const data = req.body;
  let user;
  User.findOne({
    username: data.username
  })
    .then((userobject) => {
      user = userobject;
      //console.log('user: ', user);
      //console.log('user hash password: ', user.passwordHashAndSalt);
      //console.log('data.password: ', data.password);
      if (userobject) {
        return bcrypt.compare(data.password, userobject.passwordHashAndSalt);
      } else {
        throw new Error('Username does not exist');
      }
    })
    .then((result) => {
      if (result) {
        //creating a new property, userId,
        //in the req.session object and assigning it the
        // users id
        req.session.userId = user._id;
        console.log('The user is authenticated.');
        res.redirect('/user/profile');
      } else {
        throw new Error('Wrong password!');
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/log-out', (req, res, next) => {
  //req.session.userId = undefined;
  // delete req.session.userId;
  // --> destroying the cookie and
  // deleting the session from the database:
  req.session.destroy();

  res.redirect('/');
});

module.exports = router;
