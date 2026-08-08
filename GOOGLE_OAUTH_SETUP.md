# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your BoiBabu application.

## Prerequisites

- Google Cloud Console account
- Access to your application's backend and frontend configuration

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: BoiBabu
   - User support email: Your email
   - Developer contact information: Your email
4. Add your domain to "Authorized domains" (e.g., boibabu.in)
5. Save and continue through the scopes and test users sections

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Configure the settings:
   - Name: BoiBabu Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
5. Click "Create"
6. Copy the Client ID (you'll need this for configuration)

## Step 4: Configure Backend Environment

Add the Google Client ID to your backend environment variables:

### Development (.env)
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Production
Add the same variable to your production environment configuration.

## Step 5: Configure Frontend Environment

Add the Google Client ID to your frontend environment variables:

### Development (.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Production (.env.production)
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Step 6: Test the Integration

1. Start your backend server: `npm run dev` (in backend directory)
2. Start your frontend server: `npm start` (in frontend directory)
3. Navigate to the login or register page
4. Click the "Sign in with Google" button
5. Complete the Google OAuth flow
6. Verify that you're successfully logged in

## Security Considerations

1. **Client ID Security**: The Google Client ID is safe to expose in frontend code
2. **Domain Restrictions**: Ensure your authorized domains are correctly configured
3. **HTTPS in Production**: Always use HTTPS in production for OAuth flows
4. **Environment Variables**: Keep your backend environment variables secure

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**:
   - Check that your authorized redirect URIs match exactly
   - Ensure you're using the correct protocol (http vs https)

2. **"origin_mismatch" error**:
   - Verify your authorized JavaScript origins are correct
   - Check for trailing slashes or missing protocols

3. **Google Sign-In button not appearing**:
   - Ensure the Google Identity Services script is loaded
   - Check browser console for JavaScript errors
   - Verify the Client ID is correctly set

4. **Backend authentication errors**:
   - Confirm the Google Client ID matches between frontend and backend
   - Check that the google-auth-library package is installed
   - Verify your backend environment variables are loaded

### Testing Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend dependencies installed
- [ ] Google Sign-In button appears on login/register pages
- [ ] OAuth flow completes successfully
- [ ] User is created/logged in after Google authentication
- [ ] User data is correctly stored in database

## Features Included

✅ **Login with Google**: Existing users can sign in with their Google account
✅ **Register with Google**: New users can create accounts using Google
✅ **Account Linking**: Google accounts are automatically linked to existing email accounts
✅ **Profile Pictures**: Google profile pictures are automatically imported
✅ **Email Verification**: Google emails are considered pre-verified
✅ **Role-based Redirects**: Users are redirected based on their role (admin/seller/user)
✅ **Suspension Handling**: Suspended accounts are properly handled in Google OAuth flow
✅ **Error Handling**: Comprehensive error handling for OAuth failures

## Next Steps

After successful setup, users will be able to:
- Sign in with their Google account on both login and register pages
- Have their Google profile information automatically imported
- Skip email verification (since Google emails are pre-verified)
- Enjoy a seamless authentication experience

The Google OAuth integration is now complete and ready for use!