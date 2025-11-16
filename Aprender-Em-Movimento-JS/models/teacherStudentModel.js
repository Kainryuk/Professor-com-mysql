const TeacherStudent = require('../models/TeacherStudent');
const User = require('../models/User');
const logger = require('../utils/logger');

const createTeacherStudent = async (teacherId, studentId, studentName) => {
  try {
    const teacher = await User.findById(teacherId);
    const relation = new TeacherStudent({
      teacher_id: teacherId,
      student_id: studentId,
      teacher_name: teacher.nomeCompleto,
      student_name: studentName,
      joined_at: new Date()
    });
    await relation.save();
    return { relationId: relation._id.toString(), ...relation.toObject() };
  } catch (error) {
    logger.error(`Erro ao criar vinculação: ${error.message}`);
    throw error;
  }
};

const getTeacherStudents = async (teacherId) => {
  const relations = await TeacherStudent.find({ teacher_id: teacherId })
    .sort({ joined_at: -1 })
    .lean();
  return relations.map(r => ({
    relationId: r._id.toString(),
    ...r,
    createdAt: r.joined_at.toISOString()
  }));
};

const getStudentRelations = async (studentId) => {
  const relations = await TeacherStudent.find({ student_id: studentId })
    .sort({ joined_at: -1 })
    .lean();
  return relations.map(r => ({
    relationId: r._id.toString(),
    ...r,
    createdAt: r.joined_at.toISOString()
  }));
};

const deleteTeacherStudent = async (relationId) => {
  await TeacherStudent.findByIdAndDelete(relationId);
};

module.exports = { createTeacherStudent, getTeacherStudents, getStudentRelations, deleteTeacherStudent };