import { useState, useEffect } from 'react';
import { LayoutDashboard, Video, CreditCard, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getDashboardStats } from '../services/admin.service';
import { formatPrice } from '../utils/helpers';
import CourseManager from '../components/admin/CourseManager';
import LessonManager from '../components/admin/LessonManager';
import PaymentVerifier from '../components/admin/PaymentVerifier';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';

export default function AdminPage() {
  const { userProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('courses');
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
    const data = await getDashboardStats();
    setStatsData(data);
  };

  const tabs = [
    { id: 'courses', label: 'Kursevi', icon: LayoutDashboard, color: '#BFECC9' },
    { id: 'lessons', label: 'Lekcije', icon: Video, color: '#42A5F5' },
    { id: 'payments', label: 'Uplate', icon: CreditCard, color: '#FFD700' },
  ];

  const stats = [
    { label: 'Ukupno kurseva', value: statsData.totalCourses, icon: LayoutDashboard, color: '#BFECC9' },
    { label: 'Aktivnih učenika', value: statsData.activeStudents, icon: Users, color: '#42A5F5' },
    { label: 'Na čekanju uplate', value: statsData.pendingPayments, icon: CreditCard, color: '#FFD700' },
    { label: 'Mesečni prihod', value: formatPrice(statsData.monthlyRevenue), icon: TrendingUp, color: '#FF6B35' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      {/* Admin Hero */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
                Admin Panel
              </h1>
              <p className="text-[#BFECC9] text-lg">
                Dobrodošli, {userProfile?.ime || 'Administratore'}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: stat.color }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#003366] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <Card variant="elevated">
          <CardBody className="p-8">
            {activeTab === 'courses' && <CourseManager />}
            {activeTab === 'lessons' && <LessonManager />}
            {activeTab === 'payments' && <PaymentVerifier />}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
