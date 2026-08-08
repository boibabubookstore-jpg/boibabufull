import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import RedirectHandler from './components/ui/RedirectHandler';

// Pages
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminBookForm from './pages/admin/AdminBookForm';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEmails from './pages/admin/AdminEmails';
import AdminSellers from './pages/admin/AdminSellers';
import AdminBookRequests from './pages/admin/AdminBookRequests';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminWebsiteSettings from './pages/admin/AdminWebsiteSettings';

// Seller Pages
import SellerLayout from './components/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerBooks from './pages/seller/SellerBooks';
import SellerBookForm from './pages/seller/SellerBookForm';
import SellerBookRequests from './pages/seller/SellerBookRequests';
import SellerOrders from './pages/seller/SellerOrders';
import SellerOrderDetail from './pages/seller/SellerOrderDetail';
import SellerPayments from './pages/seller/SellerPayments';
import SellerComplaints from './pages/seller/SellerComplaints';

// Other Pages
import ComplaintPage from './pages/ComplaintPage';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <NotificationProvider>
        <RedirectHandler />
        <div className="min-h-screen bg-gray-50">
          <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="books/new" element={<AdminBookForm />} />
                  <Route path="books/edit/:id" element={<AdminBookForm />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="sellers" element={<AdminSellers />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="emails" element={<AdminEmails />} />
                  <Route path="book-requests" element={<AdminBookRequests />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="website-settings" element={<AdminWebsiteSettings />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Seller Routes */}
          <Route path="/seller/*" element={
            <SellerRoute>
              <SellerLayout>
                <Routes>
                  <Route index element={<SellerDashboard />} />
                  <Route path="books" element={<SellerBooks />} />
                  <Route path="books/new" element={<SellerBookForm />} />
                  <Route path="books/edit/:id" element={<SellerBookForm />} />
                  <Route path="book-requests" element={<SellerBookRequests />} />
                  <Route path="book-requests/new" element={<SellerBookForm />} />
                  <Route path="orders" element={<SellerOrders />} />
                  <Route path="orders/:id" element={<SellerOrderDetail />} />
                  <Route path="payments" element={<SellerPayments />} />
                  <Route path="complaints" element={<SellerComplaints />} />
                </Routes>
              </SellerLayout>
            </SellerRoute>
          } />

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route index element={<HomePage />} />
                  <Route path="books" element={<BooksPage />} />
                  <Route path="books/:id" element={<BookDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="verify-email" element={<EmailVerificationPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="checkout" element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="orders/:id" element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="complaints" element={
                    <ProtectedRoute>
                      <ComplaintPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </NotificationProvider>
    </HelmetProvider>
  );
}