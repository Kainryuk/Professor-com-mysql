const logger = require('../utils/logger');
const { isProfessor } = require('../models/userModel');
const { addQuestion, getQuestions, updateQuestion, deleteQuestion } = require('../models/questionModel');

const addQuestionHandler = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      console.log('❌ [questionController] Usuário não autenticado');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!await isProfessor(userId)) {
      console.log(`❌ [questionController] Usuário ${userId} não é professor`);
      return res.status(403).json({ error: 'Only teachers can add questions' });
    }
    const { theme, question, options, correctOptionIndex, feedback, visibility } = req.body;
    if (!theme || !question || !options || !Array.isArray(options) || correctOptionIndex === undefined || !feedback || !feedback.title || !feedback.text) {
      console.log(`❌ [questionController] Campos obrigatórios faltando`);
      return res.status(400).json({ error: 'Missing required fields: theme, question, options, correctOptionIndex, feedback.title, feedback.text' });
    }
    const questionData = {
      theme: theme.toLowerCase().trim(),
      question_text: question,
      options_json: options,
      correct_option_index: parseInt(correctOptionIndex),
      feedback_title: feedback.title || '',
      feedback_illustration: feedback.illustration || '',
      feedback_text: feedback.text || '',
      created_by: userId,
      visibility: visibility || 'public'
    };
    const questionId = await addQuestion(questionData);
    console.log(`✅ [questionController] Questão adicionada: ${questionId}`);
    res.status(201).json({ message: 'Question added successfully', id: questionId });
  } catch (error) {
    console.error(`Erro ao adicionar questão: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

const getQuestionsHandler = async (req, res) => {
  console.log('📚 [questionController] Buscando todas as questões...');
  
  try {
    const userId = req.userId;
    const userIsProfessor = await isProfessor(userId);

    const questions = await getQuestions(userIsProfessor ? null : 'public');

    console.log(`✅ [questionController] ${questions.length} questões encontradas`);
    
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
      visibility: q.visibility || 'private',
      createdAt: q.createdAt
    }));

    res.status(200).json(formattedQuestions);
  } catch (error) {
    console.error('❌ [questionController] Erro ao buscar perguntas:', error);
    logger.error('Erro ao buscar perguntas', error, 'QUESTIONS');
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const editQuestionHandler = async (req, res) => {
  try {
    const userId = req.userId;
    // ... resto igual, usando updateQuestion
  } catch (error) {
    // ...
  }
};

const deleteQuestionHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!await isProfessor(userId)) {
      return res.status(403).json({ error: 'Only teachers can delete questions' });
    };
    const { questionId } = req.params;
    await deleteQuestion(questionId);
    logger.info(`Pergunta deletada: ${questionId} por ${userId}`);
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    logger.error('Erro ao deletar pergunta', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateQuestionVisibilityHandler = async (req, res) => {
  logger.info('🔄 [questionController] Iniciando alteração de visibilidade...', 'QUESTIONS');
  
  try {
    const userId = req.userId;
    logger.info(`👤 [questionController] Usuário autenticado: ${userId}`, 'QUESTIONS');
    
    const isUserProfessor = await isProfessor(userId);
    if (!isUserProfessor) {
      logger.warn(`❌ [questionController] Usuário ${userId} não é professor`, 'QUESTIONS');
      return res.status(403).json({ error: 'Apenas professores podem alterar visibilidade' });
    }

    const { questionId } = req.params;
    const { visibility } = req.body;

    logger.info(`📊 [questionController] Dados recebidos: questionId=${questionId}, visibility=${visibility}`, 'QUESTIONS');

    if (!questionId || !visibility) {
      logger.warn('❌ [questionController] Campos obrigatórios faltando', 'QUESTIONS');
      return res.status(400).json({ error: 'questionId e visibility são obrigatórios' });
    }

    if (!['public', 'private'].includes(visibility)) {
      logger.warn(`❌ [questionController] Visibilidade inválida: ${visibility}`, 'QUESTIONS');
      return res.status(400).json({ error: 'visibility deve ser "public" ou "private"' });
    }

    await updateQuestion(questionId, { 
      visibility, 
      updated_by: userId
    });
    
    logger.info(`✅ [questionController] Visibilidade alterada: ${questionId} -> ${visibility}`, 'QUESTIONS');
    res.status(200).json({ 
      message: 'Visibilidade alterada com sucesso',
      questionId,
      visibility
    });
  } catch (error) {
    logger.error('Erro ao alterar visibilidade', error, 'QUESTIONS');
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  addQuestionHandler, 
  getQuestionsHandler, 
  editQuestionHandler, 
  deleteQuestionHandler,
  updateQuestionVisibilityHandler
};