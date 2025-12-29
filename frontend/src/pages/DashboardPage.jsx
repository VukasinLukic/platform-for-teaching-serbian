import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, CheckCircle, Clock, AlertCircle, PlayCircle, Upload, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserCourses, getAllCourses } from '../services/course.service';
import { getUserTransactions } from '../services/payment.service';
import { formatPrice, formatDate, getTransactionStatusLabel } from '../utils/helpers';
import PaymentConfirmationUpload from '../components/payment/PaymentConfirmationUpload';
import Header from '../components/ui/Header';
import Modal from '../components/ui/Modal';
import OnlineClassesSection from '../components/dashboard/OnlineClassesSection';

export default function DashboardPage() {
  const { user, userProfile, logout } = useAuthStore();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [coursesData, transactionsData, allCoursesData] = await Promise.all([
        getUserCourses(user.uid),
        getUserTransactions(user.uid),
        getAllCourses(),
      ]);
      setMyCourses(coursesData);
      setTransactions(transactionsData);
      setAllCourses(allCoursesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = (transaction) => {
    setSelectedTransaction(transaction);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    setSelectedTransaction(null);
    loadUserData(); // Reload data to show updated status
  };



  // Get courses that user can purchase (not enrolled and no pending transaction)
  const availableForPurchase = allCourses.filter(course => {
    const isEnrolled = myCourses.some(c => c.id === course.id);
    const hasPendingTransaction = transactions.some(t =>
      (t.courseId === course.id || t.course_id === course.id) && t.status === 'pending'
    );
    // Only show courses that are not enrolled AND don't have pending transactions
    return !isEnrolled && !hasPendingTransaction;
  });

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-3 text-[#1A1A1A]">
            Добродошли, {userProfile?.ime?.split(' ')[0] || 'Ученик'}!
          </h1>
          <p className="text-gray-600 text-xl">Наставите тамо где сте стали или истражите нове курсеве</p>
        </div>

        {/* Available Courses Section - FIRST */}
        {availableForPurchase.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A]">Доступни Курсеви</h2>
              <Link to="/courses" className="text-[#D62828] hover:text-[#B91F1F] font-medium flex items-center gap-2">
                Види све <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableForPurchase.map((course) => (
                <div key={course.id} className="group bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl hover:border-[#D62828]/20 transition-all hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Book className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#1A1A1A] group-hover:text-[#D62828] transition-colors">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-[#D62828]">{formatPrice(course.price)}</span>
                    <span className="text-sm text-gray-500">једнократно</span>
                  </div>
                  <Link to={`/course/${course.id}`}>
                    <button className="w-full bg-[#D62828] text-white py-3 rounded-2xl font-bold hover:bg-[#B91F1F] transition-all hover:scale-105 transform flex items-center justify-center gap-2">
                      Погледај Курс <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses Section - SECOND */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-[#1A1A1A]">Моји Курсеви</h2>

          {myCourses.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-16 text-center border border-gray-100">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Book className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">Још увек немате курсеве</h3>
              <p className="text-gray-600 mb-8 text-lg">Изаберите курс и започните своје учење данас</p>
              <Link to="/courses">
                <button className="bg-[#D62828] text-white px-8 py-4 rounded-full font-bold hover:bg-[#B91F1F] transition-all hover:scale-105 transform flex items-center gap-2 mx-auto">
                  Погледај Курсеве <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <Link key={course.id} to={`/course/${course.id}`}>
                  <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#D62828]/20 transition-all hover:-translate-y-1 h-full">
                    {/* Thumbnail or gradient background */}
                    <div className="h-40 bg-gradient-to-br from-[#D62828] to-[#B91F1F] flex items-center justify-center relative overflow-hidden">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <Book className="w-16 h-16 text-white opacity-30" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-3 text-[#1A1A1A] group-hover:text-[#D62828] transition-colors">{course.title}</h3>

                      <div className="flex items-center gap-2 text-[#D62828] font-bold text-sm mb-4">
                        <PlayCircle className="w-5 h-5" />
                        <span>Настави учење</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Online Classes Section */}
        <div className="mb-16">
          <OnlineClassesSection />
        </div>

        {/* Transactions Section */}
        {transactions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-[#1A1A1A]">Трансакције</h2>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Курс</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Износ</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Статус</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Датум</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Акција</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-5 font-semibold text-[#1A1A1A]">{transaction.courseName || transaction.packageName || transaction.course?.title || 'Непознат курс'}</td>
                        <td className="px-6 py-5 font-bold text-[#D62828] text-lg">{formatPrice(transaction.amount)}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                            transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusIcon(transaction.status)}
                            {getTransactionStatusLabel(transaction.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">{formatDate(transaction.createdAt)}</td>
                        <td className="px-6 py-5">
                          {transaction.status === 'pending' && !transaction.confirmationUrl && (
                            <button
                              onClick={() => handleOpenUploadModal(transaction)}
                              className="flex items-center gap-2 bg-[#D62828] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B91F1F] transition-all hover:scale-105 transform text-sm"
                            >
                              <Upload className="w-4 h-4" />
                              Отпреми потврду
                            </button>
                          )}
                          {transaction.confirmationUrl && (
                            <span className="text-sm text-green-600 font-medium">✓ Потврда послата</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  {/* Course Name */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">Курс</div>
                    <div className="font-bold text-[#1A1A1A] text-base">
                      {transaction.courseName || transaction.packageName || transaction.course?.title || 'Непознат курс'}
                    </div>
                  </div>

                  {/* Amount and Status Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Износ</div>
                      <div className="font-black text-[#D62828] text-xl">{formatPrice(transaction.amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Статус</div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusIcon(transaction.status)}
                        {getTransactionStatusLabel(transaction.status)}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">Датум</div>
                    <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                  </div>

                  {/* Action Button */}
                  {transaction.status === 'pending' && !transaction.confirmationUrl && (
                    <button
                      onClick={() => handleOpenUploadModal(transaction)}
                      className="w-full flex items-center justify-center gap-2 bg-[#D62828] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Отпреми потврду
                    </button>
                  )}
                  {transaction.confirmationUrl && (
                    <div className="text-center text-sm text-green-600 font-bold py-2">✓ Потврда послата</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={`Потврда уплате - ${selectedTransaction?.courseName || ''}`}
      >
        {selectedTransaction && (
          <PaymentConfirmationUpload
            transactionId={selectedTransaction.id}
            onSuccess={handleUploadSuccess}
          />
        )}
      </Modal>
    </div>
  );
}
