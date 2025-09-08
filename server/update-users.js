import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from './models.js';

// Load environment variables
config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/giftgalore');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate unique userId
const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let userId = '';
  for (let i = 0; i < 8; i++) {
    userId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return userId;
};

// Update existing users with unique userIds
const updateUsersWithIds = async () => {
  try {
    // Find all users without userId
    const usersWithoutId = await User.find({ userId: { $exists: false } });
    
    console.log(`Found ${usersWithoutId.length} users without userId`);
    
    for (const user of usersWithoutId) {
      let userId;
      let isUnique = false;
      
      // Generate unique userId
      while (!isUnique) {
        userId = generateUserId();
        const existingUser = await User.findOne({ userId });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      // Update user with userId
      await User.findByIdAndUpdate(user._id, { userId });
      console.log(`Updated user ${user.email} with userId: ${userId}`);
    }
    
    console.log('All users updated successfully!');
  } catch (error) {
    console.error('Error updating users:', error);
  }
};

// Run the update
const runUpdate = async () => {
  await connectDB();
  await updateUsersWithIds();
  await mongoose.disconnect();
  console.log('Update completed');
};

runUpdate();
