import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Configure axios headers - removed as we now use the centralized API utility
  // const getAxiosConfig = () => ({
  //   headers: token ? { Authorization: `Bearer ${token}` } : {}
  // });

  // Fetch notifications
  const { data: notificationData, isLoading } = useQuery(
    'notifications',
    async () => {
      const response = await api.get('/api/notifications');
      console.log('Notifications fetched:', response.data);
      return response.data;
    },
    {
      enabled: isAuthenticated && !!token,
      refetchInterval: 30000, // Refetch every 30 seconds
      onError: (error) => {
        console.error('Error fetching notifications:', error);
        console.error('Error details:', error.response?.data);
      }
    }
  );

  // Mark notification as read
  const markAsReadMutation = useMutation(
    (notificationId) => {
      return api.put(`/api/notifications/${notificationId}/read`, {});
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );

  // Mark all as read
  const markAllAsReadMutation = useMutation(
    () => {
      return api.put('/api/notifications/mark-all-read', {});
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  const markAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    markAsRead,
    markAllAsRead,
    toggleNotifications,
    setIsOpen
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};