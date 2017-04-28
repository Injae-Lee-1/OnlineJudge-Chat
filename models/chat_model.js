var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var ChatSchema = new Schema({
  send_user_id: String,
  send_user_name: String,
  send_time: { type: Date, default: Date.now },
  receive_user_id: String,
  receive_user_name: String,
  message: String,
  whisper: Boolean
});

ChatSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Chat', ChatSchema);

