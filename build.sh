#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Crow SAP Agent — Type Check & Build
# ═══════════════════════════════════════════════════════════════
set -euo pipefail
cd "$(dirname "$0")"

echo "🔨 Building Crow SAP Agent..."
npx tsc

echo "✅ Build successful!"
echo "📁 Output: ./dist/"
