#!/bin/bash

# Production Docker script for VetGuide UI

set -e

echo "🐳 Starting VetGuide UI in production mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start production containers
echo "📦 Building production image..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Production environment is running at http://localhost"
echo "📊 View logs with: docker-compose -f docker-compose.prod.yml logs -f"
