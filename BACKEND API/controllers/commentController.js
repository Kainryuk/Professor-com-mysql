const Comment = require('../models/Comment');
const User = require('../models/User');
const Question = require('../models/Question');
const logger = require('../utils/logger');

// Adiciona um novo comentário a uma questão
const addCommentHandler = async (req, res) => {
  const userId = req.userId;
  const { questionId, message } = req.body;

  if (!questionId || !message) {
    return res.status(400).json({ error: 'questionId e message são obrigatórios.' });
  }

  try {
    const user = await User.findByPk(userId);
    const question = await Question.findByPk(questionId);

    if (!user || !question) {
      return res.status(404).json({ error: 'Usuário ou questão não encontrados.' });
    }

    const newComment = await Comment.create({
      question_id: questionId,
      user_id: userId,
      user_name: user.nomeCompleto, // Pegando o nome do usuário logado
      user_type: user.userType,     // Pegando o tipo do usuário logado
      message,
      question_theme: question.theme, // Associando o tema da questão
      question_text: question.question_text, // Associando o texto da questão
    });

    logger.info(`Comentário adicionado por ${userId} na questão ${questionId}`);
    res.status(201).json(newComment);
  } catch (error) {
    logger.error(`Erro ao adicionar comentário: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao adicionar comentário.' });
  }
};

// Busca todos os comentários (e respostas) de uma questão específica
const getCommentsByQuestionHandler = async (req, res) => {
  const { questionId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { 
        question_id: questionId,
        parent_comment_id: null // Apenas comentários principais
      },
      include: [
        { 
          model: Comment, 
          as: 'responses', // Inclui as respostas
          include: { model: User, attributes: ['nomeCompleto', 'userType'] } // Dados do autor da resposta
        },
        { model: User, attributes: ['nomeCompleto', 'userType'] } // Dados do autor do comentário principal
      ],
      order: [['createdAt', 'ASC'], ['responses', 'createdAt', 'ASC']],
    });

    res.status(200).json(comments);
  } catch (error) {
    logger.error(`Erro ao buscar comentários da questão ${questionId}: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao buscar comentários.' });
  }
};

// Adiciona uma resposta a um comentário existente
const addCommentResponseHandler = async (req, res) => {
  const userId = req.userId;
  const { parentCommentId, message } = req.body;

  if (!parentCommentId || !message) {
    return res.status(400).json({ error: 'parentCommentId e message são obrigatórios.' });
  }

  try {
    const user = await User.findByPk(userId);
    const parentComment = await Comment.findByPk(parentCommentId);

    if (!user || !parentComment) {
      return res.status(404).json({ error: 'Usuário ou comentário principal não encontrado.' });
    }

    const newResponse = await Comment.create({
      question_id: parentComment.question_id, // Mesma questão do comentário pai
      user_id: userId,
      user_name: user.nomeCompleto,
      user_type: user.userType,
      message,
      parent_comment_id: parentCommentId, // Vincula a resposta ao comentário pai
      question_theme: parentComment.question_theme,
      question_text: parentComment.question_text,
    });

    logger.info(`Resposta adicionada por ${userId} ao comentário ${parentCommentId}`);
    res.status(201).json(newResponse);
  } catch (error) {
    logger.error(`Erro ao adicionar resposta: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao adicionar resposta.' });
  }
};

module.exports = {
  addCommentHandler,
  getCommentsByQuestionHandler,
  addCommentResponseHandler,
};
