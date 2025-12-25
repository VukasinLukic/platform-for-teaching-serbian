import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, FileText, CheckCircle, Clock, AlertCircle, User, PlayCircle, LogOut, Star, TrendingUp, Upload } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { getUserCourses, getAllCourses } from '../services/course.service';
import { getUserTransactions, generateInvoice } from '../services/payment.service';
import { formatPrice, formatDate, getTransactionStatusLabel } from '../utils/helpers';
import PaymentConfirmationUpload from '../components/payment/PaymentConfirmationUpload';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { db } from '../services/firebase';

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

  // Generate payment reference number (unique per user + course)
  const generatePaymentRef = (userId, courseId) => {
    // Create a simple but unique reference based on user ID and course ID
    const userPart = userId.substring(0, 8).toUpperCase();
    const coursePart = courseId.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${userPart}-${coursePart}-${timestamp}`;
  };

  const handlePurchaseCourse = async (courseId, courseData) => {
    try {
      setLoading(true);

      // Check if transaction already exists for this course
      const existingTransaction = transactions.find(t => t.courseId === courseId);
      if (existingTransaction) {
        alert('Већ сте креирали трансакцију за овај курс. Погледајте своје трансакције.');
        return;
      }

      // Create transaction directly in Firestore
      const paymentRef = generatePaymentRef(user.uid, courseId);
      const newTransaction = {
        userId: user.uid,
        courseId: courseId,
        courseName: courseData.title,
        amount: courseData.price,
        status: 'pending',
        payment_ref: paymentRef,
        createdAt: new Date().toISOString(),
        user_id: user.uid,
        course_id: courseId
      };

      // Add to Firestore
      await addDoc(collection(db, 'transactions'), newTransaction);

      alert(`Трансакција креирана! Ваш позив на број: ${paymentRef}\n\nМолимо извршите уплату и отпремите потврду.`);
      loadUserData(); // Reload to show new transaction
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Грешка при креирању трансакције. Покушајте поново.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-[#F7F7F7] font-sans text-[#1A1A1A]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-[#1A1A1A]">
            Добродошли, {userProfile?.ime?.split(' ')[0] || 'Ученик'}!
          </h1>
          <p className="text-gray-600 text-lg">Ево прегледа вашег напретка</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#D62828]/10 p-3 rounded-2xl">
                <Book className="w-6 h-6 text-[#D62828]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{myCourses.length}</div>
            <div className="text-sm text-gray-600">Активни Курсеви</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#F2C94C]/20 p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-[#F2C94C]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">0%</div>
            <div className="text-sm text-gray-600">Просечан Напредак</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">0</div>
            <div className="text-sm text-gray-600">Завршене Лекције</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">0</div>
            <div className="text-sm text-gray-600">Поени</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Моји Курсеви</h2>
              <Link to="/courses" className="text-sm font-medium text-[#D62828] hover:text-[#B91F1F]">
                Прегледај све →
              </Link>
            </div>

            {myCourses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                <div className="bg-[#F7F7F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Немате активних курсева</h3>
                <p className="text-gray-500 mb-6">Започните своју припрему данас!</p>
                <Link to="/courses">
                  <Button variant="primary">Истражи Курсеве</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <Link key={course.id} to={`/course/${course.id}`}>
                    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-[#D62828]/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                            <Book className="w-6 h-6 text-[#D62828]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold mb-1 text-[#1A1A1A]">{course.title}</h3>
                            <p className="text-sm text-gray-600">0 од {course.totalLessons || 20} лекција</p>
                          </div>
                        </div>
                        <span className="bg-[#F2C94C]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#1A1A1A]">
                          Активан
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Напредак</span>
                          <span>0%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#D62828] h-full w-[0%] rounded-full transition-all"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PlayCircle className="w-4 h-4" />
                          <span>Настави учење</span>
                        </div>
                        <span className="text-[#D62828] text-sm font-medium">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Transactions Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Трансакције</h2>

              {transactions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="bg-[#F7F7F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Нема трансакција</h3>
                  <p className="text-gray-500">Још нисте извршили ниједну куповину.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F7F7F7]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Курс</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Износ</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Статус</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Датум</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Акција</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-[#F7F7F7] transition">
                            <td className="px-6 py-4 font-medium text-[#1A1A1A]">{transaction.courseName || transaction.course?.title || 'Непознат курс'}</td>
                            <td className="px-6 py-4 font-bold text-[#1A1A1A]">{formatPrice(transaction.amount)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                                transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {getStatusIcon(transaction.status)}
                                {getTransactionStatusLabel(transaction.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(transaction.createdAt)}</td>
                            <td className="px-6 py-4">
                              {transaction.status === 'pending' && !transaction.confirmationUrl && (
                                <button
                                  onClick={() => handleOpenUploadModal(transaction)}
                                  className="flex items-center gap-2 bg-[#D62828] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#B91F1F] transition text-sm"
                                >
                                  <Upload className="w-4 h-4" />
                                  Отпреми потврду
                                </button>
                              )}
                              {transaction.confirmationUrl && (
                                <span className="text-sm text-gray-600">Потврда послата</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#D62828]/10 p-4 rounded-full">
                  <User className="w-8 h-8 text-[#D62828]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">{userProfile?.ime || 'Корисник'}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/profile" className="block w-full text-center bg-[#F7F7F7] hover:bg-gray-200 text-[#1A1A1A] py-3 rounded-2xl font-medium transition">
                  Уреди Профил
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-center bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-[#1A1A1A] hover:text-red-600 py-3 rounded-2xl font-medium transition"
                >
                  Одјави се
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-3xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-4">Брзе радње</h3>
              <div className="space-y-3">
                <Link to="/courses" className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition backdrop-blur-sm">
                  <Book className="w-5 h-5" />
                  <span className="font-medium">Прегледај курсеве</span>
                </Link>
                <Link to="/contact" className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition backdrop-blur-sm">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Контакт подршка</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Available Courses for Purchase */}
        {availableForPurchase.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Доступни Курсеви</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableForPurchase.map((course) => (
                <div key={course.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="bg-[#D62828]/10 p-4 rounded-2xl w-fit mb-4">
                    <Book className="w-8 h-8 text-[#D62828]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#1A1A1A]">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="text-2xl font-bold text-[#D62828] mb-4">{formatPrice(course.price)}</div>
                  <button
                    onClick={() => handlePurchaseCourse(course.id, course)}
                    className="w-full bg-[#D62828] text-white py-3 rounded-2xl font-bold hover:bg-[#B91F1F] transition"
                  >
                    Купи Курс
                  </button>
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
