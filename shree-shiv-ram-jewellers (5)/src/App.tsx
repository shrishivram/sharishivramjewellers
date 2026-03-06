import { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import LoginSelection from './pages/LoginSelection';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Search from './pages/Search';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import SavedAddresses from './pages/SavedAddresses';
import PaymentMethods from './pages/PaymentMethods';
import HelpSupport from './pages/HelpSupport';
import SignUp from './pages/SignUp';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly) {
    const isAdmin = ['admin', 'super_admin', 'moderator'].includes(user.role || '');
    if (!isAdmin) return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginSelection, setShowLoginSelection] = useState(false);

  useEffect(() => {
    // If loading is finished and user is not logged in, we might need to show login selection
    // but we wait for splash to finish first.
  }, [user, isLoading]);

  const handleSplashFinish = () => {
    setShowSplash(false);
    if (!user) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    setShowLoginSelection(true);
  };

  const handleLoginSelectionFinish = () => {
    setShowLoginSelection(false);
  };

  // If we are still loading the initial auth state, we can keep the splash screen or show a loader
  // But usually splash screen handles the initial wait.

  return (
    <CartProvider>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[110]"
          >
            <SplashScreen onFinish={handleSplashFinish} />
          </motion.div>
        )}

        {showOnboarding && !user && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100]"
          >
            <Onboarding onFinish={handleOnboardingFinish} />
          </motion.div>
        )}

        {showLoginSelection && !user && (
          <motion.div
            key="login-selection"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", damping: 25 }}
            className="fixed inset-0 z-[90]"
          >
            <LoginSelection onFinish={handleLoginSelectionFinish} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen bg-white transition-opacity duration-700 ${showSplash || showOnboarding || (showLoginSelection && !user) ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/search" element={<Search />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:id" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/saved-addresses" element={<SavedAddresses />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/help-support" element={<HelpSupport />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <AppContent />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}
