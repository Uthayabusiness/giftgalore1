import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '@shared/schema';

// Database diagnostics endpoint
export const databaseDiagnostics = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Running database diagnostics...');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connectionState: mongoose.connection.readyState,
        connectionStateText: getConnectionStateText(mongoose.connection.readyState),
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        collections: [],
        userCount: 0,
        sessionCount: 0,
        recentUsers: [],
        connectionError: null
      },
      session: {
        sessionId: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        user: req.user || null,
        sessionData: req.session || null
      },
      env: {
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        sessionSecret: process.env.SESSION_SECRET ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV
      }
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      try {
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        diagnostics.database.collections = collections.map(col => col.name);

        // Count users
        diagnostics.database.userCount = await User.countDocuments();

        // Count sessions
        try {
          diagnostics.database.sessionCount = await mongoose.connection.db.collection('sessions').countDocuments();
        } catch (error) {
          console.log('Sessions collection not found or accessible');
        }

        // Get recent users
        diagnostics.database.recentUsers = await User.find({})
          .select('_id userId email firstName lastName role isActive createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

      } catch (error) {
        diagnostics.database.connectionError = error.message;
        console.error('Database query error:', error);
      }
    } else {
      diagnostics.database.connectionError = 'Database not connected';
    }

    console.log('✅ Database diagnostics completed');
    res.json(diagnostics);

  } catch (error) {
    console.error('❌ Diagnostics error:', error);
    res.status(500).json({
      error: 'Diagnostics failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Test user creation endpoint
export const testUserCreation = async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing user creation...');
    
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '9876543210',
      role: 'user',
      isActive: true,
      password: 'testpass123'
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      return res.json({
        success: false,
        message: 'Test user already exists',
        user: existingUser
      });
    }

    // Create test user
    const newUser = new User(testUser);
    await newUser.save();

    console.log('✅ Test user created successfully');
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Test user creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Test user creation failed',
      message: error.message
    });
  }
};

// Test authentication endpoint
export const testAuthentication = async (req: Request, res: Response) => {
  try {
    console.log('🔐 Testing authentication...');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
        email: email
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.json({
        success: false,
        message: 'User account is deactivated',
        user: {
          _id: user._id,
          email: user.email,
          isActive: user.isActive
        }
      });
    }

    // Check password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password || '');
    
    res.json({
      success: passwordMatch,
      message: passwordMatch ? 'Authentication successful' : 'Invalid password',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        hasPassword: !!user.password
      }
    });

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication test failed',
      message: error.message
    });
  }
};

// Clear all sessions endpoint (for debugging)
export const clearAllSessions = async (req: Request, res: Response) => {
  try {
    console.log('🧹 Clearing all sessions...');
    
    if (mongoose.connection.readyState === 1) {
      // First, clear any sessions with null or invalid sid values
      const nullSidResult = await mongoose.connection.db.collection('sessions').deleteMany({
        $or: [
          { sid: null },
          { sid: { $exists: false } },
          { sid: '' }
        ]
      });
      
      console.log(`🧹 Cleared ${nullSidResult.deletedCount} sessions with null/invalid sid`);
      
      // Then clear all remaining sessions
      const result = await mongoose.connection.db.collection('sessions').deleteMany({});
      
      res.json({
        success: true,
        message: 'All sessions cleared',
        deletedCount: result.deletedCount,
        nullSidCleared: nullSidResult.deletedCount
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }

  } catch (error) {
    console.error('❌ Clear sessions failed:', error);
    res.status(500).json({
      success: false,
      error: 'Clear sessions failed',
      message: error.message
    });
  }
};

// Check specific user endpoint
export const checkSpecificUser = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Checking specific user...');
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (mongoose.connection.readyState === 1) {
      // Check in users collection
      const user = await User.findOne({ email: email.toLowerCase() });
      
      // Also check all users for debugging
      const allUsers = await User.find({}).select('_id email firstName lastName role isActive createdAt');
      
      res.json({
        success: true,
        email: email,
        userFound: !!user,
        user: user ? {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          hasPassword: !!user.password,
          createdAt: user.createdAt
        } : null,
        allUsers: allUsers,
        totalUsers: allUsers.length,
        database: {
          name: mongoose.connection.name,
          host: mongoose.connection.host,
          readyState: mongoose.connection.readyState
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }

  } catch (error) {
    console.error('❌ Check user failed:', error);
    res.status(500).json({
      success: false,
      error: 'Check user failed',
      message: error.message
    });
  }
};

// Helper function to get connection state text
function getConnectionStateText(state: number): string {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}
