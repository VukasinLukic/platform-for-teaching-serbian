import { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { OnboardingProvider } from './context/OnboardingContext';
import TutorialTooltip from './components/ui/TutorialTooltip';
import { PromoProvider, usePromo } from './context/PromoContext';
import QuickDock from './components/ui/QuickDock';
import CookieConsent from './components/CookieConsent';
import { ROUTER_BASENAME } from './seo/script';
import { LegacyQuizRedirect, LatinMirrorReload } from './seo/routeHelpers';
import { useAssistantUiStore } from './store/assistantUiStore';
import { lazyWithRetry, installPreloadErrorHandler } from './lazyWithRetry';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';
import { isEmailVerified } from './components/auth/verification';

// Critical path — eager loaded (landing page only)
import HomePage from './pages/HomePage';

installPreloadErrorHandler();
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'));

// Lazy loaded pages. lazyWithRetry reloads the page once if a chunk from an older
// deploy is gone (prevents the white screen after a new deploy).
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const CoursesPage = lazyWithRetry(() => import('./pages/CoursesPage'));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'));
const PromoQuizPage = lazyWithRetry(() => import('./pages/PromoQuizPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./pages/VerifyEmailPage'));
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'));
const CoursePage = lazyWithRetry(() => import('./pages/CoursePage'));
const OnlineClassPage = lazyWithRetry(() => import('./pages/OnlineClassPage'));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));
const BenefitsPage = lazyWithRetry(() => import('./pages/BenefitsPage'));
const PrivacyPage = lazyWithRetry(() => import('./pages/legal/PrivacyPage'));
const TermsPage = lazyWithRetry(() => import('./pages/legal/TermsPage'));
const FAQPage = lazyWithRetry(() => import('./pages/FAQPage'));
const OnlineNastavaPage = lazyWithRetry(() => import('./pages/OnlineNastavaPage'));
const PaymentSlipPage = lazyWithRetry(() => import('./pages/PaymentSlipPage'));
const InicijalniTestPage = lazyWithRetry(() => import('./pages/InicijalniTestPage'));
const QuizListPage = lazyWithRetry(() => import('./pages/QuizListPage'));
const QuizRunnerPage = lazyWithRetry(() => import('./pages/QuizRunnerPage'));
const BlogPostPage = lazyWithRetry(() => import('./pages/BlogPostPage'));
const SEOTestPage = lazyWithRetry(() => import('./pages/SEOTestPage'));
const EmailVerificationGate = lazyWithRetry(() => import('./components/auth/EmailVerificationGate'));

// Global widgets that are not needed for the first paint
const loadAssistantWidget = () => import('./components/assistant/AssistantWidget');
const AssistantWidget = lazyWithRetry(loadAssistantWidget);
const PromoQuizModal = lazyWithRetry(() => import('./components/promo/PromoQuizModal'));

function PageLoader({ text = 'Учитава се...' }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 opacity-0 animate-[fadeIn_0.3s_ease-out_0.15s_forwards]">
        <div className="w-12 h-12 rounded-full border-4 border-[#D62828]/15 border-t-[#D62828] animate-spin" />
        <p className="text-sm font-medium text-gray-500">{text}</p>
      </div>
      <style>{'@keyframes fadeIn{from{opacity:0}to{opacity:1}}'}</style>
    </div>
  );
}

/**
 * Protected route.
 * Signed-in users may use the dashboard and quizzes before verifying their email; a
 * friendly banner reminds them. Verification is enforced where it matters: purchases
 * (client + createCourseTransaction) and paid content (Firestore rules / functions).
 * `requireVerified` keeps the full-screen gate (used for the admin panel).
 */
function ProtectedRoute({ children, adminOnly = false, requireVerified = false, verifyBanner = null }) {
  const { user, userProfile, loading } = useAuthStore();

  if (loading) {
    return <PageLoader text="Провера приступа..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerified && !isEmailVerified(userProfile, user)) {
    return <EmailVerificationGate />;
  }

  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {children}
      {verifyBanner === 'floating' && <EmailVerificationBanner variant="floating" />}
    </>
  );
}

/** Runs the callback once the browser is idle (or after a timeout as a fallback). */
function whenIdle(callback, timeout = 4000) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const id = setTimeout(callback, 1500);
  return () => clearTimeout(id);
}

/**
 * Alano chat widget renders nothing until it is opened (from QuickDock), so its code is
 * prefetched when the browser is idle and mounted on first open. It stays mounted
 * afterwards to keep the conversation.
 */
function LazyAssistantWidget() {
  const isOpen = useAssistantUiStore((s) => s.isOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => whenIdle(() => { loadAssistantWidget().catch(() => {}); }), []);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <AssistantWidget />
    </Suspense>
  );
}

/** Promo modal code is loaded only when the promotion should actually be shown. */
function LazyPromoQuizModal() {
  const { showPromoQuiz } = usePromo();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (showPromoQuiz) setMounted(true);
  }, [showPromoQuiz]);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <PromoQuizModal />
    </Suspense>
  );
}

function AppContent() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <OnboardingProvider>
      <Toaster />
      <ScrollToTop />
      <TutorialTooltip />
      <LazyPromoQuizModal />
      <LazyAssistantWidget />
      <QuickDock />
      <CookieConsent />
      <main>
        <Suspense fallback={<PageLoader />}>
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
                <ProtectedRoute adminOnly requireVerified>
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
