# Quick Setup: Get Your Google OAuth Credentials

## Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create or Select Project
- If you don't have a project, click "Create Project"
- Name it "BoiBabu" or similar
- If you have a project, select it from the dropdown

### 1.3 Enable Google Identity API
- Go to "APIs & Services" > "Library"
- Search for "Google Identity"
- Click on "Google Identity" and click "Enable"

### 1.4 Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Choose "External" (unless you have Google Workspace)
- Fill in required fields:
  - App name: `BoiBabu`
  - User support email: `gyanbhandarceo@gmail.com`
  - Developer contact: `gyanbhandarceo@gmail.com`
- Click "Save and Continue"
- Skip "Scopes" and "Test users" for now
- Click "Back to Dashboard"

### 1.5 Create OAuth 2.0 Client ID
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Application type: "Web application"
- Name: `BoiBabu Web Client`
- Authorized JavaScript origins:
  ```
  http://localhost:3000
  https://boibabu.in
  https://www.boibabu.in
  ```
- Authorized redirect URIs:
  ```
  http://localhost:3000
  https://boibabu.in
  https://www.boibabu.in
  ```
- Click "Create"
- **COPY THE CLIENT ID** - it looks like: `123456789-abcdefg.apps.googleusercontent.com`

## Step 2: Update Your Environment Files

### 2.1 Backend Environment (backend/.env)
Replace the placeholder in your backend/.env file:
```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

### 2.2 Frontend Development Environment (frontend/.env)
Replace the placeholder in your frontend/.env file:
```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

### 2.3 Frontend Production Environment (frontend/.env.production)
Replace the placeholder in your frontend/.env.production file:
```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
```

## Step 3: Test the Setup

### 3.1 Restart Your Servers
```bash
# In backend directory
npm run dev

# In frontend directory (new terminal)
npm start
```

### 3.2 Test Google Sign-In
1. Go to http://localhost:3000/login
2. You should see a "Sign in with Google" button
3. Click it and complete the Google OAuth flow
4. You should be logged in successfully

## Current Environment Status

✅ **Backend .env configured** with placeholder
✅ **Frontend .env configured** with placeholder  
✅ **Frontend .env.production configured** with placeholder
⏳ **Waiting for your Google Client ID**

## What You Need to Do

1. **Get your Google Client ID** following steps 1.1-1.5 above
2. **Replace the placeholder** `your-google-client-id.apps.googleusercontent.com` in all three files:
   - `backend/.env`
   - `frontend/.env` 
   - `frontend/.env.production`
3. **Restart your servers** to load the new environment variables

## Example of What Your Client ID Looks Like
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

## Security Notes
- The Client ID is safe to expose in frontend code
- Keep your Client Secret (if you have one) private
- Only add trusted domains to authorized origins

Once you complete these steps, your Google OAuth integration will be fully functional!