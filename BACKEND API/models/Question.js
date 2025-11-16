const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  theme: {
    type: DataTypes.STRING
  },
  text: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING
  },
  userType: {
    type: DataTypes.STRING
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public'
  }
}, {
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Question.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Question, { foreignKey: 'userId' });

module.exports = Question;