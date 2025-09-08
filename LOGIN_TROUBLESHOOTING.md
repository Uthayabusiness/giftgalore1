# Login Troubleshooting Guide

## 🔍 Database and Authentication Diagnostics

Your GiftGalore application now includes comprehensive diagnostic tools to help troubleshoot login and database issues.

### Diagnostic Endpoints

After deployment, you can access these diagnostic endpoints:

#### 1. Database Diagnostics
```
GET /api/diagnostics/database
```
**What it checks:**
- MongoDB connection status
- Database collections
- User count
- Session count
- Recent users
- Environment variables

#### 2. Test User Creation
```
POST /api/diagnostics/test-user
```
**What it does:**
- Creates a test user in the database
- Verifies user creation works
- Returns user details

#### 3. Test Authentication
```
POST /api/diagnostics/test-auth
Body: { "email": "user@example.com", "password": "password" }
```
**What it does:**
- Tests user lookup
- Checks password validation
- Verifies user status

#### 4. Clear All Sessions
```
POST /api/diagnostics/clear-sessions
```
**What it does:**
- Clears all user sessions
- Useful for debugging session issues

## 🚨 Common Login Issues and Solutions

### Issue 1: "Invalid email or password"
**Possible causes:**
- User doesn't exist in database
- Password is incorrect
- User account is deactivated

**Solutions:**
1. Check database diagnostics: `GET /api/diagnostics/database`
2. Verify user exists in recent users list
3. Check if user is active (`isActive: true`)
4. Try creating a test user: `POST /api/diagnostics/test-user`

### Issue 2: "Not authenticated" after login
**Possible causes:**
- Session not being saved to database
- Session cookie issues
- Database connection problems

**Solutions:**
1. Check session count in diagnostics
2. Clear all sessions: `POST /api/diagnostics/clear-sessions`
3. Verify MongoDB connection status
4. Check session secret is set in environment variables

### Issue 3: Database connection errors
**Possible causes:**
- MongoDB URI incorrect
- Network connectivity issues
- Database credentials wrong

**Solutions:**
1. Check MongoDB URI in environment variables
2. Verify database connection status in diagnostics
3. Test with MongoDB Atlas connection string
4. Check network access to MongoDB Atlas

### Issue 4: User creation fails
**Possible causes:**
- Duplicate email/mobile number
- Validation errors
- Database write permissions

**Solutions:**
1. Check for existing users with same email/mobile
2. Verify all required fields are provided
3. Check database write permissions
4. Review validation rules

## 🔧 Step-by-Step Troubleshooting

### Step 1: Check Database Connection
```bash
# Visit this URL after deployment
https://your-app.onrender.com/api/diagnostics/database
```

**Look for:**
- `connectionState: 1` (connected)
- `userCount > 0` (users exist)
- `sessionCount` (sessions are being stored)

### Step 2: Test User Creation
```bash
# POST to this endpoint
https://your-app.onrender.com/api/diagnostics/test-user
```

**Expected response:**
```json
{
  "success": true,
  "message": "Test user created successfully",
  "user": {
    "_id": "...",
    "email": "test-1234567890@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "user",
    "isActive": true
  }
}
```

### Step 3: Test Authentication
```bash
# POST to this endpoint with test user credentials
https://your-app.onrender.com/api/diagnostics/test-auth
Body: { "email": "test-1234567890@example.com", "password": "testpassword123" }
```

### Step 4: Check Login Process
1. Try logging in with test user
2. Check browser developer tools for network errors
3. Verify session cookie is set
4. Check server logs for authentication messages

## 📊 Environment Variables Check

Ensure these are set in your Render environment:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/giftgalore?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=your-secure-random-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔍 Server Logs Analysis

Look for these log messages in Render logs:

### Successful Login:
```
🔐 Login attempt: { email: "user@example.com", timestamp: "..." }
✅ User found: { id: "...", email: "user@example.com", role: "user" }
✅ User ID ensured: { userId: "ABC12345" }
✅ Login successful: { sessionId: "...", userId: "ABC12345", email: "user@example.com" }
```

### Failed Login:
```
🔐 Login attempt: { email: "user@example.com", timestamp: "..." }
❌ Login failed - invalid credentials: Invalid email or password
```

### Session Issues:
```
👤 Current user check: { sessionId: "...", isAuthenticated: false, hasUser: false }
❌ User not authenticated
```

## 🛠️ Quick Fixes

### Fix 1: Clear All Sessions
If users can't login, clear all sessions:
```bash
POST /api/diagnostics/clear-sessions
```

### Fix 2: Create Admin User
If you need an admin user, register with the admin email:
```bash
POST /api/auth/register
Body: {
  "email": "admin@giftgalore.com",
  "password": "adminpassword123",
  "firstName": "Admin",
  "lastName": "User",
  "mobileNumber": "9876543210"
}
```

### Fix 3: Reset User Password
If a user can't login, you can update their password in the database or create a new user.

## 📞 Support

If you're still having issues:

1. **Check Render logs** for detailed error messages
2. **Use diagnostic endpoints** to identify the problem
3. **Verify environment variables** are correctly set
4. **Test with a fresh user** to isolate the issue

The diagnostic tools will help you identify exactly where the problem is occurring in the authentication flow.
