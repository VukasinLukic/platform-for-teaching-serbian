import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';
import { FullScreenSpinner } from './components/ui/Spinner';
import { Toaster } from 'react-hot-toast';
import { OnboardingProvider } from './context/OnboardingContext';
import TutorialTooltip from './components/ui/TutorialTooltip';
import { PromoProvider } from './context/PromoContext';
import PromoQuizModal from './components/promo/PromoQuizModal';
import PromoFloatingButton from './components/promo/PromoFloatingButton';
import { useVersionCheck } from './hooks/useVersionCheck';

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
import PromoQuizPage from './pages/PromoQuizPage';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userProfile, loading } = useAuthStore();

  if (loading) {
    return <FullScreenSpinner text="Provera pristupa..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Block access if profile not loaded or email not verified
  if (!userProfile || !userProfile.emailVerified) {
    return <EmailVerificationGate />;
  }

  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const { updateAvailable, checkVersion, silentReload } = useVersionCheck();
  const location = useLocation();
  const isFirstRender = useRef(true);
  const hasReloaded = useRef(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Tihi reload na promeni rute (ne na prvom renderovanju)
  useEffect(() => {
    console.log('[APP] Route change effect', {
      isFirstRender: isFirstRender.current,
      updateAvailable,
      hasReloaded: hasReloaded.current,
      pathname: location.pathname
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('[APP] First render, skipping reload');
      return;
    }

    if (updateAvailable && !hasReloaded.current) {
      console.warn('[APP] UPDATE AVAILABLE - CALLING SILENT RELOAD ON ROUTE CHANGE!');
      hasReloaded.current = true;
      silentReload();
    }
  }, [location.pathname, updateAvailable]);

  // Tihi reload kad korisnik vrati tab u fokus
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('[APP] Visibility change', {
        visibilityState: document.visibilityState,
        updateAvailable,
        hasReloaded: hasReloaded.current
      });
      if (document.visibilityState === 'visible' && updateAvailable && !hasReloaded.current) {
        console.warn('[APP] TAB FOCUS + UPDATE AVAILABLE - CALLING SILENT RELOAD!');
        hasReloaded.current = true;
        silentReload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateAvailable]);

  return (
    <OnboardingProvider>
      <Toaster />
      <ScrollToTop />
      <TutorialTooltip />
      <PromoQuizModal />
      <PromoFloatingButton />
      <main>
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
          <Route path="/probni-prijemni" element={<PromoQuizPage />} />

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
      </main>
    </OnboardingProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PromoProvider>
        <AppContent />
      </PromoProvider>
    </BrowserRouter>
  );
}

export default App;
