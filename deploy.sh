#!/bin/bash
# Quick deploy script for mlb-pitch-visualizer
# Uses Docker layer caching for faster builds

set -e
PROJECT_DIR="/root/mlb-pitch-visualizer"
DEPLOY_DIR="/data/coolify/applications/mlb-pitch-visualizer"

echo "🔨 Building with cache (BuildKit)..."
cd "$PROJECT_DIR"

BUILD_START=$(date +%s)
# Stream full output so cache hits/misses and errors are visible.
# .dockerignore keeps the context tiny; deps layer is cached unless package.json changes.
docker build -t mlb-pitch-visualizer:latest . \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --progress=plain
BUILD_END=$(date +%s)
echo "⏱️  Build took $((BUILD_END - BUILD_START))s"

echo "🚀 Deploying..."
cd "$DEPLOY_DIR"

# Stop existing container and start the freshly built local image (no registry pull needed).
docker compose down 2>/dev/null || true
docker compose up -d --no-build

echo "✅ Done!"
docker ps --filter "name=mlb-pitch" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
