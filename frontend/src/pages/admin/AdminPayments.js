import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/currency';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingCharges, setShippingCharges] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState('2.5');
  const [selectedSellerPayment, setSelectedSellerPayment] = useState(null);

  const queryClient = useQueryClient();

  // Fetch orders with seller payments
  const { data: ordersData, isLoading, error } = useQuery(
    ['adminPayments', currentPage, searchTerm, statusFilter],
    () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...(statusFilter && { status: statusFilter })
      });
      return api.get(`/api/admin/orders?${params}`).then(res => res.data);
    },
    { keepPreviousData: true }
  );

  // Update shipping charges mutation
  const updateShippingMutation = useMutation(
    ({ orderId, shippingCost }) => {
      return api.patch(`/api/admin/orders/${orderId}/shipping`, {
        shippingCost: parseFloat(shippingCost)
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminPayments']);
        toast.success('Shipping charges updated successfully');
        setShowShippingModal(false);
        setSelectedPayment(null);
        setShippingCharges('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update shipping charges');
      }
    }
  );

  // Update commission rate mutation (for individual seller payments)
  const updateSellerCommissionMutation = useMutation(
    ({ orderId, sellerId, commissionRate }) => {
      return api.patch(`/api/admin/orders/${orderId}/seller-payment/${sellerId}/commission`, {
        commissionRate: parseFloat(commissionRate)
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminPayments']);
        toast.success('Commission rate updated successfully');
        setShowCommissionModal(false);
        setSelectedSellerPayment(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update commission rate');
      }
    }
  );

  // Update commission rate mutation (global setting)
  const updateCommissionMutation = useMutation(
    ({ rate }) => {
      return api.patch(`/api/admin/settings/commission`, {
        commissionRate: parseFloat(rate)
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminPayments']);
        toast.success('Commission rate updated successfully');
        setShowCommissionModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update commission rate');
      }
    }
  );
  const updatePaymentMutation = useMutation(
    ({ orderId, sellerId, paymentStatus, notes }) => {
      return api.patch(`/api/admin/orders/${orderId}/seller-payment/${sellerId}`, {
        paymentStatus,
        notes
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminPayments']);
        toast.success('Payment status updated successfully');
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setPaymentNotes('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update payment status');
      }
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'due':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'due':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleUpdateShipping = (order) => {
    setSelectedPayment(order);
    setShippingCharges(order.shippingCost?.toString() || '0');
    setShowShippingModal(true);
  };

  const handleMarkAsPaid = (order, payment) => {
    setSelectedPayment({ ...order, selectedSellerPayment: payment });
    setShowPaymentModal(true);
  };

  const submitShippingUpdate = () => {
    if (selectedPayment && shippingCharges !== '') {
      updateShippingMutation.mutate({
        orderId: selectedPayment._id,
        shippingCost: shippingCharges
      });
    }
  };

  const submitPaymentUpdate = () => {
    if (selectedPayment && selectedPayment.selectedSellerPayment) {
      updatePaymentMutation.mutate({
        orderId: selectedPayment._id,
        sellerId: selectedPayment.selectedSellerPayment.seller._id,
        paymentStatus: 'paid',
        notes: paymentNotes
      });
    }
  };

  const handleEditCommission = (order, payment) => {
    setSelectedSellerPayment({ order, payment });
    setCommissionRate(payment.commissionRate?.toString() || '2.5');
    setShowCommissionModal(true);
  };

  const submitCommissionUpdate = () => {
    if (selectedSellerPayment) {
      updateSellerCommissionMutation.mutate({
        orderId: selectedSellerPayment.order._id,
        sellerId: selectedSellerPayment.payment.seller._id,
        commissionRate: commissionRate
      });
    } else if (commissionRate && parseFloat(commissionRate) >= 0 && parseFloat(commissionRate) <= 100) {
      updateCommissionMutation.mutate({
        rate: commissionRate
      });
    } else {
      toast.error('Please enter a valid commission rate between 0 and 100');
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <div className="text-red-600">Error loading payments</div>;

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || {};

  // Filter orders that have seller payments
  const ordersWithPayments = orders.filter(order => 
    order.sellerPayments && order.sellerPayments.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Manage seller payments and shipping charges</p>
        </div>
        <button
          onClick={() => setShowCommissionModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Commission Rate
        </button>
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
            <option value="">All Orders</option>
            <option value="delivered">Delivered Orders</option>
            <option value="shipped">Shipped Orders</option>
          </select>

          {/* Payment Status Filter */}
          <select
            className="form-input"
          >
            <option value="">All Payment Status</option>
            <option value="due">Due Payments</option>
            <option value="paid">Paid Payments</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <FunnelIcon className="h-4 w-4 mr-1" />
            {ordersWithPayments.length} orders with payments
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          {ordersWithPayments.length > 0 ? (
            <div className="space-y-6">
              {ordersWithPayments.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          <CalendarIcon className="inline h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          {order.deliveredAt && (
                            <span className="ml-3">
                              Delivered: {new Date(order.deliveredAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{order.user?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateShipping(order)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Update Shipping
                      </button>
                      <span className="text-sm text-gray-600">
                        Shipping: {formatPrice(order.shippingCost || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Seller Payments */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Seller Payments</h4>
                    {order.sellerPayments.map((payment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(payment.paymentStatus)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.seller?.name || 'Unknown Seller'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.seller?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={getStatusBadge(payment.paymentStatus)}>
                              {payment.paymentStatus}
                            </span>
                            <button
                              onClick={() => handleEditCommission(order, payment)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              Edit Commission
                            </button>
                            {payment.paymentStatus === 'due' && (
                              <button
                                onClick={() => handleMarkAsPaid(order, payment)}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Items Total:</span>
                            <p className="font-medium text-gray-900">
                              {formatPrice(payment.itemsTotal)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Commission ({payment.commissionRate || 2.5}%):</span>
                            <p className="font-medium text-red-600">
                              -{formatPrice(payment.adminCommission)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Shipping:</span>
                            <p className="font-medium text-orange-600">
                              -{formatPrice(payment.shippingCharges)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Net Amount:</span>
                            <p className="font-bold text-blue-900">
                              {formatPrice(payment.netAmount)}
                            </p>
                          </div>
                        </div>

                        {payment.paidAt && (
                          <div className="mt-3 p-2 bg-green-50 rounded">
                            <p className="text-sm text-green-700">
                              <CheckCircleIcon className="inline h-4 w-4 mr-1" />
                              Paid on {new Date(payment.paidAt).toLocaleDateString('en-IN')}
                              {payment.notes && (
                                <span className="block mt-1 text-xs">
                                  Note: {payment.notes}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Orders with seller payments will appear here when delivered.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {pagination.current} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Update Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Shipping Charges
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingCharges}
                  onChange={(e) => setShippingCharges(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter shipping cost"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowShippingModal(false);
                    setSelectedPayment(null);
                    setShippingCharges('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitShippingUpdate}
                  disabled={updateShippingMutation.isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {updateShippingMutation.isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Mark Payment as Paid
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Seller: {selectedPayment?.selectedSellerPayment?.seller?.name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Amount: {formatPrice(selectedPayment?.selectedSellerPayment?.netAmount || 0)}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Add any notes about the payment..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                    setPaymentNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPaymentUpdate}
                  disabled={updatePaymentMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {updatePaymentMutation.isLoading ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Rate Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedSellerPayment ? 'Edit Commission Rate' : 'Update Global Commission Rate'}
              </h3>
              {selectedSellerPayment && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Order:</strong> {selectedSellerPayment.order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Seller:</strong> {selectedSellerPayment.payment.seller?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Items Total:</strong> {formatPrice(selectedSellerPayment.payment.itemsTotal)}
                  </p>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter commission rate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSellerPayment 
                    ? 'This will update the commission rate for this specific seller payment'
                    : 'Current global rate: 2.5% (This will apply to all future orders)'
                  }
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCommissionModal(false);
                    setSelectedSellerPayment(null);
                    setCommissionRate('2.5');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCommissionUpdate}
                  disabled={selectedSellerPayment ? updateSellerCommissionMutation.isLoading : updateCommissionMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {(selectedSellerPayment ? updateSellerCommissionMutation.isLoading : updateCommissionMutation.isLoading) ? 'Updating...' : 'Update Rate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;