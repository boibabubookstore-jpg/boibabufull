import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

const initialState = {
  items: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [],
  itemCount: 0,
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        return state; // Item already in wishlist
      }
      
      return { ...state, items: [...state.items, action.payload] };
    }
    
    case 'REMOVE_FROM_WISHLIST': {
      const updatedItems = state.items.filter(item => item._id !== action.payload);
      return { ...state, items: updatedItems };
    }
    
    case 'CLEAR_WISHLIST': {
      return { ...state, items: [] };
    }
    
    case 'CALCULATE_COUNT': {
      const itemCount = state.items.length;
      return { ...state, itemCount };
    }
    
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Calculate count whenever items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_COUNT' });
  }, [state.items]);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToWishlist = (book) => {
    const existingItem = state.items.find(item => item._id === book._id);
    
    if (existingItem) {
      toast.error('Book is already in your wishlist');
      return;
    }

    dispatch({
      type: 'ADD_TO_WISHLIST',
      payload: book
    });
    
    toast.success(`${book.title} added to wishlist!`);
  };

  const removeFromWishlist = (bookId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: bookId });
    toast.success('Book removed from wishlist');
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    toast.success('Wishlist cleared');
  };

  const isInWishlist = (bookId) => {
    return state.items.some(item => item._id === bookId);
  };

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};