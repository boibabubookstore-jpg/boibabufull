import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/currency';

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'sellers'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionNotes, setSuspensionNotes] = useState('');
  const [userAnalytics, setUserAnalytics] = useState(null);

  const queryClient = useQueryClient();

  // Determine role filter based on active tab
  const roleFilter = activeTab === 'users' ? 'user' : 'seller';

  // Reset page when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setStatusFilter('');
    // Force refresh when switching tabs
    queryClient.invalidateQueries(['adminUsers']);
  };

  // Force refresh when roleFilter changes
  useEffect(() => {
    queryClient.invalidateQueries(['adminUsers']);
  }, [roleFilter, queryClient]);

  // Fetch users with filters
  const { data: usersData, isLoading, error, refetch } = useQuery(
    ['adminUsers', activeTab, currentPage, searchTerm, roleFilter, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });
      const response = await api.get(`/api/admin/users?${params}`);
      return response.data;
    },
    { 
      keepPreviousData: true,
      staleTime: 0,
      cacheTime: 0
    }
  );

  // Suspend user mutation
  const suspendUserMutation = useMutation(
    ({ userId, reason, notes }) => 
      api.post(`/api/admin/users/${userId}/suspend`, { reason, notes }),
    {
      onSuccess: () => {
        toast.success('User suspended successfully');
        setShowSuspendModal(false);
        setSuspensionReason('');
        setSuspensionNotes('');
        queryClient.invalidateQueries(['adminUsers']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to suspend user');
      }
    }
  );

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation(
    (userId) => api.post(`/api/admin/users/${userId}/unsuspend`),
    {
      onSuccess: () => {
        toast.success('User unsuspended successfully');
        queryClient.invalidateQueries(['adminUsers']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to unsuspend user');
      }
    }
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSuspendUser = (user) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const handleUnsuspendUser = (user) => {
    if (window.confirm(`Are you sure you want to unsuspend ${user.name}? They will receive an email notification with a warning about following our terms of service.`)) {
      unsuspendUserMutation.mutate(user._id);
    }
  };

  const handleViewAnalytics = async (user) => {
    try {
      const response = await api.get(`/api/admin/users/${user._id}/analytics`);
      setUserAnalytics(response.data);
      setSelectedUser(user);
      setShowAnalyticsModal(true);
    } catch (error) {
      toast.error('Failed to load user analytics');
    }
  };

  const handleSuspendSubmit = (e) => {
    e.preventDefault();
    if (!suspensionReason.trim()) {
      toast.error('Suspension reason is required');
      return;
    }
    suspendUserMutation.mutate({
      userId: selectedUser._id,
      reason: suspensionReason,
      notes: suspensionNotes
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading users</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage users and sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Users
              </div>
            </button>
            <button
              onClick={() => handleTabChange('sellers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sellers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                Sellers
              </div>
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <div className="flex items-center text-sm text-gray-500">
              <FunnelIcon className="h-4 w-4 mr-1" />
              {usersData?.users?.length || 0} {activeTab} found
              <button
                onClick={() => refetch()}
                className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users/Sellers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'users' ? 'User' : 'Seller'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!usersData?.users || usersData.users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <UserIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No {activeTab} found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usersData.users.filter(user => {
                  // Filter based on active tab and exclude admins
                  if (user.role === 'admin') return false;
                  if (activeTab === 'users') {
                    return user.role === 'user';
                  } else if (activeTab === 'sellers') {
                    return user.role === 'seller';
                  }
                  return true;
                }).map((user) => {
                  const isSuspended = user.isSuspended === true;
                  
                  return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {activeTab === 'users' ? (
                              <UserIcon className="h-6 w-6 text-gray-600" />
                            ) : (
                              <BuildingStorefrontIcon className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isSuspended ? 'Suspended' : 'Active'}
                      </span>
                      {isSuspended && user.suspendedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(user.suspendedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleViewAnalytics(user)}
                          className="text-green-600 hover:text-green-900"
                          title="View Analytics"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </button>
                        
                        {isSuspended ? (
                          <button
                            onClick={() => handleUnsuspendUser(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Unsuspend User"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendUser(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Suspend User"
                          >
                            <NoSymbolIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.pagination?.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(usersData.pagination.pages, currentPage + 1))}
                disabled={currentPage === usersData.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page {currentPage} of {usersData.pagination.pages}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: usersData.pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedUser.role === 'seller' ? 'Seller' : 'User'} Details
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-sm text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900 capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-sm text-gray-900">
                  {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                </p>
              </div>
              {selectedUser.isSuspended && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Suspended At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedUser.suspendedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reason</label>
                    <p className="text-sm text-gray-900">{selectedUser.suspensionReason}</p>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Joined</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Suspend {selectedUser.role === 'seller' ? 'Seller' : 'User'}
              </h3>
              <button
                onClick={() => setShowSuspendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User: {selectedUser.name}
                </label>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Suspension *
                </label>
                <select
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Violation of Terms of Service">Violation of Terms of Service</option>
                  <option value="Fraudulent Activity">Fraudulent Activity</option>
                  <option value="Spam or Abuse">Spam or Abuse</option>
                  <option value="Multiple Complaints">Multiple Complaints</option>
                  <option value="Security Concerns">Security Concerns</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={suspensionNotes}
                  onChange={(e) => setSuspensionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details about the suspension..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={suspendUserMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {suspendUserMutation.isLoading ? 'Suspending...' : 'Suspend User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && userAnalytics && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'users' ? 'User' : 'Seller'} Analytics - {userAnalytics.user.name}
              </h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userAnalytics.analytics.totalOrders}
                </div>
                <div className="text-sm text-blue-600">Total Orders</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(userAnalytics.analytics.totalSpent)}
                </div>
                <div className="text-sm text-green-600">Total Spent</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {userAnalytics.analytics.cancellationRate}%
                </div>
                <div className="text-sm text-yellow-600">Cancellation Rate</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {userAnalytics.analytics.deliveredOrders}
                </div>
                <div className="text-sm text-purple-600">Delivered Orders</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Recent Orders</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Order
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userAnalytics.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;