#!/bin/bash
# HypeProof Deploy Script
# Usage: ./scripts/deploy.sh [--skip-build]

set -e

cd "$(dirname "$0")/.."

echo "🔨 Building..."
if [[ "$1" != "--skip-build" ]]; then
  rm -rf .next
  npm run build
  echo "✅ Build passed"
else
  echo "⏭️  Skipping build"
fi

echo ""
echo "📦 Committing changes..."
git add -A
if git diff --cached --quiet; then
  echo "ℹ️  No changes to commit"
else
  git commit -m "${COMMIT_MSG:-chore: deploy}"
fi

echo ""
echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo ""
echo "✅ Deploy complete! → https://hypeproof-ai.xyz"
