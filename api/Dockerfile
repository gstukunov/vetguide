# Multi-stage build for NestJS application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
# Миграции будут скомпилированы в dist/migrations/*.js
COPY --from=builder /app/dist ./dist

# Copy package.json (необходим для работы приложения)
COPY --from=builder /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Create entrypoint script for running migrations
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "🔄 Running database migrations..."' >> /app/docker-entrypoint.sh && \
    echo 'if node dist/scripts/run-migrations.js; then' >> /app/docker-entrypoint.sh && \
    echo '  echo "✅ Migrations completed successfully"' >> /app/docker-entrypoint.sh && \
    echo 'else' >> /app/docker-entrypoint.sh && \
    echo '  echo "⚠️  Migration failed or already applied, continuing..."' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting application..."' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "dist/main.js"]
