import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { Plus, Trash2, Loader2, Upload, Video, FileVideo, CheckCircle, ChevronDown, ChevronRight, Tag, FileText, Book } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function LessonManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadModules(selectedCourse);
    } else {
      setModules([]);
      setSelectedModule(null);
      setLessons([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedModule) {
      loadLessons(selectedModule.id);
    } else {
      setLessons([]);
    }
  }, [selectedModule]);

  const loadCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (courseId) => {
    try {
      const q = query(
        collection(db, 'modules'),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const modulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(modulesData);
      setSelectedModule(null);
    } catch (error) {
      console.error('Error loading modules:', error);
      showToast({ type: 'error', message: 'Грешка при учитавању модула' });
    }
  };

  const loadLessons = async (moduleId) => {
    try {
      const q = query(
        collection(db, 'lessons'),
        where('moduleId', '==', moduleId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showToast({ type: 'warning', message: 'Молимо одаберите видео фајл' });
        return;
      }
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        showToast({ type: 'warning', message: 'Видео фајл је превелик. Максимална величина је 500MB.' });
        return;
      }
      setFormData({ ...formData, videoFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.videoFile || !selectedModule) {
      showToast({ type: 'warning', message: 'Молимо попуните сва поља и одаберите видео' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `videos/${selectedCourse}/${selectedModule.id}/${timestamp}_${formData.videoFile.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, formData.videoFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          showToast({ type: 'error', message: 'Грешка при upload-у видеа' });
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, 'lessons'), {
            courseId: selectedCourse,
            moduleId: selectedModule.id,
            title: formData.title,
            description: formData.description,
            videoUrl: downloadURL,
            videoPath: uploadTask.snapshot.ref.fullPath,
            order: lessons.length + 1,
            duration: 0,
            createdAt: new Date().toISOString(),
          });

          setFormData({
            title: '',
            description: '',
            videoFile: null,
          });
          setShowForm(false);
          setUploading(false);
          setUploadProgress(0);

          loadLessons(selectedModule.id);
          showToast({ type: 'success', message: 'Лекција успешно додата!' });
        }
      );
    } catch (error) {
      console.error('Error creating lesson:', error);
      showToast({ type: 'error', message: 'Грешка при креирању лекције' });
      setUploading(false);
    }
  };

  const handleDelete = async (lessonId, lessonTitle) => {
    if (!confirm(`Да ли сте сигурни да желите да обришете лекцију "${lessonTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      loadLessons(selectedModule.id);
      showToast({ type: 'success', message: 'Лекција обрисана' });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showToast({ type: 'error', message: 'Грешка при брисању лекције' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#D62828]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#1A1A1A]">Управљање лекцијама</h2>

      {/* Course Selector */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <label className="block text-sm font-bold mb-3 text-[#1A1A1A]">Одабери курс</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#D62828] focus:outline-none transition-colors text-[#1A1A1A] font-medium"
        >
          <option value="">-- Изабери курс --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && modules.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-[#1A1A1A]">Модули ({modules.length})</h3>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <div key={module.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setSelectedModule(selectedModule?.id === module.id ? null : module)}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#F7F7F7] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#D62828]/10 p-3 rounded-xl">
                      <Book className="w-5 h-5 text-[#D62828]" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#1A1A1A]">{module.title}</p>
                      <p className="text-sm text-gray-600">{module.lessons?.length || 0} лекција</p>
                    </div>
                  </div>
                  {selectedModule?.id === module.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {selectedModule?.id === module.id && (
                  <div className="p-6 bg-[#F7F7F7] border-t-2 border-gray-200">
                    {/* Add Lesson Button */}
                    {!showForm && (
                      <button
                        onClick={() => {
                          setFormData({ title: '', description: '', videoFile: null });
                          setShowForm(true);
                        }}
                        className="bg-[#D62828] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#B91F1F] transition-colors flex items-center gap-2 mb-6"
                      >
                        <Plus className="w-5 h-5" />
                        Додај лекцију
                      </button>
                    )}

                    {/* Lesson Form */}
                    {showForm && (
                      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
                        <h4 className="text-lg font-bold mb-4 text-[#1A1A1A]">Нова лекција</h4>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Назив лекције</label>
                            <input
                              type="text"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#D62828] focus:outline-none transition-colors"
                              placeholder="нпр. Лекција 1: Увод у граматику"
                              required
                              disabled={uploading}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Опис лекције</label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#D62828] focus:outline-none transition-colors"
                              rows={3}
                              placeholder="Кратак опис лекције..."
                              disabled={uploading}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Видео фајл</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="videoFile"
                              disabled={uploading}
                            />
                            <label
                              htmlFor="videoFile"
                              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer block transition-all ${
                                formData.videoFile
                                  ? 'border-[#D62828] bg-[#D62828]/5'
                                  : 'border-gray-300 hover:border-[#D62828] hover:bg-gray-50'
                              }`}
                            >
                              {formData.videoFile ? (
                                <div className="flex items-center justify-center gap-4">
                                  <FileVideo className="w-8 h-8 text-[#D62828]" />
                                  <div className="text-left">
                                    <p className="font-bold text-[#1A1A1A]">{formData.videoFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="font-medium text-gray-700">Кликните да отпремите видео</p>
                                  <p className="text-xs text-gray-500">MP4, MOV (макс 500MB)</p>
                                </div>
                              )}
                            </label>
                          </div>

                          {uploading && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">Upload у току...</span>
                                <span className="font-bold text-[#D62828]">{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#D62828] h-full rounded-full transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3 pt-4">
                            <button
                              type="submit"
                              disabled={uploading || !formData.videoFile}
                              className="flex-1 bg-[#D62828] text-white py-3 rounded-2xl font-bold hover:bg-[#B91F1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Upload...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-5 h-5" />
                                  Додај лекцију
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowForm(false);
                                setFormData({ title: '', description: '', videoFile: null });
                              }}
                              disabled={uploading}
                              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              Откажи
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Lessons List */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-[#1A1A1A]">Лекције ({lessons.length})</h4>
                      {lessons.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Нема лекција за овај модул</p>
                      ) : (
                        lessons.map((lesson, idx) => (
                          <div
                            key={lesson.id}
                            className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-[#F2C94C]/20 w-10 h-10 rounded-full flex items-center justify-center">
                                <span className="font-bold text-[#1A1A1A]">{idx + 1}</span>
                              </div>
                              <div>
                                <p className="font-bold text-[#1A1A1A]">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(lesson.id, lesson.title)}
                              className="p-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-red-700" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCourse && modules.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Нема модула за овај курс. Прво креирајте модуле у менаџеру курсева.</p>
        </div>
      )}

      {!selectedCourse && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Одаберите курс да бисте управљали лекцијама</p>
        </div>
      )}
    </div>
  );
}
