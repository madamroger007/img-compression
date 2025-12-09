# 🚀 Deployment Checklist

Use this checklist to deploy your Image Processing application to production.

## Pre-Deployment

### ✅ Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm build`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Dependencies up to date (`pnpm update --latest`)

### ✅ Configuration
- [ ] Environment variables configured
- [ ] `next.config.mjs` reviewed
- [ ] `.env.example` created if needed
- [ ] Security settings reviewed

---

## GitHub Setup

### ✅ Repository Configuration
- [ ] Code pushed to GitHub repository
- [ ] Repository is public or private as intended
- [ ] Branch protection rules set (optional)

### ✅ GitHub Secrets (if using CI/CD)

#### Docker Hub (Optional)
- [ ] `DOCKER_USERNAME` added to secrets
- [ ] `DOCKER_PASSWORD` added to secrets

**How to get:**
1. Login to Docker Hub
2. Settings → Security → New Access Token
3. Copy token and add to GitHub Secrets

#### Vercel (Optional)
- [ ] `VERCEL_TOKEN` added to secrets
- [ ] `VERCEL_ORG_ID` added to secrets
- [ ] `VERCEL_PROJECT_ID` added to secrets

**How to get:**
```bash
npm i -g vercel
vercel link
# Copy from .vercel/project.json
```

#### Codecov (Optional)
- [ ] `CODECOV_TOKEN` added to secrets

**How to get:**
1. Sign up at https://codecov.io
2. Link your GitHub repository
3. Copy token from Codecov dashboard

---

## Deployment Options

Choose one or more deployment methods:

### Option 1: Docker (Recommended)

#### ✅ Local Docker Deployment
- [ ] Docker installed
- [ ] `docker-compose.yml` reviewed
- [ ] Build image: `docker build -t img-compression .`
- [ ] Test locally: `docker run -d -p 3000:3000 img-compression`
- [ ] Verify health: `curl http://localhost:3000/api/health`
- [ ] Check functionality at http://localhost:3000

#### ✅ Docker Hub Publishing
- [ ] Docker Hub account created
- [ ] Login: `docker login`
- [ ] Tag: `docker tag img-compression username/img-compression:latest`
- [ ] Push: `docker push username/img-compression:latest`
- [ ] Verify on Docker Hub

#### ✅ Production Docker Deployment
- [ ] Server has Docker installed
- [ ] Pull image: `docker pull username/img-compression:latest`
- [ ] Run with docker-compose: `docker-compose up -d`
- [ ] Configure Nginx (optional)
- [ ] Setup SSL certificates
- [ ] Configure firewall rules
- [ ] Setup monitoring/alerts

### Option 2: Vercel

#### ✅ Vercel Deployment
- [ ] Vercel account created
- [ ] Repository linked to Vercel
- [ ] Build settings configured:
  - Framework: Next.js
  - Build Command: `pnpm build`
  - Install Command: `pnpm install`
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Test deployment successful

#### ✅ Automatic Deployments
- [ ] GitHub integration enabled
- [ ] Auto-deploy on push to main configured
- [ ] Preview deployments working for PRs

### Option 3: VPS (Manual)

#### ✅ Server Setup
- [ ] Ubuntu 20.04+ VPS provisioned
- [ ] SSH access configured
- [ ] Node.js 20+ installed
- [ ] pnpm installed
- [ ] Nginx installed
- [ ] PM2 installed globally

#### ✅ Application Deployment
- [ ] Code cloned to `/var/www/img-compression`
- [ ] Dependencies installed: `pnpm install`
- [ ] Application built: `pnpm build`
- [ ] PM2 process started: `pm2 start npm --name img-compression -- start`
- [ ] PM2 configured to start on boot: `pm2 startup`
- [ ] PM2 configuration saved: `pm2 save`

#### ✅ Nginx Configuration
- [ ] Nginx config file created
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Site enabled in Nginx
- [ ] Nginx restarted
- [ ] Firewall configured (ports 80, 443, 22)

---

## Post-Deployment

