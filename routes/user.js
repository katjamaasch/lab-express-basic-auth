const { Router } = require('express');
const router = Router();
const User = require('./../models/user');

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const data = req.body;
  console.log(data);
  res.redirect('/');
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const data = req.body;
  res.render('profile', { data });
});

router.post('/log-out', (req, res, next) => {
  const data = req.body;
  console.log(data);
  res.redirect('/');
});

module.exports = router;
