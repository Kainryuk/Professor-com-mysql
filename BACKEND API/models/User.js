const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nomeCompleto: {
    type: DataTypes.STRING
  },
  dataNascimento: {
    type: DataTypes.DATEONLY
  },
  cpf: {
    type: DataTypes.STRING,
    unique: true
  },
  userType: {
    type: DataTypes.ENUM('aluno', 'professor'),
    defaultValue: 'aluno'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  tableName: 'users',
  timestamps: true
});

module.exports = User;