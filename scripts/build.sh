#!/bin/bash

# TreeNetra - Production Build Script

echo "🌳 Building TreeNetra for Production"
echo "====================================="
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Run tests
echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Aborting build."
    exit 1
fi

# Build frontend
echo "Building frontend..."
npm run build:client

# Create production dist
echo "Creating production distribution..."
mkdir -p dist
cp -r src dist/
cp -r config dist/
cp package.json dist/
cp package-lock.json dist/

# Install production dependencies
cd dist
npm ci --production
cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Distribution files are in: ./dist"
echo "Frontend build is in: ./build"
echo ""
