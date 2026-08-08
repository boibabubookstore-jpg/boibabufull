const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const admin = require('firebase-admin');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const OTP = require('../models/OTP');
const { auth } = require('../middleware/auth');
const { sendWelcomeEmail, sendOTPEmail } = require('../utils/emailService');
const { authLimiter, emailVerificationLimiter, passwordResetLimiter, otpLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Initialize Firebase Admin SDK for token verification
let firebaseAdmin = null;
try {
  // Initialize Firebase Admin with minimal config for token verification
  if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'boibabu'
    });
    console.log('✅ Firebase Admin initialized for token verification');
  } else {
    firebaseAdmin = admin.app();
  }
} catch (error) {
  console.log('⚠️ Firebase Admin initialization failed, using Google OAuth client fallback:', error.message);
}

// Initialize Google OAuth client as fallback
const googleClient = new OAuth2Client();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Firebase Google OAuth login
router.post('/google', authLimiter, [
  body('token').notEmpty().withMessage('Firebase ID token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;
    let payload;

    try {
      // Try Firebase Admin SDK first (most reliable for Firebase tokens)
      if (firebaseAdmin) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        payload = {
          sub: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
          email_verified: decodedToken.email_verified
        };
        console.log('✅ Firebase token verified with Admin SDK');
      } else {
        throw new Error('Firebase Admin not available');
      }
    } catch (adminError) {
      console.log('⚠️ Firebase Admin verification failed, trying Google OAuth client:', adminError.message);
      
      try {
        // Fallback to Google OAuth client
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: [
            'boibabu', // Firebase project ID
            process.env.GOOGLE_CLIENT_ID
          ].filter(Boolean)
        });
        payload = ticket.getPayload();
        console.log('✅ Firebase token verified with Google OAuth client');
      } catch (oauthError) {
        console.error('❌ Both verification methods failed:', {
          admin: adminError.message,
          oauth: oauthError.message
        });
        return res.status(400).json({ 
          message: 'Invalid Firebase token',
          debug: {
            adminError: adminError.message,
            oauthError: oauthError.message,
            projectId: process.env.FIREBASE_PROJECT_ID || 'boibabu'
          }
        });
      }
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email not verified' });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }

      // Check if user is suspended
      if (user.isSuspended) {
        return res.status(403).json({ 
          message: 'Account suspended', 
          suspended: true,
          suspensionReason: user.suspensionReason,
          suspendedAt: user.suspendedAt
        });
      }

      // Generate token and login
      const authToken = generateToken(user._id);

      return res.json({
        message: 'Login successful',
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: true, // Google emails are verified
          profilePicture: user.profilePicture
        }
      });
    } else {
      // Create new user
      const userRole = email === 'admin@gmail.com' ? 'admin' : 'user';
      
      user = new User({
        name,
        email,
        googleId,
        profilePicture: picture,
        role: userRole,
        isEmailVerified: true, // Google emails are verified
        password: Math.random().toString(36).slice(-8) // Random password for Google users
      });

      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.log('Welcome email failed (non-critical):', emailError.message);
      }

      // Generate token and login
      const authToken = generateToken(user._id);

      return res.json({
        message: 'Registration and login successful',
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: true,
          profilePicture: user.profilePicture
        }
      });
    }
  } catch (error) {
    console.error('Firebase Google OAuth error:', error);
    res.status(500).json({ message: 'Firebase authentication failed' });
  }
});

