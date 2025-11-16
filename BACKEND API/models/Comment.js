const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User');
const Question = require('./Question');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Question,
      key: 'id'
    }
  },
  question_theme: {
    type: DataTypes.STRING
  },
  question_text: {
    type: DataTypes.TEXT
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  user_name: {
    type: DataTypes.STRING
  },
  user_type: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Comment.belongsTo(Question, { foreignKey: 'question_id' });
Question.hasMany(Comment, { foreignKey: 'question_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });

module.exports = Comment;