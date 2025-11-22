# 🌳 TreeNetra

> Modern full-stack platform for comprehensive tree management, health monitoring, and environmental impact tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

TreeNetra is a production-ready, full-stack application for managing tree inventories, monitoring health conditions, tracking growth patterns, and analyzing environmental impact. Built with scalability and maintainability in mind, it provides a complete solution for municipalities, environmental organizations, and forestry departments.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 🗺️ **Geospatial Features** - Location-based tree mapping with MongoDB geospatial queries
- 📊 **Real-time Analytics** - Comprehensive dashboards with health trends and statistics
- 📱 **Responsive Design** - Mobile-friendly interface built with Tailwind CSS
- 🐳 **Container Ready** - Full Docker and Kubernetes support
- 🧪 **Well Tested** - Jest test suite with integration tests
- 📚 **Complete Documentation** - Architecture docs and API specifications

## ✨ Features

### Core Functionality

- **Tree Inventory Management**
  - Digital catalog with complete tree information
  - Species database with characteristics
  - Image upload and gallery
  - Tag-based organization

- **Health Monitoring**
  - Regular health inspections and records
  - Disease and pest tracking
  - Treatment recommendations
  - Health score calculations

- **Location & Mapping**
  - GPS-based tree location tracking
  - Nearby tree search with radius
  - Geospatial visualization
  - Address and region management

- **Analytics & Reporting**
  - Growth trend analysis
  - Health status distribution
  - Popular species statistics
  - User activity tracking
  - Exportable reports (CSV/JSON)

### User Management

- Role-based access (Admin, Field Officer, Viewer)
- User registration and email verification
- Password reset functionality
- Profile management

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB 7 with Mongoose ODM
- **Cache**: Redis 7
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **State Management**: Context API + TanStack Query
- **Styling**: Tailwind CSS 3
- **UI Icons**: Heroicons
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

### DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2
- **Testing**: Jest

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB 7+
- Redis 7+ (optional, for caching)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Raghavendra198902/treenetra.git
cd treenetra

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Database Setup

```bash
# Start MongoDB (if not running)
sudo systemctl start mongod

# Setup database indexes
npm run setup:db

# Seed with sample data (optional)
npm run seed:db
```

### Start Development Server

```bash
# Start both backend and frontend
npm run dev

# Or start separately
npm run dev:server  # Backend on :3000
npm run dev:client  # Frontend on :5173
```

Visit `http://localhost:5173` to access the application.

**Default Admin Credentials** (after seeding):
- Email: `admin@treenetra.com`
- Password: `Admin@123`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/treenetra

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@treenetra.com

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 👨‍💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start full-stack dev environment
npm run dev:server       # Start backend only
npm run dev:client       # Start frontend only

# Building
npm run build            # Build frontend for production
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier

# Database
npm run setup:db         # Setup database indexes
npm run seed:db          # Seed database with sample data
```

### Project Structure

```
treenetra/
├── src/
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── database/           # DB connection
│   ├── components/         # React components
│   ├── pages/              # React pages
│   ├── contexts/           # React contexts
│   ├── app.js              # Express app
│   └── server.js           # Server entry point
├── config/                 # Configuration files
├── scripts/                # Utility scripts
├── deployment/             # Docker & K8s configs
├── tests/                  # Test files
├── docs/                   # Documentation
├── .env.example            # Environment template
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Docker image config
└── package.json            # Dependencies

## 🚢 Production Deployment

### Using Docker Compose

```bash
# Build and start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

Services available:
- **API**: http://localhost:3000
- **Frontend**: http://localhost:80
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Using Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f deployment/kubernetes/

# Check deployment status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/treenetra-api
```

### Manual Deployment

```bash
# Build application
npm run build

# Install production dependencies
npm ci --production

# Start with PM2
pm2 start config/ecosystem.config.js

# Monitor
pm2 monit
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

```bash
POST /api/v1/auth/register      # Register new user
POST /api/v1/auth/login         # Login
POST /api/v1/auth/logout        # Logout
POST /api/v1/auth/refresh-token # Refresh access token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password/:token
GET  /api/v1/auth/me            # Get current user
```

### Tree Endpoints

```bash
GET    /api/v1/trees              # Get all trees
GET    /api/v1/trees/search       # Search trees
GET    /api/v1/trees/nearby       # Get nearby trees
GET    /api/v1/trees/:id          # Get tree by ID
POST   /api/v1/trees              # Create tree (auth)
PUT    /api/v1/trees/:id          # Update tree (auth)
DELETE /api/v1/trees/:id          # Delete tree (admin)
POST   /api/v1/trees/:id/images   # Upload images (auth)
```

### More Endpoints

See [API Architecture Documentation](docs/architecture/api-architecture.md) for complete API specifications.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── setup.js                 # Test configuration
├── integration/             # Integration tests
│   └── api.test.js
└── unit/                    # Unit tests (add your tests here)
```

## 📁 Project Structure
- **Frontend**: React, TypeScript
- **Database**: PostgreSQL, Redis
- **Mobile**: React Native
- **Cloud**: AWS/Azure/GCP
- **DevOps**: Docker, Kubernetes

## 📖 Documentation

Comprehensive documentation is available in our [Wiki](https://github.com/Raghavendra198902/treenetra/wiki):

- [Getting Started](https://github.com/Raghavendra198902/treenetra/wiki/Getting-Started) - Installation and setup guide
- [API Documentation](https://github.com/Raghavendra198902/treenetra/wiki/API-Documentation) - Complete API reference
- [Contributing Guide](https://github.com/Raghavendra198902/treenetra/wiki/Contributing) - How to contribute
- [Installation Guide](docs/installation.md)
- [User Guide](docs/user-guide.md)
- [Development Guide](docs/development.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
```

## 🚢 Deployment

```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 👥 Team

Created and maintained by Raghavendra.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Raghavendra198902/treenetra/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Raghavendra198902/treenetra/discussions)
- **Wiki**: [Project Wiki](https://github.com/Raghavendra198902/treenetra/wiki)
- **Email**: raghavendra198902@gmail.com

## 🌟 Acknowledgments

- Thanks to all contributors who have helped shape TreeNetra
- Built with modern open-source technologies

## 📊 Project Status

![GitHub issues](https://img.shields.io/github/issues/Raghavendra198902/treenetra)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Raghavendra198902/treenetra)
![GitHub license](https://img.shields.io/github/license/Raghavendra198902/treenetra)
![GitHub stars](https://img.shields.io/github/stars/Raghavendra198902/treenetra)

---

**Version**: 1.0.0  
**Last Updated**: November 22, 2025
