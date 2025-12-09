# CI/CD Error Troubleshooting Guide

## Common CI/CD Errors and Solutions

### 🔴 Error: "pnpm: command not found"

**Cause**: pnpm is not installed or not in PATH

**Solution**:
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8  # Ensure this matches your pnpm version
```

**Verify locally**:
```bash
pnpm --version
```

---

### 🔴 Error: "DOCKER_USERNAME secret not found"

**Cause**: Docker Hub credentials not configured in GitHub repository secrets

**Solution**:
1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token (not password!)

**How to get Docker Hub token**:
1. Log in to https://hub.docker.com
2. Go to Account Settings → Security → Access Tokens
3. Click "New Access Token"
4. Copy the token (you won't see it again!)

**Skip Docker job if secrets not configured**:
```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main' && secrets.DOCKER_USERNAME != ''
```

---

### 🔴 Error: "Cannot find module 'sharp'"

**Cause**: Sharp native dependencies not installed properly

**Solution**:
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
  env:
    SHARP_IGNORE_GLOBAL_LIBVIPS: 1
```

Or in Dockerfile:
```dockerfile
RUN pnpm install --frozen-lockfile && \
    pnpm rebuild sharp
```

---

### 🔴 Error: "ESLint configuration not found"

**Cause**: Missing `.eslintrc.json` file

**Solution**: Create `.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

---

### 🔴 Error: "Tests failed" - Background removal tests

**Cause**: `@imgly/background-removal-node` requires specific Node.js version or native dependencies

**Solution**:

1. **Add to package.json**:
```json
"engines": {
  "node": ">=18.0.0"
}
```

2. **Update CI workflow**:
```yaml
- name: Install system dependencies (Ubuntu)
  run: |
    sudo apt-get update
    sudo apt-get install -y libvips-dev
  if: runner.os == 'Linux'
```

3. **Skip tests on Windows/macOS** (optional):
```yaml
- name: Run tests
  run: pnpm test
  if: runner.os == 'Linux'
```

---

### 🔴 Error: "VERCEL_TOKEN not found"

**Cause**: Vercel deployment credentials not configured

**Solution**:

1. Get Vercel tokens:
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login and link project
vercel login
vercel link

# Get tokens from .vercel/project.json
cat .vercel/project.json
```

2. Add to GitHub Secrets:
   - `VERCEL_TOKEN`: From `vercel login` → Settings → Tokens
   - `VERCEL_ORG_ID`: From `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: From `.vercel/project.json`

**Skip Vercel deployment if not configured**:
```yaml
deploy-vercel:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main' && secrets.VERCEL_TOKEN != ''
```

---

### 🔴 Error: "Docker build failed - platform not supported"

**Cause**: Trying to build ARM64 images on AMD64 runners without QEMU

**Solution**:
```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

Or build only for current platform:
```yaml
platforms: linux/amd64  # Remove linux/arm64
```

---

### 🔴 Error: "Coverage upload failed"

**Cause**: Codecov token not configured or coverage files not generated

**Solution**:

1. Make token optional:
```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    fail_ci_if_error: false  # Don't fail CI if upload fails
```

2. Check coverage files exist:
```yaml
- name: Check coverage files
  run: |
    ls -la coverage/
    cat coverage/coverage-final.json
```

---

### 🔴 Error: "Build exceeded memory limit"

**Cause**: Next.js build requires more memory than available

**Solution**:

1. **Increase Node.js memory**:
```yaml
- name: Build application
  run: NODE_OPTIONS="--max_old_space_size=4096" pnpm build
```

2. **Reduce build size**:
```javascript
// next.config.mjs
export default {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

---

### 🔴 Error: "pnpm-lock.yaml is out of sync"

**Cause**: Lock file doesn't match package.json

**Solution**:
```bash
# Locally, regenerate lock file
rm pnpm-lock.yaml
pnpm install

# Commit the new lock file
git add pnpm-lock.yaml
git commit -m "fix: update pnpm lock file"
git push
```

---

### 🔴 Error: "Port 3000 already in use" (in Docker)

**Cause**: Container port conflict

**Solution**:

In `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "3001:3000"  # Map to different host port
```

Or stop conflicting container:
```bash
docker ps
docker stop <container-id>
```

---

## Debugging Workflows

### Enable Debug Logging

1. Go to repository Settings → Secrets and variables → Actions
2. Add secret: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow to see detailed logs

### Check Workflow Syntax

```bash
# Install actionlint
# https://github.com/rhysd/actionlint

# Check workflow files
actionlint .github/workflows/*.yml
```

### Test Locally with act

```bash
# Install act: https://github.com/nektos/act
brew install act  # macOS
choco install act-cli  # Windows

# Run workflow locally
act -j test  # Run test job
act -j build  # Run build job
```

---

## Quick Fixes

### Make Docker and Vercel jobs optional

Update `.github/workflows/ci.yml`:

```yaml
docker:
  name: Build Docker Image
  runs-on: ubuntu-latest
  needs: test
  if: |
    github.event_name == 'push' && 
    github.ref == 'refs/heads/main' &&
    secrets.DOCKER_USERNAME != ''
  continue-on-error: true  # Don't fail CI if Docker fails

deploy-vercel:
  name: Deploy to Vercel
  runs-on: ubuntu-latest
  needs: [test, build]
  if: |
    github.event_name == 'push' && 
    github.ref == 'refs/heads/main' &&
    secrets.VERCEL_TOKEN != ''
  continue-on-error: true  # Don't fail CI if Vercel fails
```

### Minimal CI (Test Only)

If you just want tests to run, create `.github/workflows/ci-minimal.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test
      
      - name: Run build
        run: pnpm build
```

---

## Monitoring CI/CD Status

### GitHub Actions Status Badge

Add to `README.md`:
```markdown
![CI/CD](https://github.com/madamroger007/img-compression/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### Check workflow runs

```bash
# Using GitHub CLI
gh run list
gh run view <run-id>
gh run watch
```

---

## Common Environment Variables

```yaml
env:
  NODE_ENV: production
  NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT: 'true'
  NEXT_TELEMETRY_DISABLED: 1
  CI: true
```

---

## Need Help?

1. Check workflow logs in GitHub Actions tab
2. Enable debug logging (see above)
3. Test locally with `act`
4. Review this troubleshooting guide
5. Check [GitHub Actions documentation](https://docs.github.com/en/actions)

---

## Current Workflow Status

Run this to check your current setup:

```bash
# Check if workflows are valid
cat .github/workflows/*.yml

# Check if required secrets are documented
grep -r "secrets\." .github/workflows/

# Check if pnpm scripts exist
cat package.json | grep -A 20 '"scripts"'

# Test commands locally
pnpm install
pnpm lint
pnpm test
pnpm build
```
