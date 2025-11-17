const { Op } = require('sequelize');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const logger = require('../utils/logger');

const addChatMessageHandler = async (req, res) => {
  const senderId = req.userId; // ID do usuário logado
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ error: 'receiverId e message são obrigatórios.' });
  }

  try {
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Remetente ou destinatário não encontrado.' });
    }

    const newMessage = await ChatMessage.create({
      sender_id: senderId,
      receiver_id: receiverId,
      sender_name: sender.nomeCompleto,
      sender_type: sender.userType,
      message,
    });

    logger.info(`Mensagem enviada de ${senderId} para ${receiverId}`);
    res.status(201).json(newMessage);
  } catch (error) {
    logger.error(`Erro ao enviar mensagem: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao enviar mensagem.' });
  }
};

const getChatMessagesHandler = async (req, res) => {
  const userId = req.userId; // ID do usuário logado
  const { otherUserId } = req.params; // ID do outro participante da conversa

  if (!otherUserId) {
    return res.status(400).json({ error: 'otherUserId é obrigatório no parâmetro da rota.' });
  }

  try {
    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId },
        ],
      },
      order: [['createdAt', 'ASC']],
      limit: 100, // Limita a quantidade de mensagens para evitar sobrecarga
    });

    res.status(200).json(messages);
  } catch (error) {
    logger.error(`Erro ao buscar mensagens: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao buscar mensagens.' });
  }
};

module.exports = {
  addChatMessageHandler,
  getChatMessagesHandler,
};
