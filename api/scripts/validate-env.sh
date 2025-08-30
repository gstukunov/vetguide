#!/bin/bash

# Environment validation script for VetGuide API
set -e

echo "🔍 Validating environment configuration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Please copy env.docker to .env and configure it:"
    echo "   cp env.docker .env"
    exit 1
fi

# Source the .env file
source .env

# Function to check if variable is set and not default
check_required() {
    local var_name=$1
    local var_value=$2
    local default_value=$3
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name is not set"
        return 1
    fi
    
    if [ "$var_value" = "$default_value" ]; then
        echo "⚠️  $var_name is using default value: $default_value"
        echo "   Please change this for security!"
        return 1
    fi
    
    echo "✅ $var_name is configured"
    return 0
}

# Function to check password strength
check_password_strength() {
    local var_name=$1
    local var_value=$2
    
    if [ ${#var_value} -lt 12 ]; then
        echo "⚠️  $var_name is too short (minimum 12 characters)"
        return 1
    fi
    
    echo "✅ $var_name has adequate length"
    return 0
}

# Function to check JWT secret strength
check_jwt_secret() {
    local var_name=$1
    local var_value=$2
    
    if [ ${#var_value} -lt 32 ]; then
        echo "⚠️  $var_name is too short (minimum 32 characters for security)"
        return 1
    fi
    
    echo "✅ $var_name has adequate length"
    return 0
}

# Track validation results
validation_failed=false

echo ""
echo "📋 Checking required variables..."

# Check required variables
check_required "DB_PASSWORD" "$DB_PASSWORD" "CHANGE_THIS_SECURE_PASSWORD" || validation_failed=true
check_required "JWT_SECRET" "$JWT_SECRET" "CHANGE_THIS_TO_32_CHAR_SECRET" || validation_failed=true
check_required "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" "CHANGE_THIS_TO_32_CHAR_SECRET" || validation_failed=true
check_required "MINIO_ROOT_PASSWORD" "$MINIO_ROOT_PASSWORD" "CHANGE_THIS_SECURE_PASSWORD" || validation_failed=true

echo ""
echo "🔒 Checking password strength..."

# Check password strength
check_password_strength "DB_PASSWORD" "$DB_PASSWORD" || validation_failed=true
check_password_strength "MINIO_ROOT_PASSWORD" "$MINIO_ROOT_PASSWORD" || validation_failed=true

echo ""
echo "🔑 Checking JWT secret strength..."

# Check JWT secret strength
check_jwt_secret "JWT_SECRET" "$JWT_SECRET" || validation_failed=true
check_jwt_secret "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET" || validation_failed=true

echo ""
echo "🌍 Checking environment settings..."

# Check NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo "✅ Running in production mode"
else
    echo "ℹ️  Running in development mode"
fi

# Check if .env is in .gitignore
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo "✅ .env file is properly ignored by git"
else
    echo "⚠️  .env file is not in .gitignore - this is a security risk!"
    validation_failed=true
fi

echo ""
if [ "$validation_failed" = true ]; then
    echo "❌ Environment validation failed!"
    echo "   Please fix the issues above before starting the application."
    echo ""
    echo "💡 Tips:"
    echo "   - Use strong, unique passwords (12+ characters)"
    echo "   - Generate strong JWT secrets (32+ characters)"
    echo "   - Never use default values in production"
    echo "   - Add .env to .gitignore if not already there"
    exit 1
else
    echo "✅ Environment validation passed!"
    echo "   Your configuration looks secure."
fi
