import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ComplaintPage = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Fetch user's complaints
  const { data: complaints, refetch, isLoading: complaintsLoading, error: complaintsError } = useQuery(
    'my-complaints',
    () => api.get('/api/complaints/my-complaints').then(res => res.data),
    {
      enabled: !!user,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch complaints:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to load complaints');
        }
      }
    }
  );

  // Fetch user's orders for complaint form
  const { data: ordersData } = useQuery(
    'user-orders',
    () => api.get('/api/orders/my-orders').then(res => res.data),
    {
      enabled: !!user && showForm,
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch orders:', error);
        // Don't show error toast for orders as it's optional
      }
    }
  );

  // Extract orders array from the response
  const orders = ordersData?.orders || [];

  // Submit complaint mutation
  const submitComplaint = useMutation(
    (complaintData) => api.post('/api/complaints', complaintData),
    {
      onSuccess: () => {
        toast.success('Complaint submitted successfully!');
        reset();
        setShowForm(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit complaint');
      }
    }
  );

  const onSubmit = (data) => {
    if (!user) {
      toast.error('Please login to submit a complaint');
      return;
    }
    submitComplaint.mutate(data);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600">You need to be logged in to submit complaints.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Support & Complaints</h1>
                  <p className="text-gray-600">Submit and track your complaints</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
              >
                {showForm ? 'Cancel' : 'New Complaint'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Complaint Form */}
            {showForm && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit New Complaint</h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="form-label">Subject *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.subject ? 'border-red-500' : ''}`}
                        placeholder="Brief description of your issue"
                        {...register('subject', { required: 'Subject is required' })}
                      />
                      {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        className={`form-input ${errors.category ? 'border-red-500' : ''}`}
                        {...register('category', { required: 'Category is required' })}
                      >
                        <option value="">Select Category</option>
                        <option value="Order Issue">Order Issue</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Book Quality">Book Quality</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Account Issue">Account Issue</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Priority</label>
                      <select
                        className="form-input"
                        {...register('priority')}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Related Order (Optional)</label>
                      <select
                        className="form-input"
                        {...register('orderId')}
                      >
                        <option value="">Select Order</option>
                        {orders && orders.length > 0 ? (
                          orders.map((order) => (
                            <option key={order._id} value={order._id}>
                              Order #{order.orderNumber} - ₹{order.total}
                            </option>
                          ))
                        ) : (
                          <option disabled>No orders available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Description *</label>
                      <textarea
                        rows={6}
                        className={`form-input ${errors.description ? 'border-red-500' : ''}`}
                        placeholder="Please provide detailed information about your issue..."
                        {...register('description', { required: 'Description is required' })}
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={submitComplaint.isLoading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {submitComplaint.isLoading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Complaints List */}
            <div className={showForm ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Complaints</h2>
                
                {complaintsLoading ? (
                  <div className="text-center py-8">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading complaints...</p>
                  </div>
                ) : complaintsError ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-500">
                      {complaintsError.response?.status === 404 
                        ? 'Complaints feature is not available' 
                        : 'Failed to load complaints'}
                    </p>
                    <button 
                      onClick={() => refetch()} 
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !complaints || complaints.length === 0 ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No complaints submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(complaints || []).map((complaint) => (
                      <div
                        key={complaint._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedComplaint(selectedComplaint?._id === complaint._id ? null : complaint)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{complaint.subject}</h3>
                            <p className="text-sm text-gray-600 mt-1">{complaint.category}</p>
                            {complaint.orderId && (
                              <p className="text-sm text-blue-600 mt-1">
                                Order #{complaint.orderId.orderNumber}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-3">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>

                        {/* Expanded Details */}
                        {selectedComplaint?._id === complaint._id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-gray-900">Description:</h4>
                                <p className="text-gray-700 mt-1">{complaint.description}</p>
                              </div>
                              
                              {complaint.adminResponse && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <h4 className="font-medium text-blue-900 flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Admin Response:
                                  </h4>
                                  <p className="text-blue-800 mt-1">{complaint.adminResponse}</p>
                                  {complaint.adminResponseDate && (
                                    <p className="text-blue-600 text-sm mt-2">
                                      Responded on: {new Date(complaint.adminResponseDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;