### ✅ Verification
- [ ] Application accessible at production URL
- [ ] Health endpoint returns 200: `/api/health`
- [ ] All features working:
  - [ ] Image compression
  - [ ] Format conversion
  - [ ] Background removal
  - [ ] Image duplication
  - [ ] File upload/download
- [ ] Performance acceptable (< 5s for medium images)

### ✅ Monitoring Setup
- [ ] Health checks configured
- [ ] Uptime monitoring enabled (e.g., UptimeRobot)
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Log aggregation configured
- [ ] Alerts configured for downtime

### ✅ Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] CORS configured if needed
- [ ] Dependencies scanned for vulnerabilities
- [ ] Secrets not exposed in logs/errors

### ✅ Backups
- [ ] Database backup strategy (if applicable)
- [ ] Docker volume backups configured
- [ ] Code repository backed up
- [ ] Configuration files backed up

---

## GitHub Actions Verification

### ✅ Workflow Status
- [ ] All workflows enabled
- [ ] First workflow run successful
- [ ] Test workflow passes
- [ ] Build workflow passes
- [ ] Docker workflow passes (if configured)
- [ ] Deploy workflow passes (if configured)

### ✅ Badges (Optional)
Add to README.md:
```markdown
![CI/CD](https://github.com/username/repo/workflows/CI/CD%20Pipeline/badge.svg)
![Tests](https://github.com/username/repo/workflows/Test%20Suite/badge.svg)
![Docker](https://github.com/username/repo/workflows/Docker%20Image%20Publish/badge.svg)
```

---

## Performance Optimization

### ✅ Production Optimizations
- [ ] Next.js standalone mode enabled ✓
- [ ] Image optimization configured
- [ ] Compression enabled
- [ ] CDN configured (optional)
- [ ] Caching headers set

### ✅ Resource Limits
- [ ] Docker memory limits set
- [ ] Docker CPU limits set
- [ ] Rate limiting configured
- [ ] File upload size limits appropriate
- [ ] Timeout values configured

---

## Documentation

### ✅ Documentation Complete
- [ ] README.md updated with deployment info
- [ ] Environment variables documented
- [ ] API documentation available
- [ ] Deployment guides accessible
- [ ] Troubleshooting guides created

---

## Maintenance Plan

### ✅ Regular Tasks
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Backup verification monthly
- [ ] Performance review quarterly
- [ ] Log review weekly

### ✅ Emergency Procedures
- [ ] Rollback procedure documented
- [ ] Emergency contact list created
- [ ] Incident response plan ready
- [ ] Backup restoration tested

---

## Final Checks

### ✅ Pre-Launch
- [ ] All checklist items completed
- [ ] Team members informed
- [ ] Documentation shared
- [ ] Support channels ready

### ✅ Launch
- [ ] Application deployed to production
- [ ] DNS propagated (if custom domain)
- [ ] Monitoring active and reporting
- [ ] Announcement made (if applicable)

### ✅ Post-Launch (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address critical issues immediately

---

## Quick Reference Commands

### Docker
```bash
# Build
docker build -t img-compression .

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Health
curl http://localhost:3000/api/health

# Stop
docker-compose down
```

### Testing
```bash
pnpm test
pnpm test:coverage
pnpm lint
```

### PM2 (VPS)
```bash
pm2 start npm --name img-compression -- start
pm2 logs img-compression
pm2 restart img-compression
pm2 stop img-compression
```

### Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## Resources

- 📘 [README.md](README.md) - Project overview
- 🐳 [DOCKER.md](DOCKER.md) - Docker guide
- 🔄 [.github/CI-CD.md](.github/CI-CD.md) - CI/CD guide
- 🚀 [.github/DEPLOYMENT.md](.github/DEPLOYMENT.md) - Deployment guide
- 🧪 [TESTING.md](TESTING.md) - Testing guide
- 📋 [CI-CD-DOCKER-SUMMARY.md](CI-CD-DOCKER-SUMMARY.md) - Complete summary

---

## Support

Need help? Check:
1. Documentation files above
2. GitHub Issues in your repository
3. Logs and error messages
4. Health check endpoint output

---

**Good luck with your deployment! 🚀**

*Last updated: December 9, 2025*
