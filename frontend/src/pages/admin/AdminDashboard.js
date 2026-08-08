import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import {
  BookOpenIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/currency';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery(
    'adminDashboard',
    () => api.get('/api/admin/dashboard').then(res => res.data),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  const stats = dashboardData?.stats || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockBooks = dashboardData?.lowStockBooks || [];

  const statCards = [
    {
      name: 'Total Books',
      value: stats.totalBooks || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Users',
      value: stats.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Net Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      subtitle: stats.totalRefunds > 0 ? `Refunds: ${formatPrice(stats.totalRefunds)}` : null
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.orderStatus === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
          </div>
          <div className="p-6">
            {lowStockBooks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All books are well stocked</p>
            ) : (
              <div className="space-y-4">
                {lowStockBooks.map((book) => (
                  <div key={book._id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-gray-900">{book.title}</p>
                      <p className="text-sm text-gray-600">Stock remaining</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        book.stock === 0 
                          ? 'bg-red-100 text-red-800'
                          : book.stock <= 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {book.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/books/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <BookOpenIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Add New Book</p>
          </Link>
          
          <Link
            to="/admin/orders"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <ShoppingBagIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">View All Orders</p>
          </Link>
          
          <Link
            to="/admin/books"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <UsersIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Manage Books</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;