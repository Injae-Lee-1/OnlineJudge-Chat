var express = require('express');
var router = express.Router();
var User = require('../models/users_model');
var crypto = require('crypto');

router.get('/', function(req, res, next) {
  if (req.session.user) return res.redirect('/');
  else return res.render('signup');
});

router.get('/id/:id', function(req, res, next) {
  var id = req.params.id;
  User.findOne({ user_id: id }, function (err, user) {
    if (err) return res.status(500).json({ error: err });
    if (user) return res.send({ result: false });
    res.send({ result: true });
  });
});

router.get('/name/:name', function(req, res, next) {
  var name = req.params.name;
  User.findOne({ user_name: name }, function (err, user) {
    if (err) return res.status(500).json({ error: err });
    if (user) return res.send({ result: false });
    res.send({ result: true });
  });
});

router.post('/', function(req, res, next) {
  var sha1 = crypto.createHash('sha1');
  var salt = req.body.email;
  sha1.update(req.body.user_pw + salt);
  var pw = sha1.digest('hex');
  
	
  var user = new User();
  user.user_id = req.body.user_id;
  user.user_pw = pw;
  user.email = req.body.email;
  user.user_name = req.body.user_name;
  user.save(function (err) {
    if (err) res.send(err);
    res.redirect('/');
  });
});

module.exports = router;