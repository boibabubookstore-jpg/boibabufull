import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  StarIcon, 
  HeartIcon, 
  ShoppingCartIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/currency';
import { getPlaceholderImage } from '../utils/imageUtils';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BookDetailPage = () => {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch book details
  const { data: book, isLoading, error } = useQuery(
    ['book', id],
    () => api.get(`/api/books/${id}`).then(res => res.data),
    { enabled: !!id }
  );

  // Add review mutation
  const addReviewMutation = useMutation(
    (reviewData) => api.post(`/api/books/${id}/reviews`, reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['book', id]);
        toast.success('Review added successfully!');
        setShowReviewForm(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add review');
      }
    }
  );

  // Update review mutation
  const updateReviewMutation = useMutation(
    (reviewData) => api.put(`/api/books/${id}/reviews`, reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['book', id]);
        toast.success('Review updated successfully!');
        setEditingReview(null);
        setShowReviewForm(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update review');
      }
    }
  );

  // Delete review mutation
  const deleteReviewMutation = useMutation(
    () => api.delete(`/api/books/${id}/reviews`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['book', id]);
        toast.success('Review deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  );

  const handleAddToCart = () => {
    addToCart(book, quantity);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(book._id)) {
      removeFromWishlist(book._id);
    } else {
      addToWishlist(book);
    }
  };

  const renderStars = (rating, size = 'h-4 w-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className={`${size} text-yellow-400`} />
        );
      } else {
        stars.push(
          <StarIcon key={i} className={`${size} text-gray-300`} />
        );
      }
    }

    return stars;
  };

  const onSubmitReview = (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }
    
    if (editingReview) {
      updateReviewMutation.mutate(data);
    } else {
      addReviewMutation.mutate(data);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
    setValue('rating', review.rating);
    setValue('comment', review.comment);
  };

  const handleDeleteReview = () => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      deleteReviewMutation.mutate();
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
    reset();
  };

  // Check if current user has reviewed this book
  const userReview = book?.reviews?.find(review => 
    review.user?._id === user?.id || review.user?.id === user?.id
  );

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <div className="text-red-600 text-center py-20">Book not found</div>;
  if (!book) return <div className="text-gray-600 text-center py-20">Book not found</div>;

  // Generate SEO data for the book
  const bookSEO = {
    title: `${book.title} by ${book.author} - Buy Online at BoiBabu.in`,
    description: `Buy ${book.title} by ${book.author} online at BoiBabu.in. ${book.description?.substring(0, 150)}... Best price: ${formatPrice(book.price)} with free shipping.`,
    keywords: `${book.title}, ${book.author}, ${typeof book.category === 'object' ? book.category.name : book.category} books, buy ${book.title} online, ${book.publisher || ''}, ISBN ${book.isbn || ''}, BoiBabu`,
    image: book.images?.[0] ? (book.images[0].startsWith('http') ? book.images[0] : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${book.images[0]}`) : getPlaceholderImage(),
    price: book.price,
    availability: book.stock > 0 ? 'InStock' : 'OutOfStock',
    isbn: book.isbn,
    publisher: book.publisher
  };

  return (
    <>
      <Helmet>
        <title>{bookSEO.title}</title>
        <meta name="description" content={bookSEO.description} />
        <meta name="keywords" content={bookSEO.keywords} />
        <link rel="canonical" href={`https://boibabu.in/books/${book._id}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={bookSEO.title} />
        <meta property="og:description" content={bookSEO.description} />
        <meta property="og:image" content={bookSEO.image} />
        <meta property="og:url" content={`https://boibabu.in/books/${book._id}`} />
        <meta property="og:type" content="book" />
        <meta property="book:author" content={book.author} />
        <meta property="book:isbn" content={book.isbn} />
        <meta property="book:release_date" content={book.publishedDate} />
        
        {/* Twitter tags */}
        <meta name="twitter:title" content={bookSEO.title} />
        <meta name="twitter:description" content={bookSEO.description} />
        <meta name="twitter:image" content={bookSEO.image} />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Structured data for book */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            "name": book.title,
            "author": {
              "@type": "Person",
              "name": book.author
            },
            "isbn": book.isbn,
            "publisher": {
              "@type": "Organization",
              "name": book.publisher
            },
            "datePublished": book.publishedDate,
            "description": book.description,
            "image": bookSEO.image,
            "numberOfPages": book.pages,
            "inLanguage": book.language,
            "genre": typeof book.category === 'object' ? book.category.name : book.category,
            "aggregateRating": book.rating?.count > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": book.rating.average,
              "reviewCount": book.rating.count,
              "bestRating": 5,
              "worstRating": 1
            } : undefined,
            "offers": {
              "@type": "Offer",
              "price": book.price,
              "priceCurrency": "INR",
              "availability": `https://schema.org/${bookSEO.availability}`,
              "seller": {
                "@type": "Organization",
                "name": "BoiBabu"
              },
              "url": `https://boibabu.in/books/${book._id}`
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/books"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Books
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Book Images */}
            <div>
              <div className="mb-4">
                <img
                  src={book.images?.[selectedImage] ? (book.images[selectedImage].startsWith('http') ? book.images[selectedImage] : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${book.images[selectedImage]}`) : getPlaceholderImage()}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {/* Thumbnail Images */}
              {book.images && book.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {book.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-20 rounded border-2 overflow-hidden ${
                        selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${image}`}
                        alt={`${book.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Book Details */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
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
                    New Arrival
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {renderStars(book.rating?.average || 0, 'h-5 w-5')}
                </div>
                <span className="text-lg text-gray-600">
                  {book.rating?.average?.toFixed(1) || '0.0'} ({book.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(book.price)}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(book.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                        {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {book.stock > 0 ? (
                  <div className={`flex items-center ${book.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${book.stock <= 5 ? 'bg-red-600' : 'bg-green-600'}`}></div>
                    {book.stock <= 5 ? (
                      <span className="font-medium">⚠️ Low Stock - Only {book.stock} left!</span>
                    ) : (
                      'In Stock'
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      className="p-2 hover:bg-gray-50"
                      disabled={quantity >= book.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={book.stock === 0 || isInCart(book._id)}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      book.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isInCart(book._id)
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    {book.stock === 0 
                      ? 'Out of Stock' 
                      : isInCart(book._id) 
                      ? 'In Cart' 
                      : 'Add to Cart'
                    }
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isInWishlist(book._id) ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TruckIcon className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Free Delivery*</p>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Secure Payment</p>
                </div>
                <div className="text-center">
                  <ClockIcon className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Easy Returns*</p>
                </div>
              </div>

              {/* Book Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{typeof book.category === 'object' ? book.category.name : book.category}</span>
                </div>
                {book.isbn && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISBN:</span>
                    <span className="font-medium">{book.isbn}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publisher:</span>
                    <span className="font-medium">{book.publisher}</span>
                  </div>
                )}
                {book.pages && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium">{book.pages}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{book.language}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description and Reviews */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                  {isAuthenticated && !userReview && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn-outline text-sm"
                    >
                      Write Review
                    </button>
                  )}
                  {isAuthenticated && userReview && !showReviewForm && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(userReview)}
                        className="btn-outline text-sm"
                      >
                        Edit Review
                      </button>
                      <button
                        onClick={handleDeleteReview}
                        disabled={deleteReviewMutation.isLoading}
                        className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {deleteReviewMutation.isLoading ? 'Deleting...' : 'Delete Review'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmit(onSubmitReview)} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">
                      {editingReview ? 'Edit Your Review' : 'Write a Review'}
                    </h3>
                    <div className="mb-4">
                      <label className="form-label">Rating</label>
                      <select
                        {...register('rating', { required: 'Rating is required' })}
                        className="form-input"
                      >
                        <option value="">Select Rating</option>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Good</option>
                        <option value="3">3 Stars - Average</option>
                        <option value="2">2 Stars - Poor</option>
                        <option value="1">1 Star - Terrible</option>
                      </select>
                      {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>}
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Comment</label>
                      <textarea
                        {...register('comment')}
                        rows={3}
                        className="form-input"
                        placeholder="Share your thoughts about this book..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addReviewMutation.isLoading || updateReviewMutation.isLoading}
                        className="btn-primary text-sm"
                      >
                        {(addReviewMutation.isLoading || updateReviewMutation.isLoading) 
                          ? 'Submitting...' 
                          : editingReview 
                            ? 'Update Review' 
                            : 'Submit Review'
                        }
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {book.reviews && book.reviews.length > 0 ? (
                    book.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="font-medium text-gray-900">{review.user?.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review this book!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default BookDetailPage;