// Register user
router.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists in main User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if user already has a pending registration
    const existingPendingUser = await PendingUser.findOne({ email });
    if (existingPendingUser) {
      // Delete the old pending registration and create a new one
      await PendingUser.findByIdAndDelete(existingPendingUser._id);
    }

    // Determine user role
    const userRole = email === 'admin@gmail.com' ? 'admin' : 'user';

    // Create pending user (plain password stored — hashed when real User is created after verification)
    const pendingUser = new PendingUser({ 
      name, 
      email, 
      password,   // plain — no pre-save hash in PendingUser
      role: userRole
    });
    await pendingUser.save();

    // Generate and send OTP for email verification
    try {
      const otpDoc = await OTP.createOTP(email, 'email_verification');
      await sendOTPEmail(email, otpDoc.otp, name, 'email_verification');
      
      res.status(201).json({
        message: 'Registration initiated! Please check your email for verification OTP to complete your account setup.',
        requiresVerification: true,
        email: email,
        isPending: true
      });
    } catch (otpError) {
      // If OTP creation fails, delete the pending user and return error
      await PendingUser.findByIdAndDelete(pendingUser._id);
      
      if (otpError.message.includes('Maximum OTP attempts')) {
        return res.status(429).json({ message: otpError.message });
      }
      
      console.error('OTP generation error:', otpError);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP for email verification
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Check if user exists in main User collection (already registered)
    let user = await User.findOne({ email });
    
    if (user) {
      // User already exists in main collection
      if (user.isEmailVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Verify OTP for existing user
      try {
        await OTP.verifyOTP(email, otp, 'email_verification');
        
        // Mark user as verified
        user.isEmailVerified = true;
        await user.save();

        // Send welcome email (optional)
        try {
          await sendWelcomeEmail(email, user.name);
        } catch (emailError) {
          console.log('Welcome email failed (non-critical):', emailError.message);
        }

        // Generate token for automatic login
        const token = generateToken(user._id);

        res.json({
          message: 'Email verified successfully!',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          }
        });
      } catch (otpError) {
        return res.status(400).json({ message: otpError.message });
      }
    } else {
      // Check if user exists in pending collection (new registration)
      const pendingUser = await PendingUser.findOne({ email });
      if (!pendingUser) {
        return res.status(404).json({ message: 'Registration not found. Please register again.' });
      }

      // Verify OTP for pending user
      try {
        await OTP.verifyOTP(email, otp, 'email_verification');
        
        // Create the real user account — User model's pre-save will hash the password
        user = new User({
          name: pendingUser.name,
          email: pendingUser.email,
          password: pendingUser.password, // plain password — will be hashed by User pre-save
          role: pendingUser.role,
          isEmailVerified: true
        });
        await user.save();

        // Delete the pending record
        await PendingUser.findByIdAndDelete(pendingUser._id);

        // Send welcome email (optional)
        try {
          await sendWelcomeEmail(email, user.name);
        } catch (emailError) {
          console.log('Welcome email failed (non-critical):', emailError.message);
        }

        // Generate token for automatic login
        const token = generateToken(user._id);

        res.json({
          message: 'Registration completed successfully! Welcome to BoiBabu!',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          }
        });
      } catch (otpError) {
        return res.status(400).json({ message: otpError.message });
      }
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP for email verification
router.post('/resend-otp', otpLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists in main User collection
    let user = await User.findOne({ email });
    let userName = '';
    let userExists = false;

    if (user) {
      // User exists in main collection
      if (user.isEmailVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }
      userName = user.name;
      userExists = true;
    } else {
      // Check if user exists in pending collection
      const pendingUser = await PendingUser.findOne({ email });
      if (!pendingUser) {
        return res.status(404).json({ message: 'Registration not found. Please register again.' });
      }
      userName = pendingUser.name;
      userExists = true;
    }

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and send new OTP
    try {
      const otpDoc = await OTP.createOTP(email, 'email_verification');
      await sendOTPEmail(email, otpDoc.otp, userName, 'email_verification');
      
      res.json({ message: 'OTP sent successfully!' });
    } catch (otpError) {
      if (otpError.message.includes('Maximum OTP attempts')) {
        return res.status(429).json({ message: otpError.message });
      }
      
      console.error('OTP generation error:', otpError);
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user in main User collection
    const user = await User.findOne({ email });
    
    if (!user) {
      // Check if user exists in pending collection
      const pendingUser = await PendingUser.findOne({ email });
      if (pendingUser) {
        return res.status(400).json({ 
          message: 'Please complete your registration by verifying your email first',
          requiresVerification: true,
          email: email,
          isPending: true
        });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        message: 'Account suspended', 
        suspended: true,
        suspensionReason: user.suspensionReason,
        suspendedAt: user.suspendedAt
      });
    }

    // Check if email is verified - all users must verify their email
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        address: req.user.address,
        phone: req.user.phone,
        isEmailVerified: req.user.isEmailVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - send OTP
router.post('/forgot-password', otpLimiter, [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset OTP has been sent.' });
    }

    // Generate and send OTP for password reset
    try {
      const otpDoc = await OTP.createOTP(email, 'password_reset');
      await sendOTPEmail(email, otpDoc.otp, user.name, 'password_reset');
      
      res.json({ 
        message: 'If an account with that email exists, a password reset OTP has been sent.',
        // Remove this in production - only for testing
        otp: process.env.NODE_ENV === 'development' ? otpDoc.otp : undefined
      });
    } catch (otpError) {
      if (otpError.message.includes('Maximum OTP attempts')) {
        return res.status(429).json({ message: otpError.message });
      }
      
      console.error('OTP generation error:', otpError);
      // Still return success message for security
      return res.json({ message: 'If an account with that email exists, a password reset OTP has been sent.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    // Verify OTP
    try {
      await OTP.verifyOTP(email, otp, 'password_reset');
      
      // Update password (will be hashed by pre-save middleware)
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password reset successfully' });
    } catch (otpError) {
      return res.status(400).json({ message: otpError.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;