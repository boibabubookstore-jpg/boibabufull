// Environment Variables Checker
// Run this with: node check-env.js

console.log('🔍 Checking Environment Variables...\n');

// Check if we're in backend or frontend directory
const fs = require('fs');
const path = require('path');

const isBackend = fs.existsSync('server.js');
const isFrontend = fs.existsSync('src') && fs.existsSync('package.json');

if (isBackend) {
  console.log('📁 Detected: Backend Directory');
  require('dotenv').config();
  
  console.log('\n🔧 Backend Environment Variables:');
  console.log('PORT:', process.env.PORT || '❌ Not set');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 
    (process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id') ? 
      '⚠️  Placeholder - needs real Client ID' : '✅ Set') : '❌ Not set');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 
    (process.env.FIREBASE_PROJECT_ID.includes('your-firebase') ? 
      '⚠️  Placeholder - needs real Project ID' : '✅ Set') : '❌ Not set');
  console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY ? 
    (process.env.FIREBASE_API_KEY.includes('your-firebase') ? 
      '⚠️  Placeholder - needs real API Key' : '✅ Set') : '❌ Not set');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  
} else if (isFrontend) {
  console.log('📁 Detected: Frontend Directory');
  
  // Check .env file
  const envPath = '.env';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n🔧 Frontend Environment Variables (.env):');
    
    const apiUrl = envContent.match(/REACT_APP_API_URL=(.+)/);
    const googleClientId = envContent.match(/REACT_APP_GOOGLE_CLIENT_ID=(.+)/);
    const firebaseApiKey = envContent.match(/REACT_APP_FIREBASE_API_KEY=(.+)/);
    const firebaseProjectId = envContent.match(/REACT_APP_FIREBASE_PROJECT_ID=(.+)/);
    
    console.log('REACT_APP_API_URL:', apiUrl ? '✅ Set' : '❌ Not set');
    console.log('REACT_APP_GOOGLE_CLIENT_ID:', googleClientId ? 
      (googleClientId[1].includes('your-google-client-id') ? 
        '⚠️  Placeholder - needs real Client ID' : '✅ Set') : '❌ Not set');
    console.log('REACT_APP_FIREBASE_API_KEY:', firebaseApiKey ? 
      (firebaseApiKey[1].includes('your-firebase') ? 
        '⚠️  Placeholder - needs real API Key' : '✅ Set') : '❌ Not set');
    console.log('REACT_APP_FIREBASE_PROJECT_ID:', firebaseProjectId ? 
      (firebaseProjectId[1].includes('your-firebase') ? 
        '⚠️  Placeholder - needs real Project ID' : '✅ Set') : '❌ Not set');
  } else {
    console.log('❌ .env file not found');
  }
  
  // Check .env.production file
  const envProdPath = '.env.production';
  if (fs.existsSync(envProdPath)) {
    const envProdContent = fs.readFileSync(envProdPath, 'utf8');
    console.log('\n🔧 Frontend Environment Variables (.env.production):');
    
    const apiUrl = envProdContent.match(/REACT_APP_API_URL=(.+)/);
    const googleClientId = envProdContent.match(/REACT_APP_GOOGLE_CLIENT_ID=(.+)/);
    const firebaseApiKey = envProdContent.match(/REACT_APP_FIREBASE_API_KEY=(.+)/);
    const firebaseProjectId = envProdContent.match(/REACT_APP_FIREBASE_PROJECT_ID=(.+)/);
    
    console.log('REACT_APP_API_URL:', apiUrl ? '✅ Set' : '❌ Not set');
    console.log('REACT_APP_GOOGLE_CLIENT_ID:', googleClientId ? 
      (googleClientId[1].includes('your-google-client-id') ? 
        '⚠️  Placeholder - needs real Client ID' : '✅ Set') : '❌ Not set');
    console.log('REACT_APP_FIREBASE_API_KEY:', firebaseApiKey ? 
      (firebaseApiKey[1].includes('your-firebase') ? 
        '⚠️  Placeholder - needs real API Key' : '✅ Set') : '❌ Not set');
    console.log('REACT_APP_FIREBASE_PROJECT_ID:', firebaseProjectId ? 
      (firebaseProjectId[1].includes('your-firebase') ? 
        '⚠️  Placeholder - needs real Project ID' : '✅ Set') : '❌ Not set');
  } else {
    console.log('❌ .env.production file not found');
  }
  
} else {
  console.log('❌ Unknown directory - run this from backend or frontend folder');
}

console.log('\n📋 Next Steps:');
console.log('1. Choose either Google Cloud Console OR Firebase Console setup');
console.log('2. Get your Google Client ID and Firebase config (if using Firebase)');
console.log('3. Replace placeholders with your actual credentials');
console.log('4. Restart your servers after updating environment variables');
console.log('\n📖 Setup Guides:');
console.log('• SETUP_GOOGLE_OAUTH_CREDENTIALS.md - Google Cloud Console');
console.log('• FIREBASE_OAUTH_SETUP.md - Firebase Console (Recommended)');