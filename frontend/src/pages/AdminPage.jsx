import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Video, CreditCard, Users, Settings, ChevronDown, LogOut, TrendingUp, Clock, Search, Eye, Check, X, Mail, Menu, Gift } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getDashboardStats, getPendingPayments, verifyPayment } from '../services/admin.service';
import { formatPrice, formatDate } from '../utils/helpers';
import CourseManager from '../components/admin/CourseManager';
import LessonManager from '../components/admin/LessonManager';
import { Link, useNavigate } from 'react-router-dom';
import PaymentVerifier from '../components/admin/PaymentVerifier';
import UsersList from '../components/admin/UsersList';
import TransactionHistory from '../components/admin/TransactionHistory';
import SettingsPanel from '../components/admin/SettingsPanel';
import OnlineClassManager from '../components/admin/OnlineClassManager';
import EmailTestingPanel from '../components/admin/EmailTestingPanel';
import NotificationDropdown from '../components/admin/NotificationDropdown';
import PromotionsManager from '../components/admin/PromotionsManager';

export default function AdminPage() {
  const { userProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payments');
  const [isEmailPanelOpen, setIsEmailPanelOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalCourses: 0,
    activeStudents: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  // Mobile drawer: Escape closes it and the page behind it does not scroll.
  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileSidebarOpen]);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStatsData(data);
    } catch (error) {
      console.error("Error loading stats", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Pregled', icon: LayoutDashboard },
    { id: 'courses', label: 'Kursevi', icon: BookOpen },
    { id: 'lessons', label: 'Lekcije', icon: Video },
    { id: 'payments', label: 'Uplate', icon: CreditCard },
    { id: 'online', label: 'Онлајн часови', icon: Video },
    { id: 'students', label: 'Ученици', icon: Users },
    { id: 'promotions', label: 'Промоције', icon: Gift },
    { id: 'settings', label: 'Подешавања', icon: Settings },
  ];

  const statsCards = [
    {
      label: 'Укупно Курсева',
      value: statsData.totalCourses || 0,
      icon: BookOpen,
      color: 'text-gold',
      borderColor: 'border-b-4 border-gold'
    },
    {
      label: 'Активних Ученика',
      value: statsData.activeStudents ? `${statsData.activeStudents}+` : '0',
      icon: Users,
      color: 'text-brand',
      borderColor: 'border-b-4 border-brand'
    },
    {
      label: 'На Чекању Уплате',
      value: statsData.pendingPayments || 0,
      icon: Clock,
      color: 'text-gold',
      borderColor: 'border-b-4 border-gold'
    },
    {
      label: 'Месечни Приход',
      value: formatPrice(statsData.monthlyRevenue || 0),
      icon: TrendingUp,
      color: 'text-brand',
      borderColor: 'border-b-4 border-brand'
    },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans flex overflow-x-hidden">

      {/* Email Testing Panel */}
      <EmailTestingPanel
        isOpen={isEmailPanelOpen}
        onClose={() => setIsEmailPanelOpen(false)}
      />

      {/* Floating Email Test Button - Desktop */}
      <button
        onClick={() => setIsEmailPanelOpen(true)}
        className="hidden lg:flex fixed bottom-6 left-72 bg-gradient-to-r from-brand to-warning text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl motion-safe:hover:scale-110 transition-all duration-300 items-center gap-3 font-bold z-50 group"
      >
        <Mail size={24} className="group-hover:rotate-12 transition-transform" />
        <span>Test Emails</span>
      </button>

      {/* Floating Email Test Button - Mobile */}
      <button
        onClick={() => setIsEmailPanelOpen(true)}
        className="lg:hidden fixed right-4 bg-gradient-to-r from-brand to-warning text-white p-4 rounded-full shadow-2xl z-40"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        aria-label="Тестирај email-ове"
      >
        <Mail size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="admin-sidebar"
        aria-label="Админ навигација"
        className={`w-[min(16rem,85vw)] lg:w-64 bg-ink text-white flex flex-col fixed inset-y-0 left-0 shadow-2xl z-50 motion-safe:transition-transform motion-safe:duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 lg:p-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-gold" />
          <span className="text-xl font-serif font-bold flex-1">Srpski u Srcu</span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Затвори мени"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
             <button
               key={item.id}
               onClick={() => {
                 setActiveTab(item.id);
                 setMobileSidebarOpen(false);
               }}
               aria-current={activeTab === item.id ? 'page' : undefined}
               className={`w-full flex items-center gap-4 px-5 py-3 lg:px-6 lg:py-4 rounded-xl transition-all duration-200 ${
                 activeTab === item.id
                   ? 'bg-gold text-ink font-bold shadow-lg'
                   : 'text-white/70 hover:bg-white/10 hover:text-white'
               }`}
             >
               <item.icon size={20} />
               <span>{item.label}</span>
             </button>
          ))}
        </nav>

        {/* User Profile Mini */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
               {userProfile?.ime?.charAt(0) || 'A'}
            </div>
            <div>
               <div className="font-bold text-sm">{userProfile?.ime || 'Admin'}</div>
               <div className="text-xs text-white/50">Administrator</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300 hover:text-red-100 text-sm transition"
          >
            <LogOut size={16} /> Одјави се
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 lg:ml-64 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12 w-full overflow-x-hidden">

        {/* Top Header */}
        <header className="flex justify-between items-center gap-3 mb-4 lg:mb-12">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-ink hover:bg-gray-100 rounded-lg transition"
              aria-label="Отвори админ мени"
              aria-expanded={mobileSidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-ink truncate">Administracija</h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <NotificationDropdown />
             <div className="hidden md:flex bg-white px-4 py-2 rounded-full shadow-sm items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-white text-xs">
                  {userProfile?.ime?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-bold text-ink">{userProfile?.ime || 'Admin'}</span>
                <ChevronDown size={16} className="text-gray-500" />
             </div>
          </div>
        </header>

        {/* Mobile/tablet: horizontal section switcher, so every tab is one tap away */}
        <nav
          aria-label="Админ секције"
          className="lg:hidden -mx-4 md:-mx-8 px-4 md:px-8 mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex gap-2 w-max">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                    activeTab === item.id
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-ink border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Stats Cards */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
            {statsCards.map((stat, index) => (
              <div key={index} className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-all ${stat.borderColor}`}>
                 <div className="flex justify-between items-start mb-3 md:mb-4">
                   <div className="text-gray-500 text-xs md:text-sm font-medium break-words max-w-[60%]">{stat.label}</div>
                   <div className={`p-2 rounded-lg bg-gray-50 ${stat.color} flex-shrink-0`}>
                     <stat.icon size={18} className="md:w-5 md:h-5" />
                   </div>
                 </div>
                 <div className="text-xl sm:text-2xl md:text-3xl font-black text-ink break-words">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white md:rounded-2xl lg:rounded-3xl shadow-sm border-y md:border border-gray-100 min-h-[400px] lg:min-h-[600px] -mx-4 md:mx-0 p-4 md:p-6 lg:p-8 overflow-x-auto">
           {/* Tab Title if not Dashboard */}
           {activeTab !== 'dashboard' && (
             <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-ink mb-4 md:mb-6 pb-4 border-b border-gray-100">
               {sidebarItems.find(i => i.id === activeTab)?.label}
             </h2>
           )}

           {/* Active Tab Component */}
           <div className="motion-safe:animate-fade-in overflow-x-auto">
              {activeTab === 'payments' && (
                <div className="space-y-8">
                  <PaymentVerifier />
                  <TransactionHistory />
                </div>
              )}
              {activeTab === 'courses' && <CourseManager />}
              {activeTab === 'lessons' && <LessonManager />}
              {activeTab === 'dashboard' && (
                 <div className="space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-bold text-ink">Последње Активности</h3>
                    </div>

                    {/* Pending Payments */}
                    <PaymentVerifier limit={5} title="Уплате на Чекању" />

                    {/* Transaction History */}
                    <TransactionHistory maxItems={10} />
                 </div>
              )}

              {activeTab === 'students' && <UsersList />}

              {activeTab === 'online' && <OnlineClassManager />}

              {activeTab === 'promotions' && <PromotionsManager />}

              {activeTab === 'settings' && <SettingsPanel />}
           </div>
        </div>
      </main>
    </div>
  );
}
