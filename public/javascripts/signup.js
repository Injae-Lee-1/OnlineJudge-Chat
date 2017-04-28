var idCheck = false;
var passwordCheck = false;
var nameCheck = false;
$(document).ready(function () {
  $('#id').on({
    focus: function () {
      idCheck = false;
      $('#idCheckSuccess').hide();
      $('#idCheckFail').hide();
      $('#idOnlyEngNum').hide();
    },
    blur: function () {
      var id = $('#id').val();
      if (id !== '') {
        if (!validate(id) || id.length < 4 || id.length > 12) {
          $('#idOnlyEngNum').show();
          idCheck = false;
          return;
        }
        $.ajax({
          type: 'get',
          url: '/users/id/' + id,
          dataType: 'json',
          success: function (data) {
            if (data.result) {
              $('#idCheckSuccess').show();
              idCheck = true;
            } else {
              $('#idCheckFail').show();
              idCheck = false;
            }
          },
          error: function (xhr, status, error) {
            alert('Error : ' + error);
          }
        });
      }
    }
  });
  
  $('#name').on({
    focus: function () {
      nameCheck = false;
      $('#nameCheckSuccess').hide();
      $('#nameCheckFail').hide();
      $('#nameOnlyHanEngNum').hide();
    },
    blur: function () {
      var name = $('#name').val();
      var result = true;
      if (name !== "") {
        if (!validate(name) || name.length < 4 || name.length > 12) {
          $('#nameOnlyHanEngNum').show();
          nameCheck = false;
          return;
        }
		
	    $.ajax({
          type: 'get',
          url: '/users/name/' + name,
          dataType: 'json',
          success: function (data) {
            if (data.result) {
              $('#nameCheckSuccess').show();
              nameCheck = true;
            } else {
              $('#nameCheckFail').show();
              nameCheck = false;
            }
          },
          error: function (xhr, status, error) {
            alert('Error : ' + error);
          }
        });
      }
    }
  });

  $("#join").on("click", function () {
    if (joinCheck()) {
      $("#joinForm").submit();
    }
  });

  $("#password").on({
    keyup: function () {
      pwCheck();
    },
    change: function () {
      pwCheck();
    }
  });

  $("#passwordCheck").on({
    keyup: function () {
      pwCheck();
    },
    change: function () {
      pwCheck();
    }
  });
});

function pwLengthCheck() {
  if ($("#password").val().length >= 4 && $("#password").val().length <= 12) {
    $("#pwLengthFail").hide();
    return true;
  } else {
    $("#pwLengthFail").show();
    $("#pwCheckFail").hide();
    $("#pwCheckSuccess").hide();
    passwordCheck = false;
    return false;
  }
}

function pwCheck() {
  if (pwLengthCheck()) {
    if ($("#password").val() == $("#passwordCheck").val()) {
      $("#pwCheckFail").hide();
      $("#pwCheckSuccess").show();
      passwordCheck = true;
    } else {
      $("#pwCheckSuccess").hide();
      $("#pwCheckFail").show();
      passwordCheck = false;
    }
  }
}
function joinCheck() {
  if ($("#id").val()==='' || $("#email").val()==='' || $("#password").val()==='' || $("#passwordCheck").val()===''
    || $("#name").val()==='') {
    alert("입력 사항을 모두 입력해 주세요.");
    return false;
  }
  if (!passwordCheck) {
    alert("패스워드를 확인해주세요.");
    return false;
  }
  if (!idCheck) {
    alert("사용할 수 없는 ID입니다.");
    return false;
  }
  if (!nameCheck) {
    alert("사용할 수 없는 닉네임입니다.");
    return false;
  }
  return true;
}

function validate(val) {
  var re = /^[ㄱ-ㅎ|가-힣|_A-Za-z0-9-]*$/;
  return re.test(val);
}