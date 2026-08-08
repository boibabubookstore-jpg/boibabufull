import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { formatPrice } from '../../utils/currency';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const SellerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page,
        limit: 10,
        ...(filters.status !== 'all' && { status: filters.status })
      });
      
      const response = await api.get(`/api/seller/payments?${params}`);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your earnings and payment status from delivered orders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="form-select"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <BanknotesIcon className="h-4 w-4 mr-1" />
            {pagination.total || 0} payments found
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  {/* Payment Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.paymentStatus)}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{payment.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          <CalendarIcon className="inline h-4 w-4 mr-1" />
                          Ordered: {new Date(payment.orderDate).toLocaleDateString('en-IN')}
                          {payment.deliveredAt && (
                            <span className="ml-3">
                              Delivered: {new Date(payment.deliveredAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(payment.paymentStatus)}>
                      {payment.paymentStatus}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {payment.customer?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({payment.customer?.email})
                      </span>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items Total:</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(payment.itemsTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Admin Commission (2.5%):</span>
                        <span className="font-medium text-red-600">
                          -{formatPrice(payment.adminCommission)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping Charges:</span>
                        <span className="font-medium text-orange-600">
                          -{formatPrice(payment.shippingCharges)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Net Amount</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatPrice(payment.netAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Details */}
                  {payment.paidAt && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
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
          ) : (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status !== 'all' 
                  ? `No payments with status "${filters.status}" found.`
                  : 'Payment history from delivered orders will appear here.'
                }
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
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPayments;