import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  UserIcon,
  EyeIcon,
  ChartBarIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  TruckIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/currency';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm();

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await api.get('/api/admin/sellers');
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch seller analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ['sellerAnalytics', selectedSeller?._id],
    () => api.get(`/api/admin/sellers/${selectedSeller._id}/analytics`).then(res => res.data),
    {
      enabled: !!selectedSeller && showAnalytics,
      onError: (error) => {
        toast.error('Failed to load seller analytics');
        console.error('Analytics error:', error);
      }
    }
  );

  const handleViewAnalytics = (seller) => {
    setSelectedSeller(seller);
    setShowAnalytics(true);
  };

  const handleCreateSeller = async (data) => {
    setCreating(true);
    try {
      const response = await api.post('/api/admin/sellers', data);
      toast.success('Seller account created successfully');
      setSellers([response.data.seller, ...sellers]);
      setShowCreateForm(false);
      reset();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create seller';
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          setError(err.path, { message: err.msg });
        });
      } else {
        toast.error(message);
      }
    } finally {
      setCreating(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage seller accounts
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Seller
        </button>
      </div>

      {/* Create Seller Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateForm(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(handleCreateSeller)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                      <UserIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Create Seller Account
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                              errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            {...register('name', {
                              required: 'Name is required',
                              minLength: { value: 2, message: 'Name must be at least 2 characters' }
                            })}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Invalid email address'
                              }
                            })}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                              errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            {...register('password', {
                              required: 'Password is required',
                              minLength: { value: 6, message: 'Password must be at least 6 characters' }
                            })}
                          />
                          {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Seller'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sellers List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sellers ({sellers.length})
          </h3>
          
          {sellers.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {seller.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Seller
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {seller.createdBy?.name || 'Admin'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewAnalytics(seller)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Analytics"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sellers</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new seller account.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Analytics Modal */}
      {showAnalytics && selectedSeller && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAnalytics(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Seller Analytics - {selectedSeller.name}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedSeller.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {analyticsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="spinner"></div>
                    <span className="ml-2 text-gray-600">Loading analytics...</span>
                  </div>
                ) : analyticsData ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600">Total Orders</p>
                            <p className="text-2xl font-bold text-blue-900">{analyticsData.analytics.totalOrders}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TruckIcon className="h-8 w-8 text-green-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-600">Delivery Rate</p>
                            <p className="text-2xl font-bold text-green-900">{analyticsData.analytics.deliveryRate}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <XCircleIcon className="h-8 w-8 text-red-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-600">Cancellation Rate</p>
                            <p className="text-2xl font-bold text-red-900">{analyticsData.analytics.cancellationRate}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <BanknotesIcon className="h-8 w-8 text-yellow-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-600">Total Earnings</p>
                            <p className="text-2xl font-bold text-yellow-900">{formatPrice(analyticsData.analytics.totalEarnings)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Order Status Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{analyticsData.analytics.deliveredOrders}</p>
                          <p className="text-sm text-gray-600">Delivered</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.analytics.pendingOrders}</p>
                          <p className="text-sm text-gray-600">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{analyticsData.analytics.cancelledOrders}</p>
                          <p className="text-sm text-gray-600">Cancelled</p>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Earnings Chart */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Monthly Earnings (Last 6 Months)</h4>
                      <div className="space-y-2">
                        {analyticsData.analytics.monthlyEarnings.map((month, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">{month.month}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">{month.orders} orders</span>
                              <span className="text-sm font-bold text-green-600">{formatPrice(month.earnings)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analyticsData.analytics.recentOrders.map((order) => (
                              <tr key={order._id}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">#{order.orderNumber}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{order.customer}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">{order.itemCount}</td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Failed to load analytics data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;