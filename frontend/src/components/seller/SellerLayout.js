import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../ui/NotificationBell';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const SellerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/seller', icon: HomeIcon },
    { name: 'My Books', href: '/seller/books', icon: BookOpenIcon },
    { name: 'Book Requests', href: '/seller/book-requests', icon: ClipboardDocumentListIcon },
    { name: 'Visit Store', href: '/books', icon: GlobeAltIcon, external: true },
  ];

  const orderManagement = [
    { name: 'Orders', href: '/seller/orders', icon: ShoppingBagIcon },
  ];

  const financialManagement = [
    { name: 'Payments', href: '/seller/payments', icon: BanknotesIcon },
  ];

  const supportSection = [
    { name: 'Complaints', href: '/seller/complaints', icon: ChatBubbleLeftRightIcon },
  ];

  const renderNavigationSection = (items, title, isMobile = false) => (
    <div className="space-y-2">
      {title && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {items.map((item) => {
        const isActive = location.pathname === item.href && !item.external;
        const linkProps = item.external 
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {};
        
        return (
          <Link
            key={item.name}
            to={item.href}
            {...linkProps}
            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            className={`${
              isActive
                ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-md'
                : item.external
                ? 'border-transparent text-green-600 hover:bg-green-50 hover:text-green-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } group flex items-center px-3 py-3 ${isMobile ? 'text-base' : 'text-sm'} font-medium rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm`}
          >
            <item.icon className={`${isMobile ? 'mr-4 h-6 w-6' : 'mr-3 h-6 w-6'}`} />
            {item.name}
            {item.external && (
              <span className="ml-auto text-xs text-gray-400">↗</span>
            )}
          </Link>
        );
      })}
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 bg-blue-50 py-3 rounded-lg mx-2">
              <h1 className="text-lg font-bold text-blue-900">📚 Seller Panel</h1>
            </div>
            <div className="mt-4 px-2">
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                ✅ Mobile Navigation
              </div>
            </div>
            <nav className="mt-5 space-y-6 px-2">
              {renderNavigationSection(navigation, 'Main', true)}
              {renderNavigationSection(orderManagement, 'Order Management', true)}
              {renderNavigationSection(financialManagement, 'Financial', true)}
              {renderNavigationSection(supportSection, 'Support', true)}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-red-100">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r-4 border-blue-500 shadow-lg">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4 bg-blue-50 py-3 rounded-lg mx-2">
              <h1 className="text-xl font-bold text-blue-900">📚 Seller Panel</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-6 px-2">
              {renderNavigationSection(navigation, 'Main')}
              {renderNavigationSection(orderManagement, 'Order Management')}
              {renderNavigationSection(financialManagement, 'Financial')}
              {renderNavigationSection(supportSection, 'Support')}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-md border-b-2 border-blue-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 shadow-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="lg:hidden ml-3">
                <h1 className="text-lg font-bold text-gray-900">📚 Seller Panel</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;