#!/bin/bash

# Development Docker script for VetGuide UI

set -e

echo "🐳 Starting VetGuide UI in development mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start development containers
echo "📦 Building development image..."
docker-compose -f docker-compose.yml build

echo "🚀 Starting development containers..."
docker-compose -f docker-compose.yml up

echo "✅ Development environment is running at http://localhost:3000"
