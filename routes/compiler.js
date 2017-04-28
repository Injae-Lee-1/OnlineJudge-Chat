var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');

var user_directory = '';
router.use(function (req, res, next){
  if (!req.session.user) return res.redirect('/login');
  user_directory = __dirname + '/../outputs/' + req.session.user.user_id;
  dir_check();
  file_check();
  next();
});

router.get('/:file_name', function(req, res, next) {
  var file_path = __dirname + '/../uploads/' + req.session.user.user_id + '/';
  var file_name = req.params.file_name;
	
  var child_process;
  var args = [];
  var compiler;
  if (path.extname(file_name) == '.c') {
    compiler = 'gcc';
    args = [file_path + file_name, '-std=c99', '-o', user_directory + '/output.out'];
	compile_c_cpp(req, res, compiler, args);
  } else if (path.extname(file_name) == '.cpp') {
    compiler = 'g++';
    args = [file_path + file_name, '-o', user_directory + '/output.out'];
	compile_c_cpp(req, res, compiler, args);
  } else if (path.extname(file_name) == '.py') {
	execute_file(req, res, 'python ' + file_path + file_name, 0);
  } else {
      return res.send({ err: '.c, .cpp, .py 파일의 경우에만 실행 가능합니다.' });
  }
  
});

function dir_check() {
  if (!fs.existsSync(user_directory)) fs.mkdirSync(user_directory);
}

function file_check() {
  if (fs.existsSync(user_directory + '/output.txt')) fs.unlinkSync(user_directory + '/output.txt');
}

function compile_c_cpp(req, res, compiler, args) {
  var child_process = spawn(compiler, args, { shell: true });
  child_process.stdout.on('data', function (data) {
    console.log(data);
  });
  child_process.stderr.on('data', function (err) {
    console.log('stderr: ' + err);
  });
  child_process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    execute_file(req, res, user_directory + '/output.out', code);
  });
}

function execute_file(req, res, excuteFile, code) {
	var test_case = __dirname + '/../input.txt';
    var output_text = user_directory + '/output.txt';
    var correct_text = __dirname + '/../correct.txt';
    if (code === 0) {
	  try {
	    var run = execSync(excuteFile + ' < ' + test_case + ' > ' + output_text , { shell: true });
		console.log('output: ' + fs.readFileSync(output_text));
        console.log('correct_text: ' + fs.readFileSync(correct_text));
	  } catch (err) {
	    return res.send({ err: '실행 에러' });
	  }
      var compare = exec('diff ' + output_text + ' ' + correct_text + ' -b', { shell: true }, function (err, stdout, stderr) {
	    console.log(stdout);
	    return res.send({ result : stdout });
	  }); 
    } else if (code === 1) {
      return res.send({ err: '컴파일 에러' });
    }
}

module.exports = router;