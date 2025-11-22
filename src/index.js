const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    name: 'TreeNetra API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to TreeNetra - Tree Management Platform'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌳 TreeNetra server running on http://localhost:${PORT}`);
});

module.exports = app;
