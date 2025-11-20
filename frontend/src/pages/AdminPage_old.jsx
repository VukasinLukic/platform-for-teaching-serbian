import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, LogOut, LayoutDashboard, Video, CreditCard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CourseManager from '../components/admin/CourseManager';
import LessonManager from '../components/admin/LessonManager';
import PaymentVerifier from '../components/admin/PaymentVerifier';

export default function AdminPage() {
  const { userProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('courses');

  const tabs = [
    { id: 'courses', label: 'Kursevi', icon: LayoutDashboard },
    { id: 'lessons', label: 'Lekcije', icon: Video },
    { id: 'payments', label: 'Uplate', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Book className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-gradient">Nauči Srpski</span>
                <span className="block text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{userProfile?.ime}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <button
                onClick={logout}
                className="btn-secondary py-2 px-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Odjavi se
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20">
        <div className="container-custom">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-black mb-4">
              Dobrodošli, <span className="text-gradient">{userProfile?.ime}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Upravljajte kursevima, lekcijama i verifikujte uplate
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-black shadow-lg shadow-primary/30'
                      : 'bg-card border border-border hover:border-primary/40'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="glass-card rounded-3xl p-8">
            {activeTab === 'courses' && <CourseManager />}
            {activeTab === 'lessons' && <LessonManager />}
            {activeTab === 'payments' && <PaymentVerifier />}
          </div>
        </div>
      </div>
    </div>
  );
}
