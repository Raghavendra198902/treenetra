#!/bin/bash

# TreeNetra - Docker Deployment Script

echo "🌳 TreeNetra Docker Deployment"
echo "==============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✓ Docker $(docker --version)"
echo "✓ Docker Compose $(docker-compose --version)"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Environment variables loaded"
else
    echo "⚠️  .env file not found, using defaults"
fi

echo ""
echo "Building and starting containers..."
echo ""

# Build and start services
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
docker-compose ps

echo ""
echo "✅ Deployment completed!"
echo ""
echo "Services:"
echo "  - API: http://localhost:3000"
echo "  - Frontend: http://localhost:80"
echo "  - MongoDB: localhost:27017"
echo "  - Redis: localhost:6379"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
