const TeacherCode = require('../models/TeacherCode');
const logger = require('../utils/logger');

const createTeacherCode = async (teacherId, code) => {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const codeDoc = new TeacherCode({
      code,
      teacher_id: teacherId,
      expires_at: expiresAt
    });
    await codeDoc.save();
    return codeDoc.toObject();
  } catch (error) {
    logger.error(`Erro ao criar código: ${error.message}`);
    throw error;
  }
};

const getTeacherCode = async (teacherId) => {
  const code = await TeacherCode.findOne({
    teacher_id: teacherId,
    expires_at: { $gt: new Date() },
    used_by: null
  });
  return code ? code.toObject() : null;
};

const useTeacherCode = async (code, studentId) => {
  const codeDoc = await TeacherCode.findOne({
    code,
    used_by: null,
    expires_at: { $gt: new Date() }
  });

  if (!codeDoc) return null;

  codeDoc.used_by = studentId;
  codeDoc.used_at = new Date();
  await codeDoc.save();

  return codeDoc.toObject();
};

module.exports = { createTeacherCode, getTeacherCode, useTeacherCode };