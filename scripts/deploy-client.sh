#!/bin/bash

# Deploy script: Squash commit main to prod/client and push
# Usage: ./deploy-client.sh [commit-message]

set -e  # Exit on error

CURRENT_BRANCH=$(git branch --show-current)
DEPLOY_BRANCH="prod/client"

echo "🚀 Deploying client to ${DEPLOY_BRANCH}"

# Checkout or create prod/client branch
if git show-ref --verify --quiet "refs/heads/${DEPLOY_BRANCH}"; then
    git checkout "${DEPLOY_BRANCH}"
else
    git checkout -b "${DEPLOY_BRANCH}"
fi

# Squash merge from main
git merge --squash main || echo "No changes to merge"

# Commit (allow empty for redeploys)
COMMIT_MSG="${1:-Deploy client $(date '+%Y-%m-%d %H:%M:%S')}"
git commit --allow-empty -m "${COMMIT_MSG}"

# Push
git push origin "${DEPLOY_BRANCH}"

# Return to original branch
git checkout "${CURRENT_BRANCH}"

echo "✅ Client deployed successfully!"
