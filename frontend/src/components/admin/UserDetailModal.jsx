import { useState, useEffect } from 'react';
import { X, BookOpen, Mail, Phone, Calendar, CheckCircle, XCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatPrice, formatDate } from '../../utils/helpers';
import { showToast } from '../../utils/toast';

export default function UserDetailModal({ user, onClose, onUpdate }) {
  const [courses, setCourses] = useState([]);
  const [userCourses, setUserCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);

      // Load user's courses
      const userCoursesRef = doc(db, 'user_courses', user.id);
      const userCoursesSnap = await getDoc(userCoursesRef);

      if (userCoursesSnap.exists()) {
        setUserCourses(userCoursesSnap.data().courses || {});
      } else {
        setUserCourses({});
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast.error('Грешка при учитавању података');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourseAccess = async (courseId, currentlyHasAccess) => {
    try {
      setProcessing(courseId);

      const userCoursesRef = doc(db, 'user_courses', user.id);
      const userCoursesSnap = await getDoc(userCoursesRef);

      if (currentlyHasAccess) {
        // Remove access
        const updatedCourses = { ...userCourses };
        delete updatedCourses[courseId];

        if (Object.keys(updatedCourses).length === 0) {
          // If no courses left, we keep the document but with empty courses
          await setDoc(userCoursesRef, {
            userId: user.id,
            courses: {}
          });
        } else {
          await updateDoc(userCoursesRef, {
            [`courses.${courseId}`]: null
          });
        }

        setUserCourses(updatedCourses);
        showToast.success('Приступ курсу је уклоњен');
      } else {
        // Add access
        const courseData = {
          active: true,
          purchased_at: new Date(),
          valid_until: null, // Lifetime access
          granted_by_admin: true,
          granted_at: new Date()
        };

        if (userCoursesSnap.exists()) {
          await updateDoc(userCoursesRef, {
            [`courses.${courseId}`]: courseData
          });
        } else {
          await setDoc(userCoursesRef, {
            userId: user.id,
            courses: {
              [courseId]: courseData
            }
          });
        }

        setUserCourses(prev => ({
          ...prev,
          [courseId]: courseData
        }));

        showToast.success('Приступ курсу је додат');
      }

      // Notify parent to refresh
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling course access:', error);
      showToast.error('Грешка при промени приступа');
    } finally {
      setProcessing(null);
    }
  };

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand to-brand-700 text-white p-4 pr-14 sm:p-6 sm:pr-16 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Затвори"
          >
            <X size={20} className="text-white" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
              {user.ime?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{user.ime || 'Без имена'}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-white text-sm">
                <span className="flex items-center gap-1 break-all">
                  <Mail size={14} />
                  {user.email}
                </span>
                {user.telefon && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {user.telefon}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-ink mb-3">Информације о кориснику</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Регистрован:</span>
                <span className="font-semibold text-ink">
                  {user.registrovan_at ? formatDate(new Date(user.registrovan_at)) : 'Непознато'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Број курсева:</span>
                <span className="font-semibold text-ink">
                  {Object.keys(userCourses).length}
                </span>
              </div>
            </div>
          </div>

          {/* Courses Management */}
          <div>
            <h3 className="text-lg font-bold text-ink mb-4">Управљање курсевима</h3>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Нема доступних курсева
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map(course => {
                  const hasAccess = !!userCourses[course.id];
                  const isProcessing = processing === course.id;

                  return (
                    <div
                      key={course.id}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        hasAccess
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-gray-500" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-ink mb-1">{course.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-semibold text-brand">
                                {formatPrice(course.price)}
                              </span>
                              <span className={`px-2 py-1 rounded-full ${
                                course.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {course.status === 'published' ? 'Објављено' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 flex-shrink-0">
                          {hasAccess && (
                            <div className="flex items-center gap-1 text-green-700 text-sm font-semibold px-3 py-1.5 bg-green-100 rounded-lg">
                              <CheckCircle size={16} />
                              <span>Има приступ</span>
                            </div>
                          )}

                          <button
                            onClick={() => handleToggleCourseAccess(course.id, hasAccess)}
                            disabled={isProcessing}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                              hasAccess
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-brand text-white hover:bg-brand-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Обрада...</span>
                              </>
                            ) : hasAccess ? (
                              <>
                                <Trash2 size={16} />
                                <span>Уклони</span>
                              </>
                            ) : (
                              <>
                                <Plus size={16} />
                                <span>Додај</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {hasAccess && userCourses[course.id]?.granted_by_admin && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="text-xs text-green-700 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Приступ додат од стране администратора
                            {userCourses[course.id]?.granted_at && (
                              <span className="ml-1">
                                ({formatDate(userCourses[course.id].granted_at.toDate())})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 sm:rounded-b-2xl" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={onClose}
            className="w-full bg-ink text-white px-6 py-3 rounded-lg font-bold hover:bg-ink-800 transition-colors"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
