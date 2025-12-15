# Backend Implementation Example

## Contoh Implementasi Refresh Token di Backend

Ini adalah contoh implementasi untuk backend (Node.js/Express + JWT).

### 1. Install Dependencies

```bash
npm install jsonwebtoken
```

### 2. Token Configuration

```javascript
// config/jwt.js
module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  accessTokenExpiry: '15m', // 15 minutes
  refreshTokenExpiry: '7d', // 7 days
};
```

### 3. Token Generation Utilities

```javascript
// utils/tokenUtils.js
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

/**
 * Generate access token
 */
function generateAccessToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'access'
    },
    config.accessTokenSecret,
    { expiresIn: config.accessTokenExpiry }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'refresh'
    },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiry }
  );
}

/**
 * Generate both tokens
 */
function generateTokenPair(userId, email) {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
  };
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.accessTokenSecret);
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.refreshTokenSecret);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};
```

### 4. Auth Middleware

```javascript
// middleware/auth.js
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Attach user info to request
  req.user = decoded;
  next();
}

module.exports = { authenticateToken };
```

### 5. Login Endpoint (Updated)

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const { generateTokenPair } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

    // Optional: Save refresh token to database for revocation
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and tokens
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          role: user.role,
          isVerified: user.isVerified,
        },
        token: accessToken,
        refreshToken: refreshToken, // ← IMPORTANT!
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
```

### 6. Refresh Token Endpoint (NEW!)

```javascript
// routes/auth.js
const { verifyRefreshToken, generateTokenPair } = require('../utils/tokenUtils');

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Optional: Check if refresh token exists in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Optional: Verify refresh token matches stored token
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked',
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user.id, user.email);

    // Optional: Update refresh token in database (token rotation)
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return new tokens
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken, // Optional: rotate refresh token
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});
```

### 7. Register Endpoint (Updated)

```javascript
/**
 * POST /auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, nickname } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = new User({
      email,
      password, // Will be hashed by User model
      fullName,
      nickname,
      authProvider: 'email',
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and tokens
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          role: user.role,
          isVerified: user.isVerified,
        },
        token: accessToken,
        refreshToken: refreshToken, // ← IMPORTANT!
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});
```

### 8. Google Auth Endpoint (Updated)

```javascript
/**
 * POST /auth/google
 * Authenticate with Google ID token
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required',
      });
    }

    // Verify Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        fullName: name,
        avatarUrl: picture,
        authProvider: 'google',
        googleId,
        isVerified: true, // Google accounts are pre-verified
      });
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and tokens
    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          role: user.role,
          isVerified: user.isVerified,
        },
        token: accessToken,
        refreshToken: refreshToken, // ← IMPORTANT!
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});
```

### 9. Logout Endpoint (Optional - Token Revocation)

```javascript
/**
 * POST /auth/logout
 * Logout and revoke refresh token
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user and clear refresh token
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});
```

### 10. User Model (Updated)

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  fullName: {
    type: String,
    required: true,
  },
  nickname: String,
  avatarUrl: String,
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email',
  },
  googleId: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: String, // ← NEW! Store current refresh token
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = require('bcrypt');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

## Testing

### Test Refresh Endpoint dengan cURL:

```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response akan berisi token dan refreshToken

# 2. Test Refresh
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN_HERE"}'

# Response akan berisi token baru
```

## Environment Variables

Tambahkan di `.env`:

```env
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id
```

## Security Best Practices

1. **Use Strong Secrets**: Generate random secrets untuk JWT
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **HTTPS Only**: Gunakan HTTPS di production

3. **Token Rotation**: Rotate refresh token setiap kali di-refresh

4. **Token Revocation**: Store refresh token di database untuk revocation

5. **Rate Limiting**: Limit refresh endpoint untuk prevent abuse

6. **Secure Storage**: Jangan log atau expose tokens

## Checklist Implementation

- [ ] Install dependencies (jsonwebtoken)
- [ ] Create token utilities
- [ ] Update User model (add refreshToken field)
- [ ] Update login endpoint (return refreshToken)
- [ ] Update register endpoint (return refreshToken)
- [ ] Update Google auth endpoint (return refreshToken)
- [ ] Create refresh endpoint
- [ ] Update logout endpoint (revoke refreshToken)
- [ ] Set environment variables
- [ ] Test all endpoints
- [ ] Deploy to production
