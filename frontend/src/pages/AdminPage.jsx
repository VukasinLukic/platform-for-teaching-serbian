import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Video, CreditCard, Users, Settings, Bell, ChevronDown, LogOut, TrendingUp, Clock, Search, Eye, Check, X, Mail } from 'lucide-react';
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

export default function AdminPage() {
  const { userProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payments');
  const [isEmailPanelOpen, setIsEmailPanelOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalCourses: 0,
    activeStudents: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

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
    { id: 'online', label: 'Onlajn časovi', icon: Video },
    { id: 'students', label: 'Učenici', icon: Users },
    { id: 'settings', label: 'Podešavanja', icon: Settings },
  ];

  const statsCards = [
    {
      label: 'Ukupno Kurseva',
      value: statsData.totalCourses || 0,
      icon: BookOpen,
      color: 'text-[#F2C94C]',
      borderColor: 'border-b-4 border-[#F2C94C]'
    },
    {
      label: 'Aktivnih Učenika',
      value: statsData.activeStudents ? `${statsData.activeStudents}+` : '0',
      icon: Users,
      color: 'text-[#D62828]',
      borderColor: 'border-b-4 border-[#D62828]'
    },
    {
      label: 'Na Čekanju Uplate',
      value: statsData.pendingPayments || 0,
      icon: Clock,
      color: 'text-[#FFD700]',
      borderColor: 'border-b-4 border-[#FFD700]'
    },
    {
      label: 'Mesečni Prihod',
      value: formatPrice(statsData.monthlyRevenue || 0),
      icon: TrendingUp,
      color: 'text-[#D62828]',
      borderColor: 'border-b-4 border-[#D62828]'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans flex">

      {/* Email Testing Panel */}
      <EmailTestingPanel
        isOpen={isEmailPanelOpen}
        onClose={() => setIsEmailPanelOpen(false)}
      />

      {/* Floating Email Test Button */}
      <button
        onClick={() => setIsEmailPanelOpen(true)}
        className="fixed bottom-6 left-72 bg-gradient-to-r from-[#D62828] to-[#F77F00] text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center gap-3 font-bold z-50 group"
      >
        <Mail size={24} className="group-hover:rotate-12 transition-transform" />
        <span>Test Emails</span>
      </button>

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col fixed h-full shadow-2xl z-50">
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#F2C94C]" />
          <span className="text-xl font-serif font-bold">Nauči Srpski</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${
                 activeTab === item.id 
                   ? 'bg-[#F2C94C] text-[#1A1A1A] font-bold shadow-lg' 
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
            <LogOut size={16} /> Odjavi se
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 lg:p-12">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-[#1A1A1A]">Admin Panel</h1>
          
          <div className="flex items-center gap-6">
             <button className="relative p-2 text-gray-400 hover:text-[#1A1A1A] transition">
               <Bell size={24} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white text-xs">
                  {userProfile?.ime?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">{userProfile?.ime || 'Admin'}</span>
                <ChevronDown size={16} className="text-gray-400" />
             </div>
          </div>
        </header>

        {/* Stats Cards */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsCards.map((stat, index) => (
              <div key={index} className={`bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all ${stat.borderColor}`}>
                 <div className="flex justify-between items-start mb-4">
                   <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                   <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                     <stat.icon size={20} />
                   </div>
                 </div>
                 <div className="text-3xl font-black text-[#1A1A1A]">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[600px] p-8">
           {/* Tab Title if not Dashboard */}
           {activeTab !== 'dashboard' && (
             <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 pb-4 border-b border-gray-100">
               {sidebarItems.find(i => i.id === activeTab)?.label}
             </h2>
           )}

           {/* Active Tab Component */}
           <div className="animate-fade-in">
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
                       <h3 className="text-xl font-bold text-[#1A1A1A]">Poslednje Aktivnosti</h3>
                    </div>

                    {/* Pending Payments */}
                    <PaymentVerifier limit={5} title="Уплате на Чекању" />

                    {/* Transaction History */}
                    <TransactionHistory maxItems={10} />
                 </div>
              )}

              {activeTab === 'students' && <UsersList />}

              {activeTab === 'online' && <OnlineClassManager />}

              {activeTab === 'settings' && <SettingsPanel />}
           </div>
        </div>
      </main>
    </div>
  );
}
