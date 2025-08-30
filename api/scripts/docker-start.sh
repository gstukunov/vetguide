#!/bin/bash

# Docker startup script for VetGuide API
set -e

echo "🐳 Starting VetGuide API with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from env.docker template..."
    cp env.docker .env
    echo "📝 Please edit .env file with your actual configuration values"
    echo "🔐 Make sure to change default passwords and secrets!"
    echo ""
    echo "🚨 SECURITY WARNING:"
    echo "   - Change all default passwords"
    echo "   - Generate strong JWT secrets (32+ characters)"
    echo "   - Never commit .env file to version control"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Validate environment configuration
echo "🔍 Validating environment configuration..."
if ! ./scripts/validate-env.sh; then
    echo "❌ Environment validation failed. Please fix the issues and try again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "✅ VetGuide API is starting up!"
echo ""
echo "📊 Service URLs:"
echo "   API: http://localhost:3001"
echo "   API Docs: http://localhost:3001/api (Swagger UI)"
echo "   MinIO Console: http://localhost:9001"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "📝 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo "🔄 Restart: docker-compose restart"
echo ""
echo "🔍 To view logs: docker-compose logs -f app"
