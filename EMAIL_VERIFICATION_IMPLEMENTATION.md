# Email Verification Implementation - Complete Registration Flow

## Overview
This document outlines the comprehensive email verification system that ensures **no user can complete registration without first verifying their email address**. Users cannot access the application until they verify their email, making email verification a mandatory part of the registration process.

## How It Works

### 1. Registration Process (New Approach)
- When a user registers with email/password, they are stored in a **temporary `PendingUser` collection**
- **No account is created in the main `User` collection** until email verification is complete
- An OTP (One-Time Password) is generated and sent to their email
- The user receives a message indicating registration is initiated but not complete
- The user is redirected to the email verification page
- **The user cannot login until they complete email verification**

### 2. Email Verification Process
- User enters the 6-digit OTP received in their email
- System verifies the OTP
- **Only after successful OTP verification:**
  - User account is created in the main `User` collection
  - User is marked as `isEmailVerified: true`
  - Pending user record is deleted
  - User is automatically logged in
  - Welcome email is sent
- User is redirected to the appropriate dashboard based on their role

### 3. Login Process
- System first checks if user exists in main `User` collection
- If user doesn't exist in main collection, checks `PendingUser` collection
- If found in pending collection, user is told to complete registration via email verification
- If found in main collection but not verified, user is redirected to verification
- **Only fully verified users can access the application**

### 4. Google OAuth Users
- Google OAuth users bypass the pending system
- They are directly created in the main `User` collection with `isEmailVerified: true`
- This is because Google pre-verifies email addresses
- These users can immediately access the application

## Implementation Details

### Backend Changes

#### 1. New PendingUser Model (`backend/models/PendingUser.js`)
```javascript
const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 }, // Pre-hashed
  role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
  verificationToken: { type: String, required: true },
  expiresAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours
});
```

#### 2. Updated Registration Route (`backend/routes/auth.js`)
- Creates user in `PendingUser` collection (not `User` collection)
- Generates and sends OTP via email
- Returns `requiresVerification: true` and `isPending: true` in response
- If OTP sending fails, deletes the pending user

#### 3. Updated Login Route (`backend/routes/auth.js`)
- Checks main `User` collection first
- If not found, checks `PendingUser` collection
- If found in pending, returns appropriate message to complete registration
- Only allows login for verified users in main collection

#### 4. Enhanced OTP Verification Route (`backend/routes/auth.js`)
- Handles both existing users (in main collection) and pending users
- For pending users: Creates account in main collection after verification
- For existing users: Marks as verified
- Automatically logs in user after successful verification
- Deletes pending user record after successful verification

#### 5. Updated Resend OTP Route (`backend/routes/auth.js`)
- Handles both pending users and existing unverified users
- Finds user in either collection and sends OTP accordingly

### Frontend Changes

#### 1. Updated Registration Page (`frontend/src/pages/auth/RegisterPage.js`)
- Handles `isPending` flag in response
- Shows appropriate message for registration initiation vs completion
- Passes pending status to verification page

#### 2. Updated Login Page (`frontend/src/pages/auth/LoginPage.js`)
- Handles `isPending` flag for users who haven't completed registration
- Shows different messages for pending vs existing unverified users
- Redirects to verification with appropriate context

#### 3. Enhanced Email Verification Page (`frontend/src/pages/auth/EmailVerificationPage.js`)
- Shows different UI based on whether it's completing registration or verifying existing account
- Different success messages for registration completion vs email verification
- Additional information for pending registrations

#### 4. Updated Auth Context (`frontend/src/contexts/AuthContext.js`)
- Handles new response format with `isPending` flag
- Different toast messages for registration initiation vs completion
- Proper error handling for pending users trying to login

## Security Features

### 1. Temporary User Storage
- Pending users are stored separately from main users
- Pending users automatically expire after 24 hours
- No access to application until verification is complete

### 2. OTP System
- 6-digit numeric OTP
- 5-minute expiration time
- Maximum 3 attempts per 24 hours
- Rate limiting on OTP generation

### 3. Complete Registration Flow
- **No partial registrations** - users must complete the full flow
- **No unverified access** - application access only after verification
- **Automatic cleanup** - expired pending registrations are removed

### 4. Rate Limiting
- Registration attempts are rate limited
- OTP generation is rate limited
- Prevents spam and abuse

## Migration and Cleanup

### Cleanup Script (`backend/scripts/cleanup-unverified-users.js`)
- Moves recent unverified users to pending collection
- Deletes old unverified users from main collection
- Provides statistics on cleanup operations

### Running the Cleanup
```bash
cd backend
node scripts/cleanup-unverified-users.js
```

## User Experience Flow

### New User Registration (Complete Flow)
1. User fills registration form
2. User submits form
3. **Pending account created** (not in main User collection)
4. OTP sent to email
5. User redirected to verification page with "Complete Registration" message
6. User enters OTP
7. **Account created in main collection** after successful verification
8. User automatically logged in
9. User redirected to dashboard
10. Welcome email sent

### Attempted Login Before Verification
1. User tries to log in with pending registration
2. System detects pending status
3. User shown message: "Please complete your registration by verifying your email"
4. User redirected to verification page
5. User completes verification process
6. Account created and user logged in

### Google OAuth Users (Immediate Access)
1. User clicks "Sign in with Google"
2. Google authentication
3. **Account directly created in main collection** with verified status
4. User logged in and redirected immediately

## Error Handling

### Registration Errors
- Duplicate email addresses (checks both collections)
- Invalid email format
- OTP generation failures (pending user deleted)
- Email sending failures (pending user deleted)

### Verification Errors
- Invalid OTP
- Expired OTP
- Maximum attempts exceeded
- Pending user not found (registration expired)

### Login Errors
- Pending registration (redirects to verification)
- Unverified email (redirects to verification)
- Invalid credentials
- Account suspension

## Database Collections

### Main User Collection
- Only contains **fully verified and active users**
- All users have `isEmailVerified: true` (except legacy users)
- Users can login and access the application

### PendingUser Collection
- Contains **incomplete registrations**
- Users waiting for email verification
- Automatically expires after 24 hours
- Cannot login or access application

### Benefits of This Approach
1. **Clean separation** between verified and unverified users
2. **No partial access** - users must complete full registration
3. **Automatic cleanup** - expired registrations are removed
4. **Better security** - no unverified users in main system
5. **Clear user flow** - obvious distinction between registration and verification

## Monitoring and Logging

### Logs to Monitor
- Pending user creations
- Registration completions (pending → verified)
- Failed verification attempts
- Expired pending registrations
- Email sending failures

### Metrics to Track
- Registration completion rate (pending → verified)
- Time to complete registration
- Pending user expiration rate
- OTP verification success rate

## Troubleshooting

### Common Issues
1. **Registration not completing**: Check pending user collection and OTP records
2. **OTP not received**: Check spam folder, verify email service
3. **Registration expired**: User needs to register again
4. **Cannot login**: Check if user is in pending vs main collection

### Support Process
1. Check if user exists in main User collection
2. Check if user exists in PendingUser collection
3. Check OTP records and expiration
4. Manually complete registration if needed (admin action)
5. Resend OTP if within limits

## Future Enhancements

### Possible Improvements
1. **Email verification links** (alternative to OTP)
2. **Extended pending period** for certain cases
3. **Bulk registration completion** for admin users
4. **Registration analytics dashboard**
5. **Automated reminder emails** for pending registrations

### Security Enhancements
1. **Device fingerprinting** for registration
2. **IP-based rate limiting** per registration
3. **CAPTCHA** for repeated registration attempts
4. **Email domain validation** and blocking