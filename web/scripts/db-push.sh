#!/bin/bash
# HypeProof DB Migration Push
# Requires: SUPABASE_ACCESS_TOKEN env or `supabase login` first
# Usage: ./scripts/db-push.sh

set -e

cd "$(dirname "$0")/.."

PROJECT_REF="kuwcknqfurwehzgyzomy"

echo "🔗 Linking to Supabase project..."
npx supabase link --project-ref "$PROJECT_REF"

echo ""
echo "📊 Pushing migrations..."
npx supabase db push

echo ""
echo "✅ Database migrations applied!"
