# GiftGalore - Render Deployment Guide

This guide will help you deploy your GiftGalore ecommerce application to Render.com.

## Prerequisites

Before deploying, make sure you have:

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **MongoDB Atlas Account**: For database hosting (recommended)
3. **Cloudinary Account**: For image uploads
4. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Prepare Your Environment Variables

### Required Environment Variables

Create a `.env` file locally (or use the provided `env.example` as a template):

```env
# Environment Configuration
NODE_ENV=production

# MongoDB Configuration (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0

# Session Configuration (generate a secure random string)
SESSION_SECRET=your-super-secret-session-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=3000
```

### Getting Your Environment Variables

#### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string from "Connect" → "Connect your application"
5. Replace `<password>` with your database user password

#### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Go to Dashboard to get your credentials:
   - Cloud Name
   - API Key
   - API Secret

#### Session Secret
Generate a secure random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any secure random string generator
```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub** with the `render.yaml` file included
2. **Go to Render Dashboard**
3. **Click "New +" → "Blueprint"**
4. **Connect your GitHub repository**
5. **Render will automatically detect the `render.yaml` file**
6. **Configure your environment variables** (see Step 3)
7. **Click "Apply" to deploy**

### Option B: Manual Setup

1. **Go to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `giftgalore` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you need more resources)

## Step 3: Configure Environment Variables

In your Render service dashboard:

1. **Go to "Environment" tab**
2. **Add the following environment variables:**

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `MONGODB_URI` | `your-mongodb-connection-string` | MongoDB Atlas connection string |
| `SESSION_SECRET` | `your-secure-random-string` | Session encryption key |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `your-api-key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Cloudinary API secret |

3. **Click "Save Changes"**

## Step 4: Deploy and Test

1. **Click "Deploy"** in your Render service
2. **Wait for the build to complete** (usually 2-5 minutes)
3. **Check the logs** for any errors
4. **Visit your deployed URL** (e.g., `https://giftgalore.onrender.com`)

## Step 5: Verify Deployment

### Health Check
Your app includes a health check endpoint at `/api/categories`. Render will use this to verify your app is running.

### Test the Application
1. **Visit your deployed URL**
2. **Test user registration/login**
3. **Browse products**
4. **Add items to cart**
5. **Test checkout process**
6. **Verify admin panel** (if you have admin users)

## Troubleshooting

### Common Issues

#### Build Failures
- **Check Node.js version**: Render uses Node.js 18 by default
- **Verify all dependencies**: Ensure all packages are in `package.json`
- **Check build logs**: Look for specific error messages

#### Database Connection Issues
- **Verify MongoDB URI**: Ensure the connection string is correct
- **Check network access**: Make sure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
- **Verify credentials**: Ensure username/password are correct

#### Static File Issues
- **Check build output**: Ensure `dist/public` directory exists after build
- **Verify file paths**: Check that static files are being served correctly

#### Environment Variable Issues
- **Check variable names**: Ensure they match exactly (case-sensitive)
- **Verify values**: Make sure no extra spaces or quotes
- **Restart service**: After changing environment variables

### Logs and Debugging

1. **View logs** in Render dashboard under "Logs" tab
2. **Check build logs** for compilation errors
3. **Monitor runtime logs** for application errors
4. **Use console.log** statements for debugging (remove in production)

## Performance Optimization

### For Production

1. **Enable caching** for static assets
2. **Use CDN** for images (Cloudinary provides this)
3. **Optimize images** before upload
4. **Monitor performance** using Render's metrics

### Database Optimization

1. **Create indexes** for frequently queried fields
2. **Use connection pooling** (already configured)
3. **Monitor query performance**

## Security Considerations

1. **Use HTTPS** (Render provides this automatically)
2. **Secure environment variables** (never commit them to git)
3. **Use strong session secrets**
4. **Implement rate limiting** (consider adding this)
5. **Validate all inputs** (already implemented with Zod)

## Scaling

### Free Tier Limitations
- **Sleep after 15 minutes** of inactivity
- **Limited build minutes** per month
- **Shared resources**

### Upgrading to Paid Plans
- **No sleep mode**
- **More build minutes**
- **Better performance**
- **Custom domains**

## Monitoring and Maintenance

1. **Monitor uptime** using Render's dashboard
2. **Check logs regularly** for errors
3. **Update dependencies** periodically
4. **Backup your database** regularly
5. **Monitor performance metrics**

## Support

If you encounter issues:

1. **Check Render documentation**: [render.com/docs](https://render.com/docs)
2. **Review application logs**
3. **Test locally** to isolate issues
4. **Check MongoDB Atlas logs**
5. **Verify Cloudinary configuration**

## Success! 🎉

Once deployed, your GiftGalore application will be available at your Render URL. You can:

- **Share the URL** with users
- **Set up a custom domain** (paid plans)
- **Monitor usage** and performance
- **Scale as needed**

Your ecommerce application is now live and ready for customers!
