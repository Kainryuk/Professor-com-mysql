const mongoose = require('mongoose');

const teacherStudentSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacher_name: String,
  student_name: String,
  joined_at: { type: Date, default: Date.now }
}, { collection: 'teacher_students' });

module.exports = mongoose.model('TeacherStudent', teacherStudentSchema);