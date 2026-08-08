import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/currency';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Fetch order details
  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    () => api.get(`/api/orders/${id}`).then(res => res.data),
    { enabled: !!id }
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(
    ({ reason }) => api.patch(`/api/orders/${id}/cancel`, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        toast.success('Order cancelled successfully. Stock has been restored and refund will be processed.');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-purple-500" />;
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-indigo-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
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
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', icon: ClockIcon },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
    { key: 'processing', label: 'Processing', icon: ClockIcon },
    { key: 'shipped', label: 'Shipped', icon: TruckIcon },
    { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon }
  ];

  const getCurrentStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return orderSteps.findIndex(step => step.key === status);
  };

  const handleCancelOrder = () => {
    const reason = window.prompt('Please provide a reason for cancellation (optional):');
    if (reason !== null) { // User didn't click cancel on prompt
      if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        cancelOrderMutation.mutate({ reason: reason || 'Cancelled by user' });
      }
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <div className="text-red-600 text-center py-20">Order not found</div>;
  if (!order) return <div className="text-gray-600 text-center py-20">Order not found</div>;

  const currentStepIndex = getCurrentStepIndex(order.orderStatus);
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/orders"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="ml-2 capitalize">{order.orderStatus}</span>
                </div>
                
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          {order.orderStatus !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Tracking</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                <div 
                  className="absolute left-4 top-8 w-0.5 bg-primary-600 transition-all duration-500"
                  style={{ height: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                <div className="space-y-8">
                  {orderSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.key} className="relative flex items-center">
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted 
                            ? 'bg-primary-600 border-primary-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          <StepIcon className={`h-4 w-4 ${
                            isCompleted ? 'text-white' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <p className={`font-medium ${
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-primary-600">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Status History</h3>
                  <div className="space-y-3">
                    {order.statusHistory.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-full ${
                            status.status === 'delivered' ? 'bg-green-100' :
                            status.status === 'shipped' ? 'bg-blue-100' :
                            status.status === 'processing' ? 'bg-yellow-100' :
                            status.status === 'confirmed' ? 'bg-green-100' :
                            'bg-gray-100'
                          }`}>
                            {getStatusIcon(status.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {status.status}
                            </p>
                            {status.notes && (
                              <p className="text-xs text-gray-600">{status.notes}</p>
                            )}
                            {status.updatedBy && (
                              <p className="text-xs text-gray-500">
                                Updated by: {status.updatedBy.name || 'Admin'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {new Date(status.timestamp).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(status.timestamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                      Tracking Number: <strong>{order.trackingNumber}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Estimated Delivery */}
              {order.estimatedDelivery && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="text-gray-700">
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                {order.shippingAddress?.landmark && (
                  <p><strong>Landmark:</strong> {order.shippingAddress.landmark}</p>
                )}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && (
                  <p className="mt-2"><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
              <div className="text-gray-700">
                <p><strong>Payment Method:</strong> {order.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Payment Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : order.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.book?.images?.[0] ? 
                      (item.book.images[0].startsWith('http') ? 
                        item.book.images[0] : 
                        `${process.env.REACT_APP_API_URL || 'https://boibabu-git-main-rajdips-projects-3d1f8c28.vercel.app'}${item.book.images[0]}`
                      ) : 
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                    }
                    alt={item.book?.title}
                    className="w-16 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ci8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc>';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.book?.title}</h3>
                    <p className="text-sm text-gray-600">by {item.book?.author}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(item.price || 0)}</p>
                    <p className="text-sm text-gray-600">each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice((item.price || 0) * item.quantity)}</p>
                    <p className="text-sm text-gray-600">total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{formatPrice(order.shippingCost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{formatPrice(order.tax || 0)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canCancel && (
            <div className="mt-6 text-center">
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isLoading}
                className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
              >
                {cancelOrderMutation.isLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Orders can be cancelled until they are shipped.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;