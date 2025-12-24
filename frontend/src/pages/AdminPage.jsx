import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Video, CreditCard, Users, Settings, Bell, ChevronDown, LogOut, TrendingUp, Clock, Search, Eye, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getDashboardStats, getPendingPayments, verifyPayment } from '../services/admin.service';
import { formatPrice, formatDate } from '../utils/helpers';
import CourseManager from '../components/admin/CourseManager';
import LessonManager from '../components/admin/LessonManager';
import { Link, useNavigate } from 'react-router-dom';
import PaymentVerifier from '../components/admin/PaymentVerifier';

export default function AdminPage() {
  const { userProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payments');
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
    { id: 'students', label: 'Učenici', icon: Users },
    { id: 'settings', label: 'Podešavanja', icon: Settings },
  ];

  const statsCards = [
    {
      label: 'Ukupno Kurseva',
      value: statsData.totalCourses || 0,
      icon: BookOpen,
      color: 'text-[#BFECC9]',
      borderColor: 'border-b-4 border-[#BFECC9]'
    },
    {
      label: 'Aktivnih Učenika',
      value: statsData.activeStudents ? `${statsData.activeStudents}+` : '0',
      icon: Users,
      color: 'text-[#42A5F5]',
      borderColor: 'border-b-4 border-[#42A5F5]'
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
      color: 'text-[#FF6B35]',
      borderColor: 'border-b-4 border-[#FF6B35]'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#003366] text-white flex flex-col fixed h-full shadow-2xl z-50">
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#BFECC9]" />
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
                   ? 'bg-[#BFECC9] text-[#003366] font-bold shadow-lg' 
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
          <h1 className="text-4xl font-serif font-bold text-[#003366]">Admin Panel</h1>
          
          <div className="flex items-center gap-6">
             <button className="relative p-2 text-gray-400 hover:text-[#003366] transition">
               <Bell size={24} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 bg-[#003366] rounded-full flex items-center justify-center text-white text-xs">
                  {userProfile?.ime?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-bold text-[#003366]">{userProfile?.ime || 'Admin'}</span>
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
                 <div className="text-3xl font-black text-[#003366]">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[600px] p-8">
           {/* Tab Title if not Dashboard */}
           {activeTab !== 'dashboard' && (
             <h2 className="text-2xl font-bold text-[#003366] mb-6 pb-4 border-b border-gray-100">
               {sidebarItems.find(i => i.id === activeTab)?.label}
             </h2>
           )}

           {/* Active Tab Component */}
           <div className="animate-fade-in">
              {activeTab === 'payments' && <PaymentVerifier />}
              {activeTab === 'courses' && <CourseManager />}
              {activeTab === 'lessons' && <LessonManager />}
              {activeTab === 'dashboard' && (
                 <div className="space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-bold text-[#003366]">Poslednje Aktivnosti</h3>
                    </div>
                    {/* Placeholder for recent activities table if needed, or reuse components */}
                    <PaymentVerifier limit={5} title="Nedavne Uplate" />
                 </div>
              )}
              {['students', 'settings'].includes(activeTab) && (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="bg-[#BFECC9]/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      {activeTab === 'students' ? (
                        <Users className="w-12 h-12 text-[#003366]" />
                      ) : (
                        <Settings className="w-12 h-12 text-[#003366]" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-[#003366] mb-3">
                      {activeTab === 'students' ? 'Učenici' : 'Podešavanja'}
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === 'students'
                        ? 'Ovde ćete moći videti listu svih učenika koji su kupili kurseve, njihov napredak i statistike.'
                        : 'Ovde ćete moći podesiti profile, notifikacije, email template-ove i ostale postavke platforme.'}
                    </p>
                    <p className="text-sm text-gray-400 mt-4">Funkcionalnost uskoro dostupna</p>
                  </div>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
