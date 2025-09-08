import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

// Define User schema
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  mobileNumber: String,
  profileImageUrl: String,
  password: String,
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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

// Fix existing users
const fixUsers = async () => {
  try {
    // Find all users
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} total users`);
    
    for (const user of allUsers) {
      let updates = {};
      
      // Add userId if missing
      if (!user.userId) {
        let userId;
        let isUnique = false;
        
        while (!isUnique) {
          userId = generateUserId();
          const existingUser = await User.findOne({ userId });
          if (!existingUser) {
            isUnique = true;
          }
        }
        
        updates.userId = userId;
        console.log(`✅ Added userId ${userId} to user ${user.email}`);
      }
      
      // Ensure user is active
      if (user.isActive !== true) {
        updates.isActive = true;
        console.log(`✅ Set user ${user.email} as active`);
      }
      
      // Update user if needed
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
      }
    }
    
    console.log('🎉 All users fixed successfully!');
    
    // Show all users
    const updatedUsers = await User.find({});
    console.log('\n📋 Current users:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.email} (${user.userId}) - ${user.role} - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('Error fixing users:', error);
  }
};

// Run the fix
const runFix = async () => {
  await connectDB();
  await fixUsers();
  await mongoose.disconnect();
  console.log('Fix completed');
};

runFix();
