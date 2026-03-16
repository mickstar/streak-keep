#!/usr/bin/env bash
set -euo pipefail

REMOTE="git@github.com:mickstar/streak-keep.git"
BRANCH="gh-pages"

echo "Building..."
pnpm build

echo "Deploying to $BRANCH..."
cd dist
git init -b "$BRANCH"
git add -A
git commit -m "Deploy $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
git push -f "$REMOTE" "$BRANCH"
cd ..
rm -rf dist/.git

echo "Done! https://mickstar.github.io/streak-keep/"
