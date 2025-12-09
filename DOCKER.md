# Docker Quick Start Guide

## Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at: http://localhost:3000

### Option 2: Docker Only

```bash
# Build image
docker build -t img-compression:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --name img-compression \
  img-compression:latest

# View logs
docker logs -f img-compression

# Stop
docker stop img-compression
docker rm img-compression
```

## Docker Compose Services

### App Service
- **Port**: 3000
- **Health Check**: http://localhost:3000/api/health
- **Resources**:
  - CPU: 2 cores (limit), 1 core (reservation)
  - Memory: 2GB (limit), 1GB (reservation)

### Nginx Service (Optional)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Configuration**: `nginx/nginx.conf`
- **Features**:
  - Reverse proxy
  - Rate limiting
  - SSL/TLS termination

## Environment Variables

```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT=true
PORT=3000
HOSTNAME=0.0.0.0
EOF

# Use with docker-compose
docker-compose --env-file .env up -d
```

## Health Monitoring

```bash
# Check health status
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-12-09T...",
  "uptime": 123.456,
  "memory": {
    "used": 150,
    "total": 200
  },
  "env": "production"
}
```

## Useful Commands

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Restart

```bash
# Restart all
docker-compose restart

# Restart app only
docker-compose restart app
```

### Update

```bash
# Pull latest image
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove images
docker rmi img-compression:latest
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Inspect container
docker inspect img-compression-app

# Check resources
docker stats
```

### Port already in use

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill process or change port in docker-compose.yml
```

### Out of memory

```bash
# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

## Production Deployment

### With Nginx

1. **Configure SSL certificates:**
```bash
# Create ssl directory
mkdir -p nginx/ssl

# Copy certificates
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/

# Update nginx.conf to enable HTTPS server block
```

2. **Start with Nginx:**
```bash
docker-compose up -d app nginx
```

### Multi-platform Build

```bash
# Build for multiple architectures
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t username/img-compression:latest \
  --push .
```

## Docker Hub Publishing

```bash
# Login
docker login

# Tag image
docker tag img-compression:latest username/img-compression:latest

# Push
docker push username/img-compression:latest

# Pull on server
docker pull username/img-compression:latest
docker run -d -p 3000:3000 username/img-compression:latest
```

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect img-compression_data

# Backup volume
docker run --rm \
  -v img-compression_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data

# Restore volume
docker run --rm \
  -v img-compression_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/data-backup.tar.gz -C /
```

## Performance Tips

1. **Use BuildKit for faster builds:**
```bash
DOCKER_BUILDKIT=1 docker build -t img-compression:latest .
```

2. **Layer caching:**
```bash
# Build with cache
docker-compose build

# Build without cache
docker-compose build --no-cache
```

3. **Multi-stage builds:**
Already configured in Dockerfile for minimal image size

## Security

1. **Run as non-root user** ✓ (configured in Dockerfile)
2. **Scan for vulnerabilities:**
```bash
docker scan img-compression:latest
```

3. **Keep base images updated:**
```bash
docker pull node:20-alpine
docker-compose build --pull
```

## Monitoring

### Docker Stats

```bash
# Real-time stats
docker stats img-compression-app

# Once
docker stats --no-stream img-compression-app
```

### Health Checks

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' img-compression-app

# View health logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' img-compression-app
```

---

**Need help?** Check [DEPLOYMENT.md](.github/DEPLOYMENT.md) for detailed deployment guides.
