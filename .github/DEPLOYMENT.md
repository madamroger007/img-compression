# Deployment Guide

This document provides comprehensive deployment instructions for the Image Processing application.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Vercel Deployment](#vercel-deployment)
- [VPS Deployment](#vps-deployment)
- [Environment Variables](#environment-variables)

## Docker Deployment

### Quick Start with Docker Compose

1. **Build and run the application:**
```bash
docker-compose up -d
```

2. **View logs:**
```bash
docker-compose logs -f app
```

3. **Stop the application:**
```bash
docker-compose down
```

### Manual Docker Build

1. **Build the image:**
```bash
docker build -t img-compression:latest .
```

2. **Run the container:**
```bash
docker run -d \
  -p 3000:3000 \
  --name img-compression \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT=true \
  img-compression:latest
```

3. **Check health:**
```bash
curl http://localhost:3000/api/health
```

### Docker Hub Deployment

1. **Tag the image:**
```bash
docker tag img-compression:latest yourusername/img-compression:latest
```

2. **Push to Docker Hub:**
```bash
docker login
docker push yourusername/img-compression:latest
```

3. **Pull and run on any server:**
```bash
docker pull yourusername/img-compression:latest
docker run -d -p 3000:3000 yourusername/img-compression:latest
```

## GitHub Actions CI/CD

### Setup Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

#### For Docker Hub Publishing:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

#### For Vercel Deployment:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### Workflows Overview

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on push to main/develop
   - Runs on pull requests
   - Jobs:
     - Test (Node 18.x, 20.x)
     - Build
     - Docker build & push
     - Vercel deployment

2. **Docker Publish** (`.github/workflows/docker-publish.yml`)
   - Runs on releases
   - Pushes to GitHub Container Registry
   - Supports multi-platform (amd64, arm64)

3. **Test Suite** (`.github/workflows/test.yml`)
   - Runs on all branches
   - Tests on Ubuntu, Windows, macOS
   - Generates coverage reports
   - Comments coverage on PRs

### Manual Workflow Trigger

```bash
# Trigger via GitHub CLI
gh workflow run ci.yml

# Or use GitHub UI: Actions → Select workflow → Run workflow
```

## Vercel Deployment

### Automatic Deployment (via GitHub)

1. **Connect repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings

2. **Build Configuration:**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Environment Variables:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT=true
   ```

### CLI Deployment

1. **Install Vercel CLI:**
```bash
pnpm add -g vercel
```

2. **Login and deploy:**
```bash
vercel login
vercel --prod
```

## VPS Deployment

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- Nginx installed
- SSL certificate (Let's Encrypt recommended)

### Step 1: Clone and Setup

```bash
# Clone repository
git clone <your-repo-url> /var/www/img-compression
cd /var/www/img-compression

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build
```

### Step 2: Setup PM2 for Process Management

```bash
# Install PM2
pnpm add -g pm2

# Start application
pm2 start npm --name "img-compression" -- start

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### Step 3: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/img-compression

# Enable site
sudo ln -s /etc/nginx/sites-available/img-compression /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 4: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### Step 5: Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## Environment Variables

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3000` | No |
| `HOSTNAME` | Server hostname | `localhost` | No |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT` | Auto-download after processing | `true` |
| `MAX_FILE_SIZE` | Maximum upload size (bytes) | `52428800` (50MB) |

### Setting Environment Variables

#### Docker:
```bash
docker run -e NODE_ENV=production -e PORT=3000 ...
```

#### Docker Compose:
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
```

#### PM2:
```bash
pm2 start npm --name "img-compression" -- start --env production
```

#### Vercel:
Set via dashboard or `vercel.json`

## Monitoring and Maintenance

### Health Checks

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://yourdomain.com/api/health
```

### View Logs

**Docker:**
```bash
docker logs -f img-compression
```

**PM2:**
```bash
pm2 logs img-compression
```

**Docker Compose:**
```bash
docker-compose logs -f app
```

### Update Deployment

**Docker:**
```bash
docker-compose pull
docker-compose up -d
```

**VPS:**
```bash
git pull origin main
pnpm install
pnpm build
pm2 restart img-compression
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

2. **Out of memory:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

3. **Permission errors:**
```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/img-compression
```

4. **Sharp/libvips errors:**
```bash
# Rebuild sharp
pnpm rebuild sharp
```

## Scaling

### Horizontal Scaling with Docker

```bash
# Scale to 3 instances
docker-compose up -d --scale app=3

# Use load balancer (Nginx, HAProxy, or cloud LB)
```

### Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: img-compression
spec:
  replicas: 3
  selector:
    matchLabels:
      app: img-compression
  template:
    metadata:
      labels:
        app: img-compression
    spec:
      containers:
      - name: img-compression
        image: yourusername/img-compression:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

## Security Best Practices

1. **Keep dependencies updated:**
```bash
pnpm update --latest
```

2. **Use HTTPS in production** (handled by Nginx/Vercel)

3. **Enable rate limiting** (configured in nginx.conf)

4. **Set proper CORS headers** (if needed)

5. **Regular security audits:**
```bash
pnpm audit
pnpm audit fix
```

## Support

For deployment issues:
1. Check logs first
2. Review environment variables
3. Verify network/firewall settings
4. Check GitHub Issues
5. Contact support

---

**Last Updated:** December 2025
