const Question = require('../models/Question');
const logger = require('../utils/logger');

const addQuestion = async (questionData) => {
  try {
    const question = new Question({
      ...questionData,
      created_at: new Date(),
      updated_at: new Date()
    });
    await question.save();
    return question._id.toString();
  } catch (error) {
    logger.error(`Erro ao adicionar questão: ${error.message}`);
    throw error;
  }
};

const getQuestions = async (visibility = null) => {
  try {
    const filter = visibility ? { visibility } : {};
    const questions = await Question.find(filter)
      .sort({ created_at: -1 })
      .lean();

    return questions.map(q => ({
      id: q._id.toString(),
      ...q,
      created_at: q.created_at.toISOString(),
      updated_at: q.updated_at.toISOString()
    }));
  } catch (error) {
    logger.error(`Erro ao listar perguntas: ${error.message}`);
    throw error;
  }
};

const updateQuestion = async (questionId, questionData) => {
  try {
    await Question.findByIdAndUpdate(questionId, {
      ...questionData,
      updated_at: new Date()
    });
  } catch (error) {
    logger.error(`Erro ao atualizar questão ${questionId}: ${error.message}`);
    throw error;
  }
};

const deleteQuestion = async (questionId) => {
  try {
    await Question.findByIdAndDelete(questionId);
  } catch (error) {
    logger.error(`Erro ao deletar pergunta ${questionId}: ${error.message}`);
    throw error;
  }
};

module.exports = { addQuestion, getQuestions, updateQuestion, deleteQuestion };