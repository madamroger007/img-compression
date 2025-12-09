# Multi-stage build for optimized production image (Debian-based for glibc)
FROM node:20-bookworm-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    pkg-config \
    libvips \
    libvips-dev \
    libfftw3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm (match lockfile generated with pnpm v10)
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (allow lockfile update if needed for version compatibility)
RUN pnpm install --prod=false

# Rebuild the source code only when needed
FROM base AS builder
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    pkg-config \
    libvips \
    libvips-dev \
    libfftw3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm (match lockfile generated with pnpm v10)
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT=true
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libvips \
    libfftw3-double3 \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
