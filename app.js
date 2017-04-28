var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var mongoose = require('mongoose');
var moment = require('moment-timezone');

var app = express();
var port = process.env.PORT || 3000;
var db = mongoose.connection;
  db.on('error', console.error);
  db.once('open', function(){
      console.log("Connected to mongod server");
  });
  mongoose.connect('mongodb://localhost:27017/missiondb');

var index = require('./routes/index');
var compiler = require('./routes/compiler');
var login = require('./routes/login');
var main = require('./routes/main');
var upload = require('./routes/upload');
var users = require('./routes/users');
var chat = require('./routes/chat');

var Chat = require('./models/chat_model');

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/compiler', compiler);
app.use('/login', login);
app.use('/main', main);
app.use('/upload', upload);
app.use('/users', users);
app.use('/signup', users);
app.use('/chat', chat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.set('server', server);

var io = require('socket.io').listen(server);
var user_list = [];
var socket_list = {};
io.sockets.on('connection', function (socket) {
  socket.on('connected_user_name', function (data) {
    socket.user_name = data.user_name;
    socket.user_id = data.user_id;
	socket_list[socket.id] = socket;
    console.log(socket.user_name + '(' + socket.id + ') is connected');
	user_list.push({ user_name: socket.user_name, socket_id: socket.id });
	
    io.emit('update_user_list', { user_list: user_list });
  });
 
  socket.on('send_msg', function (data) {
    var time = new Date();
	var msg_data =  { message: data.message, send_user_name: socket.user_name, send_time: time};
	  
	if (data.receive_socket_id == '전체') {
      msg_data.whisper = false;
      io.emit('receive_msg', msg_data);
    } else {
      msg_data.whisper = true;
      msg_data.receive_user_name = data.receive_user_name;
      io.to(data.receive_socket_id).emit('receive_msg', msg_data);
      socket.emit('receive_msg', msg_data);
	}
	  
    var chat = new Chat();
    chat.send_user_id = socket.user_id;
    chat.send_user_name = socket.user_name;
	chat.message = data.message;
    chat.send_time = time;
    if (data.receive_socket_id != '전체') {
      chat.receive_user_id = socket_list[data.receive_socket_id].user_id;
      chat.receive_user_name = data.receive_user_name;
      chat.whisper = true;
	}
	chat.save(function (err) {
      if (err) console.log(err);
    });
	
  });
	
  socket.on('disconnect', function () {
    console.log(socket.user_name + '(' + socket.id + ') is disconnected');
    for (var i = 0; i < user_list.length; i++) {
      if (user_list[i].user_name == socket.user_name) {
        user_list.splice(i, 1);
        break;
	  }
	}
    delete socket_list[socket.id];
    socket.broadcast.emit('update_user_list', { user_list: user_list });
  });
	
});

