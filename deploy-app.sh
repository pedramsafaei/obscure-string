#!/bin/bash

echo ""
echo "🚀 Full Project Deploy Script (with tagging)"
echo "--------------------------------------------"

# Step 1: Format and test
echo "🧹 Running format + tests..."
npm run format
npm test || { echo "❌ Tests failed. Exiting."; exit 1; }

# Step 2: Build docs
echo ""
read -p "📘 Build VitePress docs? (y/n) " confirm_build
if [[ $confirm_build == "y" ]]; then
  npm run docs:build || { echo "❌ Docs build failed. Exiting."; exit 1; }
fi

# Step 3: Git status
echo ""
echo "📄 Git status:"
git status

# Step 4: Commit all changes
read -p "✏️  Enter commit message (leave blank to skip manual commit): " commit_msg
if [[ -n $commit_msg ]]; then
  git add -A
  git commit -m "$commit_msg" || echo "⚠️  Nothing to commit."
else
  echo "⏭️  Skipping manual commit."
fi

# Step 5: Bump version with standard-version
echo ""
echo "🔖 Select version type:"
select bump in "patch" "minor" "major" "skip"; do
  case $bump in
    patch) npm run release:patch; break ;;
    minor) npm run release:minor; break ;;
    major) npm run release:major; break ;;
    skip) echo "⏭️  Skipping version bump."; break ;;
    *) echo "❌ Invalid option." ;;
  esac
done

# Step 6: Push changes and tags
read -p "🚀 Push code and tags to origin/main? (y/n) " confirm_push
if [[ $confirm_push == "y" ]]; then
  git push origin main --follow-tags
  echo "✅ Code and version tags pushed!"
else
  echo "🛑 Push skipped."
fi

# Step 7: Optional npm publish
read -p "📦 Publish to npm? (y/n) " confirm_publish
if [[ $confirm_publish == "y" ]]; then
  npm publish --access public
  echo "📦 Published to npm!"
else
  echo "📦 Skipping npm publish."
fi

# Final message
echo ""
echo "🌐 Docs will auto-deploy to:"
echo "    https://pedramsafaei.github.io/obscure-string/"
echo "📦 Your new package version:"
jq .version package.json
