import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/currency';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const queryClient = useQueryClient();

  // Fetch orders with filters
  const { data: ordersData, isLoading, error } = useQuery(
    ['adminOrders', currentPage, searchTerm, statusFilter, sortBy, sortOrder],
    () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder
      });
      return api.get(`/api/admin/orders?${params}`).then(res => res.data);
    },
    { keepPreviousData: true }
  );

  // Process refund mutation
  const processRefundMutation = useMutation(
    ({ orderId, refundAmount, reason }) => {
      return api.post(`/api/admin/orders/${orderId}/refund`, {
        refundAmount: parseFloat(refundAmount),
        reason
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminOrders']);
        toast.success('Refund processed successfully');
        setShowRefundModal(false);
        setSelectedOrder(null);
        setRefundAmount('');
        setRefundReason('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to process refund');
      }
    }
  );

  const updateOrderMutation = useMutation(
    ({ orderId, orderStatus, trackingNumber, notes }) => {
      return api.patch(`/api/admin/orders/${orderId}/status`, {
        orderStatus,
        trackingNumber,
        notes
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminOrders']);
        toast.success('Order status updated successfully');
        setShowStatusModal(false);
        setSelectedOrder(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order status');
      }
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'processing':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      case 'returned':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'returned':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setShowStatusModal(true);
  };

  const handleViewOrder = async (order) => {
    try {
      // Fetch complete order details
      const response = await api.get(`/api/admin/orders/${order._id}`);
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      // Fallback to using the order from the list
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const handleRefund = (order) => {
    setSelectedOrder(order);
    setRefundAmount('');
    setRefundReason('');
    setShowRefundModal(true);
  };

  const submitRefund = () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }
    
    if (parseFloat(refundAmount) > (selectedOrder.total - (selectedOrder.refundAmount || 0))) {
      toast.error('Refund amount cannot exceed remaining order total');
      return;
    }

    processRefundMutation.mutate({
      orderId: selectedOrder._id,
      refundAmount,
      reason: refundReason
    });
  };

  const submitStatusUpdate = () => {
    if (selectedOrder && newStatus) {
      updateOrderMutation.mutate({
        orderId: selectedOrder._id,
        orderStatus: newStatus,
        trackingNumber: trackingNumber
      });
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <div className="text-red-600">Error loading orders</div>;

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || {};

  return (
    <div className="space-y-6 min-h-screen overflow-auto">{/* Added overflow-auto for scrolling */}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and track deliveries</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Return & Refund</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="form-input"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="total-desc">Highest Value</option>
            <option value="total-asc">Lowest Value</option>
            <option value="orderNumber-asc">Order Number A-Z</option>
            <option value="orderNumber-desc">Order Number Z-A</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <FunnelIcon className="h-4 w-4 mr-1" />
            {pagination.total || 0} orders found
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sellers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500">
                          Tracking: {order.trackingNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Array.from(new Set(
                        order.items?.map(item => item.book?.seller?.name).filter(Boolean)
                      )).join(', ') || 'Admin'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Array.from(new Set(
                        order.items?.map(item => item.book?.seller?.email).filter(Boolean)
                      )).slice(0, 2).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items?.slice(0, 2).map(item => item.book?.title).join(', ')}
                      {order.items?.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(order.total || 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.paymentMethod}
                    </div>
                    <div className="text-xs text-blue-600">
                      Status: {order.paymentStatus || 'pending'}
                    </div>
                    {order.refundAmount > 0 && (
                      <div className="text-xs text-red-600">
                        Refunded: {formatPrice(order.refundAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="ml-1 capitalize">{order.orderStatus}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Order"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Update Status"
                      >
                        <TruckIcon className="h-4 w-4" />
                      </button>
                      {/* Show refund button for orders that can be refunded */}
                      {(order.orderStatus !== 'cancelled' && 
                        order.paymentStatus !== 'refunded' &&
                        (order.refundAmount || 0) < order.total) && (
                        <button
                          onClick={() => handleRefund(order)}
                          className="text-green-600 hover:text-green-900"
                          title="Process Refund"
                        >
                          <CurrencyDollarIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No orders found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details - #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedOrder.shippingAddress?.name}</p>
                  <p><strong>Street:</strong> {selectedOrder.shippingAddress?.street}</p>
                  {selectedOrder.shippingAddress?.landmark && (
                    <p><strong>Landmark:</strong> {selectedOrder.shippingAddress.landmark}</p>
                  )}
                  <p><strong>City:</strong> {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p><strong>ZIP:</strong> {selectedOrder.shippingAddress?.zipCode}</p>
                  <p><strong>Country:</strong> {selectedOrder.shippingAddress?.country}</p>
                  {selectedOrder.shippingAddress?.phone && (
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <img
                              src={item.book?.images?.[0] ? 
                                (item.book.images[0].startsWith('http') ? 
                                  item.book.images[0] : 
                                  `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${item.book.images[0]}`
                                ) : 
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                              }
                              alt={item.book?.title}
                              className="h-12 w-8 object-cover rounded mr-3"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc>';
                              }}
                            />
                            <div>
                              <p className="font-medium">{item.book?.title}</p>
                              <p className="text-sm text-gray-500">by {item.book?.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">{formatPrice(item.price)}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 flex justify-end">
              <div className="w-64">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                  </div>
                  {selectedOrder.couponDiscount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Coupon Discount:</span>
                      <span>-{formatPrice(selectedOrder.couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>{formatPrice(selectedOrder.shippingCost || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>{formatPrice(selectedOrder.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.total || 0)}</span>
                  </div>
                  {selectedOrder.refundAmount > 0 && (
                    <div className="flex justify-between text-red-600 border-t pt-2">
                      <span>Refunded:</span>
                      <span>-{formatPrice(selectedOrder.refundAmount)}</span>
                    </div>
                  )}
                  {selectedOrder.appliedCoupon && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Coupon: {selectedOrder.appliedCoupon.code}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Order Status
              </h3>
              
              <div className="mb-4">
                <label className="form-label">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Return & Refund</option>
                </select>
              </div>

              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <div className="mb-4">
                  <label className="form-label">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="form-input"
                    placeholder="Enter tracking number"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={submitStatusUpdate}
                  disabled={updateOrderMutation.isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {updateOrderMutation.isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Process Refund - #{selectedOrder.orderNumber}
              </h3>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Order Total: {formatPrice(selectedOrder.total)}
                </div>
                {selectedOrder.refundAmount > 0 && (
                  <div className="text-sm text-red-600 mb-2">
                    Already Refunded: {formatPrice(selectedOrder.refundAmount)}
                  </div>
                )}
                <div className="text-sm text-gray-600 mb-4">
                  Available for Refund: {formatPrice(selectedOrder.total - (selectedOrder.refundAmount || 0))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Refund Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedOrder.total - (selectedOrder.refundAmount || 0)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="form-input"
                  placeholder="Enter refund amount"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Refund Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Enter reason for refund (optional)"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRefund}
                  disabled={processRefundMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processRefundMutation.isLoading ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;