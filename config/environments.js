module.exports = {
  development: {
    database: {
      uri: 'mongodb://localhost:27017/treenetra_dev'
    },
    logging: true,
    cors: {
      origin: 'http://localhost:5173'
    }
  },

  test: {
    database: {
      uri: 'mongodb://localhost:27017/treenetra_test'
    },
    logging: false
  },

  production: {
    database: {
      uri: process.env.MONGODB_URI
    },
    logging: false,
    cors: {
      origin: process.env.FRONTEND_URL
    }
  }
};
