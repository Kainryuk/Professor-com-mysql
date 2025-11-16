const { Op } = require('sequelize');
const Question = require('../models/Question');
const User = require('../models/User');
const logger = require('../utils/logger');

const addQuestionHandler = async (req, res) => {
  const teacherId = req.userId;

  try {
    const user = await User.findByPk(teacherId);
    if (user.userType !== 'professor') {
      return res.status(403).json({ error: 'Apenas professores podem adicionar questões.' });
    }

    const { theme, question, options, correctOptionIndex, feedback, visibility } = req.body;
    
    // Validação de campos obrigatórios
    if (!theme || !question || !options || !Array.isArray(options) || correctOptionIndex === undefined || !feedback || !feedback.title || !feedback.text) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const newQuestion = await Question.create({
      theme: theme.toLowerCase().trim(),
      question_text: question,
      options_json: options,
      correct_option_index: parseInt(correctOptionIndex),
      feedback_title: feedback.title,
      feedback_illustration: feedback.illustration || '',
      feedback_text: feedback.text,
      created_by: teacherId,
      visibility: visibility || 'public',
    });

    logger.info(`Questão adicionada pelo professor ${teacherId}: ${newQuestion.id}`);
    res.status(201).json({ message: 'Questão adicionada com sucesso', id: newQuestion.id });
  } catch (error) {
    logger.error(`Erro ao adicionar questão: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao adicionar questão.' });
  }
};

const getQuestionsHandler = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findByPk(userId);
    const whereClause = {};

    // Se não for professor, só pode ver questões públicas
    if (!user || user.userType !== 'professor') {
      whereClause.visibility = 'public';
    }

    const questions = await Question.findAll({ where: whereClause });
    
    const formattedQuestions = questions.map(q => ({
        id: q.id,
        theme: q.theme,
        question: q.question_text,
        options: q.options_json,
        correctOptionIndex: q.correct_option_index,
        feedback: {
            title: q.feedback_title,
            text: q.feedback_text,
            illustration: q.feedback_illustration
        },
        createdBy: q.created_by,
        visibility: q.visibility,
        createdAt: q.createdAt
      }));

    res.status(200).json(formattedQuestions);
  } catch (error) {
    logger.error(`Erro ao buscar questões: ${error.message}`);
    res.status(500).json({ error: 'Erro ao buscar questões.' });
  }
};

const editQuestionHandler = async (req, res) => {
  const teacherId = req.userId;
  const { questionId } = req.params;

  try {
    const user = await User.findByPk(teacherId);
    if (user.userType !== 'professor') {
      return res.status(403).json({ error: 'Apenas professores podem editar questões.' });
    }

    const questionToEdit = await Question.findByPk(questionId);

    if (!questionToEdit) {
      return res.status(404).json({ error: 'Questão não encontrada.' });
    }

    // Opcional: Verificar se o professor que está editando é o mesmo que criou
    if (questionToEdit.created_by !== teacherId) {
        return res.status(403).json({ error: 'Você só pode editar as questões que criou.' });
    }

    const { theme, question, options, correctOptionIndex, feedback, visibility } = req.body;

    // Atualiza apenas os campos fornecidos
    questionToEdit.theme = theme || questionToEdit.theme;
    questionToEdit.question_text = question || questionToEdit.question_text;
    questionToEdit.options_json = options || questionToEdit.options_json;
    questionToEdit.correct_option_index = correctOptionIndex !== undefined ? parseInt(correctOptionIndex) : questionToEdit.correct_option_index;
    if (feedback) {
        questionToEdit.feedback_title = feedback.title || questionToEdit.feedback_title;
        questionToEdit.feedback_text = feedback.text || questionToEdit.feedback_text;
        questionToEdit.feedback_illustration = feedback.illustration || questionToEdit.feedback_illustration;
    }
    questionToEdit.visibility = visibility || questionToEdit.visibility;
    questionToEdit.updated_by = teacherId;

    await questionToEdit.save();

    logger.info(`Questão ${questionId} atualizada pelo professor ${teacherId}`);
    res.status(200).json({ message: 'Questão atualizada com sucesso.' });
  } catch (error) {
    logger.error(`Erro ao editar questão: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao editar questão.' });
  }
};

const deleteQuestionHandler = async (req, res) => {
    const teacherId = req.userId;
    const { questionId } = req.params;

    try {
        const user = await User.findByPk(teacherId);
        if (user.userType !== 'professor') {
            return res.status(403).json({ error: 'Apenas professores podem deletar questões.' });
        }

        const questionToDelete = await Question.findOne({ where: { id: questionId, created_by: teacherId } });

        if (!questionToDelete) {
            return res.status(404).json({ error: 'Questão não encontrada ou você não tem permissão para deletá-la.' });
        }

        await questionToDelete.destroy();

        logger.info(`Questão ${questionId} deletada pelo professor ${teacherId}`);
        res.status(200).json({ message: 'Questão deletada com sucesso.' });
    } catch (error) {
        logger.error(`Erro ao deletar questão: ${error.message}`);
        res.status(500).json({ error: 'Erro interno ao deletar questão.' });
    }
};

const updateQuestionVisibilityHandler = async (req, res) => {
    const teacherId = req.userId;
    const { questionId } = req.params;
    const { visibility } = req.body;

    try {
        const user = await User.findByPk(teacherId);
        if (user.userType !== 'professor') {
            return res.status(403).json({ error: 'Apenas professores podem alterar a visibilidade.' });
        }

        if (!['public', 'private'].includes(visibility)) {
            return res.status(400).json({ error: 'O valor da visibilidade é inválido.' });
        }

        const questionToUpdate = await Question.findOne({ where: { id: questionId, created_by: teacherId } });

        if (!questionToUpdate) {
            return res.status(404).json({ error: 'Questão não encontrada ou você não tem permissão para alterá-la.' });
        }

        questionToUpdate.visibility = visibility;
        questionToUpdate.updated_by = teacherId;
        await questionToUpdate.save();

        logger.info(`Visibilidade da questão ${questionId} alterada para ${visibility} pelo professor ${teacherId}`);
        res.status(200).json({ message: 'Visibilidade atualizada com sucesso.' });
    } catch (error) {
        logger.error(`Erro ao alterar visibilidade da questão: ${error.message}`);
        res.status(500).json({ error: 'Erro interno ao alterar visibilidade.' });
    }
};

module.exports = {
  addQuestionHandler, 
  getQuestionsHandler, 
  editQuestionHandler, 
  deleteQuestionHandler,
  updateQuestionVisibilityHandler
};