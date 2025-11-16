// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');
const sequelize = require('./utils/database');

// === Rotas ===
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const relationshipRoutes = require('./routes/relationshipRoutes');
const commentRoutes = require('./routes/commentRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '.env') });

logger.info('Iniciando servidor...');
logger.info(`Variáveis de ambiente carregadas → NODE_ENV=${process.env.NODE_ENV || 'development'}`);

const app = express();

// === Configurar CORS ===
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'https://id-preview--77c82926-cc52-4e97-9f3b-585910fae583.lovable.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://localhost:8080'
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: mobile, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS bloqueado para origem: ${origin}`);
        callback(new Error('Origem não permitida pelo CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// === Middlewares globais ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === Health check ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: 'MySQL'
  });
});

// === Rotas da API ===
app.use('/api', authRoutes);
app.use('/api', questionRoutes);
app.use('/api', relationshipRoutes);
app.use('/api', commentRoutes);
app.use('/api', chatRoutes);

// === Rota 404 ===
app.use('/', (req, res) => {
  logger.warn(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// === Middleware global de erro ===
app.use((err, req, res, next) => {
  logger.error(`Erro não tratado: ${err.message}`, 'EXCEPTION', {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message
  });
});

// === Iniciar servidor ===
const PORT = process.env.PORT || 5050;

const startServer = async () => {
  try {
    await sequelize.sync(); // Sincroniza os modelos com o banco de dados
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`, 'SERVER');
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error(`Falha ao iniciar o servidor: ${error.message}`, 'FATAL');
    process.exit(1);
  }
};

startServer();