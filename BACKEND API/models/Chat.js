const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'chats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Chat.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
Chat.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });

module.exports = Chat;