const express = require('express');
const authRoutes = require('./auth.routes');
const treeRoutes = require('./tree.routes');
const userRoutes = require('./user.routes');
const speciesRoutes = require('./species.routes');
const healthRoutes = require('./health.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    message: 'TreeNetra API v1',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: '/api/v1/auth',
      trees: '/api/v1/trees',
      users: '/api/v1/users',
      species: '/api/v1/species',
      health: '/api/v1/health-records',
      analytics: '/api/v1/analytics'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/trees', treeRoutes);
router.use('/users', userRoutes);
router.use('/species', speciesRoutes);
router.use('/health-records', healthRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
