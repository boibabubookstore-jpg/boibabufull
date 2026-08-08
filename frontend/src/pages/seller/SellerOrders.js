import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/currency';
import { getPlaceholderImage } from '../../utils/imageUtils';
import {
  ShoppingBagIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/seller/orders', {
        params: filters
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'returned':
        return <CheckCircleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
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
      case 'returned':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const calculateSellerTotal = (order) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track orders containing your books and manage fulfillment
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Return & Refund</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
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

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Customer</h4>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                      {order.user?.phone && (
                        <p className="text-sm text-gray-600">{order.user.phone}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress?.street}</p>
                        {order.shippingAddress?.landmark && (
                          <p>Near {order.shippingAddress.landmark}</p>
                        )}
                        <p>
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items (Only seller's books) */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Books in this Order</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            {item.book?.images && item.book.images.length > 0 ? (
                              <img
                                src={item.book.images[0].startsWith('http') ? item.book.images[0] : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${item.book.images[0]}`}
                                alt={item.book.title}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = getPlaceholderImage();
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.book?.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                by {item.book?.author}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              Total: {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="pt-4 border-t border-gray-200">
                    {/* Payment Information */}
                    {order.sellerPayment && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Payment Details</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Items Total:</span>
                            <span className="font-medium text-blue-900 ml-2">
                              {formatPrice(order.sellerPayment.itemsTotal)}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">Admin Commission (2.5%):</span>
                            <span className="font-medium text-red-600 ml-2">
                              -{formatPrice(order.sellerPayment.adminCommission)}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">Shipping Charges:</span>
                            <span className="font-medium text-orange-600 ml-2">
                              -{formatPrice(order.sellerPayment.shippingCharges)}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">Payment Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              order.sellerPayment.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : order.sellerPayment.paymentStatus === 'due'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.sellerPayment.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Net Amount:</span>
                            <span className="text-lg font-bold text-blue-900">
                              {formatPrice(order.sellerPayment.netAmount)}
                            </span>
                          </div>
                          {order.sellerPayment.paidAt && (
                            <p className="text-xs text-blue-600 mt-1">
                              Paid on {new Date(order.sellerPayment.paidAt).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/seller/orders/${order._id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Gross earnings from this order</p>
                        <p className="text-lg font-bold text-primary-600">
                          {formatPrice(calculateSellerTotal(order))}
                        </p>
                        {order.refundAmount > 0 && (
                          <p className="text-sm text-red-600">
                            Order Refunded: {formatPrice(order.refundAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status !== 'all' 
                  ? `No orders with status "${filters.status}" found.`
                  : 'Orders containing your books will appear here.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;