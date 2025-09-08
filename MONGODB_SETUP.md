# MongoDB Setup Guide for GiftGalore

Your GiftGalore application is already configured to use MongoDB! Here's how to set it up:

## Current Configuration

The application is already set up with:
- ✅ MongoDB connection with Mongoose
- ✅ MongoDB schemas for all entities (User, Product, Category, Cart, Order)
- ✅ MongoDB session store using `connect-mongo`
- ✅ All necessary dependencies installed

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration (Your MongoDB Atlas URL)
MONGODB_URI=mongodb+srv://uthayakrishna:Uthaya$0@cluster0.x305hxj.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=development

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=db62ml3ru
CLOUDINARY_API_KEY=838449141136265
CLOUDINARY_API_SECRET=your-LW16qMz-NIPFRu4QSDbwMdzYQ58

# Replit Auth (optional for development)
# REPLIT_DOMAINS=your-replit-domain.com
# REPL_ID=your-replit-id
# ISSUER_URL=https://replit.com/oidc
```

## MongoDB Connection Options

### 1. Local MongoDB Installation
```bash
# Install MongoDB locally
# Then use:
MONGODB_URI=mongodb://localhost:27017/giftgalore
```

### 2. MongoDB Atlas (Cloud) - ✅ CONFIGURED
```bash
# Your MongoDB Atlas connection string:
MONGODB_URI=mongodb+srv://uthayakrishna:Uthaya$0@cluster0.x305hxj.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Development Mode (In-Memory)
For development, if no `MONGODB_URI` is provided, the app will use an in-memory MongoDB server automatically.

## Database Features

The application includes these MongoDB collections:

### Collections
- **Users** - User accounts and authentication
- **Categories** - Product categories
- **Products** - Product catalog
- **Cart** - Shopping cart items
- **Orders** - Customer orders
- **Sessions** - User sessions (managed by connect-mongo)

### Features
- ✅ Automatic session management with MongoDB
- ✅ User authentication and authorization
- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ Order management
- ✅ Search and filtering capabilities

## Cloudinary Image Upload Setup

The application includes Cloudinary integration for image uploads in the admin panel:

### Features
- ✅ Drag & drop image uploads
- ✅ Multiple image support (up to 5 images per product)
- ✅ Automatic image optimization
- ✅ Image preview with thumbnail generation
- ✅ URL input fallback for existing images
- ✅ Secure admin-only uploads

### Setup Steps
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add them to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Usage
- In the admin panel, go to Products
- Click "Add Product" or "Edit Product"
- Use the drag & drop area to upload images
- Or manually enter image URLs
- Images are automatically optimized and stored in Cloudinary

## Running the Application

1. Set up your environment variables
2. Start the development server:
```bash
npm run dev
```

3. The application will automatically:
   - Connect to MongoDB
   - Create collections if they don't exist
   - Set up session storage
   - Initialize the database schema

## Database Schema

The application uses Mongoose schemas with the following features:
- Automatic timestamps
- Data validation
- Indexes for performance
- Relationships between collections
- Session expiration handling

Your MongoDB setup is complete and ready to use! 🎉
