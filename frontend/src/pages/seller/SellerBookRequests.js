import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/currency';
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const SellerBookRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1
  });

  const fetchRequests = useCallback(async () => {
    try {
      const response = await api.get('/api/seller/book-requests', {
        params: filters
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your book submission requests and their approval status
          </p>
        </div>
        <Link
          to="/seller/books/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Book
        </Link>
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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

                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(request.status)}
                      {request.status === 'approved' && request.type === 'create' && (
                        <Link
                          to={`/seller/books/edit/${request.originalBook || 'new'}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Book"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No book requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by submitting your first book for approval.
              </p>
              <div className="mt-6">
                <Link
                  to="/seller/books/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Book
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerBookRequests;