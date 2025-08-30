#!/bin/bash

# Docker reset script for VetGuide API
set -e

echo "⚠️  This will completely reset the VetGuide API environment!"
echo "   This includes:"
echo "   - Stopping all containers"
echo "   - Removing all containers"
echo "   - Removing all volumes (database data, MinIO data, uploads)"
echo "   - Removing all images"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo "🛑 Stopping and removing containers..."
docker-compose down -v

echo "🗑️  Removing images..."
docker-compose down --rmi all

echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

echo "✅ VetGuide API environment has been completely reset!"
echo "   Run ./scripts/docker-start.sh to start fresh."
