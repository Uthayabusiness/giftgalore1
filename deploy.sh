#!/bin/bash

# GiftGalore Deployment Script for Render
# This script helps prepare your application for deployment

echo "🚀 GiftGalore Deployment Preparation"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please ensure it exists in the project root."
    exit 1
fi

echo "✅ Found render.yaml"

# Check if env.example exists
if [ ! -f "env.example" ]; then
    echo "❌ Error: env.example not found. Please ensure it exists in the project root."
    exit 1
fi

echo "✅ Found env.example"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found."
    echo "📝 Please create a .env file based on env.example before deploying."
    echo "   You can copy it with: cp env.example .env"
    echo "   Then edit .env with your actual values."
else
    echo "✅ Found .env file"
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Warning: Git repository not initialized."
    echo "📝 Please initialize git and push to GitHub before deploying to Render."
    echo "   You can do this with:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
else
    echo "✅ Git repository found"
fi

# Test build locally
echo ""
echo "🔨 Testing build process..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not created. Build may have failed."
    exit 1
fi

echo "✅ Build artifacts created in dist/"

# Clean up
echo ""
echo "🧹 Cleaning up build artifacts..."
rm -rf dist
echo "✅ Cleanup complete"

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a .env file with your environment variables (if not done already)"
echo "2. Push your code to GitHub"
echo "3. Go to render.com and create a new Web Service"
echo "4. Connect your GitHub repository"
echo "5. Configure environment variables in Render dashboard"
echo "6. Deploy!"
echo ""
echo "📖 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "🔗 Useful links:"
echo "   - Render Dashboard: https://dashboard.render.com"
echo "   - MongoDB Atlas: https://cloud.mongodb.com"
echo "   - Cloudinary: https://cloudinary.com"
echo ""
echo "Good luck with your deployment! 🚀"
