#!/bin/bash

# Media4U - Update All Git Remotes to Organization
# Run this after transferring repos to Media4u-fun organization

echo "🚀 Updating all git remotes to Media4u-fun organization..."
echo ""

# Update innovative-door-solutions
echo "📦 Updating innovative-door-solutions..."
cd /c/Users/devla/OneDrive/Desktop/claud/innovative-door-solutions
git remote set-url origin https://github.com/Media4u-fun/innovative-door-solutions.git
git fetch
echo "✅ innovative-door-solutions updated!"
echo ""

# Update orangecrest-pools
echo "📦 Updating orangecrest-pools..."
cd /c/Users/devla/OneDrive/Desktop/claud/orangecrest-pools
git remote set-url origin https://github.com/Media4u-fun/orangecrest-pools.git
git fetch
echo "✅ orangecrest-pools updated!"
echo ""

# Update at-ease-pest
echo "📦 Updating at-ease-pest..."
cd /c/Users/devla/OneDrive/Desktop/claud/at-ease-pest
git remote set-url origin https://github.com/Media4u-fun/at-ease-pest.git
git fetch
echo "✅ at-ease-pest updated!"
echo ""

# Go back to media4u
cd /c/Users/devla/OneDrive/Desktop/claud/media4u

echo "🎉 ALL DONE! All repos now point to Media4u-fun organization!"
echo ""
echo "Verify with: git remote -v (in each project folder)"
