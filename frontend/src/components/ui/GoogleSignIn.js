import React, { useState } from 'react';
import { signInWithPopup, getIdToken } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const GoogleSignIn = ({ onSuccess, onError, text = "Sign in with Google" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { googleLogin } = useAuth();

  const handleGoogleSignIn = async () => {
    if (!auth || !googleProvider) {
      onError?.('Firebase not configured. Please check your environment variables.');
      return;
    }

    setIsLoading(true);
    try {
      // Sign in with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the ID token
      const idToken = await getIdToken(user);
      
      // Send token to your backend
      const authResult = await googleLogin(idToken);
      
      if (authResult.success) {
        onSuccess?.(authResult);
      } else {
        onError?.(authResult.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Firebase Google sign-in error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Google sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/invalid-api-key') {
        errorMessage = 'Invalid Firebase configuration. Please check your API key.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domain not authorized. Please add your domain to Firebase settings.';
      }
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center py-3 px-4 border border-red-300 rounded-md bg-red-50 mb-4">
          <span className="text-red-600 text-sm">
            Firebase not configured. Check browser console for details.
          </span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Debug info:</p>
          <p>API Key: {process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>Project ID: {process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>Auth Domain: {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
          Signing in...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {text}
        </div>
      )}
    </button>
  );
};

export default GoogleSignIn;