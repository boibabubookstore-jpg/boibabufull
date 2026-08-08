import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/currency';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/seller/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentOrders = dashboardData?.recentOrders || [];

  const statCards = [
    {
      name: 'Approved Books',
      value: stats.approvedBooks || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      link: '/seller/books'
    },
    {
      name: 'Pending Requests',
      value: stats.pendingRequests || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      link: '/seller/book-requests?status=pending'
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: 'bg-green-500',
      link: '/seller/orders'
    },
    {
      name: 'Total Revenue',
      value: formatPrice(stats.totalRevenue || 0),
      icon: CurrencyRupeeIcon,
      color: 'bg-purple-500',
      link: '/seller/payments'
    }
  ];

  const paymentCards = [
    {
      name: 'Pending Payments',
      value: formatPrice(stats.pendingPayments || 0),
      icon: ClockIcon,
      color: 'bg-yellow-500',
      description: 'Amount due from delivered orders'
    },
    {
      name: 'Paid Amount',
      value: formatPrice(stats.paidAmount || 0),
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
      description: 'Total amount received'
    },
    {
      name: 'Admin Commission',
      value: formatPrice(stats.totalCommission || 0),
      icon: CurrencyRupeeIcon,
      color: 'bg-red-500',
      description: '2.5% platform fee'
    },
    {
      name: 'Shipping Charges',
      value: formatPrice(stats.totalShippingCharges || 0),
      icon: CurrencyRupeeIcon,
      color: 'bg-orange-500',
      description: 'Deducted from payments'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your books.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow sm:px-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${stat.color} p-3 rounded-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Payment Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Overview</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paymentCards.map((card) => (
              <div key={card.name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-2 rounded-md`}>
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{card.name}</p>
                    <p className="text-lg font-semibold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">Net Earnings</h4>
                <p className="text-xs text-blue-700">Revenue - Commission - Shipping</p>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {formatPrice(stats.netEarnings || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/seller/book-requests/new"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-10 w-10 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" />
                <p className="text-sm font-medium text-gray-900">Add New Book</p>
                <p className="text-sm text-gray-500">Submit a new book for approval</p>
              </div>
            </Link>

            <Link
              to="/seller/book-requests"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-10 w-10 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" />
                <p className="text-sm font-medium text-gray-900">View Requests</p>
                <p className="text-sm text-gray-500">Check status of your submissions</p>
              </div>
            </Link>

            <Link
              to="/seller/orders"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-10 w-10 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" />
                <p className="text-sm font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-500">Track your book sales</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Books
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link
                          to={`/seller/orders/${order._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          #{order._id.slice(-8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items?.map(item => item.book?.title).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Orders for your books will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;