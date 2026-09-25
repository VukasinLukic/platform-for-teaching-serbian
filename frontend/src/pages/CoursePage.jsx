import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play, Book, CheckCircle, Lock, ChevronDown,
  Video, ArrowRight, FileText, Download, Loader2
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { getCourseById, checkUserAccess, getCourseModulesWithLessons } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import SEO from '../components/SEO';
import { formatPrice } from '../utils/helpers';
import { functions, functionsEU } from '../services/firebase';
import Header from '../components/ui/Header';
import AuthRequiredModal from '../components/ui/AuthRequiredModal';
import VideoPlayer from '../components/course/VideoPlayer';
import NotFoundPage from './NotFoundPage';
import { resolveCourseIdBySlug } from '../seo/courseSlug';
import { orgRef, teacherRef, breadcrumbSchema, absoluteUrl } from '../seo/site';
import { ensureEmailVerifiedForPurchase } from '../components/auth/verification';
import { purchaseErrorMessage } from '../components/auth/errorMessages';

export default function CoursePage() {
  // /course/:id (legacy, Firestore id) or /kurs/:slug (SEO URL)
  const { id: idParam, slug } = useParams();
  const [id, setId] = useState(idParam || null);
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
  const [downloadingIdx, setDownloadingIdx] = useState(null);

  const handleDownloadMaterial = async (material, idx) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setDownloadingIdx(idx);
    try {
      // Materials are served through short-lived links after an access check
      const getMaterialUrl = httpsCallable(functionsEU, 'getMaterialUrl');
      const result = await getMaterialUrl({ lessonId: selectedLesson.id, index: idx });
      window.location.assign(result.data.url);
    } catch (error) {
      console.error('Download error:', error);
      alert(error.code === 'functions/permission-denied'
        ? 'Материјали су доступни након куповине курса.'
        : 'Грешка при преузимању материјала. Покушајте поново.');
    } finally {
      setDownloadingIdx(null);
    }
  };

  useEffect(() => {
    if (idParam) {
      setId(idParam);
      return;
    }
    let cancelled = false;
    setLoading(true);
    resolveCourseIdBySlug(slug)
      .then((resolved) => {
        if (cancelled) return;
        if (resolved) setId(resolved);
        else {
          setCourse(null);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [idParam, slug]);

  useEffect(() => {
    if (id) loadCourseData();
  }, [id, user]);

  const loadCourseData = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      // Always load modules and lessons (for preview and access)
      const modulesData = await getCourseModulesWithLessons(id);
      setModules(modulesData);

      // Set first lesson as selected (or the lesson from ?lekcija= — "continue where you left off")
      const resumeId = new URLSearchParams(window.location.search).get('lekcija');
      const resumeLesson = resumeId && modulesData.flatMap((m) => m.lessons || []).find((l) => l.id === resumeId);
      if (resumeLesson) {
        setSelectedLesson(resumeLesson);
      } else if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
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
    const verification = await ensureEmailVerifiedForPurchase();
    if (!verification.ok) {
      setPurchasing(false);
      alert(verification.message);
      return;
    }
    try {
      // The transaction (amount, course) is created on the server; an existing
      // pending transaction for this course is reused.
      const createCourseTransaction = httpsCallable(functions, 'createCourseTransaction');
      const result = await createCourseTransaction({ courseId: id });
      const paymentRef = result.data.paymentReference;

      // Navigate to payment slip page with payment data
      navigate(result.data.transactionId ? `/uplatnica?tx=${encodeURIComponent(result.data.transactionId)}` : '/uplatnica', {
        state: {
          paymentData: {
            amount: result.data.amount,
            courseName: result.data.courseName || course.title,
            paymentReference: paymentRef,
            userName: userProfile?.ime || '',
          }
        }
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(purchaseErrorMessage(error));
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
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-brand-700/10 backdrop-blur-md"></div>

            {/* Lock icon */}
            <div className="relative z-10 text-center px-8">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Lock className="w-12 h-12 text-brand" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-ink">Откључајте све лекције</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Купите курс да бисте добили приступ свим видео лекцијама, материјалима и квизовима
              </p>
              <button
                onClick={handlePurchaseClick}
                disabled={purchasing}
                className="bg-brand text-white px-12 py-5 rounded-full font-bold hover:bg-brand-700 transition-all shadow-xl motion-safe:hover:scale-105 inline-flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
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
          {/* Secure Video Player - uses signed URLs, no direct video access */}
          <div className="bg-ink rounded-3xl overflow-hidden shadow-xl max-w-full">
            {selectedLesson.videoPath || selectedLesson.videoUrl || selectedLesson.video_key ? (
              user ? (
                <VideoPlayer
                  key={selectedLesson.id}
                  lessonId={selectedLesson.id}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-white">
                  <div className="text-center px-8 max-w-md">
                    <Video className="w-16 h-16 opacity-30 mx-auto mb-4" />
                    <p className="text-base md:text-lg mb-6">
                      Први видео можете да погледате бесплатно. Само је потребно да се пријавите.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        to="/login"
                        className="bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand-700 transition-all"
                      >
                        Пријави се
                      </Link>
                      <Link
                        to="/register"
                        className="bg-white text-brand px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-all"
                      >
                        Направи налог
                      </Link>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="aspect-video flex items-center justify-center text-white">
                <Video className="w-20 h-20 opacity-30" />
              </div>
            )}
          </div>

          {/* Lesson Details + Materials */}
          <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-ink">{selectedLesson.title}</h2>
            {selectedLesson.description && (
              <p className="text-gray-600 text-lg mb-6">{selectedLesson.description}</p>
            )}

            {/* Materials Section */}
            {selectedLesson.materials && selectedLesson.materials.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-ink">
                  <Download className="w-5 h-5 text-brand" />
                  Материјали за преузимање
                </h3>
                <div className="grid gap-3">
                  {selectedLesson.materials.map((material, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDownloadMaterial(material, idx)}
                      disabled={downloadingIdx === idx}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group text-left w-full overflow-hidden disabled:opacity-60 disabled:cursor-wait"
                    >
                      <div className="w-12 h-12 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{material.name}</p>
                        <p className="text-sm text-gray-500">{(material.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {downloadingIdx === idx ? (
                        <Loader2 className="w-5 h-5 text-brand animate-spin" />
                      ) : (
                        <Download className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors" />
                      )}
                    </button>
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
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 md:p-16 text-center border border-gray-100 aspect-video flex items-center justify-center">
        <div>
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Play className="w-12 h-12 text-brand" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-ink">Започните учење</h3>
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
          <h3 className="text-xl font-bold text-ink mb-2">Садржај курса</h3>
          <p className="text-sm text-gray-600">
            {modules.length} наслова • {
              modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
            } лекција
          </p>
          {!hasAccess && (
            <div className="mt-3 p-3 bg-brand-50 border border-brand/20 rounded-xl text-sm text-gray-700">
              <Lock className="w-4 h-4 inline mr-2 text-brand" />
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
                    activeModuleIndex === moduleIndex ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Book className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink truncate">{module.title}</p>
                    <p className="text-xs text-gray-500">{module.lessons?.length || 0} лекција</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition ${activeModuleIndex === moduleIndex ? 'rotate-180' : ''}`} />
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
                              ? 'bg-brand text-white'
                              : isLocked
                              ? 'bg-gray-50 text-gray-500 cursor-pointer opacity-60 hover:opacity-80'
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
                                  : 'text-brand fill-brand'
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
            <div className="bg-gradient-to-br from-brand to-brand-700 rounded-2xl p-6 text-white text-center">
              <h4 className="font-bold text-lg mb-2">Откључајте све лекције</h4>
              <p className="text-sm text-white mb-4">Приступите комплетном курсу</p>
              <button
                onClick={handlePurchaseClick}
                disabled={purchasing}
                className="w-full bg-white text-brand px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return <NotFoundPage />;

  // SEO schema za Course
  const coursePath = course.slug ? `/kurs/${course.slug}` : `/course/${course.id}`;
  const courseDescription = course.description || `Онлајн видео курс „${course.title}“ за припрему мале матуре из српског језика.`;
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": courseDescription,
    "url": absoluteUrl(coursePath),
    ...(course.thumbnail_url ? { "image": course.thumbnail_url } : {}),
    "inLanguage": "sr",
    "provider": orgRef(),
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": teacherRef()
    },
    // Price only when present in Firestore (RSD)
    ...(typeof course.price === 'number' && course.price > 0 ? {
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "RSD",
        "category": "Paid",
        "availability": "https://schema.org/InStock",
        "url": absoluteUrl(coursePath)
      }
    } : {})
  };
  const courseBreadcrumb = breadcrumbSchema([
    { name: 'Курсеви', path: '/courses' },
    { name: course.title, path: coursePath },
  ]);

  // Unified Course Page
  return (
    <>
      <SEO
        title={`${course.title} — онлајн курс`}
        description={`${courseDescription}`.slice(0, 155)}
        canonical={coursePath}
        jsonLd={[courseJsonLd, courseBreadcrumb]}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={`Молимо вас да се пријавите или направите налог како бисте купили курс "${course?.title}".`}
      />

    <div className="min-h-screen bg-white font-sans text-ink overflow-x-hidden">
      <Header />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {/* Course Header with Thumbnail */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
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
              <h1 className="text-3xl md:text-5xl font-bold text-ink">{course.title}</h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">{course.description}</p>

              {/* Price and CTA */}
              {!hasAccess && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Цена курса:</div>
                    <div className="text-3xl md:text-4xl font-black text-brand">
                      {formatPrice(course.price)}
                    </div>
                  </div>
                  <button
                    onClick={handlePurchaseClick}
                    disabled={purchasing}
                    className="w-full sm:w-auto bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-brand-700 transition-all shadow-lg motion-safe:hover:scale-105 inline-flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Book className="w-5 h-5 text-brand" />
                  <span>{modules.length} наслова</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Play className="w-5 h-5 text-brand" />
                  <span>{modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} лекција</span>
                </div>
                {!hasAccess && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-5 h-5 text-brand" />
                    <span>Прва лекција бесплатно</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left = Video/CTA, Right = Lessons List */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
          {/* LEFT SIDE - Video Player or CTA */}
          <div className="space-y-6 min-w-0">
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
