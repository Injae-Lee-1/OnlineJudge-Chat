var express = require('express');
var router = express.Router();
var User = require('../models/users_model');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.user) return res.redirect('/');
  else return res.render('login', { msg: '' });
});

router.get('/logout', function(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  deleteFolderRecursive(__dirname + '/../uploads/' + req.session.user.user_id);
  req.session.destroy();
  res.redirect('/');
});

router.post('/', function(req, res, next) {
  var user_id = req.body.user_id;
  var user_pw = req.body.user_pw;

  User.findOne({user_id:user_id}, function (err, user){
    if (err) return res.send(err);
    if (user) {
      var sha1 = crypto.createHash('sha1');
      var salt = user.email;
      sha1.update(user_pw + salt);
      var digest = sha1.digest('hex');
      if (user.user_pw == digest) {
        req.session.user = user;
        return res.redirect('/main');
      }
    }
    return res.render('login', { msg: '아이디 혹은 비밀번호를 확인해주세요.' });
  });
});

function deleteFolderRecursive(path) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file) {
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
  fs.rmdirSync(path);
  }
}

module.exports = router;
