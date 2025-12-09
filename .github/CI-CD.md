# CI/CD Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline includes automated testing, building, and deployment to multiple platforms.

## Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Test Job
- **Matrix Strategy**: Tests on Node.js 18.x and 20.x
- **Steps**:
  1. Checkout code
  2. Setup pnpm and Node.js
  3. Install dependencies
  4. Run linter (`pnpm lint`)
  5. Run tests (`pnpm test`)
  6. Generate coverage report
  7. Upload coverage to Codecov

#### Build Job
- **Depends on**: Test job success
- **Steps**:
  1. Checkout code
  2. Setup pnpm and Node.js
  3. Install dependencies
  4. Build Next.js application
  5. Upload build artifacts

#### Docker Job
- **Depends on**: Test job success
- **Condition**: Only runs on push to `main` branch
- **Steps**:
  1. Checkout code
  2. Setup Docker Buildx
  3. Login to Docker Hub
  4. Build multi-platform image (amd64, arm64)
  5. Push to Docker Hub with proper tags

#### Deploy Vercel Job
- **Depends on**: Test and Build jobs
- **Condition**: Only runs on push to `main` branch
- **Steps**:
  1. Checkout code
  2. Deploy to Vercel production

---

### 2. Docker Publish (`.github/workflows/docker-publish.yml`)

**Triggers:**
- New releases
- Manual workflow dispatch

**Features:**
- Publishes to GitHub Container Registry (ghcr.io)
- Multi-platform support (linux/amd64, linux/arm64)
- Automatic tagging:
  - `latest` for default branch
  - Version tags from releases (1.0.0, 1.0, 1)
  - Git SHA tags
- Build provenance attestation

---

### 3. Test Suite (`.github/workflows/test.yml`)

**Triggers:**
- Push to any branch
- Pull requests to `main` or `develop`

**Matrix Testing:**
- **Operating Systems**: Ubuntu, Windows, macOS
- **Node Versions**: 18.x, 20.x

**Features:**
- Cross-platform testing
- Coverage report generation
- Coverage comments on PRs
- Upload test results as artifacts

---

## Required GitHub Secrets

### For Docker Hub

```
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-token
```

**How to get Docker Hub token:**
1. Log in to Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Copy the token and add to GitHub secrets

### For Vercel Deployment

```
VERCEL_TOKEN: your-vercel-token
VERCEL_ORG_ID: your-org-id
VERCEL_PROJECT_ID: your-project-id
```

**How to get Vercel credentials:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel link

# Get credentials from .vercel/project.json
cat .vercel/project.json
```

### Optional: Codecov

```
CODECOV_TOKEN: your-codecov-token
```

---

## Workflow Status Badges

Add to your README.md:

```markdown
![CI/CD](https://github.com/username/repo/workflows/CI/CD%20Pipeline/badge.svg)
![Tests](https://github.com/username/repo/workflows/Test%20Suite/badge.svg)
![Docker](https://github.com/username/repo/workflows/Docker%20Image%20Publish/badge.svg)
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

---

## Local Testing

### Test Workflows Locally with act

```bash
# Install act
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflows locally
act push
act pull_request
```

---

## Pipeline Flow Diagram

```
┌─────────────────────┐
│  Push to main/dev   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Test Job         │
│  (Node 18.x, 20.x)  │
│  - Lint             │
│  - Test             │
│  - Coverage         │
└──────────┬──────────┘
           │
           ├──────────────┬──────────────┐
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐  ┌──────────┐
    │  Build   │   │  Docker  │  │  Vercel  │
    │   Job    │   │   Job    │  │   Job    │
    └──────────┘   └──────────┘  └──────────┘
```

---

## Docker Image Tags

### Main Branch Push
- `username/img-compression:main`
- `username/img-compression:main-<sha>`

### Release v1.2.3
- `username/img-compression:1.2.3`
- `username/img-compression:1.2`
- `username/img-compression:1`
- `username/img-compression:latest`

### Pull Request
- `username/img-compression:pr-123`

---

## Environment-Specific Configuration

### Development
```yaml
NODE_ENV: development
NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT: true
```

### Production
```yaml
NODE_ENV: production
NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT: true
```

---

## Troubleshooting

### Build Failures

**Check logs:**
```bash
# View workflow logs on GitHub
# Settings → Actions → Select failed workflow → View logs
```

**Common issues:**

1. **Dependencies installation fails**
   - Check `pnpm-lock.yaml` is committed
   - Verify Node.js version compatibility

2. **Build fails**
   - Check for TypeScript errors
   - Verify environment variables

3. **Tests fail**
   - Run tests locally: `pnpm test`
   - Check for platform-specific issues

### Docker Build Failures

**Common issues:**

1. **Out of memory**
   - Increase Docker memory limit
   - Use multi-stage builds (already configured)

2. **Platform-specific errors**
   - Test locally: `docker build --platform linux/amd64 .`

### Deployment Failures

**Vercel:**
- Check Vercel token validity
- Verify project ID and org ID
- Check build logs on Vercel dashboard

---

## Performance Optimization

### Caching

**GitHub Actions cache:**
- pnpm dependencies cached automatically
- Docker layers cached with `cache-from: type=gha`

**Example speeds:**
- Fresh build: ~5-7 minutes
- Cached build: ~2-3 minutes

### Parallel Jobs

Tests run in parallel across:
- Multiple Node.js versions
- Multiple operating systems

Total time: ~3-5 minutes (all jobs)

---

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Scan dependencies** - Automated with Dependabot
3. **Lock file integrity** - Use `--frozen-lockfile`
4. **Least privilege** - Minimal permissions for tokens
5. **Sign commits** - Enable commit signature verification

---

## Monitoring

### GitHub Actions Usage

View usage:
```
Settings → Billing → Usage this month
```

**Free tier limits:**
- 2,000 minutes/month for private repos
- Unlimited for public repos

### Notifications

Configure notifications:
```
Settings → Notifications → Actions
```

Options:
- Email on failure
- Slack integration
- Discord webhooks

---

## Manual Workflow Triggers

### Via GitHub CLI

```bash
# Trigger CI pipeline
gh workflow run ci.yml

# Trigger Docker publish
gh workflow run docker-publish.yml

# Trigger with inputs
gh workflow run ci.yml -f environment=production
```

### Via GitHub UI

1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose branch and inputs

---

## Rollback Strategy

### Docker Rollback

```bash
# List previous images
docker images username/img-compression

# Deploy previous version
docker pull username/img-compression:1.2.2
docker-compose up -d
```

### Vercel Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

---

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Implement blue-green deployments
- [ ] Add performance benchmarks
- [ ] Set up staging environment
- [ ] Configure automatic rollback on failures
- [ ] Add deployment notifications (Slack/Discord)

---

**Last Updated:** December 2025
