import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/currency';
import { getBookImageUrl } from '../utils/imageUtils';

const WishlistPage = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (book) => {
    addToCart(book, 1);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">Save books you love to your wishlist and never lose track of them.</p>
              <Link
                to="/books"
                className="btn-primary inline-block"
              >
                Discover Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <button
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Wishlist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((book) => (
              <div key={book._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                <Link to={`/books/${book._id}`} className="block">
                  <div className="relative">
                    <img
                      src={getBookImageUrl(book)}
                      alt={book.title}
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Remove from wishlist button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(book._id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/books/${book._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {book.title}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(book.price)}
                    </span>
                    {book.originalPrice && book.originalPrice > book.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(book.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(book);
                    }}
                    disabled={book.stock === 0 || isInCart(book._id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      book.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isInCart(book._id)
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    {book.stock === 0 
                      ? 'Out of Stock' 
                      : isInCart(book._id) 
                      ? 'In Cart' 
                      : 'Add to Cart'
                    }
                  </button>

                  {/* Stock Status */}
                  <div className="mt-2 text-center">
                    {book.stock > 0 ? (
                      <span className="text-sm text-green-600">
                        {book.stock < 5 ? `Only ${book.stock} left` : 'In Stock'}
                      </span>
                    ) : (
                      <span className="text-sm text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-12 text-center">
            <Link
              to="/books"
              className="btn-outline inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;