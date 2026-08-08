import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  XMarkIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/currency';

const OrderConfirmationModal = ({ isOpen, onClose, order }) => {
  console.log('OrderConfirmationModal render:', { isOpen, hasOrder: !!order, orderNumber: order?.orderNumber });
  
  // Auto-close after 30 seconds instead of immediate close
  React.useEffect(() => {
    if (isOpen && order) {
      const timer = setTimeout(() => {
        console.log('Auto-closing modal after 30 seconds');
        // Don't auto-close, let user close manually
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, order]);
  
  if (!isOpen || !order) {
    console.log('Modal not showing because:', { isOpen, hasOrder: !!order });
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto transform transition-all z-[10000]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-[10001]"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>

            {/* Order Details */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order Confirmed!
              </h2>
              
              {/* Order Number */}
              <p className="text-gray-600 mb-2">
                Your order <span className="font-semibold text-primary-600">#{order.orderNumber}</span> has been placed successfully.
              </p>
              
              {/* Order Date & Time */}
              <p className="text-sm text-gray-500 mb-4">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              
              {/* Tracking Information */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Order Status: Confirmed</p>
                <p className="text-xs text-blue-600">
                  You will receive tracking information via email once your order is shipped.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm text-gray-900">{formatPrice(order.subtotal + (order.couponDiscount || 0))}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span className="text-sm">Coupon Discount ({order.appliedCoupon?.code}):</span>
                  <span className="text-sm">-{formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Shipping:</span>
                <span className="text-sm text-gray-900">{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="text-sm text-gray-600">Order Total:</span>
                <span className="font-bold text-lg text-gray-900">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="text-sm text-gray-900">{order.items?.length} book{order.items?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm text-gray-900 capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Estimated Delivery</span>
              </div>
              <div className="flex items-center justify-center mb-2">
                <ClockIcon className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-700 font-medium">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-xs text-blue-600 text-center">
                Standard delivery (5-7 business days)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to={`/orders/${order._id}`}
                onClick={onClose}
                className="w-full btn-primary text-center block"
              >
                Track Your Order
              </Link>
              <button
                onClick={onClose}
                className="w-full btn-outline"
              >
                Continue Shopping
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-500 mt-4">
              You will receive an email confirmation shortly with your order details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;