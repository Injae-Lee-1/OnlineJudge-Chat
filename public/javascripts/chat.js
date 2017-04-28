var page = 1;

$(document).ready(function() {
  var time = new Date();
	
  update_chat_list(user_id, time);

  $('#chat_div').scroll(function() {
	if ($(this).scrollTop() === 0) {
      update_chat_list(user_id, time);
      $(this).scrollTop(40);
	}
  });

  $('#send_chat').click(function() {
    if ($('#chat_input').val() === '') return;
    send_msg();
    $('#chat_input').val('');
  });
	
  $('#chat_input').keyup(function (key) {
    if(key.keyCode == 13) $('#send_chat').click();
  });
	
  $(document).on('click', 'button[name="chat_user"]', function (event) {
    $('#chat_select').val(event.target.value).prop("selected", true);
  });
});


function update_user_list(data) {
  var user_list = data.user_list;
  $('#chat_users').empty();
  $('#chat_select').empty();
  $('#chat_users').append('<li class=\'list-group-item\' style=\'text-align: center\'>접속자 목록</li>');
  $('#chat_users').append('<li class=\'list-group-item\' style=\'text-align: center\'>나</li>');
  $('#chat_select').append('<option>전체</option>');
  user_list.forEach(function(user) {
    if (user.user_name != user_name) {
      var $li = $('<li class=\'list-group-item\' style=\'text-align: center\'>');
      var $btn = $('<button class=\'btn btn-link\' name=\'chat_user\'>').val(user.socket_id).text(user.user_name);
      $li.append($btn);
      $('#chat_users').append($li);
      $('#chat_select').append('<option value=\'' + user.socket_id + '\'>' + user.user_name + '</option>');
    }
  });
}

function update_chat_list(id, time) {
  var url = '/chat/' + id + '/' + page + '/' + time;
  $.ajax({
    url: url,
    method: 'get',
    dataType: 'json',
    success: function(chat_list) {
      chat_list.forEach(function (chat) {
        chat.prepend = true;
        receive_msg(chat);
	  });
      page++;
    }
  });
}

function receive_msg(data) {
  var message = data.message;
  var send_time = moment(data.send_time).tz("Asia/Seoul").locale('ko').format('LLL');
  var send_user_name = data.send_user_name;
  var direction = (send_user_name == user_name) ? 'right' : 'left';
  var whisper = data.whisper ? ' whisper' : '';
  if (data.whisper) send_user_name += '(To ' + data.receive_user_name + ')';

  var $user_name = $('<div class="header clearfix">')
  					.append('<strong class="pull-' + direction + ' primary-font">' + send_user_name + '</strong>');
  var $msg = $('<p>').text(message);
  var $time = $('<small class="pull-' + direction + ' text-muted">').text(send_time);
  var $msg_body = $('<div class="clearfix">').append($('<div>').addClass('chat-box col-xs-5 pull-' + direction + whisper).append($msg));
  var $chat_body = $('<div class="chat-body">').append($user_name, $msg_body, $time);
  var $chat_list_item = $('<li class="right clearfix">').append($chat_body);
	
  if (data.prepend)	$('#chat_list').prepend($chat_list_item);
  else {
    var scroll_top = $('#chat_div').scrollTop();
    var end_scroll = false;
	if ( $('#chat_div')[0].scrollHeight - scroll_top == $('#chat_div').outerHeight()) end_scroll = true;
    $('#chat_list').append($chat_list_item);
    if ( end_scroll ) $('#chat_div').scrollTop($('#chat_div')[0].scrollHeight);
  }
}

function send_msg() {
  var message = $('#chat_input').val();
  var receive_socket_id = $('select').val();
  var receive_user_name = $('select option:selected').text();
  socket.emit('send_msg', { message: message, receive_socket_id: receive_socket_id, receive_user_name: receive_user_name });
}