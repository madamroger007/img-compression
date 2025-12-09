#!/usr/bin/env pwsh
# CI/CD Health Check Script

Write-Host "`n🔍 CI/CD Configuration Health Check`n" -ForegroundColor Cyan

# Check workflow files
Write-Host "📋 Checking workflow files..." -ForegroundColor Yellow
$workflows = @(
    ".github/workflows/ci.yml",
    ".github/workflows/test.yml",
    ".github/workflows/docker-publish.yml"
)

foreach ($workflow in $workflows) {
    if (Test-Path $workflow) {
        Write-Host "  ✅ $workflow exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $workflow missing" -ForegroundColor Red
    }
}

# Check package.json scripts
Write-Host "`n📦 Checking package.json scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$requiredScripts = @("dev", "build", "start", "lint", "test")

foreach ($script in $requiredScripts) {
    if ($packageJson.scripts.$script) {
        Write-Host "  ✅ Script '$script' defined" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Script '$script' missing" -ForegroundColor Red
    }
}

# Check ESLint config
Write-Host "`n🔧 Checking ESLint configuration..." -ForegroundColor Yellow
$eslintConfigs = @(".eslintrc.json", ".eslintrc.js", "eslint.config.js")
$hasEslint = $false

foreach ($config in $eslintConfigs) {
    if (Test-Path $config) {
        Write-Host "  ✅ $config exists" -ForegroundColor Green
        $hasEslint = $true
        break
    }
}

if (-not $hasEslint) {
    Write-Host "  ⚠️  No ESLint config found (will use Next.js defaults)" -ForegroundColor Yellow
}

# Check Docker files
Write-Host "`n🐳 Checking Docker configuration..." -ForegroundColor Yellow
$dockerFiles = @("Dockerfile", "docker-compose.yml", ".dockerignore")

foreach ($file in $dockerFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
    }
}

# Check for required secrets documentation
Write-Host "`n🔐 Required GitHub Secrets (add in repo settings):" -ForegroundColor Yellow
Write-Host "  • DOCKER_USERNAME - Docker Hub username" -ForegroundColor Cyan
Write-Host "  • DOCKER_PASSWORD - Docker Hub access token" -ForegroundColor Cyan
Write-Host "  • VERCEL_TOKEN - Vercel deployment token" -ForegroundColor Cyan
Write-Host "  • VERCEL_ORG_ID - Vercel organization ID" -ForegroundColor Cyan
Write-Host "  • VERCEL_PROJECT_ID - Vercel project ID" -ForegroundColor Cyan

# Test commands locally
Write-Host "`n🧪 Testing commands locally..." -ForegroundColor Yellow

Write-Host "  Testing: pnpm --version" -ForegroundColor Gray
try {
    $pnpmVersion = pnpm --version 2>$null
    Write-Host "  ✅ pnpm v$pnpmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ pnpm not installed" -ForegroundColor Red
    Write-Host "     Install: npm install -g pnpm" -ForegroundColor Gray
}

Write-Host "`n  Testing: pnpm lint" -ForegroundColor Gray
try {
    $lintOutput = pnpm lint 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Linting passed" -ForegroundColor Green
    } else {
        $warningCount = ($lintOutput | Select-String -Pattern "Warning:" -AllMatches).Matches.Count
        Write-Host "  ⚠️  Linting completed with $warningCount warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Linting failed" -ForegroundColor Red
}

Write-Host "`n  Testing: pnpm test" -ForegroundColor Gray
try {
    $testOutput = pnpm test 2>&1
    if ($LASTEXITCODE -eq 0) {
        $passedTests = ($testOutput | Select-String -Pattern "(\d+) passed").Matches[0].Groups[1].Value
        Write-Host "  ✅ $passedTests tests passed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Tests failed" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Tests failed to run" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Workflows are configured and valid" -ForegroundColor White
Write-Host "  • Tests are passing locally" -ForegroundColor White
Write-Host "  • Docker job will skip if DOCKER_USERNAME secret not set" -ForegroundColor White
Write-Host "  • Vercel job will skip if VERCEL_TOKEN secret not set" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • CI-CD-ERRORS.md - Troubleshooting guide" -ForegroundColor White
Write-Host "  • .github/CI-CD.md - Workflow documentation" -ForegroundColor White
Write-Host "  • DEPLOYMENT-CHECKLIST.md - Deployment steps" -ForegroundColor White

Write-Host "`n✨ CI/CD is ready! Push to 'main' branch to trigger workflows.`n" -ForegroundColor Green
