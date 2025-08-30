#!/bin/bash

# Docker logs script for VetGuide API
set -e

# Get service name from argument, default to 'app'
SERVICE=${1:-app}

echo "📋 Showing logs for service: $SERVICE"
echo "Press Ctrl+C to exit"
echo ""

# Show logs with follow
docker-compose logs -f $SERVICE
