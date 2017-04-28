var editor;

$(document).ready(function () {
  set_file_list();

  $(document).on('keydown', editor, function(key) {
    if(key.ctrlKey && key.which === 83) {
        $('#save').click();
        return false;
    }
  });
	
  $("#dropzone").on({
    dragenter: function (e) {
      e.stopPropagation();
      e.preventDefault();
      $(this).css('border', '2px solid #5272A0');
    },
    dragleave: function (e) {
      e.stopPropagation();
      e.preventDefault();
      $(this).css('border', '2px dotted #8296C2');
    },
    dragover: function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    drop: function (e) {
      e.preventDefault();
      $(this).css('border', '2px dotted #8296C2');
      var files = e.originalEvent.dataTransfer.files;
      if (files.length < 1) return;
      if (files.length > 1) {
        alert("파일 업로드는 하나의 파일만 가능합니다.");
        return;
      }
      FileMultiUpload(files);
    }
  });
		
  $('#save').click(function () {
    if (!confirm('저장하시겠습니까?')) return;
      $(editor.save());
      var text = $(editor.getTextArea()).val();
      var file_name = $('#editor_filename').val();
      $.ajax({
        url: '/upload',
        method: 'put',
        data: JSON.stringify({
          content: text,
          file_name: file_name
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: function(res) {
        alert('저장되었습니다.');
      }
    });
  });
		  
  $('#compile').click(function () {
    var file_name = $('#editor_filename').val();
    $.ajax({
      url: '/compiler/' + file_name,
      method: 'get',
      dataType: 'json',
      success: function(res) {
        if(res.err)  alert(res.err);
        else if (res.result === '') alert('정답입니다!');
        else alert('틀렸습니다.');
      },
      error: function(err) {
        alert(err.err);
      }
    });
  });
		  
  $('#close').click(function () {
    if(confirm('편집을 종료하시겠습니까?')) {
      $('#editor_filename').hide();
      editor.toTextArea();
      $('#editor').hide();
      $('#editorzone button').hide();
    }
  });
});

$(document).on('click', 'a[name="uploaded_file"]', function(event) {
  var file_name = event.target.innerHTML;
  var url = '/upload/uploded_file';
  $.ajax({
    url: url + '?file_name=' + file_name,
    method: 'get',
    dataType: 'json',
    processData: false,
    contentType: false,
    success: function(res) {
      SetEditor(res.file_name, res.contents);
    }
  });
});

// 파일 멀티 업로드
function FileMultiUpload(files) {
  if(confirm("파일을 업로드 하시겠습니까?")) {
    var data = new FormData();
    for (var i = 0; i < files.length; i++) {
      data.append('file', files[i]);
    }
    $('#editor_filename').hide();
    $('#editorzone button').hide();
    if (editor) editor.toTextArea();
    $('#editor').hide();

    var url = '/upload';
    $.ajax({
      url: url,
      method: 'post',
      data: data,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: function(res) {
        if (res.extract_success) {
          alert('업로드 성공!');
          set_file_list();
        }
      }
    });
  }
}

function set_file_list() {
  $('#filelist').empty();
  var url = '/upload/uploded_files';
  $.ajax({
    url: url,
    method: 'get',
    dataType: 'json',
    processData: false,
    contentType: false,
    success: function(res) {
      var entire_files = res.entire_files;
      if (entire_files.length === 0) return;
      $('#filezone').empty();
      $('#filezone').append('<h1>업로드 된 파일 목록</h1>');
      $('#filezone').append('<ul id=\'filelist\' class=\'list-group\'></ul>');
      for(var i=0; i < entire_files.length; i++) {
        $('#filelist').append('<li class=\'list-group-item\'><a class=\'btn btn-lg btn-link\' name=\'uploaded_file\'>' + entire_files[i] + '</a></li>');
      }
    }
  });
}
		
function SetEditor(file_name, content) {
  $('#editor_filename').val(file_name);
  $('#editor_filename').text('파일명: ' + file_name);
  $('#editor_filename').show();
  $('#editorzone button').show();
  if (editor) editor.toTextArea();
  $('#editor').val(content);
  editor = CodeMirror.fromTextArea($('#editor')[0], {
    lineNumbers: true
  });
}