#!/bin/bash

# Media4U - Verify Organization Setup
# Checks all repos are properly connected to Media4u-fun organization

echo "🔍 VERIFYING MEDIA4U ORGANIZATION SETUP"
echo "========================================"
echo ""

# Function to check a repo
check_repo() {
  local repo_path=$1
  local repo_name=$2
  local expected_url=$3

  echo "📦 Checking $repo_name..."

  if [ ! -d "$repo_path" ]; then
    echo "   ❌ Directory not found: $repo_path"
    echo ""
    return 1
  fi

  cd "$repo_path"

  # Check remote URL
  local actual_url=$(git remote get-url origin 2>&1)

  if [ "$actual_url" = "$expected_url" ]; then
    echo "   ✅ Remote URL correct: $actual_url"
  else
    echo "   ⚠️  Remote URL mismatch!"
    echo "      Expected: $expected_url"
    echo "      Actual:   $actual_url"
  fi

  # Try to fetch to verify connectivity
  echo "   🔄 Testing connection..."
  if git fetch --dry-run origin 2>&1 | grep -q "fatal"; then
    echo "   ❌ Cannot connect to remote repository"
  else
    echo "   ✅ Connection successful"
  fi

  # Check current branch
  local branch=$(git branch --show-current)
  echo "   📍 Current branch: $branch"

  echo ""
}

# Check all 4 repos
check_repo "/c/Users/devla/OneDrive/Desktop/claud/media4u" \
           "media4u" \
           "https://github.com/Media4u-fun/media4u.git"

check_repo "/c/Users/devla/OneDrive/Desktop/claud/innovative-door-solutions" \
           "innovative-door-solutions" \
           "https://github.com/Media4u-fun/innovative-door-solutions.git"

check_repo "/c/Users/devla/OneDrive/Desktop/claud/orangecrest-pools" \
           "orangecrest-pools" \
           "https://github.com/Media4u-fun/orangecrest-pools.git"

check_repo "/c/Users/devla/OneDrive/Desktop/claud/at-ease-pest" \
           "at-ease-pest" \
           "https://github.com/Media4u-fun/at-ease-pest.git"

echo "========================================"
echo "✨ VERIFICATION COMPLETE!"
echo ""
echo "Summary:"
echo "- All repos should point to Media4u-fun organization"
echo "- All connections should be successful"
echo "- Check for any ⚠️ or ❌ symbols above"
echo ""
