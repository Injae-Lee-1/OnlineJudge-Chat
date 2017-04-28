var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  user_id: {type: String, unique: true},
  user_pw: String,
  user_name: {type: String, unique: true},
  email: String
});

module.exports = mongoose.model('User', UserSchema);

