const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { createUser, verifyUserCredentials, verifyUserPasswordReset, resetUserPassword, verifyUserByCpfForPasswordReset } = require('../models/userModel');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Para verificações diretas

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  logger.logRequest(req, 'AUTH');
  try {
    const { nomeCompleto, cpf, userType, dataNascimento, password } = req.body;
    
    logger.debug('Dados recebidos para registro', 'AUTH', {
      nomeCompleto,
      cpf: cpf ? cpf.substring(0, 3) + '***' : 'não fornecido',
      userType,
      dataNascimento,
      hasCustomPassword: !!password
    });

    if (!nomeCompleto || !cpf || !userType || !dataNascimento) {
      logger.warn('Campos obrigatórios faltando', 'AUTH', { 
        nomeCompleto: !!nomeCompleto, 
        cpf: !!cpf, 
        userType: !!userType, 
        dataNascimento: !!dataNascimento 
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validUserTypes = ['aluno', 'professor'];
    if (!validUserTypes.includes(userType)) {
      logger.warn('userType inválido', 'AUTH', { userType });
      return res.status(400).json({ error: 'Formato do userType inválido' });
    }

    if (!/^\d{11}$/.test(cpf)) {
      logger.warn('CPF em formato inválido', 'AUTH', { cpf: cpf ? cpf.substring(0, 3) + '***' : 'não fornecido' });
      return res.status(400).json({ error: 'Formato do CPF inválido' });
    }

    console.log('🔍 [REGISTER] Verificando duplicação de CPF...', {
      cpf: cpf.substring(0, 3) + '***',
      userType
    });

    const existingUser = await User.findOne({ cpf, userType });
    if (existingUser) {
      console.log('❌ [REGISTER] CPF já cadastrado:', {
        cpf: cpf.substring(0, 3) + '***',
        userType,
        existingEmail: existingUser.email
      });
      logger.warn('CPF já cadastrado para este tipo de usuário', 'AUTH', { 
        cpf: cpf.substring(0, 3) + '***', 
        userType 
      });
      return res.status(400).json({ 
        error: `Já existe um ${userType} cadastrado com este CPF` 
      });
    }

    console.log('✅ [REGISTER] CPF livre para cadastro');

    const finalPassword = password || cpf;
    console.log('🔐 [REGISTER] Gerando hash da senha...');
    const passwordHash = await bcrypt.hash(finalPassword, SALT_ROUNDS);
    const hashKey = passwordHash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    const email = `${cpf}_${userType}_${hashKey}@saberemmovimento.com`;

    console.log('📧 [REGISTER] Email gerado:', email);
    console.log('🔑 [REGISTER] HashKey:', hashKey);

    // Criar usuário no MongoDB
    const userData = {
      nomeCompleto,
      cpf,
      userType,
      dataNascimento,
      password: passwordHash, // Já hasheado no schema pre-save
      email
    };
    const newUser = await createUser(userData);

    // Gerar JWT
    const token = jwt.sign({ userId: newUser._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    logger.error(`Erro ao registrar: ${error.message}`, 'AUTH');
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ user, token });
  } catch (error) {
    logger.error(`Erro ao logar: ${error.message}`, 'AUTH');
    res.status(500).json({ error: error.message });
  }
};

const verifyUserForPasswordResetHandler = async (req, res) => {
  // ... igual, usando verifyUserByCpfForPasswordReset
};

const resetPassword = async (req, res) => {
  // ... igual, usando resetUserPassword (sem admin.auth(), só Mongo)
};

module.exports = { register, login, resetPassword, verifyUserForPasswordResetHandler };