# Docker Setup for VetGuide UI

This document provides instructions for running the VetGuide UI application using Docker in both development and production environments.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Development Mode

For local development with hot reload:

```bash
# Using the helper script
./scripts/docker-dev.sh

# Or manually
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Production Mode

For production deployment:

```bash
# Using the helper script
./scripts/docker-prod.sh

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build
```

The application will be available at `http://localhost` (port 80) with Nginx as reverse proxy.

## Docker Files Overview

### Core Files

- **`Dockerfile`** - Multi-stage production build optimized for size and security
- **`Dockerfile.dev`** - Development build with hot reload support
- **`.dockerignore`** - Excludes unnecessary files from Docker context
- **`docker-compose.yml`** - Development environment configuration
- **`docker-compose.prod.yml`** - Production environment with Nginx
- **`nginx.conf`** - Nginx configuration for production reverse proxy

### Helper Scripts

- **`scripts/docker-dev.sh`** - Start development environment
- **`scripts/docker-prod.sh`** - Start production environment
- **`scripts/docker-stop.sh`** - Stop all containers
- **`scripts/docker-clean.sh`** - Clean up Docker resources

## Development Workflow

### Starting Development

```bash
./scripts/docker-dev.sh
```

This will:

- Build the development Docker image
- Start the container with volume mounts for hot reload
- Expose the application on port 3000

### Making Changes

The development setup includes volume mounts, so changes to your source code will automatically trigger hot reload in the browser.

### Stopping Development

```bash
./scripts/docker-stop.sh
```

## Production Deployment

### Local Production Testing

```bash
./scripts/docker-prod.sh
```

This will:

- Build the optimized production image
- Start the application with Nginx reverse proxy
- Expose the application on port 80

### Server Deployment

1. **Copy files to server:**

   ```bash
   scp -r . user@your-server:/path/to/vetguide-ui/
   ```

2. **On the server, start production:**

   ```bash
   cd /path/to/vetguide-ui
   ./scripts/docker-prod.sh
   ```

3. **Configure domain (optional):**
   - Update `nginx.conf` with your domain name
   - Add SSL certificates to `ssl/` directory
   - Uncomment HTTPS configuration in `nginx.conf`

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
# Add your API endpoints and other configuration
```

## Docker Commands Reference

### Manual Commands

```bash
# Development
docker-compose up --build
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose logs -f
docker-compose -f docker-compose.prod.yml logs -f

# Execute commands in container
docker-compose exec vetguide-ui sh
```

### Cleanup Commands

```bash
# Stop all containers
./scripts/docker-stop.sh

# Clean up everything (containers, images, volumes)
./scripts/docker-clean.sh

# Remove specific images
docker rmi vetguide-ui_vetguide-ui
```

## Production Features

### Nginx Configuration

The production setup includes:

- **Reverse Proxy** - Routes requests to the Next.js application
- **Static File Caching** - Optimized caching for `_next/static` files
- **Rate Limiting** - Protection against abuse (API: 10 req/s, Auth: 5 req/m)
- **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
- **Gzip Compression** - Reduces bandwidth usage
- **Health Check** - Available at `/health` endpoint

### SSL/HTTPS Setup

To enable HTTPS:

1. Place your SSL certificates in the `ssl/` directory:

   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. Uncomment the HTTPS server block in `nginx.conf`

3. Update the server name to your domain

4. Restart the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml restart
   ```

## Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Permission issues on Linux:**

   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   ```

3. **Build failures:**

   ```bash
   # Clean and rebuild
   ./scripts/docker-clean.sh
   ./scripts/docker-dev.sh
   ```

4. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs vetguide-ui
   ```

### Performance Optimization

- The production Dockerfile uses multi-stage builds for smaller images
- Next.js standalone output reduces bundle size
- Nginx handles static file serving and compression
- Alpine Linux base images minimize attack surface

## Monitoring

### Health Checks

- Application health: `http://localhost/health`
- Container status: `docker-compose ps`

### Logs

```bash
# Follow all logs
docker-compose -f docker-compose.prod.yml logs -f

# Follow specific service logs
docker-compose -f docker-compose.prod.yml logs -f vetguide-ui
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## Security Considerations

- Production containers run as non-root user (`nextjs`)
- Security headers are configured in Nginx
- Rate limiting prevents abuse
- Environment variables should be used for sensitive configuration
- Regular security updates for base images

## Support

For issues related to Docker setup, check:

1. Docker and Docker Compose versions
2. Available disk space and memory
3. Network connectivity
4. Container logs for specific error messages
