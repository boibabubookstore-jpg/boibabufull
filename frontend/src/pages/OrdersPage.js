import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import {
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/currency';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch user orders
  const { data: ordersData, isLoading, error } = useQuery(
    ['userOrders', currentPage, searchTerm, statusFilter],
    () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });
      return api.get(`/api/orders/my-orders?${params}`).then(res => res.data);
    },
    { keepPreviousData: true }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-purple-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-indigo-500" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'confirmed':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'processing':
        return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'shipped':
        return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'returned':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 40;
      case 'processing':
        return 60;
      case 'shipped':
        return 80;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      case 'returned':
        return 100;
      default:
        return 0;
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <div className="text-red-600 text-center py-20">Error loading orders</div>;

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 form-input"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Return & Refund</option>
              </select>

              {/* Results Count */}
              <div className="flex items-center text-sm text-gray-600">
                {pagination.total || 0} orders found
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
              <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
              <Link
                to="/books"
                className="btn-primary inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          <span className="ml-2 capitalize">{order.orderStatus}</span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.total || 0)}
                          </p>
                          {order.refundAmount > 0 && (
                            <p className="text-sm text-red-600">
                              Refunded: {formatPrice(order.refundAmount)}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn-outline text-sm"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div className="p-6 bg-gray-50">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Order Progress</span>
                        <span>{getProgressPercentage(order.orderStatus)}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            order.orderStatus === 'cancelled' ? 'bg-red-500' : 'bg-primary-600'
                          }`}
                          style={{ width: `${getProgressPercentage(order.orderStatus)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <TruckIcon className="h-4 w-4 mr-2" />
                        <span>Tracking Number: <strong>{order.trackingNumber}</strong></span>
                      </div>
                    )}

                    {order.estimatedDelivery && (
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>
                          Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={item.book?.images?.[0] ? 
                              (item.book.images[0].startsWith('http') ? 
                                item.book.images[0] : 
                                `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${item.book.images[0]}`
                              ) : 
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                            }
                            alt={item.book?.title}
                            className="w-12 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.book?.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity} × {formatPrice(item.price || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded ${
                      page === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;