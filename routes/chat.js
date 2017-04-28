var express = require('express');
var router = express.Router();
var Chat = require('../models/chat_model');

router.use('/', function (req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
});

router.get('/:id/:page/:time', function (req, res, next) {
  var id = req.params.id;
  var page = req.params.page;
  var time = req.params.time;
  Chat.paginate({ $and : [
                          { $or : [{ receive_user_id: null }, { receive_user_id: id }, { send_user_id: id }] },
                          { send_time : { $lte : time } }
                         ] },
				{ sort: '-send_time', page: page, limit: 10 }, function(err, result) {
	  res.send(result.docs);
  });
});

module.exports = router;