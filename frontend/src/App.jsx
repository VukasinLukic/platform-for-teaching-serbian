import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';
import { FullScreenSpinner } from './components/ui/Spinner';
import { Toaster } from 'react-hot-toast';
import { OnboardingProvider } from './context/OnboardingContext';
import TutorialTooltip from './components/ui/TutorialTooltip';
import { PromoProvider } from './context/PromoContext';
import PromoQuizModal from './components/promo/PromoQuizModal';
import AssistantWidget from './components/assistant/AssistantWidget';
import QuickDock from './components/ui/QuickDock';
import CookieConsent from './components/CookieConsent';
import { useVersionCheck } from './hooks/useVersionCheck';
import { ROUTER_BASENAME } from './seo/script';
import { LegacyQuizRedirect, LatinMirrorReload } from './seo/routeHelpers';

// Critical path — eager loaded
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import BlogPage from './pages/BlogPage';
import PromoQuizPage from './pages/PromoQuizPage';
import EmailVerificationGate from './components/auth/EmailVerificationGate';

// Lazy loaded — non-critical or heavy pages
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const OnlineClassPage = lazy(() => import('./pages/OnlineClassPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BenefitsPage = lazy(() => import('./pages/BenefitsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const OnlineNastavaPage = lazy(() => import('./pages/OnlineNastavaPage'));
const PaymentSlipPage = lazy(() => import('./pages/PaymentSlipPage'));
const InicijalniTestPage = lazy(() => import('./pages/InicijalniTestPage'));
const QuizListPage = lazy(() => import('./pages/QuizListPage'));
const QuizRunnerPage = lazy(() => import('./pages/QuizRunnerPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const SEOTestPage = lazy(() => import('./pages/SEOTestPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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
  // TEMPORARILY DISABLED - Version check causing reload loop
  // const { updateAvailable, checkVersion, silentReload } = useVersionCheck();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // DISABLED - These useEffects were causing constant page reloads
  // Will re-enable with proper fix later

  // // Tihi reload na promeni rute (ne na prvom renderovanju)
  // useEffect(() => {
  //   console.log('[APP] Route change effect', {
  //     isFirstRender: isFirstRender.current,
  //     updateAvailable,
  //     hasReloaded: hasReloaded.current,
  //     pathname: location.pathname
  //   });

  //   if (isFirstRender.current) {
  //     isFirstRender.current = false;
  //     console.log('[APP] First render, skipping reload');
  //     return;
  //   }

  //   if (updateAvailable && !hasReloaded.current) {
  //     console.warn('[APP] UPDATE AVAILABLE - CALLING SILENT RELOAD ON ROUTE CHANGE!');
  //     hasReloaded.current = true;
  //     silentReload();
  //   }
  // }, [location.pathname, updateAvailable]);

  // // Tihi reload kad korisnik vrati tab u fokus
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     console.log('[APP] Visibility change', {
  //       visibilityState: document.visibilityState,
  //       updateAvailable,
  //       hasReloaded: hasReloaded.current
  //     });
  //     if (document.visibilityState === 'visible' && updateAvailable && !hasReloaded.current) {
  //       console.warn('[APP] TAB FOCUS + UPDATE AVAILABLE - CALLING SILENT RELOAD!');
  //       hasReloaded.current = true;
  //       silentReload();
  //     }
  //   };
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // }, [updateAvailable]);

  return (
    <OnboardingProvider>
      <Toaster />
      <ScrollToTop />
      <TutorialTooltip />
      <PromoQuizModal />
      <AssistantWidget />
      <QuickDock />
      <CookieConsent />
      <main>
        <Suspense fallback={<FullScreenSpinner text="Učitava se..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/kurs/:slug" element={<CoursePage />} />
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
            <Route path="/inicijalni-test/:razred" element={<InicijalniTestPage />} />

            {/* SEO Test Stranice */}
            <Route path="/srpski-jezik/:kategorija/:slug" element={<SEOTestPage />} />

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

            {/* Quiz Routes — public; old /quizzes URLs redirect */}
            <Route path="/kvizovi" element={<QuizListPage />} />
            <Route path="/kvizovi/:quizId" element={<QuizRunnerPage />} />
            <Route path="/quizzes" element={<Navigate to="/kvizovi" replace />} />
            <Route path="/quizzes/:quizId" element={<LegacyQuizRedirect />} />

            {/* /lat/* reached by client-side navigation from the Cyrillic app: reload into Latin mode */}
            <Route path="/lat/*" element={<LatinMirrorReload />} />

            {/* Catch all - real 404 page (noindex) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </OnboardingProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <PromoProvider>
        <AppContent />
      </PromoProvider>
    </BrowserRouter>
  );
}

export default App;
