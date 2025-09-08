# Environment Setup Instructions

## 1. Create .env file

Create a `.env` file in the root directory with the following content:

```bash
# Environment Configuration
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here-change-this-in-production

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Cashfree Payment Gateway Configuration
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENVIRONMENT=PRODUCTION

# Server Configuration
PORT=3000
```

## 2. For Production Deployment (Render.com)

Add these environment variables in your Render dashboard:

- `CASHFREE_APP_ID`: your-cashfree-app-id
- `CASHFREE_SECRET_KEY`: your-cashfree-secret-key
- `CASHFREE_ENVIRONMENT`: PRODUCTION

## 3. Security Notes

✅ **Secrets are now secure:**
- Cashfree credentials moved to environment variables
- `.env` file is ignored by git
- No sensitive data in source code

✅ **For GitHub:**
- You can now safely push to GitHub
- Secrets are not exposed in the repository
- Use `env.example` as a template for others

## 4. Testing

After setting up the `.env` file, restart your development server:

```bash
npm run dev
```

The Cashfree integration will now use the environment variables instead of hardcoded secrets.
