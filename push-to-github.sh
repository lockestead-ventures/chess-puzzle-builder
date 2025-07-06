#!/bin/bash

# Simple script to push commits to GitHub
# Usage: ./push-to-github.sh

echo "🚀 Pushing to GitHub..."

# Get the current branch
BRANCH=$(git symbolic-ref --short HEAD)

# Check if there are any commits to push
if git log origin/$BRANCH..HEAD --oneline | grep -q .; then
    echo "📝 Found commits to push:"
    git log origin/$BRANCH..HEAD --oneline
    
    # Push to GitHub
    if git push origin $BRANCH; then
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 Repository: https://github.com/lockestead-ventures/chess-puzzle-builder.git"
    else
        echo "❌ Failed to push to GitHub. Please check your connection."
        exit 1
    fi
else
    echo "ℹ️  No new commits to push."
fi 