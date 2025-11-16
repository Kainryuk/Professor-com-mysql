const logger = require('../utils/logger');
const { isProfessor } = require('../models/userModel'); // Ajuste se precisar de mais
const { createTeacherCode, getTeacherCode, useTeacherCode } = require('../models/teacherCodeModel');
const { createTeacherStudent, getTeacherStudents, getStudentRelations, deleteTeacherStudent } = require('../models/teacherStudentModel');
const User = require('../models/User'); // Para buscar dados de users

const isValidId = (id, paramName) => {
  if (!id || id === 'undefined' || typeof id !== 'string' || id.trim().length === 0) {
    logger.warn(`ID inválido para ${paramName}: ${id}`);
    return false;
  }
  return true;
};

const getStudentsHandler = async (req, res) => {
  try {
    console.log('👥 [relationshipController] Buscando dados dos alunos por ID...');
    
    const userId = req.userId; // Do middleware
    console.log(`🔍 [relationshipController] Usuário autenticado (ID): ${userId}`);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ [relationshipController] Usuário não encontrado: ${userId}`);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (user.userType !== 'professor') {
      console.log(`❌ [relationshipController] Usuário ${userId} não é professor`);
      return res.status(403).json({ error: 'Apenas professores podem acessar dados dos alunos' });
    }

    // Buscar relações
    const relations = await TeacherStudent.find({ teacher_id: userId });
    console.log(`📊 [relationshipController] ${relations.length} relações encontradas`);
    
    const students = [];
    for (const relation of relations) {
      const studentId = relation.student_id;
      try {
        const student = await User.findById(studentId);
        if (student) {
          students.push({
            id: student._id.toString(),
            nomeCompleto: student.nomeCompleto,
            email: student.email,
            userType: student.userType,
            score: student.score || 0,
            rank: student.rank || 'Iniciante',
            cpf: student.cpf,
            dataNascimento: student.dataNascimento,
            // Dados da relação
            relationId: relation._id.toString(),
            joined_at: relation.joined_at ? relation.joined_at.toISOString() : null,
            student_name: relation.student_name,
            teacher_name: relation.teacher_name
          });
        } else {
          console.warn(`⚠️ [relationshipController] Aluno não encontrado: ${studentId}`);
        }
      } catch (error) {
        console.warn(`⚠️ [relationshipController] Erro ao buscar aluno ${studentId}: ${error.message}`);
      }
    }

    console.log(`✅ [relationshipController] ${students.length} alunos retornados`);
    res.status(200).json(students);
  } catch (error) {
    logger.error(`Erro ao buscar alunos: ${error.message}`, 'RELATIONSHIPS');
    res.status(500).json({ error: error.message });
  }
};

const generateTeacherCode = async (req, res) => {
  // ... (o resto igual, usando models migrados)
  // Exemplo: use createTeacherCode(userId, code)
};

const getTeacherCodeHandler = async (req, res) => {
  // ... igual, usando getTeacherCode
};

const linkStudentByCode = async (req, res) => {
  // ... igual, usando useTeacherCode e createTeacherStudent
};

const getTeacherStudentsHandler = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`🔍 [relationshipController] Buscando alunos para teacherId: ${userId}`);
    
    if (!await isProfessor(userId)) {
      return res.status(403).json({ error: 'Only teachers can access student data' });
    }

    const relations = await getTeacherStudents(userId);
    res.status(200).json(relations || []);
  } catch (error) {
    console.error(`Erro ao listar alunos: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

const getStudentRelationsHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId, 'studentId')) {
      return res.status(400).json({ error: 'Invalid studentId' });
    }
    const userId = req.userId;
    if (userId !== studentId) { // Removi isStudent, ajuste se precisar
      return res.status(403).json({ error: 'Access denied' });
    }
    const relations = await getStudentRelations(studentId);
    res.status(200).json(relations || []);
  } catch (error) {
    logger.error(`Erro ao listar professores: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

const unlinkStudent = async (req, res) => {
  logger.info('🔓 [relationshipController] Iniciando desvinculação', 'RELATIONSHIPS');
  
  try {
    const { relationId } = req.params;
    logger.info(`📊 [relationshipController] relationId: ${relationId}`, 'RELATIONSHIPS');
    
    if (!isValidId(relationId, 'relationId')) {
      logger.warn(`❌ [relationshipController] relationId inválido`, 'RELATIONSHIPS');
      return res.status(400).json({ error: 'Invalid relationId' });
    }
    const userId = req.userId;
    const relation = await TeacherStudent.findById(relationId);
    if (!relation) {
      logger.warn(`❌ [relationshipController] Relação não encontrada: ${relationId}`, 'RELATIONSHIPS');
      return res.status(404).json({ error: 'Relation not found' });
    }
    if (relation.teacher_id.toString() !== userId && relation.student_id.toString() !== userId) {
      logger.warn(`❌ [relationshipController] Usuário ${userId} sem permissão`, 'RELATIONSHIPS');
      return res.status(403).json({ error: 'Only participants can unlink' });
    }
    await deleteTeacherStudent(relationId);
    logger.info(`✅ [relationshipController] Relação desvinculada: ${relationId}`, 'RELATIONSHIPS');
    res.status(200).json({ success: true, message: 'Unlinked successfully' });
  } catch (error) {
    logger.error(`Erro ao desvincular`, error, 'RELATIONSHIPS');
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateTeacherCode,
  getTeacherCodeHandler,
  linkStudentByCode,
  getTeacherStudentsHandler,
  getStudentRelationsHandler,
  unlinkStudent,
  getStudentsHandler
};