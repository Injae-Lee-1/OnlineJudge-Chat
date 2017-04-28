var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) return res.render('index', { auth: true, user_id: req.session.user.user_id });
  else return res.render('index', { auth: false, user_id: '' });
});

module.exports = router;