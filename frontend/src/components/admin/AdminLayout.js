import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../ui/NotificationBell';
import {
  HomeIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  BellIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Books', href: '/admin/books', icon: BookOpenIcon },
    { name: 'Book Requests', href: '/admin/book-requests', icon: ClipboardDocumentListIcon },
    { name: 'Sellers', href: '/admin/sellers', icon: UsersIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Emails', href: '/admin/emails', icon: EnvelopeIcon },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TagIcon },
    { name: 'Complaints', href: '/admin/complaints', icon: ChatBubbleLeftRightIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'Website Settings', href: '/admin/website-settings', icon: CogIcon },
  ];

  const orderManagement = [
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  ];

  const financialManagement = [
    { name: 'Payments', href: '/admin/payments', icon: BanknotesIcon },
  ];

  const renderNavigationSection = (items, title) => (
    <div className="space-y-2">
      {title && (
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600 flex-shrink-0">
            <Link to="/admin" className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Boibabu Admin</span>
            </Link>
            
            {/* Notification Bell */}
            <div className="text-white">
              <NotificationBell />
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {renderNavigationSection(navigation, 'Main')}
            {renderNavigationSection(orderManagement, 'Order Management')}
            {renderNavigationSection(financialManagement, 'Financial')}
          </nav>

          {/* User Menu - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                View Store
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;