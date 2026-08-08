import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const AdminComplaints = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'seller'
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    userType: 'user' // Default to user complaints
  });

  // Update filters when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({
      ...filters,
      userType: tab
    });
  };

  const queryClient = useQueryClient();

  // Fetch complaints
  const { data: complaintsData, isLoading } = useQuery(
    ['admin-complaints', filters],
    () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/complaints/admin/all?${params}`).then(res => res.data);
    }
  );

  // Fetch complaint stats
  const { data: stats } = useQuery(
    'complaint-stats',
    () => api.get('/api/complaints/admin/stats/overview').then(res => res.data)
  );

  // Update complaint status mutation
  const updateComplaintMutation = useMutation(
    ({ id, status, response }) => 
      api.put(`/api/complaints/admin/${id}/status`, { status, response }),
    {
      onSuccess: (data, variables) => {
        const statusMessage = variables.status === 'Resolved' 
          ? 'Complaint resolved successfully! Email notification sent to user.'
          : 'Complaint updated successfully!';
        toast.success(statusMessage);
        setShowResponseModal(false);
        setResponse('');
        setNewStatus('');
        setSelectedComplaint(null);
        queryClient.invalidateQueries('admin-complaints');
        queryClient.invalidateQueries('complaint-stats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update complaint');
      }
    }
  );

  const handleUpdateComplaint = () => {
    if (!selectedComplaint || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    updateComplaintMutation.mutate({
      id: selectedComplaint._id,
      status: newStatus,
      response: response.trim() || undefined
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
            <p className="text-gray-600">Manage and respond to user complaints</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">User Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.userComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Seller Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sellerComplaints}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange('user')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Complaints ({stats?.userComplaints || 0})
            </button>
            <button
              onClick={() => handleTabChange('seller')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seller'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Seller Complaints ({stats?.sellerComplaints || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Filters - {activeTab === 'user' ? 'User' : 'Seller'} Complaints
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="form-label">Priority</label>
            <select
              className="form-input"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {activeTab === 'user' ? (
                <>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Book Quality">Book Quality</option>
                  <option value="Delivery Issue">Delivery Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Commission Issue">Commission Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Platform Issue">Platform Issue</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Book Management">Book Management</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === 'user' ? 'User' : 'Seller'} Complaints
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="spinner mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading complaints...</p>
          </div>
        ) : complaintsData?.complaints?.length === 0 ? (
          <div className="p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaintsData?.complaints?.map((complaint) => (
              <div key={complaint._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{complaint.subject}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>User:</strong> {complaint.user.name} ({complaint.user.email}) 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          complaint.userType === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {complaint.userType === 'seller' ? 'Seller' : 'Customer'}
                        </span>
                      </p>
                      <p><strong>Category:</strong> {complaint.category}</p>
                      {complaint.orderId && (
                        <p><strong>Order:</strong> #{complaint.orderId.orderNumber}</p>
                      )}
                      {complaint.bookId && (
                        <p><strong>Book:</strong> {complaint.bookId.title}</p>
                      )}
                      <p><strong>Submitted:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>

                    <p className="text-gray-700 mt-3 line-clamp-2">{complaint.description}</p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setNewStatus(complaint.status);
                        setResponse(complaint.adminResponse || '');
                        setShowResponseModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Respond"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Respond to Complaint: {selectedComplaint.subject}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Complaint Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Original Complaint:</h4>
                <p className="text-gray-700">{selectedComplaint.description}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>User:</strong> {selectedComplaint.user.name}</p>
                  <p><strong>Category:</strong> {selectedComplaint.category}</p>
                  <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <label className="form-label">Status *</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Response */}
              <div>
                <label className="form-label">Admin Response</label>
                <textarea
                  rows={6}
                  className="form-input"
                  placeholder="Enter your response to the user..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
                {newStatus === 'Resolved' && (
                  <p className="text-sm text-blue-600 mt-2">
                    📧 An email notification will be sent to the user when this complaint is resolved.
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedComplaint(null);
                  setResponse('');
                  setNewStatus('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComplaint}
                disabled={updateComplaintMutation.isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {updateComplaintMutation.isLoading ? 'Updating...' : 'Update Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;