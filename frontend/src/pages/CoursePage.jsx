import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play, Book, CheckCircle, Lock, ChevronDown, ChevronRight,
  Video, Award, Shield, Star, FileText, ArrowRight
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getCourseById, checkUserAccess, getCourseModulesWithLessons } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import { db } from '../services/firebase';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
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
      console.log('🔵 [CoursePage] Loading course data for ID:', id);

      const courseData = await getCourseById(id);
      console.log('✅ [CoursePage] Course loaded:', courseData);
      setCourse(courseData);

      // Check if user has access
      if (user) {
        console.log('🔵 [CoursePage] Checking access for user:', user.uid);
        const access = await checkUserAccess(user.uid, id);
        console.log('✅ [CoursePage] Access check result:', access);
        setHasAccess(access);

        // Load modules and lessons if user has access
        if (access) {
          console.log('🔵 [CoursePage] User has access, loading modules...');
          const modulesData = await getCourseModulesWithLessons(id);
          console.log('✅ [CoursePage] Modules loaded:', modulesData);
          console.log('📊 [CoursePage] Total modules:', modulesData.length);

          if (modulesData.length === 0) {
            console.warn('⚠️ [CoursePage] No modules found for this course!');
          } else {
            modulesData.forEach((module, idx) => {
              console.log(`  📦 Module ${idx + 1}:`, module.title, `(${module.lessons.length} lessons)`);
            });
          }

          setModules(modulesData);

          // Auto-select first lesson
          if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
            console.log('🔵 [CoursePage] Setting current lesson to first lesson');
            setSelectedLesson(modulesData[0].lessons[0]);
          }
        } else {
          console.log('⚠️ [CoursePage] User does NOT have access to this course');
        }
      } else {
        console.log('⚠️ [CoursePage] No user logged in');
      }
    } catch (error) {
      console.error('❌ [CoursePage] Error loading course data:', error);
      console.error('❌ [CoursePage] Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique payment reference
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
      // Check if transaction already exists for this user + course
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('courseId', '==', id)
      );
      const existingTransactions = await getDocs(q);

      let paymentRef;

      if (!existingTransactions.empty) {
        // Use existing payment reference
        const existingTransaction = existingTransactions.docs[0].data();
        paymentRef = existingTransaction.payment_ref;
        console.log('🔵 [CoursePage] Using existing payment ref:', paymentRef);
      } else {
        // Create new transaction with unique payment reference
        paymentRef = generatePaymentRef(user.uid, id);
        console.log('🔵 [CoursePage] Creating new transaction with ref:', paymentRef);

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
      console.error('❌ [CoursePage] Error creating transaction:', error);
      alert('Грешка при креирању трансакције. Покушајте поново.');
    }
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Курс није пронађен</h2>
          <Link to="/courses" className="text-[#D62828] hover:underline mt-4 block">
            Назад на курсеве
          </Link>
        </div>
      </div>
    );
  }

  // If user has access, show the learning interface
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] font-sans text-[#1A1A1A]">
        <Header />

        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            {/* Left Sidebar - Modules and Lessons */}
            <div className="lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 overflow-y-auto">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-[#1A1A1A]">{course.title}</h2>
                <p className="text-sm text-gray-600 mb-6">
                  {modules.length} {modules.length === 1 ? 'модул' : 'модула'}
                </p>

                <div className="space-y-2">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setActiveModuleIndex(activeModuleIndex === moduleIndex ? -1 : moduleIndex)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#F7F7F7] transition text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activeModuleIndex === moduleIndex ? 'bg-[#D62828] text-white' : 'bg-[#F7F7F7] text-gray-600'
                          }`}>
                            <Book className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">{module.title}</p>
                            <p className="text-xs text-gray-500">{module.lessons?.length || 0} лекција</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition ${activeModuleIndex === moduleIndex ? 'rotate-180' : ''}`} />
                      </button>

                      {activeModuleIndex === moduleIndex && (
                        <div className="ml-11 mt-2 space-y-1">
                          {module.lessons?.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-[#D62828]/10 text-[#D62828]'
                                  : 'hover:bg-[#F7F7F7] text-gray-700'
                              }`}
                            >
                              <Play className={`w-3 h-3 ${selectedLesson?.id === lesson.id ? 'fill-[#D62828]' : ''}`} />
                              <span className="text-sm font-medium truncate">{lesson.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Video Player */}
            <div className="space-y-6">
              {selectedLesson ? (
                <>
                  {/* Video Player */}
                  <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-lg aspect-video">
                    {selectedLesson.videoUrl ? (
                      <video
                        key={selectedLesson.id}
                        controls
                        className="w-full h-full"
                        src={selectedLesson.videoUrl}
                      >
                        Ваш претраживач не подржава видео.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Видео није доступан</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold mb-4 text-[#1A1A1A]">{selectedLesson.title}</h1>
                    {selectedLesson.description && (
                      <p className="text-gray-600 leading-relaxed">{selectedLesson.description}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="bg-[#F7F7F7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[#1A1A1A]">Одаберите лекцију</h3>
                  <p className="text-gray-500">Изаберите лекцију из левог менија да бисте започели учење</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user doesn't have access, show the purchase page
  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans text-[#1A1A1A]">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D62828] opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F2C94C] opacity-10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#F2C94C] text-[#1A1A1A] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                <Star className="w-4 h-4 fill-[#1A1A1A]" /> Најпопуларнији курс
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">{course.title}</h1>
              <p className="text-xl text-white/80 leading-relaxed">{course.description}</p>

              <div className="flex items-end gap-6">
                <div className="text-5xl font-bold text-white">{formatPrice(course.price)}</div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handlePurchaseClick}
                  className="bg-[#D62828] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#B91F1F] transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3"
                >
                  {user ? 'Купи Овај Курс' : 'Пријави се и Купи'} <ArrowRight className="w-6 h-6" />
                </button>
                <div className="mt-4 flex items-center gap-6 text-sm text-white/60 font-medium">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F2C94C]" /> Једнократно плаћање
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#F2C94C]" /> 7 дана гаранција
                  </span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <div className="bg-white rounded-[3rem] p-4 shadow-2xl">
                  <div className="bg-[#F7F7F7] rounded-[2.5rem] overflow-hidden h-[500px] flex items-center justify-center">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl mb-6">
                          <Play className="w-12 h-12 text-[#D62828] fill-[#D62828] ml-2" />
                        </div>
                        <div className="bg-white px-6 py-3 rounded-2xl inline-block shadow-lg">
                          <span className="font-bold text-[#1A1A1A]">Преглед Курса</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 -mt-20 relative z-20">
        <div className="bg-[#1A1A1A] text-white rounded-[3rem] p-10 shadow-xl">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Award className="text-[#F2C94C]" /> Шта добијате?
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              'Неограничен приступ 24/7',
              'Сертификат по завршетку',
              'Видео материјали HD квалитета',
              'PDF материјали за учење',
              'Подршка професорке',
              'Приступ заједници'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 font-medium">
                <div className="bg-[#F2C94C] rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-[#1A1A1A]" />
                </div>
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={handlePurchaseClick}
              className="bg-[#D62828] text-white px-10 py-4 rounded-full font-bold hover:bg-[#B91F1F] transition shadow-lg"
            >
              {user ? 'Купи Курс' : 'Пријави се'}
            </button>
          </div>
        </div>
      </div>

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
