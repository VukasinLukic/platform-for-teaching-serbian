import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { initEmailService } from './services/email.service';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BenefitsPage from './pages/BenefitsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';

import CoursesPage from './pages/CoursesPage';
import FAQPage from './pages/FAQPage';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userProfile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
    initEmailService();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
