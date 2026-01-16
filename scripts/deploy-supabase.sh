#!/bin/bash

# Deploy script: Squash commit main to prod/supabase and push
# Usage: ./deploy-supabase.sh [commit-message]

set -e  # Exit on error

CURRENT_BRANCH=$(git branch --show-current)
DEPLOY_BRANCH="prod/supabase"

echo "🚀 Deploying supabase to ${DEPLOY_BRANCH}"

# Checkout or create prod/supabase branch
if git show-ref --verify --quiet "refs/heads/${DEPLOY_BRANCH}"; then
    git checkout "${DEPLOY_BRANCH}"
else
    git checkout -b "${DEPLOY_BRANCH}"
fi

# Make working tree match main (avoids merge conflicts)
git fetch origin "${DEPLOY_BRANCH}" || true
git reset --hard origin/"${DEPLOY_BRANCH}" 2>/dev/null || true
git read-tree -u --reset main

# Commit (allow empty for redeploys)
COMMIT_MSG="${1:-Deploy supabase $(date '+%Y-%m-%d %H:%M:%S')}"
git commit --allow-empty -m "${COMMIT_MSG}"

# Push
git push origin "${DEPLOY_BRANCH}"

# Deploy to Supabase
echo "📤 Deploying to Supabase..."
bun run sb:push

# Return to original branch
git checkout "${CURRENT_BRANCH}"

echo "✅ Supabase deployed successfully!"
