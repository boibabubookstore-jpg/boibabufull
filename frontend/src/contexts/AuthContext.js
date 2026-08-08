import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { authEventEmitter } from '../utils/authEvents';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'AUTH_ERROR':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Define loadUser function first
  const loadUser = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/me');
      dispatch({ type: 'LOAD_USER', payload: response.data.user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  // Set auth token in api headers and add response interceptor
  useEffect(() => {
    if (state.token) {
      console.log('Setting api auth header');
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      console.log('Auth header set successfully');
    } else {
      console.log('Removing api auth header');
      delete api.defaults.headers.common['Authorization'];
    }

    // Add response interceptor to handle suspension
    let interceptor;
    try {
      interceptor = api.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 403 && error.response?.data?.suspended) {
            // User is suspended, log them out
            dispatch({ type: 'AUTH_ERROR' });
            toast.error('Your account has been suspended. Please contact support.');
          }
          return Promise.reject(error);
        }
      );
    } catch (interceptorError) {
      console.warn('Could not set up api interceptor:', interceptorError);
    }

    // Cleanup interceptor on unmount
    return () => {
      try {
        if (interceptor !== undefined) {
          api.interceptors.response.eject(interceptor);
        }
      } catch (cleanupError) {
        console.warn('Could not cleanup api interceptor:', cleanupError);
      }
    };
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.token, loadUser]);

  const googleLogin = async (token) => {
    try {
      const response = await api.post('/api/auth/google', { token });
      
      // Set the token in state first
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      
      // Wait a moment for the axios header to be set, then emit login event
      setTimeout(() => {
        authEventEmitter.emit('login', response.data.user);
      }, 10);
      
      toast.success('Google sign-in successful!');
      
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Google sign-in failed';
      
      // Handle suspension
      if (error.response?.data?.suspended) {
        return { 
          success: false, 
          suspended: true,
          suspensionReason: error.response.data.suspensionReason,
          suspendedAt: error.response.data.suspendedAt,
          message 
        };
      }
      
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.requiresVerification) {
        // User needs to verify email first
        const message = response.data.isPending ? 
          'Please complete your registration by verifying your email first' :
          'Please verify your email before logging in';
        
        toast.error(message);
        return { 
          success: false, 
          requiresVerification: true,
          email: response.data.email,
          isPending: response.data.isPending,
          message: message
        };
      }
      
      // Set the token in state first
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
      
      // Wait a moment for the axios header to be set, then emit login event
      setTimeout(() => {
        authEventEmitter.emit('login', response.data.user);
      }, 10);
      
      toast.success('Login successful!');
      
      // Don't redirect automatically, let the user navigate manually for now
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      // Handle suspension
      if (error.response?.data?.suspended) {
        return { 
          success: false, 
          suspended: true,
          suspensionReason: error.response.data.suspensionReason,
          suspendedAt: error.response.data.suspendedAt,
          message 
        };
      }
      
      toast.error(message);
      return { success: false, message };
    }
  };

  // Function to login with token (used after email verification)
  const loginWithToken = (token, user) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
    
    // Wait a moment for the axios header to be set, then emit login event
    setTimeout(() => {
      authEventEmitter.emit('login', user);
    }, 10);
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      
      if (response.data.requiresVerification) {
        // Registration initiated but requires email verification
        const message = response.data.isPending ? 
          'Registration initiated! Please check your email for verification to complete your account setup.' :
          'Registration successful! Please check your email for verification.';
        
        toast.success(message);
        return { 
          success: true, 
          requiresVerification: true,
          email: response.data.email,
          isPending: response.data.isPending
        };
      } else {
        // Automatically log in the user (for admin or existing flow)
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
        toast.success('Registration successful! Welcome to BoiBabu!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    try {
      // Emit logout event to CartContext before clearing anything
      authEventEmitter.emit('logout');
      
      // Clear api authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Clear localStorage but don't touch cart (cart is database-only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('wishlist'); // Clear wishlist on logout
      }
      
      // Dispatch logout action
      dispatch({ type: 'LOGOUT' });
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      dispatch({ type: 'LOGOUT' });
      toast.error('Logout completed with errors');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      dispatch({ type: 'LOAD_USER', payload: response.data.user });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    googleLogin,
    loginWithToken,
    register,
    logout,
    updateProfile,
    updateUser,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};