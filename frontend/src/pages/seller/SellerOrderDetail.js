import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/currency';
import { getPlaceholderImage } from '../../utils/imageUtils';
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const SellerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await api.get(`/api/seller/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-3 py-1 text-sm font-semibold rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'shipped':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const calculateSellerTotal = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The order you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Link
            to="/seller/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/seller/orders"
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={getStatusBadge(order.status)}>
            {order.status}
          </span>
          {getStatusIcon(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Books in this Order</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {item.book?.images && item.book.images.length > 0 ? (
                      <img
                        src={item.book.images[0].startsWith('http') ? item.book.images[0] : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${item.book.images[0]}`}
                        alt={item.book.title}
                        className="w-16 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.book?.title}
                      </h3>
                      <p className="text-sm text-gray-600">by {item.book?.author}</p>
                      <p className="text-sm text-gray-500">Category: {typeof item.book?.category === 'object' ? item.book.category.name : item.book?.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary-600">
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {order.statusHistory.map((event, eventIdx) => (
                      <li key={eventIdx}>
                        <div className="relative pb-8">
                          {eventIdx !== order.statusHistory.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                                {getStatusIcon(event.status)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Order status changed to{' '}
                                  <span className="font-medium text-gray-900 capitalize">
                                    {event.status}
                                  </span>
                                </p>
                                {event.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                                )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={event.timestamp}>
                                  {new Date(event.timestamp).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                <p className="text-sm text-gray-600">{order.user?.email}</p>
                {order.user?.phone && (
                  <p className="text-sm text-gray-600">{order.user.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.shippingAddress?.street}</p>
                {order.shippingAddress?.landmark && (
                  <p>Near {order.shippingAddress.landmark}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p>{order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Earnings</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Total</span>
                <span className="font-medium">{formatPrice(calculateSellerTotal())}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total Earnings</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(calculateSellerTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayOrderId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-medium text-xs">{order.razorpayOrderId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetail;