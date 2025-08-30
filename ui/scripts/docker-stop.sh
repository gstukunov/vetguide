#!/bin/bash

# Stop Docker containers script for VetGuide UI

set -e

echo "🛑 Stopping VetGuide UI containers..."

# Stop development containers
if docker-compose -f docker-compose.yml ps -q | grep -q .; then
    echo "📦 Stopping development containers..."
    docker-compose -f docker-compose.yml down
fi

# Stop production containers
if docker-compose -f docker-compose.prod.yml ps -q | grep -q .; then
    echo "📦 Stopping production containers..."
    docker-compose -f docker-compose.prod.yml down
fi

echo "✅ All containers stopped"
