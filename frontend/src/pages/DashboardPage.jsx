import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, FileText, CheckCircle, Clock, AlertCircle, ArrowRight, User, PlayCircle, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserCourses } from '../services/course.service';
import { getUserTransactions } from '../services/payment.service';
import { formatPrice, formatDate, getTransactionStatusLabel } from '../utils/helpers';
import PaymentConfirmationUpload from '../components/payment/PaymentConfirmationUpload';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const { user, userProfile, logout } = useAuthStore();
  const [myCourses, setMyCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [coursesData, transactionsData] = await Promise.all([
        getUserCourses(user.uid),
        getUserTransactions(user.uid),
      ]);
      setMyCourses(coursesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'rejected': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#BFECC9] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* Hero Dashboard */}
      <div className="bg-[#003366] text-white pb-20 pt-12 rounded-b-[3rem] shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                Dobro došli nazad!
              </h1>
              <p className="text-[#BFECC9] text-lg">
                {userProfile?.ime || user.email}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl text-center min-w-[100px]">
                 <div className="text-2xl font-bold">{myCourses.length}</div>
                 <div className="text-xs opacity-70 uppercase tracking-wider">Kurseva</div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Link to="/dashboard" className="bg-[#FF6B35] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:bg-[#E55A28] transition shadow-lg">
               <Book className="w-6 h-6" />
               <span className="font-bold text-sm">Moji Kursevi</span>
            </Link>
            <Link to="/profile" className="bg-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:bg-white/20 transition backdrop-blur-sm">
               <User className="w-6 h-6" />
               <span className="font-bold text-sm">Profil</span>
            </Link>
            <Link to="/dashboard" className="bg-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:bg-white/20 transition backdrop-blur-sm">
               <PlayCircle className="w-6 h-6" />
               <span className="font-bold text-sm">Nastavi Učenje</span>
            </Link>
             <button onClick={logout} className="bg-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:bg-red-500/20 transition backdrop-blur-sm text-red-200 hover:text-red-100">
               <LogOut className="w-6 h-6" />
               <span className="font-bold text-sm">Odjavi se</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20">
        
        {/* My Courses */}
        <div className="mb-12">
           <div className="flex items-center justify-between mb-6 px-2">
             <h2 className="text-2xl font-bold text-[#003366]">Moji Kursevi</h2>
             <Link to="/courses" className="text-sm font-bold text-[#FF6B35] hover:text-[#E55A28]">
               Pogledaj sve kurseve
             </Link>
           </div>

           {myCourses.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center shadow-lg">
                <div className="bg-[#F5F3EF] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nemate aktivnih kurseva</h3>
                <p className="text-gray-500 mb-6">Započnite svoju pripremu danas!</p>
                <Link to="/courses">
                  <Button variant="primary">Istraži Kurseve</Button>
                </Link>
              </div>
           ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {myCourses.map((course) => (
                 <Link key={course.id} to={`/course/${course.id}`}>
                   <div className="bg-white rounded-[2rem] p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer border border-gray-100">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#BFECC9] p-3 rounded-xl group-hover:scale-110 transition-transform">
                          <Book className="w-6 h-6 text-[#003366]" />
                        </div>
                        <span className="bg-[#F5F3EF] px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                          Aktivan
                        </span>
                     </div>
                     <h3 className="text-lg font-bold mb-2 text-[#003366]">{course.title}</h3>
                     <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                       <div className="bg-[#FF6B35] h-full w-[10%]"></div> {/* Progress placeholder */}
                     </div>
                     <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                       <span>Napredak</span>
                       <span>10%</span>
                     </div>
                     <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                       <span className="text-sm font-bold text-[#003366] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                         Otvori Kurs <ArrowRight className="w-4 h-4" />
                       </span>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
           )}
        </div>

        {/* Transactions */}
        <div>
           <h2 className="text-2xl font-bold text-[#003366] mb-6 px-2">Istorija Uplata</h2>
           {transactions.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                 <p className="text-gray-500">Nemate zabeleženih transakcija.</p>
              </div>
           ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4 w-full md:w-auto">
                       <div className={`p-3 rounded-full ${
                         tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                         tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                         'bg-red-100 text-red-600'
                       }`}>
                         {getStatusIcon(tx.status)}
                       </div>
                       <div>
                         <div className="font-bold text-[#003366]">{formatPrice(tx.amount)}</div>
                         <div className="text-xs text-gray-500">{formatDate(tx.created_at)}</div>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                       <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                          tx.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                          'bg-red-50 text-red-700'
                       }`}>
                         {getTransactionStatusLabel(tx.status)}
                       </span>
                       
                       {tx.status === 'pending' && !tx.confirmation_url && (
                         <PaymentConfirmationUpload transactionId={tx.id} onSuccess={loadUserData} />
                       )}
                     </div>
                  </div>
                ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
