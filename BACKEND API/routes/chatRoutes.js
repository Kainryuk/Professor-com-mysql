const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    addChatMessageHandler,
    getChatMessagesHandler
} = require('../controllers/chatController');

// Aplica o middleware de autenticação a todas as rotas de chat
router.use(authMiddleware);

// Rota para enviar uma nova mensagem
// O body deve conter { receiverId, message }
router.post('/', addChatMessageHandler);

// Rota para buscar o histórico de mensagens com outro usuário
// Ex: GET /api/chat/456 (busca a conversa entre o usuário logado e o usuário 456)
router.get('/:otherUserId', getChatMessagesHandler);

module.exports = router;
