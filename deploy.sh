#!/bin/bash

# Deploy script: bumps version, commits, pushes, and publishes to npm
# Usage: ./deploy.sh [patch|minor|major]
# Default: patch

set -e  # Exit on error

VERSION_TYPE=${1:-patch}

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "Error: Version type must be 'patch', 'minor', or 'major'"
  echo "Usage: ./deploy.sh [patch|minor|major]"
  exit 1
fi

echo "🚀 Starting deployment process..."
echo "📦 Version bump type: $VERSION_TYPE"

# Check if there are uncommitted changes (excluding package.json which will be updated by npm version)
if ! git diff --quiet --exit-code || ! git diff --cached --quiet --exit-code; then
  echo "📝 Staging all changes..."
  git add -A
  
  echo "💾 Committing changes..."
  git commit -m "chore: prepare for release" || echo "No changes to commit"
fi

# Bump version (this also creates a git commit and tag)
echo "⬆️  Bumping version ($VERSION_TYPE)..."
npm version "$VERSION_TYPE" --no-git-tag-version

# Create git commit for version bump
echo "💾 Committing version bump..."
git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"

# Create git tag
NEW_VERSION=$(node -p "require('./package.json').version")
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push commits and tags
echo "📤 Pushing to git..."
git push
git push --tags

# Publish to npm
echo "📦 Publishing to npm..."
npm publish

echo "✅ Deployment complete! Version $NEW_VERSION has been published."
