const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  question_theme: String,
  question_text: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_name: String,
  user_type: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);