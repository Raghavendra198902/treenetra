const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  if (!req._startTime || !res._startTime) {
    return '';
  }
  const ms = (res._startTime[0] - req._startTime[0]) * 1000 +
             (res._startTime[1] - req._startTime[1]) / 1000000;
  return ms.toFixed(3);
});

// Custom format
const logFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

// Create middleware
const requestLogger = morgan(logFormat, {
  stream: {
    write: (message) => {
      logger.http(message.trim());
    }
  }
});

module.exports = { requestLogger };
