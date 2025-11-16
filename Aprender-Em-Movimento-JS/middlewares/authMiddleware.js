const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      logger.warn('No token provided', 'AUTH_MIDDLEWARE');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Set userId no req
    next();
  } catch (error) {
    logger.error(`Token inválido: ${error.message}`, 'AUTH_MIDDLEWARE');
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;