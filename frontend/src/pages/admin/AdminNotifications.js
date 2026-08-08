import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
  BellIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  GiftIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    priority: 'medium',
    sendToAll: true,
    specificUsers: []
  });

  // Fetch all users for targeting
  const { data: usersData } = useQuery(
    'admin-users',
    () => {
      return api.get(`/api/admin/users`).then(res => res.data);
    }
  );

  // Fetch recent notifications
  const { data: notificationsData, isLoading } = useQuery(
    'admin-notifications',
    () => {
      return api.get(`/api/notifications/admin`).then(res => res.data);
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      onError: (error) => {
        console.error('Error fetching admin notifications:', error);
      }
    }
  );

  // Send notification mutation
  const sendNotificationMutation = useMutation(
    (notificationData) => {
      return api.post(`/api/notifications/broadcast`, notificationData);
    },
    {
      onSuccess: () => {
        toast.success('Notification sent successfully!');
        setFormData({
          type: 'general',
          title: '',
          message: '',
          priority: 'medium',
          sendToAll: true,
          specificUsers: []
        });
        setIsCreating(false);
        queryClient.invalidateQueries('admin-notifications');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send notification');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipients = formData.sendToAll 
      ? usersData?.users?.map(user => user._id) || []
      : formData.specificUsers;

    if (recipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    sendNotificationMutation.mutate({
      recipients,
      type: formData.type,
      title: formData.title,
      message: formData.message,
      priority: formData.priority
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      order: TruckIcon,
      delivery: TruckIcon,
      offer: GiftIcon,
      stock: ExclamationTriangleIcon,
      general: InformationCircleIcon
    };
    return icons[type] || InformationCircleIcon;
  };

  const getTypeColor = (type) => {
    const colors = {
      order: 'text-blue-600 bg-blue-100',
      delivery: 'text-green-600 bg-green-100',
      offer: 'text-purple-600 bg-purple-100',
      stock: 'text-orange-600 bg-orange-100',
      general: 'text-gray-600 bg-gray-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return <LoadingSpinner size="large" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Send notifications to users and manage communication</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="btn-primary flex items-center gap-2"
        >
          <BellIcon className="h-5 w-5" />
          Send Notification
        </button>
      </div>

      {/* Create Notification Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send New Notification</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="form-label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="form-input"
                >
                  <option value="general">General</option>
                  <option value="offer">Offer/Promotion</option>
                  <option value="order">Order Update</option>
                  <option value="delivery">Delivery</option>
                  <option value="stock">Stock Alert</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="form-label">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="form-label">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder="Enter notification title"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="form-label">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-input"
                rows={4}
                placeholder="Enter notification message"
                required
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="form-label">Recipients</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.sendToAll}
                    onChange={() => setFormData({ ...formData, sendToAll: true })}
                    className="mr-2"
                  />
                  <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Send to all users ({usersData?.users?.length || 0} users)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.sendToAll}
                    onChange={() => setFormData({ ...formData, sendToAll: false })}
                    className="mr-2"
                  />
                  Select specific users
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendNotificationMutation.isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {sendNotificationMutation.isLoading ? (
                  <>
                    <div className="spinner w-4 h-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notificationsData?.notifications?.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            notificationsData?.notifications?.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <div key={notification._id} className="px-6 py-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        Sent to {notification.recipientCount || 0} users
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;