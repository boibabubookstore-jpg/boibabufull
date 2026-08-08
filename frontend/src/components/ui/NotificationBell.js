import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    isOpen, 
    toggleNotifications, 
    markAsRead, 
    markAllAsRead,
    setIsOpen 
  } = useNotifications();

  const getNotificationIcon = (type) => {
    const icons = {
      order: '📦',
      delivery: '🚚',
      offer: '🎉',
      stock: '📊',
      general: '📢'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      order: 'text-blue-600 bg-blue-50',
      delivery: 'text-green-600 bg-green-50',
      offer: 'text-purple-600 bg-purple-50',
      stock: 'text-orange-600 bg-orange-50',
      general: 'text-gray-600 bg-gray-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-l-green-400',
      medium: 'border-l-yellow-400',
      high: 'border-l-red-400'
    };
    return colors[priority] || 'border-l-gray-400';
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6 text-primary-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-[32rem] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">{unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <BellIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h4>
                  <p className="text-sm text-gray-500">We'll notify you when something arrives!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 mt-1 p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2 ml-2" />
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                            {notification.priority === 'high' && (
                              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                High Priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;