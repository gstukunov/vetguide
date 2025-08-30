#!/bin/bash

# Docker stop script for VetGuide API
set -e

echo "🛑 Stopping VetGuide API..."

# Stop and remove containers
docker-compose down

echo "✅ VetGuide API stopped successfully!"

# Optional: Remove volumes (uncomment if you want to reset data)
# echo "🗑️  Removing volumes..."
# docker-compose down -v
# echo "✅ All data has been removed!"
