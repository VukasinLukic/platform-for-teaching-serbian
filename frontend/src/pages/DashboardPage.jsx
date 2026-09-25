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
import { useOnboarding } from '../context/OnboardingContext';
import EmailVerificationBanner from '../components/auth/EmailVerificationBanner';
import { isEmailVerified } from '../components/auth/verification';
import PaymentStatusTimeline from '../components/dashboard/PaymentStatusTimeline';
import ContinueLearningCard from '../components/dashboard/ContinueLearningCard';
import QuizResultsCard from '../components/dashboard/QuizResultsCard';
import MalaMaturaCountdown, { MALA_MATURA_DATE } from '../components/dashboard/MalaMaturaCountdown';
import EmptyState from '../components/dashboard/EmptyState';
import { getCourseProgress, countCompletedLessons, getQuizResults, toMillis } from '../components/dashboard/progressService';
import { getAvailableQuizzes } from '../services/quiz.service';

const QUIZ_BASE_PATH = '/kvizovi';

export default function DashboardPage() {
  const { user, userProfile, logout } = useAuthStore();
  const { checkAndStartTutorial } = useOnboarding();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [resume, setResume] = useState(null);
  const [quizResults, setQuizResults] = useState({});
  const [quizTitles, setQuizTitles] = useState({});

  useEffect(() => {
    if (user) {
      loadUserData();
    }
    // Reload when the email gets verified (purchased courses become readable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile?.emailVerified]);

  useEffect(() => {
    if (!loading && window.location.hash === '#uplate') {
      document.getElementById('uplate')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      checkAndStartTutorial('dashboard');
    }
  }, [loading, checkAndStartTutorial]);

  const loadUserData = async () => {
    // Each source is loaded independently so one failure (e.g. user_courses is readable
    // only after email verification) does not empty the whole dashboard.
    const verified = isEmailVerified(userProfile, user);
    const [coursesRes, txRes, allRes, quizRes, manifestRes] = await Promise.allSettled([
      verified ? getUserCourses(user.uid) : Promise.resolve([]),
      getUserTransactions(user.uid),
      getAllCourses(),
      getQuizResults(user.uid),
      getAvailableQuizzes(),
    ]);
    const coursesData = coursesRes.status === 'fulfilled' ? coursesRes.value : [];
    const allCoursesData = allRes.status === 'fulfilled' ? allRes.value : [];
    setMyCourses(coursesData);
    setTransactions(txRes.status === 'fulfilled' ? txRes.value : []);
    setAllCourses(allCoursesData);
    setQuizResults(quizRes.status === 'fulfilled' ? quizRes.value : {});
    if (manifestRes.status === 'fulfilled' && Array.isArray(manifestRes.value)) {
      setQuizTitles(Object.fromEntries(manifestRes.value.map((q) => [q.id, q.title])));
    }

    try {
      const progressList = await Promise.all(
        coursesData.map(async (course) => ({ course, progress: await getCourseProgress(user.uid, course.id).catch(() => null) }))
      );
      const latest = progressList
        .filter((p) => p.progress?.lastLessonId)
        .sort((a, b) => toMillis(b.progress.updatedAt) - toMillis(a.progress.updatedAt))[0];
      if (latest) {
        const total = allCoursesData.find((c) => c.id === latest.course.id)?.lessonsCount || 0;
        const done = countCompletedLessons(latest.progress);
        setResume({
          course: latest.course,
          lastLessonId: latest.progress.lastLessonId,
          lastLessonTitle: latest.progress.lastLessonTitle,
          percent: total > 0 ? Math.min(100, Math.round((done / total) * 100)) : null,
        });
      } else {
        setResume(null);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
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

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        {/* Welcome Section */}
        <div className="mb-10 md:mb-16" data-tour="welcome">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-[#1A1A1A]">
            Добро дошли, {userProfile?.ime?.split(' ')[0] || 'Ученик'}!
          </h1>
          <p className="text-gray-600 text-base md:text-xl">Наставите тамо где сте стали или истражите нове курсеве</p>
        </div>

        <EmailVerificationBanner className="mb-8" />

        {(resume || MALA_MATURA_DATE) && (
          <div className={`mb-10 grid gap-6 ${resume && MALA_MATURA_DATE ? 'lg:grid-cols-[2fr,1fr]' : ''}`}>
            {resume && <ContinueLearningCard {...resume} />}
            <MalaMaturaCountdown />
          </div>
        )}

        {transactions.some((t) => t.status === 'pending') && (
          <section id="uplate" className="mb-10 md:mb-16 scroll-mt-24">
            <h2 className="text-xl md:text-3xl font-bold mb-2 text-[#1A1A1A]">Статус уплате</h2>
            <p className="text-gray-600 mb-6">Одобравамо уплате обично у року од 24 часа.</p>
            <PaymentStatusTimeline
              transactions={transactions.filter((t) => t.status === 'pending')}
              onUploadProof={handleOpenUploadModal}
            />
          </section>
        )}

        {/* Available Courses Section - FIRST */}
        {availableForPurchase.length > 0 && (
          <div className="mb-10 md:mb-16" data-tour="available-courses">
            <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
              <h2 className="text-xl md:text-3xl font-bold text-[#1A1A1A]">Доступни курсеви</h2>
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
        <div className="mb-10 md:mb-16" data-tour="my-courses">
          <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 text-[#1A1A1A]">Моји курсеви</h2>

          {myCourses.length === 0 ? (
            <EmptyState
              pose="wave"
              title={isEmailVerified(userProfile, user) ? 'Још увек немаш курсеве' : 'Твоји курсеви ће се појавити овде'}
              text={isEmailVerified(userProfile, user)
                ? 'Изабери курс и почни да учиш данас. Прва лекција сваког курса је бесплатна.'
                : 'Потврди имејл адресу да би видео купљене курсеве и могао да купујеш нове.'}
              action={
                <Link to="/courses" className="inline-flex items-center gap-2 bg-[#D62828] text-white px-6 py-3 rounded-full font-bold hover:bg-[#B91F1F]">
                  Погледај курсеве <ArrowRight className="w-5 h-5" />
                </Link>
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <Link key={course.id} to={`/course/${course.id}`}>
                  <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#D62828]/20 transition-all hover:-translate-y-1 h-full">
                    {/* Thumbnail or gradient background */}
                    <div className="h-40 bg-gradient-to-br from-[#D62828] to-[#B91F1F] flex items-center justify-center relative overflow-hidden">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
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
        <div className="mb-10 md:mb-16">
          <OnlineClassesSection />
        </div>

        {/* Quiz results per topic */}
        <section className="mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 className="text-xl md:text-3xl font-bold text-[#1A1A1A]">Резултати квизова</h2>
            <Link to={QUIZ_BASE_PATH} className="text-[#D62828] hover:text-[#B91F1F] font-medium flex items-center gap-2">
              Сви квизови <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <QuizResultsCard results={quizResults} quizTitles={quizTitles} quizBasePath={QUIZ_BASE_PATH} />
        </section>

        {/* Quizzes Section */}
        {myCourses.length > 0 && (
          <div className="mb-10 md:mb-16" data-tour="quizzes">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-3xl p-6 md:p-12 text-white relative overflow-hidden group">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D62828] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Квизови знања</h2>
                  <p className="text-gray-400 text-base md:text-lg max-w-xl">
                    Тестирајте своје знање кроз интерактивне квизове. Пратите свој напредак и утврдите градиво на забаван начин.
                  </p>
                </div>

                <Link to="/kvizovi" className="w-full md:w-auto">
                  <button className="w-full md:w-auto bg-[#D62828] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#B91F1F] transition-all hover:scale-105 transform flex items-center justify-center gap-2 shadow-lg shadow-red-900/20">
                    <Book className="w-5 h-5" />
                    Погледај Квизове <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Section */}
        {transactions.length > 0 && (
          <div className="mb-10 md:mb-16">
            <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 text-[#1A1A1A]">Историја уплата</h2>

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
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
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
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
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
        title={`Доказ о уплати — ${selectedTransaction?.courseName || selectedTransaction?.packageName || ''}`}
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
