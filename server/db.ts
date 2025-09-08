import mongoose from 'mongoose';

// Connect to MongoDB
export const connectDB = async () => {
  try {
    let mongoUri: string;
    
    if (process.env.MONGODB_URI) {
      // Use provided MongoDB URI but ensure it points to giftgalore database
      mongoUri = process.env.MONGODB_URI;
      console.log('Using provided MongoDB URI:', mongoUri);
    } else {
      // Default to MongoDB Atlas if no URI provided
      mongoUri = 'mongodb+srv://uthayakrishna:Uthaya$0@cluster0.x305hxj.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0';
      console.log('Using MongoDB Atlas database');
    }
    
    // Ensure the URI points to the giftgalore database
    if (!mongoUri.includes('/giftgalore')) {
      // Parse the URI to properly insert the database name
      const url = new URL(mongoUri);
      url.pathname = '/giftgalore';
      mongoUri = url.toString();
      console.log('Updated MongoDB URI to include giftgalore database:', mongoUri);
    }
    
    // Connect to MongoDB with proper SSL configuration
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully to database:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Please check your internet connection and MongoDB Atlas configuration');
    process.exit(1);
  }
};

// Cleanup function
export const disconnectDB = async () => {
  await mongoose.disconnect();
};

// Export mongoose instance
export const db = mongoose;