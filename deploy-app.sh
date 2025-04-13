#!/bin/bash

echo ""
echo "🚀 Full Project Deploy Script"
echo "-----------------------------"

# Step 1: Format and test (optional safety checks)
echo "🧹 Running format + tests..."
npm run format
npm test || { echo "❌ Tests failed. Exiting."; exit 1; }

# Step 2: Build docs
echo ""
read -p "📘 Build VitePress docs? (y/n) " confirm_build
if [[ $confirm_build == "y" ]]; then
  npm run docs:build || { echo "❌ Docs build failed. Exiting."; exit 1; }
fi

# Step 3: Show status
echo ""
echo "📄 Git status:"
git status

# Step 4: Commit everything
read -p "✏️  Enter commit message: " commit_msg
if [[ -z $commit_msg ]]; then
  echo "🚫 No commit message entered. Exiting."
  exit 1
fi

git add -A
git commit -m "$commit_msg" || {
  echo "⚠️  Nothing to commit. Continuing to push..."
}

# Step 5: Push to main
read -p "🚀 Push to origin/main? (y/n) " confirm_push
if [[ $confirm_push == "y" ]]; then
  git push origin main
  echo "✅ Code pushed!"
else
  echo "🛑 Push skipped."
fi

# Step 6: Optional npm publish
read -p "📦 Publish to npm? (y/n) " confirm_publish
if [[ $confirm_publish == "y" ]]; then
  npm publish --access public
  echo "📦 Published to npm!"
else
  echo "📦 Skipping npm publish."
fi

echo ""
echo "🌐 Your docs will be live shortly at:"
echo "    https://pedramsafaei.github.io/obscure-string/"
echo "📦 Your package is at:"
echo "    https://www.npmjs.com/package/obscure-string"
