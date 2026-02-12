import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play, Book, CheckCircle, Lock, ChevronDown,
  Video, ArrowRight, FileText, Download
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getCourseById, checkUserAccess, getCourseModulesWithLessons } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';
import { formatPrice } from '../utils/helpers';
import { db, functions } from '../services/firebase';
import Header from '../components/ui/Header';
import AuthRequiredModal from '../components/ui/AuthRequiredModal';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [id, user]);

  const loadCourseData = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      // Always load modules and lessons (for preview and access)
      const modulesData = await getCourseModulesWithLessons(id);
      setModules(modulesData);

      // Set first lesson as selected
      if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
        setSelectedLesson(modulesData[0].lessons[0]);
      }

      // Check access if user is logged in
      if (user) {
        const access = await checkUserAccess(user.uid, id);
        setHasAccess(access);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setPurchasing(true);
    try {
      // Check if user already has a pending transaction for this course
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('courseId', '==', id),
        where('status', '==', 'pending')
      );
      const existingTransactions = await getDocs(q);

      let paymentRef;

      if (!existingTransactions.empty) {
        // Use existing payment reference
        const existingTransaction = existingTransactions.docs[0].data();
        paymentRef = existingTransaction.payment_ref;
      } else {
        // Generate new payment reference using Cloud Function
        const generatePaymentRefFunction = httpsCallable(functions, 'generatePaymentReference');
        const result = await generatePaymentRefFunction();
        paymentRef = result.data.paymentReference;

        // Create new transaction
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

      // Navigate to payment slip page with payment data
      navigate('/uplatnica', {
        state: {
          paymentData: {
            amount: course.price,
            courseName: course.title,
            paymentReference: paymentRef,
            userName: userProfile?.ime || '',
          }
        }
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Грешка при креирању трансакције. Покушајте поново.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleLessonSelect = (lesson, moduleIndex, lessonIndex) => {
    // Check if lesson is locked
    const isFirstLesson = moduleIndex === 0 && lessonIndex === 0;
    const isLocked = !hasAccess && !isFirstLesson;

    if (!isLocked) {
      setSelectedLesson(lesson);
    }
  };

  const renderMainContent = () => {
    // If lesson is selected
    if (selectedLesson) {
      // Find module and lesson index to determine if locked
      let moduleIndex = -1;
      let lessonIndex = -1;

      for (let i = 0; i < modules.length; i++) {
        const foundIndex = modules[i].lessons?.findIndex(l => l.id === selectedLesson.id);
        if (foundIndex !== -1) {
          moduleIndex = i;
          lessonIndex = foundIndex;
          break;
        }
      }

      const isFirstLesson = moduleIndex === 0 && lessonIndex === 0;
      const isLocked = !hasAccess && !isFirstLesson;

      if (isLocked) {
        // Show CTA instead of video
        return (
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl aspect-video flex items-center justify-center relative overflow-hidden">
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/10 to-[#B91F1F]/10 backdrop-blur-md"></div>

            {/* Lock icon */}
            <div className="relative z-10 text-center px-8">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Lock className="w-12 h-12 text-[#D62828]" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[#1A1A1A]">Откључајте све лекције</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Купите курс да бисте добили приступ свим видео лекцијама, материјалима и квизовима
              </p>
              <button
                onClick={handlePurchaseClick}
                disabled={purchasing}
                className="bg-[#D62828] text-white px-12 py-5 rounded-full font-bold hover:bg-[#B91F1F] transition-all shadow-xl hover:scale-105 inline-flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {purchasing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Учитавање...
                  </>
                ) : (
                  <>
                    Купи курс за {formatPrice(course.price)}
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      }

      // Show video if has access or is first lesson
      return (
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
                <Video className="w-20 h-20 opacity-30" />
              </div>
            )}
          </div>

          {/* Lesson Details + Materials */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-4 text-[#1A1A1A]">{selectedLesson.title}</h2>
            {selectedLesson.description && (
              <p className="text-gray-600 text-lg mb-6">{selectedLesson.description}</p>
            )}

            {/* Materials Section */}
            {selectedLesson.materials && selectedLesson.materials.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1A1A1A]">
                  <Download className="w-5 h-5 text-[#D62828]" />
                  Материјали за преузимање
                </h3>
                <div className="grid gap-3">
                  {selectedLesson.materials.map((material, idx) => (
                    <a
                      key={idx}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={material.name}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group text-left w-full"
                    >
                      <div className="w-12 h-12 bg-[#D62828] rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1A1A1A] truncate">{material.name}</p>
                        <p className="text-sm text-gray-500">{material.type} • {(material.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-[#D62828] transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    // If no lesson is selected
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-16 text-center border border-gray-100 aspect-video flex items-center justify-center">
        <div>
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Play className="w-12 h-12 text-[#D62828]" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">Започните учење</h3>
          <p className="text-gray-600 text-lg">Изаберите лекцију из менија да бисте почели</p>
        </div>
      </div>
    );
  };

  const renderLessonsList = () => {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Садржај курса</h3>
          <p className="text-sm text-gray-600">
            {modules.length} области • {
              modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
            } лекција
          </p>
          {!hasAccess && (
            <div className="mt-3 p-3 bg-[#FFF5F5] border border-[#D62828]/20 rounded-xl text-sm text-gray-700">
              <Lock className="w-4 h-4 inline mr-2 text-[#D62828]" />
              Само прва лекција је доступна без плаћања
            </div>
          )}
        </div>

        {/* Module list */}
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
                <ChevronDown className={`w-5 h-5 text-gray-400 transition ${activeModuleIndex === moduleIndex ? 'rotate-180' : ''}`} />
              </button>

              {/* Lessons list */}
              {activeModuleIndex === moduleIndex && module.lessons && (
                <div className="mt-2 ml-4 space-y-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isFirstLesson = moduleIndex === 0 && lessonIndex === 0;
                    const isLocked = !hasAccess && !isFirstLesson;

                    return (
                      <div key={lesson.id} className="relative">
                        <button
                          onClick={() => handleLessonSelect(lesson, moduleIndex, lessonIndex)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                            selectedLesson?.id === lesson.id
                              ? 'bg-[#D62828] text-white'
                              : isLocked
                              ? 'bg-gray-50 text-gray-400 cursor-pointer opacity-60 hover:opacity-80'
                              : 'hover:bg-gray-50 text-gray-700 border border-gray-100 bg-white'
                          }`}
                          title={isLocked ? 'Откључајте све лекције куповином курса' : ''}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedLesson?.id === lesson.id
                              ? 'bg-white/20'
                              : isLocked
                              ? 'bg-gray-200'
                              : 'bg-gray-100'
                          }`}>
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Play className={`w-4 h-4 ${
                                selectedLesson?.id === lesson.id
                                  ? 'text-white fill-white'
                                  : 'text-[#D62828] fill-[#D62828]'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{lesson.title}</span>
                            <span className={`text-xs ${
                              selectedLesson?.id === lesson.id ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              Лекција {lessonIndex + 1}
                              {isFirstLesson && !hasAccess && ' • БЕСПЛАТНО'}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA at bottom of sidebar (only if no access) */}
        {!hasAccess && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-2xl p-6 text-white text-center">
              <h4 className="font-bold text-lg mb-2">Откључајте све лекције</h4>
              <p className="text-sm text-white/90 mb-4">Приступите комплетном курсу</p>
              <button
                onClick={handlePurchaseClick}
                disabled={purchasing}
                className="w-full bg-white text-[#D62828] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#D62828] border-t-transparent rounded-full animate-spin"></div>
                    Учитавање...
                  </>
                ) : (
                  <>Купи за {formatPrice(course.price)}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
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

  // SEO schema za Course
  const courseJsonLd = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description || `Online видео курс ${course.title} за припрему мале матуре из српског језика`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу",
      "url": "https://srpskiusrcu.rs"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": "PT10H"
    }
  } : null;

  // Unified Course Page
  return (
    <>
      {course && (
        <SEO
          title={`${course.title} | Online Курс`}
          description={course.description || `Online видео курс ${course.title} за припрему мале матуре из српског језика. Интерактивне лекције, тестови, материјали за преузимање.`}
          canonical={`/course/${course.id}`}
          jsonLd={courseJsonLd ? [courseJsonLd] : []}
        />
      )}

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={`Молимо вас да се пријавите или направите налог како бисте купили курс "${course?.title}".`}
      />

    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Course Header with Thumbnail */}
        <div className="mb-8">
          <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
            {/* Thumbnail */}
            <div className="relative lg:ml-[25%]">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-auto rounded-3xl shadow-lg"
                  loading="lazy"
                />
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                  <div className="w-full h-[300px] bg-gray-50 flex items-center justify-center">
                    <Book className="w-20 h-20 text-gray-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A]">{course.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>

              {/* Price and CTA */}
              {!hasAccess && (
                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Цена курса:</div>
                    <div className="text-4xl font-black text-[#D62828]">
                      {formatPrice(course.price)}
                    </div>
                  </div>
                  <button
                    onClick={handlePurchaseClick}
                    disabled={purchasing}
                    className="bg-[#D62828] text-white px-8 py-4 rounded-full font-bold hover:bg-[#B91F1F] transition-all shadow-lg hover:scale-105 inline-flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {purchasing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Учитавање...
                      </>
                    ) : (
                      <>
                        Купи курс сада
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Course Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Book className="w-5 h-5 text-[#D62828]" />
                  <span>{modules.length} области</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Play className="w-5 h-5 text-[#D62828]" />
                  <span>{modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} лекција</span>
                </div>
                {!hasAccess && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-[#D62828]" />
                    <span>Прва лекција бесплатно</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left = Video/CTA, Right = Lessons List */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* LEFT SIDE - Video Player or CTA */}
          <div className="space-y-6">
            {renderMainContent()}
          </div>

          {/* RIGHT SIDE - Lessons List (sidebar) */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]">
            {renderLessonsList()}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
