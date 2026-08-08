import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatPrice } from '../../utils/currency';
import { getBookImageUrl } from '../../utils/imageUtils';

const BookCard = ({ book }) => {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(book._id)) {
      removeFromWishlist(book._id);
    } else {
      addToWishlist(book);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  return (
    <div className="card group">
      <Link to={`/books/${book._id}`} className="block">
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={getBookImageUrl(book)}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ aspectRatio: '2/3' }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {book.featured && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
            {book.bestseller && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                Bestseller
              </span>
            )}
            {book.newArrival && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
          >
            {isInWishlist(book._id) ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0 || isInCart(book._id)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                book.stock === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : isInCart(book._id)
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {book.stock === 0 
                ? 'Out of Stock' 
                : isInCart(book._id) 
                ? 'In Cart' 
                : 'Add to Cart'
              }
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {book.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {renderStars(book.rating?.average || 0)}
            </div>
            <span className="text-sm text-gray-500">
              ({book.rating?.count || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(book.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {book.stock > 0 ? (
              <span className="text-sm text-green-600">
                {book.stock < 5 ? `Only ${book.stock} left` : 'In Stock'}
              </span>
            ) : (
              <span className="text-sm text-red-600">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BookCard;