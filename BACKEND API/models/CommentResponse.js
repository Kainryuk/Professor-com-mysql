const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  comment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_name: String,
  user_type: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommentResponse', responseSchema);