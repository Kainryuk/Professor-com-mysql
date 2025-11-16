const mongoose = require('mongoose');

const teacherCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expires_at: { type: Date, required: true },
  used_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  used_at: Date,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeacherCode', teacherCodeSchema);