const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User');

const TeacherCode = sequelize.define('TeacherCode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

User.hasOne(TeacherCode, { foreignKey: 'teacherId' });
TeacherCode.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

module.exports = TeacherCode;
