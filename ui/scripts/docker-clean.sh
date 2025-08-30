#!/bin/bash

# Clean Docker resources script for VetGuide UI

set -e

echo "🧹 Cleaning Docker resources for VetGuide UI..."

# Stop all containers
echo "🛑 Stopping all containers..."
docker-compose -f docker-compose.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Remove containers
echo "🗑️  Removing containers..."
docker-compose -f docker-compose.yml rm -f 2>/dev/null || true
docker-compose -f docker-compose.prod.yml rm -f 2>/dev/null || true

# Remove images
echo "🗑️  Removing images..."
docker rmi $(docker images "vetguide-ui*" -q) 2>/dev/null || true

# Remove unused networks
echo "🗑️  Removing unused networks..."
docker network prune -f

# Remove unused volumes
echo "🗑️  Removing unused volumes..."
docker volume prune -f

echo "✅ Docker cleanup completed"
