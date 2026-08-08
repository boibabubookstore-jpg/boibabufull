import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { authEventEmitter } from '../utils/authEvents';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  couponDiscount: 0,
  appliedCoupon: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.book._id === action.payload.book._id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.book._id === action.payload.book._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.book._id !== action.payload);
      return { ...state, items: updatedItems };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.book._id === action.payload.bookId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, items: updatedItems };
    }
    
    case 'CLEAR_CART': {
      return { ...state, items: [], couponDiscount: 0, appliedCoupon: null };
    }
    
    case 'APPLY_COUPON': {
      return { 
        ...state, 
        couponDiscount: action.payload.discount, 
        appliedCoupon: action.payload.coupon 
      };
    }
    
    case 'REMOVE_COUPON': {
      return { ...state, couponDiscount: 0, appliedCoupon: null };
    }
    
    case 'SYNC_CART': {
      return { ...state, items: action.payload };
    }
    
    case 'CALCULATE_TOTALS': {
      const total = state.items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
      const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      return { ...state, total, itemCount };
    }
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Listen for auth events (login/logout)
  useEffect(() => {
    const handleLogin = (user) => {
      console.log('Cart login handler called for user:', user.name);
      setIsAuthenticated(true);
      setUser(user);
    };

    const handleLogout = () => {
      console.log('Cart logout handler called, current items:', state.items.length);
      // Clear cart locally but keep it in database
      dispatch({ type: 'CLEAR_CART' });
      setIsAuthenticated(false);
      setUser(null);
      console.log('Cart logout completed');
    };

    authEventEmitter.on('login', handleLogin);
    authEventEmitter.on('logout', handleLogout);
    
    return () => {
      authEventEmitter.off('login', handleLogin);
      authEventEmitter.off('logout', handleLogout);
    };
  }, [state.items]);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.items]);

  // Load cart from database when user logs in
  useEffect(() => {
    console.log('Cart useEffect triggered, isAuthenticated:', isAuthenticated);
    if (isAuthenticated && user) {
      // Check if api has the auth header set before loading cart
      const checkAndLoadCart = () => {
        if (api.defaults.headers.common['Authorization']) {
          console.log('Auth header found, loading cart from server');
          loadCartFromServer();
        } else {
          console.log('Auth header not set yet, retrying in 50ms');
          setTimeout(checkAndLoadCart, 50);
        }
      };
      
      checkAndLoadCart();
    }
  }, [isAuthenticated, user]);

  const loadCartFromServer = async () => {
    try {
      console.log('Loading cart from server...');
      console.log('Current auth header:', api.defaults.headers.common['Authorization']);
      
      const response = await api.get('/api/cart');
      console.log('Cart response received from server');
      
      if (response.data && response.data.items) {
        const serverItems = response.data.items.map(item => ({
          book: item.book,
          quantity: item.quantity
        }));
        
        console.log('Syncing cart items:', serverItems);
        dispatch({ type: 'SYNC_CART', payload: serverItems });
        console.log('Cart loaded successfully from server');
      } else {
        console.log('No cart items found on server');
      }
    } catch (error) {
      console.error('Failed to load cart from server:', error);
      if (error.response?.status === 401) {
        console.error('Authentication error - token may not be set properly');
      }
    }
  };

  const addToCart = async (book, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (book.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const existingItem = state.items.find(item => item.book._id === book._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > book.stock) {
      toast.error('Cannot add more items than available stock');
      return;
    }

    try {
      console.log('Adding to cart:', book.title, 'quantity:', quantity);
      console.log('Current auth header before add:', api.defaults.headers.common['Authorization']);
      
      const response = await api.post('/api/cart/add', {
        bookId: book._id,
        quantity
      });
      
      console.log('Add to cart response received');
      
      if (response.data.cart) {
        const serverItems = response.data.cart.items.map(item => ({
          book: item.book,
          quantity: item.quantity
        }));
        
        console.log('Syncing cart after add:', serverItems);
        dispatch({ type: 'SYNC_CART', payload: serverItems });
      }
      
      toast.success(`${book.title} added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 401) {
        console.error('401 Unauthorized - Auth token issue detected');
        toast.error('Authentication error. Please try logging out and back in.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  const removeFromCart = async (bookId) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage cart');
      return;
    }

    try {
      const response = await api.delete(`/api/cart/remove/${bookId}`);
      
      if (response.data.cart) {
        const serverItems = response.data.cart.items.map(item => ({
          book: item.book,
          quantity: item.quantity
        }));
        
        dispatch({ type: 'SYNC_CART', payload: serverItems });
      }
      
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from cart');
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage cart');
      return;
    }

    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    const item = state.items.find(item => item.book._id === bookId);
    
    if (item && quantity > item.book.stock) {
      toast.error('Cannot exceed available stock');
      return;
    }

    try {
      const response = await api.put('/api/cart/update', {
        bookId,
        quantity
      });
      
      if (response.data.cart) {
        const serverItems = response.data.cart.items.map(item => ({
          book: item.book,
          quantity: item.quantity
        }));
        
        dispatch({ type: 'SYNC_CART', payload: serverItems });
      }
    } catch (error) {
      console.error('Failed to update quantity on server:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/api/cart/clear');
        dispatch({ type: 'CLEAR_CART' });
        toast.success('Cart cleared');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to clear cart');
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared');
    }
  };

  const getCartItem = (bookId) => {
    return state.items.find(item => item.book._id === bookId);
  };

  const isInCart = (bookId) => {
    return state.items.some(item => item.book._id === bookId);
  };

  const applyCoupon = (discount, coupon) => {
    dispatch({ 
      type: 'APPLY_COUPON', 
      payload: { discount, coupon } 
    });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const getDiscountedTotal = () => {
    return Math.max(0, state.total - state.couponDiscount);
  };

  const getFinalTotal = () => {
    const discountedTotal = getDiscountedTotal();
    const shippingCost = discountedTotal >= 2000 ? 0 : 70;
    return discountedTotal + shippingCost;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,
    applyCoupon,
    removeCoupon,
    getDiscountedTotal,
    getFinalTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};