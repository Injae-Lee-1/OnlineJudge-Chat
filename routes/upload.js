var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');
var fs = require('fs');
var tar = require('tar-fs');
var unzip = require('unzip');
var path = require('path');

var user_directory = '';
router.use(function (req, res, next){
  if (!req.session.user) return res.redirect('/login');
  user_directory = __dirname + '/../uploads/' + req.session.user.user_id;
  dir_check();
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, user_directory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  storage: storage,
  limits: { fieldSize: 104857600 }
});

router.get('/uploded_file', function(req, res, next) {
  var file_name = req.query.file_name;
  var contents = fs.readFileSync(user_directory + '/' + file_name);
  res.send({ file_name: file_name, contents: contents.toString() });
});

router.get('/uploded_files', function(req, res, next) {
  read_filelist(user_directory, send_filelist, req, res);
});

router.post('/', upload.any(), function(req, res, next) {
  var file_name = req.files[0].filename;
  var tar_extract = tar.extract(user_directory);
  var zip_extract = unzip.Extract({ path: user_directory });
  var readStream = fs.createReadStream(user_directory + '/' + file_name);
  if (path.extname(file_name) == '.tar') {
    readStream.pipe(tar_extract);
    fs.unlink(user_directory + '/' + file_name);
  } else if (path.extname(file_name) == '.zip') {
    readStream.pipe(zip_extract);
    fs.unlink(user_directory + '/' + file_name);
  }

  return res.send({ extract_success: true });
});

router.put('/', function(req, res, next) {
  var file_name = req.body.file_name;
  var content = req.body.content;
  fs.writeFile(user_directory + '/'+ file_name, content, 'utf8', function (err) {
	  if (err) return res.send(err);
	  return res.send({ success: true });
  });
});

function read_filelist(dir, done, req, res) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results, req, res);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          read_filelist(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
}

function send_filelist(err, results, req, res) {
  var entire_files = [];
  for (var i = 0; i < results.length; i++)
    entire_files.push(results[i].substring(user_directory.length + 1));
  if (err) throw err;
  res.send({ uploded_files: req.files, entire_files: entire_files });
}

function dir_check() {
  if (!fs.existsSync(user_directory))
    fs.mkdirSync(user_directory);
}
	
module.exports = router;