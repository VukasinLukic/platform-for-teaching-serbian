import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play, Book, CheckCircle, Lock, ChevronDown, ChevronRight,
  Video, Award, Shield, Star, FileText, ArrowRight, Clock, Users, Download
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getCourseById, checkUserAccess, getCourseModulesWithLessons } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import { db } from '../services/firebase';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import PaymentModal from '../components/payment/PaymentModal';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);

  useEffect(() => {
    loadCourseData();
  }, [id, user]);

  const loadCourseData = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      if (user) {
        const access = await checkUserAccess(user.uid, id);
        setHasAccess(access);

        if (access) {
          const modulesData = await getCourseModulesWithLessons(id);
          setModules(modulesData);

          if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
            setSelectedLesson(modulesData[0].lessons[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentRef = (userId, courseId) => {
    const userPart = userId.substring(0, 6).toUpperCase();
    const coursePart = courseId.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${userPart}-${coursePart}-${timestamp}`;
  };

  const handlePurchaseClick = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/course/${id}` } });
      return;
    }

    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('courseId', '==', id)
      );
      const existingTransactions = await getDocs(q);

      let paymentRef;

      if (!existingTransactions.empty) {
        const existingTransaction = existingTransactions.docs[0].data();
        paymentRef = existingTransaction.payment_ref;
      } else {
        paymentRef = generatePaymentRef(user.uid, id);

        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          user_id: user.uid,
          courseId: id,
          course_id: id,
          courseName: course.title,
          amount: course.price,
          status: 'pending',
          payment_ref: paymentRef,
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }

      setPaymentReference(paymentRef);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Грешка при креирању трансакције. Покушајте поново.');
    }
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Курс није пронађен</h2>
          <Link to="/courses" className="text-[#D62828] hover:underline">
            Назад на курсеве
          </Link>
        </div>
      </div>
    );
  }

  // Learning Interface - When user has access
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
        <Header />

        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            {/* Sidebar - Course Content */}
            <div className="lg:h-[calc(100vh-120px)] lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">{course.title}</h2>
                  <p className="text-sm text-gray-600">
                    {modules.length} {modules.length === 1 ? 'модул' : 'модула'} • {
                      modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
                    } лекција
                  </p>
                </div>

                <div className="space-y-3">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setActiveModuleIndex(activeModuleIndex === moduleIndex ? -1 : moduleIndex)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-gray-50 transition border border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activeModuleIndex === moduleIndex ? 'bg-[#D62828] text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Book className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1A1A1A] truncate">{module.title}</p>
                            <p className="text-xs text-gray-500">{module.lessons?.length || 0} лекција</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition flex-shrink-0 ${activeModuleIndex === moduleIndex ? 'rotate-180' : ''}`} />
                      </button>

                      {activeModuleIndex === moduleIndex && module.lessons && (
                        <div className="mt-2 ml-4 space-y-1">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-[#D62828] text-white'
                                  : 'hover:bg-gray-50 text-gray-700 border border-gray-100 bg-white'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selectedLesson?.id === lesson.id ? 'bg-white/20' : 'bg-gray-100'
                              }`}>
                                <Play className={`w-4 h-4 ${selectedLesson?.id === lesson.id ? 'text-white fill-white' : 'text-[#D62828] fill-[#D62828]'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium block truncate">{lesson.title}</span>
                                <span className={`text-xs ${selectedLesson?.id === lesson.id ? 'text-white/70' : 'text-gray-500'}`}>
                                  Лекција {lessonIndex + 1}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {selectedLesson ? (
                <>
                  {/* Video Player */}
                  <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-xl aspect-video">
                    {selectedLesson.videoUrl ? (
                      <video
                        key={selectedLesson.id}
                        controls
                        className="w-full h-full"
                        src={selectedLesson.videoUrl}
                        controlsList="nodownload"
                      >
                        Ваш претраживач не подржава видео.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <Video className="w-20 h-20 mx-auto mb-4 opacity-30" />
                          <p className="text-lg opacity-70">Видео тренутно није доступан</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lesson Details */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold mb-4 text-[#1A1A1A]">{selectedLesson.title}</h1>
                    {selectedLesson.description && (
                      <p className="text-gray-600 text-lg leading-relaxed">{selectedLesson.description}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-16 text-center border border-gray-100">
                  <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Play className="w-12 h-12 text-[#D62828]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">Започните учење</h3>
                  <p className="text-gray-600 text-lg">Изаберите лекцију из менија да бисте почели</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Purchase Page
  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* Hero Section - Red Background */}
      <section className="pt-24 pb-20 px-6 bg-gradient-to-br from-[#D62828] to-[#B91F1F] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Course Info */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                <Star className="w-4 h-4 fill-white" /> Препоручено
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                {course.title}
              </h1>

              <p className="text-xl text-white/90 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-5xl font-bold text-white">{formatPrice(course.price)}</div>
                  <div className="text-sm text-white/70 mt-1">Једнократна уплата</div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handlePurchaseClick}
                  className="bg-white text-[#D62828] px-12 py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105 transform flex items-center gap-3"
                >
                  {user ? 'Купи курс сада' : 'Пријави се и купи'}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="font-medium">Трајан приступ</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="font-medium">7 дана гаранција</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="font-medium">Сертификат</span>
                </div>
              </div>
            </div>

            {/* Right - Course Thumbnail */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-[500px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-white/5 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Book className="w-32 h-32 mx-auto mb-6 opacity-30" />
                      <p className="text-2xl font-bold opacity-50">Курс</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#D62828] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D62828] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Шта добијате у курсу?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Комплетан пакет за успешно учење српског језика</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Video, title: 'HD видео лекције', desc: 'Квалитетни видео материјали у HD резолуцији', gradient: 'from-[#D62828] to-[#B91F1F]' },
              { icon: Download, title: 'PDF материјали', desc: 'Преузмите и учите офлајн било када', gradient: 'from-[#1A1A1A] to-gray-800' },
              { icon: Clock, title: 'Трајан приступ', desc: '24/7 приступ свим материјалима', gradient: 'from-[#D62828] to-[#B91F1F]' },
              { icon: Award, title: 'Сертификат', desc: 'Званични сертификат по завршетку', gradient: 'from-[#1A1A1A] to-gray-800' },
              { icon: Users, title: 'Подршка професорке', desc: 'Директна помоћ и одговори на питања', gradient: 'from-[#D62828] to-[#B91F1F]' },
              { icon: Shield, title: '7 дана гаранција', desc: 'Повраћај новца без питања', gradient: 'from-[#1A1A1A] to-gray-800' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="group bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-2xl hover:border-[#D62828]/20 transition-all hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>

                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#D62828] transition-colors">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-[#1A1A1A] to-gray-800 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D62828] opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-4">Спремни да почнете?</h3>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Придружите се стотинама задовољних ученика који су већ уписали курс
              </p>
              <button
                onClick={handlePurchaseClick}
                className="bg-[#D62828] text-white px-12 py-5 rounded-full text-lg font-bold hover:bg-[#B91F1F] transition-all shadow-2xl hover:scale-105 transform inline-flex items-center gap-3"
              >
                {user ? 'Купи курс сада' : 'Пријави се и купи'}
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          course={course}
          paymentReference={paymentReference}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
