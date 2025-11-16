const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  const { nomeCompleto, cpf, userType, dataNascimento, password } = req.body;

  if (!nomeCompleto || !cpf || !userType || !dataNascimento) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  try {
    // Verifica se já existe um usuário com o mesmo CPF e tipo
    const existingUser = await User.findOne({ where: { cpf, userType } });
    if (existingUser) {
      return res.status(409).json({ error: `Já existe um ${userType} com este CPF.` });
    }

    const hashedPassword = await bcrypt.hash(password || cpf, SALT_ROUNDS);

    const newUser = await User.create({
      nomeCompleto,
      cpf,
      userType,
      dataNascimento,
      password: hashedPassword,
      email: `${cpf}_${userType}@saberemmovimento.com`, // Email gerado
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Remove a senha do objeto de usuário retornado
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    logger.info(`Usuário registrado: ${newUser.id}`);
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    logger.error(`Erro ao registrar: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const userResponse = user.toJSON();
    delete userResponse.password;

    logger.info(`Usuário logado: ${user.id}`);
    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    logger.error(`Erro ao fazer login: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
};

const verifyUserForPasswordResetHandler = async (req, res) => {
  const { cpf, dataNascimento } = req.body;

  if (!cpf || !dataNascimento) {
    return res.status(400).json({ error: 'CPF e data de nascimento são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { cpf, dataNascimento } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado com os dados fornecidos.' });
    }

    // Retorna sucesso para indicar que o usuário foi verificado
    res.status(200).json({ message: 'Usuário verificado com sucesso.' });
  } catch (error) {
    logger.error(`Erro ao verificar usuário para reset de senha: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao verificar usuário.' });
  }
};

const resetPassword = async (req, res) => {
  const { cpf, dataNascimento, newPassword } = req.body;

  if (!cpf || !dataNascimento || !newPassword) {
    return res.status(400).json({ error: 'CPF, data de nascimento e nova senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { cpf, dataNascimento } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado com os dados fornecidos.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedNewPassword;
    await user.save();

    logger.info(`Senha do usuário ${user.id} foi resetada com sucesso.`);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    logger.error(`Erro ao resetar a senha: ${error.message}`);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
  }
};

module.exports = { register, login, verifyUserForPasswordResetHandler, resetPassword };
