@echo off
REM GiftGalore Deployment Script for Render (Windows)
REM This script helps prepare your application for deployment

echo 🚀 GiftGalore Deployment Preparation
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Found package.json

REM Check if render.yaml exists
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found. Please ensure it exists in the project root.
    pause
    exit /b 1
)

echo ✅ Found render.yaml

REM Check if env.example exists
if not exist "env.example" (
    echo ❌ Error: env.example not found. Please ensure it exists in the project root.
    pause
    exit /b 1
)

echo ✅ Found env.example

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found.
    echo 📝 Please create a .env file based on env.example before deploying.
    echo    You can copy it with: copy env.example .env
    echo    Then edit .env with your actual values.
) else (
    echo ✅ Found .env file
)

REM Check if git is initialized
if not exist ".git" (
    echo ⚠️  Warning: Git repository not initialized.
    echo 📝 Please initialize git and push to GitHub before deploying to Render.
    echo    You can do this with:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    echo    git remote add origin ^<your-github-repo-url^>
    echo    git push -u origin main
) else (
    echo ✅ Git repository found
)

REM Test build locally
echo.
echo 🔨 Testing build process...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Check if dist directory was created
if not exist "dist" (
    echo ❌ Error: dist directory not created. Build may have failed.
    pause
    exit /b 1
)

echo ✅ Build artifacts created in dist/

REM Clean up
echo.
echo 🧹 Cleaning up build artifacts...
rmdir /s /q dist
echo ✅ Cleanup complete

echo.
echo 🎉 Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Create a .env file with your environment variables (if not done already)
echo 2. Push your code to GitHub
echo 3. Go to render.com and create a new Web Service
echo 4. Connect your GitHub repository
echo 5. Configure environment variables in Render dashboard
echo 6. Deploy!
echo.
echo 📖 For detailed instructions, see RENDER_DEPLOYMENT.md
echo.
echo 🔗 Useful links:
echo    - Render Dashboard: https://dashboard.render.com
echo    - MongoDB Atlas: https://cloud.mongodb.com
echo    - Cloudinary: https://cloudinary.com
echo.
echo Good luck with your deployment! 🚀
pause
