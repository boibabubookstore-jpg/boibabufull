import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/currency';
import {
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const AdminBookRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    page: 1
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const fetchRequests = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/book-requests', {
        params: filters
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch book requests');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId) => {
    setProcessing(true);
    try {
      await api.post(`/api/admin/book-requests/${requestId}/approve`);
      toast.success('Book request approved successfully');
      fetchRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve request';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (data) => {
    setProcessing(true);
    try {
      await api.post(`/api/admin/book-requests/${selectedRequest._id}/reject`, data);
      toast.success('Book request rejected');
      setShowRejectModal(false);
      setSelectedRequest(null);
      reset();
      fetchRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject request';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
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
        <h1 className="text-2xl font-bold text-gray-900">Book Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve book submissions from sellers
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <BookOpenIcon className="h-6 w-6 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.bookData.title}
                        </h3>
                        <span className={getStatusBadge(request.status)}>
                          {request.status}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {request.type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Author</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.bookData.author}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof request.bookData.category === 'object' ? request.bookData.category.name : request.bookData.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(request.bookData.price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stock</p>
                          <p className="text-sm font-medium text-gray-900">
                            {request.bookData.stock}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {request.bookData.description}
                        </p>
                      </div>

                      {/* Images */}
                      {request.bookData.images && request.bookData.images.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-2">Images</p>
                          <div className="flex space-x-2">
                            {request.bookData.images.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${image}`}
                                alt={`Book cover ${index + 1}`}
                                className="w-16 h-20 object-cover rounded border"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                                }}
                              />
                            ))}
                            {request.bookData.images.length > 3 && (
                              <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-500">+{request.bookData.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Seller: {request.seller?.name}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                        {request.reviewedAt && (
                          <>
                            <span>•</span>
                            <span>Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      {request.adminNotes && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>Admin Notes:</strong> {request.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processing}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectModal(true);
                          }}
                          disabled={processing}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No book requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                No book requests found for the selected filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRejectModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(handleReject)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <XCircleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Reject Book Request
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          You are about to reject "{selectedRequest.bookData.title}" by {selectedRequest.seller?.name}.
                          Please provide a reason for rejection.
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Rejection Reason
                        </label>
                        <textarea
                          rows={4}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.adminNotes ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Explain why this book request is being rejected..."
                          {...register('adminNotes', {
                            required: 'Rejection reason is required',
                            minLength: { value: 10, message: 'Please provide a detailed reason' }
                          })}
                        />
                        {errors.adminNotes && (
                          <p className="mt-1 text-sm text-red-600">{errors.adminNotes.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {processing ? 'Rejecting...' : 'Reject Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
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
    </div>
  );
};

export default AdminBookRequests;