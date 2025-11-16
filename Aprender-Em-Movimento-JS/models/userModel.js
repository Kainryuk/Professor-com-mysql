const User = require('../models/User');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const verifyUserCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
};

const verifyUserPasswordReset = async (email, dataNascimento) => {
  return await User.findOne({ email, dataNascimento });
};

const verifyUserByCpfForPasswordReset = async (cpf, userType) => {
  return await User.findOne({ cpf, userType });
};

const resetUserPassword = async (userId, newPassword) => {
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { 
    password: hashed, 
    updatedAt: new Date() 
  });
};

const isProfessor = async (userId) => {
  const user = await User.findById(userId);
  return user?.userType === 'professor';
};

module.exports = {
  createUser,
  verifyUserCredentials,
  verifyUserPasswordReset,
  verifyUserByCpfForPasswordReset,
  resetUserPassword,
  isProfessor
};