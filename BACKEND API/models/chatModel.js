const Chat = require('../models/Chat');
const logger = require('../utils/logger');

const addChatMessage = async (messageData) => {
  try {
    const msg = new Chat({ ...messageData, created_at: new Date() });
    await msg.save();
    return msg._id.toString();
  } catch (error) {
    logger.error(`Erro ao adicionar mensagem de chat: ${error.message}`);
    throw error;
  }
};

const getChatMessages = async (senderId, receiverId) => {
  try {
    const messages = await Chat.find({
      $or: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    })
      .sort({ created_at: 1 })
      .lean();

    return messages.map(m => ({
      id: m._id.toString(),
      ...m,
      sender_id: m.sender_id.toString(),
      receiver_id: m.receiver_id.toString(),
      created_at: m.created_at.toISOString()
    }));
  } catch (error) {
    logger.error(`Erro ao buscar mensagens de chat: ${error.message}`);
    throw error;
  }
};

module.exports = { addChatMessage, getChatMessages };