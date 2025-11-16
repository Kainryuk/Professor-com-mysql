const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./User');

const TeacherStudent = sequelize.define('TeacherStudent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  teacher_name: {
    type: DataTypes.STRING
  },
  student_name: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'teacher_students',
  timestamps: true,
  createdAt: 'joined_at',
  updatedAt: false
});

TeacherStudent.belongsTo(User, { as: 'Teacher', foreignKey: 'teacher_id' });
TeacherStudent.belongsTo(User, { as: 'Student', foreignKey: 'student_id' });

module.exports = TeacherStudent;