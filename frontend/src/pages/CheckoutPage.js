import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import {
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/currency';
import { getBookImageUrl } from '../utils/imageUtils';
import OrderConfirmationModal from '../components/ui/OrderConfirmationModal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, couponDiscount, appliedCoupon, getDiscountedTotal, getFinalTotal } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  console.log('CheckoutPage render - State:', { 
    showConfirmation, 
    hasConfirmedOrder: !!confirmedOrder, 
    orderNumber: confirmedOrder?.orderNumber 
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      landmark: user?.address?.landmark || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'India'
    }
  });

  // Calculate totals
  const subtotal = total;
  const discountedSubtotal = getDiscountedTotal();
  const shippingCost = discountedSubtotal >= 2000 ? 0 : 70;
  const finalTotal = getFinalTotal();

  // Create Razorpay order
  const createRazorpayOrder = useMutation(
    (amount) => api.post('/api/payment/create-order', { amount }),
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create payment order');
        setIsProcessing(false);
      }
    }
  );

  // Verify payment
  const verifyPayment = useMutation(
    (paymentData) => api.post('/api/payment/verify-payment', paymentData),
    {
      onSuccess: (response) => {
        console.log('Payment verification successful');
        console.log('Setting confirmed order');
        console.log('Setting showConfirmation to true');
        setConfirmedOrder(response.data.order);
        setShowConfirmation(true);
        clearCart();
        toast.success('Order placed successfully!');
        
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Payment verification failed');
        setIsProcessing(false);
      }
    }
  );

  const handleRazorpayPayment = async (orderData) => {
    try {
      const { data } = await createRazorpayOrder.mutateAsync(finalTotal);
      
      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'BoiBabu',
        description: 'Book Purchase',
        order_id: data.order.id,
        handler: function (response) {
          verifyPayment.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData: {
              ...orderData,
              total: finalTotal,
              subtotal: discountedSubtotal,
              shippingCost,
              couponDiscount,
              appliedCoupon
            }
          });
        },
        prefill: {
          name: orderData.shippingAddress.name,
          email: orderData.shippingAddress.email,
          contact: orderData.shippingAddress.phone
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    const orderData = {
      items: items.map(item => ({
        bookId: item.book._id,
        quantity: item.quantity
      })),
      shippingAddress: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country
      },
      paymentMethod
    };

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment(orderData);
    } else {
      // Handle other payment methods (COD, etc.)
      try {
        const response = await api.post('/api/orders', {
          ...orderData,
          total: finalTotal,
          subtotal: discountedSubtotal,
          shippingCost,
          couponDiscount,
          appliedCoupon
        });
        console.log('Order created successfully');
        setConfirmedOrder(response.data.order);
        setShowConfirmation(true);
        clearCart();
        toast.success('Order placed successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to place order');
        setIsProcessing(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some books to your cart before checkout.</p>
            <button
              onClick={() => navigate('/books')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Forms */}
              <div className="space-y-6">
                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <TruckIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter Your Full Name Here"
                        className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        placeholder="Enter Your Email Id Here"
                        className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                        {...register('phone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'Please enter a valid 10-digit mobile number'
                          }
                        })}
                        onInput={(e) => {
                          // Only allow numbers
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                          // Limit to 10 digits
                          if (e.target.value.length > 10) {
                            e.target.value = e.target.value.slice(0, 10);
                          }
                        }}
                        maxLength="10"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                      <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number (e.g., 9876543210)</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        placeholder="Enter Village, Post for Rural for Urban use Street Address"
                        className={`form-input ${errors.street ? 'border-red-500' : ''}`}
                        {...register('street', { required: 'Street address is required' })}
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="Near hospital, school, etc."
                        className={`form-input ${errors.landmark ? 'border-red-500' : ''}`}
                        {...register('landmark', { required: 'Landmark is required'})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Landmark helps delivery person locate your address easily</p>
                    </div>

                    <div>
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        placeholder="Enter City Name"
                        className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                        {...register('city', { required: 'City is required' })}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        placeholder="Enter State Name"
                        className={`form-input ${errors.state ? 'border-red-500' : ''}`}
                        {...register('state', { required: 'State is required' })}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">ZIP Code *</label>
                      <input
                        type="text"
                        placeholder="6-digit PIN code"
                        className={`form-input ${errors.zipCode ? 'border-red-500' : ''}`}
                        {...register('zipCode', { 
                          required: 'ZIP code is required',
                          pattern: {
                            value: /^[1-9][0-9]{5}$/,
                            message: 'Please enter a valid 6-digit PIN code'
                          }
                        })}
                        onInput={(e) => {
                          // Only allow numbers
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                          // Limit to 6 digits
                          if (e.target.value.length > 6) {
                            e.target.value = e.target.value.slice(0, 6);
                          }
                        }}
                        maxLength="6"
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
                      <p className="text-xs text-gray-500 mt-1">Enter 6-digit PIN code (e.g., 110001)</p>
                    </div>

                    <div>
                      <label className="form-label">Country *</label>
                      <select
                        className={`form-input ${errors.country ? 'border-red-500' : ''}`}
                        {...register('country', { required: 'Country is required' })}
                      >
                        <option value="India">India</option>
                      </select>
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <CreditCardIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-primary-200 bg-primary-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium">Online Payment</span>
                          <div className="ml-2 flex space-x-1">
                            <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Cards" className="h-6" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">Pay securely with cards, UPI, net banking & more</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Cash on delivery is not available. Please use online payment for a secure transaction.
                    </p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Secure Checkout</h3>
                      <p className="text-sm text-blue-700">Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.book._id} className="flex items-center space-x-3">
                        <img
                          src={getBookImageUrl(item.book)}
                          alt={item.book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{item.book.title}</h3>
                          <p className="text-sm text-gray-500">by {item.book.author}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.book.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Place Order - {formatPrice(finalTotal)}
                      </div>
                    )}
                  </button>

                  {discountedSubtotal < 2000 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Add {formatPrice(2000 - discountedSubtotal)} more for free shipping!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          navigate('/');
        }}
        order={confirmedOrder}
      />
    </div>
  );
};

export default CheckoutPage;