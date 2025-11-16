const { Op } = require('sequelize');
const TeacherCode = require('../models/TeacherCode');
const TeacherStudent = require('../models/TeacherStudent');
const User = require('../models/User');
const logger = require('../utils/logger');

// Função auxiliar para gerar um código aleatório
const generateRandomCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateTeacherCode = async (req, res) => {
  const teacherId = req.userId;

  try {
    const user = await User.findByPk(teacherId);
    if (user.userType !== 'professor') {
      return res.status(403).json({ error: 'Apenas professores podem gerar códigos.' });
    }

    const newCode = generateRandomCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expira em 24 horas

    // Cria ou atualiza o código do professor
    const [teacherCode, created] = await TeacherCode.findOrCreate({
      where: { teacherId },
      defaults: { code: newCode, expiresAt },
    });

    if (!created) {
      teacherCode.code = newCode;
      teacherCode.expiresAt = expiresAt;
      await teacherCode.save();
    }

    logger.info(`Código gerado para o professor ${teacherId}: ${newCode}`);
    res.status(201).json({ code: newCode, expiresAt });
  } catch (error) {
    logger.error(`Erro ao gerar código de professor: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao gerar código.' });
  }
};

const getTeacherCodeHandler = async (req, res) => {
  const teacherId = req.userId;

  try {
    const teacherCode = await TeacherCode.findOne({
      where: {
        teacherId,
        expiresAt: { [Op.gt]: new Date() }, // Apenas códigos válidos
      },
    });

    if (!teacherCode) {
      return res.status(404).json({ error: 'Nenhum código ativo encontrado.' });
    }

    res.status(200).json(teacherCode);
  } catch (error) {
    logger.error(`Erro ao buscar código de professor: ${error.message}`);
    res.status(500).json({ error: 'Erro ao buscar código.' });
  }
};

const linkStudentByCode = async (req, res) => {
  const studentId = req.userId;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'O código é obrigatório.' });
  }

  try {
    const student = await User.findByPk(studentId);
    if (student.userType !== 'aluno') {
      return res.status(403).json({ error: 'Apenas alunos podem se vincular a professores.' });
    }

    const teacherCode = await TeacherCode.findOne({
      where: {
        code,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: 'teacher',
    });

    if (!teacherCode) {
      return res.status(404).json({ error: 'Código inválido ou expirado.' });
    }

    const teacherId = teacherCode.teacherId;

    // Verifica se o vínculo já existe
    const existingLink = await TeacherStudent.findOne({
      where: { teacherId, studentId },
    });

    if (existingLink) {
      return res.status(409).json({ error: 'Aluno já vinculado a este professor.' });
    }

    // Cria o vínculo
    await TeacherStudent.create({
      teacherId,
      studentId,
      teacher_name: teacherCode.teacher.nomeCompleto,
      student_name: student.nomeCompleto,
    });

    logger.info(`Aluno ${studentId} vinculado ao professor ${teacherId}`);
    res.status(201).json({ message: 'Vínculo criado com sucesso!' });
  } catch (error) {
    logger.error(`Erro ao vincular aluno por código: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao vincular aluno.' });
  }
};

const getStudentsHandler = async (req, res) => {
    const teacherId = req.userId;

    try {
        const user = await User.findByPk(teacherId);
        if (!user || user.userType !== 'professor') {
            return res.status(403).json({ error: 'Apenas professores podem ver seus alunos.' });
        }

        const relations = await TeacherStudent.findAll({ 
            where: { teacherId },
            include: [{ model: User, as: 'student' }]
        });

        const students = relations.map(rel => ({
            id: rel.student.id,
            nomeCompleto: rel.student.nomeCompleto,
            email: rel.student.email,
            userType: rel.student.userType,
            score: rel.student.score || 0,
            rank: rel.student.rank || 'Iniciante',
            cpf: rel.student.cpf,
            dataNascimento: rel.student.dataNascimento,
            relationId: rel.id,
            joined_at: rel.createdAt,
        }));

        res.status(200).json(students);

    } catch (error) {
        logger.error(`Erro ao buscar alunos: ${error.message}`, 'RELATIONSHIPS');
        res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
};

const unlinkStudent = async (req, res) => {
    const { relationId } = req.params;
    const userId = req.userId;

    try {
        const relation = await TeacherStudent.findByPk(relationId);

        if (!relation) {
            return res.status(404).json({ error: 'Vínculo não encontrado.' });
        }

        // Apenas o professor do vínculo ou o próprio aluno podem desfazer
        if (relation.teacherId !== userId && relation.studentId !== userId) {
            return res.status(403).json({ error: 'Você não tem permissão para desfazer este vínculo.' });
        }

        await relation.destroy();

        logger.info(`Vínculo ${relationId} desfeito pelo usuário ${userId}`);
        res.status(200).json({ message: 'Vínculo desfeito com sucesso.' });

    } catch (error) {
        logger.error(`Erro ao desvincular aluno: ${error.message}`, 'RELATIONSHIPS');
        res.status(500).json({ error: 'Erro ao desvincular aluno.' });
    }
};

module.exports = {
  generateTeacherCode,
  getTeacherCodeHandler,
  linkStudentByCode,
  getStudentsHandler,
  unlinkStudent,
};
