const mongoose = require('mongoose');
const logger = require('./logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lovable_db';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    logger.info('MongoDB já conectado', 'MONGO');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    logger.info('MongoDB conectado com sucesso!', 'MONGO');

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Erro no MongoDB: ${err.message}`, 'MONGO');
    });

  } catch (error) {
    logger.error(`Erro ao conectar ao MongoDB: ${error.message}`, 'MONGO');
    process.exit(1);
  }
};

module.exports = { mongoose, connectDB };