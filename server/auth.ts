import passport from "passport";
import session from "express-session";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Express, RequestHandler } from "express";
import MongoStore from "connect-mongo";
import { storage } from "./storage";
import { User } from "../shared/schema";
import { Strategy as LocalStrategy } from "passport-local";

// Admin email configuration
const ADMIN_EMAIL = "uthayakrishna67@gmail.com";

// Generate unique userId
const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let userId = '';
  for (let i = 0; i < 8; i++) {
    userId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return userId;
};

// Ensure user has unique userId
const ensureUserId = async (user: any) => {
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
    
    await User.findByIdAndUpdate(user._id, { userId });
    user.userId = userId;
  }
  return user;
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Always use MongoDB Atlas for session storage
  let mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://uthayakrishna:Uthaya$0@cluster0.x305hxj.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0';
  
  // Ensure the URI points to the giftgalore database
  if (!mongoUrl.includes('/giftgalore')) {
    // Parse the URI to properly insert the database name
    const url = new URL(mongoUrl);
    url.pathname = '/giftgalore';
    mongoUrl = url.toString();
  }
  
  const sessionStore = MongoStore.create({
    mongoUrl: mongoUrl,
    ttl: sessionTtl,
    collectionName: "sessions",
    dbName: 'giftgalore', // Explicitly specify the database name
    touchAfter: 24 * 3600, // lazy session update
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    name: 'giftgalore.sid', // Custom session name to avoid conflicts
    genid: () => {
      // Generate a more robust session ID
      return crypto.randomBytes(16).toString('hex');
    },
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  });
}

// Local strategy for email/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email: string, password: string, done: any) => {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password || '');
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        return done(null, false, { message: 'Account is deactivated' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, mobileNumber } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName || !mobileNumber) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }

      // Validate mobile number format (basic validation)
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobileNumber)) {
        return res.status(400).json({ 
          message: 'Please enter a valid 10-digit mobile number' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { mobileNumber: mobileNumber }
        ]
      });
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email.toLowerCase() 
            ? 'User with this email already exists' 
            : 'User with this mobile number already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Determine role based on email
      const role = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';

      // Create user
      const newUser = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        mobileNumber,
        role,
        isActive: true,
      });

             await newUser.save();

       // Ensure user has unique ID
       const userWithId = await ensureUserId(newUser);

       // Auto-login after registration
       req.login(userWithId, (err) => {
         if (err) {
           return res.status(500).json({ message: 'Registration successful but login failed' });
         }
         res.json({ 
           message: 'Registration successful',
           user: {
             id: userWithId._id,
             userId: userWithId.userId,
             email: userWithId.email,
             firstName: userWithId.firstName,
             lastName: userWithId.lastName,
             mobileNumber: userWithId.mobileNumber,
             role: userWithId.role,
             isActive: userWithId.isActive,
             address: userWithId.address,
             createdAt: userWithId.createdAt,
             updatedAt: userWithId.updatedAt,
           }
         });
       });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res, next) => {
    console.log('🔐 Login attempt:', { email: req.body.email, timestamp: new Date().toISOString() });
    
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        console.error('❌ Login error:', err);
        return res.status(500).json({ message: 'Login failed', error: err.message });
      }
      
      if (!user) {
        console.log('❌ Login failed - invalid credentials:', info?.message);
        return res.status(401).json({ message: info.message || 'Invalid credentials' });
      }

      console.log('✅ User found:', { id: user._id, email: user.email, role: user.role });

      // Ensure user has unique ID
      const userWithId = await ensureUserId(user);
      console.log('✅ User ID ensured:', { userId: userWithId.userId });
      
      req.login(userWithId, (err) => {
        if (err) {
          console.error('❌ Session login failed:', err);
          if (!res.headersSent) {
            return res.status(500).json({ message: 'Login failed', error: err.message });
          }
          return;
        }
        
        console.log('✅ Login successful:', { 
          sessionId: req.sessionID, 
          userId: userWithId.userId,
          email: userWithId.email 
        });
        
        if (!res.headersSent) {
          res.json({ 
            message: 'Login successful',
            user: {
              id: userWithId._id,
              userId: userWithId.userId,
              email: userWithId.email,
              firstName: userWithId.firstName,
              lastName: userWithId.lastName,
              mobileNumber: userWithId.mobileNumber,
              role: userWithId.role,
              isActive: userWithId.isActive,
              address: userWithId.address,
              createdAt: userWithId.createdAt,
              updatedAt: userWithId.updatedAt,
            }
          });
        }
      });
    })(req, res, next);
  });

  // Profile update endpoint
  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const { firstName, lastName, email, mobileNumber, address } = req.body;
      const user = req.user as any;
      
      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }
      
      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          firstName,
          lastName,
          email,
          mobileNumber,
          address,
          updatedAt: new Date()
        },
        { new: true, select: '-password' }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    console.log('🔄 POST /api/auth/logout - Starting logout process');
    
    // Force logout by clearing everything
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
      });
    });
  });

  // GET logout endpoint (for direct navigation)
  app.get('/api/logout', (req, res) => {
    console.log('🔄 GET /api/logout - Starting logout process');
    
    // Force logout by clearing everything
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        // Return a redirect response instead of JSON
        res.redirect('/login');
      });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', async (req, res) => {
    console.log('👤 Current user check:', { 
      sessionId: req.sessionID, 
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      timestamp: new Date().toISOString()
    });
    
    if (req.isAuthenticated()) {
      const user = req.user as any;
      console.log('✅ User authenticated:', { id: user._id, email: user.email });
      
      try {
        // Ensure user has unique ID
        const updatedUser = await ensureUserId(user);
        console.log('✅ User data retrieved:', { userId: updatedUser.userId, email: updatedUser.email });
        
        res.json({
          id: updatedUser._id,
          userId: updatedUser.userId,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          mobileNumber: updatedUser.mobileNumber,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          address: updatedUser.address,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        });
      } catch (error) {
        console.error('❌ Error retrieving user data:', error);
        res.status(500).json({ message: 'Failed to retrieve user data', error: error.message });
      }
    } else {
      console.log('❌ User not authenticated');
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Check if email is admin
  app.get('/api/auth/check-admin/:email', (req, res) => {
    const email = req.params.email;
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
    res.json({ isAdmin });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Middleware to check if user is admin
export const isAdmin: RequestHandler = (req, res, next) => {
  console.log('🔐 isAdmin middleware called for:', req.path);
  console.log('👤 User authenticated:', req.isAuthenticated());
  console.log('🍪 Session ID:', req.sessionID);
  console.log('🍪 Session data:', req.session);
  
  if (req.isAuthenticated()) {
    const user = req.user as any;
    console.log('👤 User:', user);
    console.log('📧 User email:', user.email);
    console.log('👑 User role:', user.role);
    console.log('🎯 Admin email:', ADMIN_EMAIL);
    // Check if user has admin role OR is the admin email
    if (user.role === 'admin' || user.email === ADMIN_EMAIL) {
      console.log('✅ Admin access granted');
      return next();
    }
  }
  console.log('❌ Admin access denied');
  res.status(403).json({ message: 'Admin access required' });
};

// Middleware to check if user is admin or the specific admin email
export const isAdminOrSpecificUser: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    if (user.role === 'admin' || user.email === ADMIN_EMAIL) {
      return next();
    }
  }
  res.status(403).json({ message: 'Admin access required' });
};
