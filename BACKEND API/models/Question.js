const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  theme: String,
  text: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userType: String,
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);