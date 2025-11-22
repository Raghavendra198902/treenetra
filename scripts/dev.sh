#!/bin/bash

# TreeNetra - Development Start Script

echo "🌳 Starting TreeNetra Development Environment"
echo "=============================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✓ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✓ npm $(npm --version)"

# Check MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running"
    echo "Please start MongoDB first: sudo systemctl start mongod"
    exit 1
fi
echo "✓ MongoDB is running"

echo ""
echo "Starting services..."
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

# Start backend in background
echo "Starting backend server..."
NODE_ENV=development npm run dev:server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend dev server..."
npm run dev:client &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for processes
wait
