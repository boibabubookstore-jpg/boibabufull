# Firebase Authentication Troubleshooting Guide

This guide will help you diagnose and fix Firebase authentication issues.

## 🔍 Common Issues and Solutions

### 1. Firebase Not Configured Error

**Error**: "Firebase not configured. Please check your environment variables."

**Solution**:
1. Ensure all Firebase environment variables are set in your `.env` files
2. Check that the values don't contain placeholder text
3. Restart your development server after updating environment variables

**Required Variables**:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

### 2. Popup Blocked Error

**Error**: "Popup blocked. Please allow popups for this site."

**Solution**:
1. Allow popups for your domain in browser settings
2. Try using a different browser
3. Disable popup blockers temporarily

### 3. Invalid Google Token Error

**Error**: "Invalid Google token"

**Solution**:
1. Verify your Google Client ID matches in both frontend and backend
2. Check that your domain is authorized in Google Cloud Console
3. Ensure the token hasn't expired

### 4. Firebase Project Not Found

**Error**: Firebase project not found or access denied

**Solution**:
1. Verify your Firebase project ID is correct
2. Check that the project exists in Firebase Console
3. Ensure you have proper permissions for the project

## 🛠️ Debugging Steps

### Step 1: Check Environment Variables

Run the environment checker:
```bash
# In frontend directory
node ../check-env.js
```

Look for:
- ✅ All variables should show "Set"
- ⚠️ No variables should show "Placeholder"
- ❌ No variables should show "Not set"

### Step 2: Test Firebase Initialization

Add this to your browser console on the login page:
```javascript
// Check if Firebase is initialized
console.log('Firebase config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

// Check if auth is available
import { auth } from './src/config/firebase.js';
console.log('Firebase auth:', auth);
```

### Step 3: Check Network Requests

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to sign in with Google
4. Look for failed requests to:
   - `identitytoolkit.googleapis.com`
   - `securetoken.googleapis.com`
   - Your backend API

### Step 4: Check Console Errors

Look for these common errors in browser console:
- `Firebase: Error (auth/popup-closed-by-user)`
- `Firebase: Error (auth/popup-blocked)`
- `Firebase: Error (auth/unauthorized-domain)`
- `Firebase: Error (auth/invalid-api-key)`

## 🔧 Configuration Fixes

### Fix 1: Update Firebase Project Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Verify your web app configuration
5. Copy the exact config values to your `.env` files

### Fix 2: Update Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Click on "Authorized domains" tab
3. Add your domains:
   - `localhost` (for development)
   - `your-domain.com` (for production)
4. Save changes

### Fix 3: Enable Google Sign-In Method

1. In Firebase Console, go to Authentication > Sign-in method
2. Find "Google" in the providers list
3. Click on it and toggle "Enable"
4. Set your project support email
5. Save changes

## 🚀 Quick Fix Commands

### Install Dependencies
```bash
# In frontend directory
npm install firebase
```

### Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

### Clear Browser Cache
```bash
# Chrome/Edge
Ctrl+Shift+Delete

# Firefox
Ctrl+Shift+Delete

# Or use incognito/private mode
```

## 🔄 Fallback Options

If Firebase continues to have issues, the system will automatically fall back to Google Identity Services:

### Option 1: Use Google Identity Services Only
Remove or comment out Firebase environment variables to force fallback:
```env
# REACT_APP_FIREBASE_API_KEY=...
# REACT_APP_FIREBASE_AUTH_DOMAIN=...
# etc.
```

### Option 2: Use Direct Google Cloud Console Setup
Follow the `SETUP_GOOGLE_OAUTH_CREDENTIALS.md` guide instead of Firebase.

## 📊 Testing Checklist

- [ ] Firebase project created and configured
- [ ] Google authentication enabled in Firebase
- [ ] Authorized domains added
- [ ] Environment variables set correctly
- [ ] Frontend dependencies installed
- [ ] Development server restarted
- [ ] Browser popups allowed
- [ ] Network requests successful
- [ ] No console errors
- [ ] Google sign-in button appears
- [ ] Sign-in popup opens
- [ ] Authentication completes successfully
- [ ] User is redirected correctly

## 🆘 Still Having Issues?

### Check These Common Mistakes:

1. **Wrong Project ID**: Make sure you're using the correct Firebase project
2. **Mismatched Client ID**: Ensure Google Client ID matches between Firebase and backend
3. **Domain Not Authorized**: Add your domain to both Firebase and Google Cloud Console
4. **Environment Variables**: Check for typos or missing values
5. **Browser Issues**: Try incognito mode or different browser
6. **Network Issues**: Check if your network blocks Google services

### Debug Information to Collect:

1. Browser console errors
2. Network tab failed requests
3. Environment variable values (without sensitive data)
4. Firebase project configuration
5. Google Cloud Console OAuth settings

### Alternative Solutions:

1. **Use Google Identity Services**: Remove Firebase config to use fallback
2. **Manual Token Verification**: Implement custom token verification
3. **Different Auth Provider**: Consider other OAuth providers

The system is designed to be resilient - if Firebase fails, it will automatically fall back to Google Identity Services, ensuring your users can always authenticate!