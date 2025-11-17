const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    addCommentHandler,
    getCommentsByQuestionHandler,
    addCommentResponseHandler
} = require('../controllers/commentController');

// Aplica o middleware de autenticação a todas as rotas de comentários
router.use(authMiddleware);

// Rota para buscar todos os comentários e respostas de uma questão específica
// Ex: GET /api/comments/123
router.get('/:questionId', getCommentsByQuestionHandler);

// Rota para adicionar um novo comentário a uma questão
// O body deve conter { questionId, message }
router.post('/', addCommentHandler);

// Rota para adicionar uma resposta a um comentário existente
// O body deve conter { parentCommentId, message }
router.post('/responses', addCommentResponseHandler);

module.exports = router;
