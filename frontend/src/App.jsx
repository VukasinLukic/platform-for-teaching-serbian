import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';
import { FullScreenSpinner } from './components/ui/Spinner';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import OnlineClassPage from './pages/OnlineClassPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BenefitsPage from './pages/BenefitsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';

import CoursesPage from './pages/CoursesPage';
import FAQPage from './pages/FAQPage';
import OnlineNastavaPage from './pages/OnlineNastavaPage';
import PaymentSlipPage from './pages/PaymentSlipPage';
import EmailVerificationGate from './components/auth/EmailVerificationGate';
import QuizListPage from './pages/QuizListPage';
import QuizRunnerPage from './pages/QuizRunnerPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userProfile, loading } = useAuthStore();

  if (loading) {
    return <FullScreenSpinner text="Provera pristupa..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if email is verified (except for /verify route)
  if (userProfile && !userProfile.emailVerified) {
    return <EmailVerificationGate />;
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
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Toaster />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/course/:id" element={<CoursePage />} />
        <Route path="/online-class/:id" element={<OnlineClassPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/online-nastava" element={<OnlineNastavaPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/uplatnica" element={<PaymentSlipPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

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

        {/* Quiz Routes */}
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId"
          element={
            <ProtectedRoute>
              <QuizRunnerPage />
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
