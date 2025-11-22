# 🚀 TreeNetra Quick Start Guide

> Get TreeNetra up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB 7+ installed and running
- [ ] Git installed
- [ ] 4GB+ RAM available
- [ ] 2GB+ disk space

## Installation Steps

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/Raghavendra198902/treenetra.git
cd treenetra

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Create environment file
cp .env.example .env

# Edit with your settings
nano .env
```

**Minimum Required Variables:**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/treenetra
JWT_SECRET=your-secret-key-min-32-chars
```

### 3. Setup Database

```bash
# Setup indexes
npm run setup:db

# Load sample data (optional but recommended)
npm run seed:db
```

### 4. Start Application

```bash
# Start both backend and frontend
npm run dev
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

### 5. Login

**Default Admin Account:**
- Email: `admin@treenetra.com`
- Password: `Admin@123`

## Common Commands

```bash
# Development
npm run dev              # Full stack
npm run dev:server       # Backend only
npm run dev:client       # Frontend only

# Testing
npm test                 # Run tests
npm run lint             # Check code

# Production
npm run build            # Build frontend
npm start                # Start production server

# Docker
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View logs
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Permission Denied on Scripts
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

## Next Steps

1. ✅ Explore the Dashboard
2. 📝 Add your first tree
3. 📊 Check the Analytics page
4. 👥 Invite team members
5. 📚 Read the [Architecture Docs](docs/architecture/README.md)

## Getting Help

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/Raghavendra198902/treenetra/issues)
- 💬 [Discussions](https://github.com/Raghavendra198902/treenetra/discussions)

---

**Happy Tree Managing! 🌳**
