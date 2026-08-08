import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon, PlusIcon, MinusIcon, TagIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/currency';
import { getBookImageUrl } from '../utils/imageUtils';
import { useState } from 'react';
import api from '../utils/api';

const CartPage = () => {
  const { items, total, updateQuantity, removeFromCart, clearCart, couponDiscount, appliedCoupon, applyCoupon, removeCoupon, getDiscountedTotal, getFinalTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const applyCouponHandler = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await api.post('/api/coupons/validate', {
        code: couponCode.toUpperCase(),
        orderAmount: total
      });

      if (response.data.valid) {
        const couponData = response.data.coupon;
        applyCoupon(couponData.discount, couponData);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCouponHandler = () => {
    setCouponCode('');
    setCouponError('');
    removeCoupon();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any books to your cart yet.</p>
              <Link
                to="/books"
                className="btn-primary inline-block"
              >
                Continue Shopping
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
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {items.map((item) => (
                  <div key={item.book._id} className="p-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center gap-4">
                      {/* Book Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={getBookImageUrl(item.book)}
                          alt={item.book.title}
                          className="w-20 h-28 object-cover rounded"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/books/${item.book._id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 block truncate"
                        >
                          {item.book.title}
                        </Link>
                        <p className="text-gray-600 mt-1">by {item.book.author}</p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          {formatPrice(item.book.price)}
                        </p>
                        
                        {/* Stock Warning */}
                        {item.book.stock < 5 && (
                          <p className="text-orange-600 text-sm mt-1">
                            Only {item.book.stock} left in stock
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 rounded-l-lg"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 rounded-r-lg"
                            disabled={item.quantity >= item.book.stock}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.book._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        Subtotal: {formatPrice(item.book.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {getDiscountedTotal() >= 2000 ? 'FREE' : '₹70.00'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(getFinalTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      onClick={applyCouponHandler}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <TagIcon className="h-4 w-4" />
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  
                  {couponError && (
                    <p className="text-red-500 text-sm mt-1">{couponError}</p>
                  )}
                  
                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded-lg">
                      <span className="text-green-700 text-sm">
                        {appliedCoupon?.description || appliedCoupon?.code} applied! 
                        {appliedCoupon?.type === 'percentage' 
                          ? ` ${appliedCoupon.value}% off` 
                          : ` ₹${appliedCoupon.value} off`}
                      </span>
                      <button
                        onClick={removeCouponHandler}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Try coupon codes for discounts on your order</p>
                  </div>
                </div>

                {getDiscountedTotal() < 2000 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-800">
                      Add {formatPrice(2000 - getDiscountedTotal())} more for free shipping!
                    </p>
                  </div>
                )}

                {isAuthenticated ? (
                  <Link
                    to="/checkout"
                    className="btn-primary w-full text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login?redirect=/checkout"
                      className="btn-primary w-full text-center block"
                    >
                      Login to Checkout
                    </Link>
                    <p className="text-sm text-gray-600 text-center">
                      New customer?{' '}
                      <Link to="/register" className="text-primary-600 hover:text-primary-700">
                        Create an account
                      </Link>
                    </p>
                  </div>
                )}

                <Link
                  to="/books"
                  className="btn-outline w-full text-center block mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;