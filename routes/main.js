var express = require('express');
var router = express.Router();
var fs = require('fs');

router.use('/', function(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
});

router.get('/', function(req, res, next) {
  res.render('main',{ user: req.session.user });
});



module.exports = router;