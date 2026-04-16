import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { uploadVideoToR2, deleteVideoFromR2 } from '../../services/cloudflare.service';
import { Plus, Trash2, Loader2, Upload, Video, FileVideo, CheckCircle, ChevronDown, ChevronRight, Tag, FileText, Book, Edit, Paperclip, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';

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
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    videoFile: null,
    materials: [], // { file, name, type, size } or { url, name, type, size } for existing
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
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
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);

      // For each module, count the lessons
      const modulesWithLessonCount = await Promise.all(
        snapshot.docs.map(async (moduleDoc) => {
          const moduleData = { id: moduleDoc.id, ...moduleDoc.data() };

          // Count lessons for this module
          const lessonsQuery = query(
            collection(db, 'lessons'),
            where('moduleId', '==', moduleDoc.id)
          );
          const lessonsSnapshot = await getDocs(lessonsQuery);
          moduleData.lessonCount = lessonsSnapshot.size;

          return moduleData;
        })
      );

      // Sort modules by order field (fallback to createdAt)
      modulesWithLessonCount.sort((a, b) => {
        const orderA = a.order != null ? a.order : 9999;
        const orderB = b.order != null ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
      });

      setModules(modulesWithLessonCount);
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
        where('moduleId', '==', moduleId)
      );
      const snapshot = await getDocs(q);
      const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort lessons by order field (fallback to createdAt)
      lessonsData.sort((a, b) => {
        const orderA = a.order != null ? a.order : 9999;
        const orderB = b.order != null ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
      });

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

  const handleMaterialsChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024; // 50MB per file

    const newMaterials = files.filter(file => {
      if (file.size > maxSize) {
        showToast({ type: 'warning', message: `Фајл "${file.name}" је превелик. Максимална величина је 50MB.` });
        return false;
      }
      return true;
    }).map(file => ({
      file,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size
    }));

    setFormData({
      ...formData,
      materials: [...formData.materials, ...newMaterials]
    });

    // Reset input
    e.target.value = '';
  };

  const removeMaterial = (index) => {
    const newMaterials = formData.materials.filter((_, idx) => idx !== index);
    setFormData({ ...formData, materials: newMaterials });
  };

  const uploadMaterials = async (lessonId) => {
    const uploadedMaterials = [];

    for (const material of formData.materials) {
      if (material.file) {
        // New file to upload
        try {
          const fileName = `course-materials/${selectedCourse}/${lessonId}/${Date.now()}_${material.name}`;
          const storageRef = ref(storage, fileName);
          const metadata = {
            contentDisposition: `attachment; filename="${material.name}"`,
          };
          const uploadTask = await uploadBytesResumable(storageRef, material.file, metadata);
          const downloadURL = await getDownloadURL(uploadTask.ref);

          uploadedMaterials.push({
            name: material.name,
            url: downloadURL,
            type: material.type,
            size: material.size
          });
          console.log('✅ [LessonManager] Material uploaded:', material.name);
        } catch (error) {
          console.error('❌ [LessonManager] Error uploading material:', material.name, error);
          showToast({ type: 'warning', message: `Грешка при upload-у: ${material.name}` });
        }
      } else if (material.url) {
        // Existing material
        uploadedMaterials.push({
          name: material.name,
          url: material.url,
          type: material.type,
          size: material.size
        });
      }
    }

    return uploadedMaterials;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedModule) {
      showToast({ type: 'warning', message: 'Молимо одаберите модул' });
      return;
    }

    // Check if editing existing lesson
    if (editingLesson) {
      // Editing mode - video is optional
      if (!formData.title.trim()) {
        showToast({ type: 'warning', message: 'Молимо унесите назив лекције' });
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        console.log('🔵 [LessonManager] Updating lesson:', editingLesson.id);

        let videoUrl = editingLesson.videoUrl;
        let videoPath = editingLesson.videoPath;

        // If new video file is provided, upload it
        if (formData.videoFile) {
          console.log('🔵 [LessonManager] New video file provided, uploading to Cloudflare R2...');

          // Delete old video from R2 if it exists
          if (editingLesson.videoPath) {
            console.log('🔵 [LessonManager] Deleting old video from R2:', editingLesson.videoPath);
            await deleteVideoFromR2(editingLesson.videoPath);
          }

          // Upload new video to Cloudflare R2
          const result = await uploadVideoToR2(
            formData.videoFile,
            selectedCourse,
            selectedModule.id,
            (progress) => {
              console.log(`📊 [LessonManager] Upload progress: ${progress}%`);
              setUploadProgress(progress);
            }
          );

          videoUrl = result.url;
          videoPath = result.path;

          console.log('✅ [LessonManager] Video uploaded:', videoUrl);
        }

        // Upload materials
        console.log('🔵 [LessonManager] Uploading materials...');
        const uploadedMaterials = await uploadMaterials(editingLesson.id);

        // Update lesson document
        await updateDoc(doc(db, 'lessons', editingLesson.id), {
          title: formData.title,
          description: formData.description,
          order: formData.order,
          videoUrl: videoUrl,
          videoPath: videoPath,
          materials: uploadedMaterials,
          updatedAt: new Date().toISOString(),
        });

        console.log('✅ [LessonManager] Lesson updated successfully');

        setFormData({
          title: '',
          description: '',
          order: 1,
          videoFile: null,
          materials: [],
        });
        setEditingLesson(null);
        setShowForm(false);
        setUploading(false);
        setUploadProgress(0);

        loadLessons(selectedModule.id);
        showToast({ type: 'success', message: 'Лекција успешно ажурирана!' });
      } catch (error) {
        console.error('❌ [LessonManager] Error updating lesson:', error);
        showToast({ type: 'error', message: error.message || 'Грешка при ажурирању лекције' });
        setUploading(false);
      }
    } else {
      // Creating new lesson - video is required
      if (!formData.videoFile || !formData.title.trim()) {
        showToast({ type: 'warning', message: 'Молимо попуните сва поља и одаберите видео' });
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        console.log('🔵 [LessonManager] Creating new lesson...');
        console.log('🔵 [LessonManager] Uploading video to Cloudflare R2...');

        // Upload video to Cloudflare R2
        const result = await uploadVideoToR2(
          formData.videoFile,
          selectedCourse,
          selectedModule.id,
          (progress) => {
            console.log(`📊 [LessonManager] Upload progress: ${progress}%`);
            setUploadProgress(progress);
          }
        );

        console.log('✅ [LessonManager] Video uploaded:', result.url);
        console.log('🔵 [LessonManager] Creating lesson document...');

        // Create lesson document first to get ID for materials
        const lessonDoc = await addDoc(collection(db, 'lessons'), {
          courseId: selectedCourse,
          moduleId: selectedModule.id,
          title: formData.title,
          description: formData.description,
          videoUrl: result.url,
          videoPath: result.path,
          order: formData.order,
          duration: 0,
          materials: [],
          createdAt: new Date().toISOString(),
        });

        // Upload materials if any
        if (formData.materials.length > 0) {
          console.log('🔵 [LessonManager] Uploading materials...');
          const uploadedMaterials = await uploadMaterials(lessonDoc.id);
          await updateDoc(doc(db, 'lessons', lessonDoc.id), {
            materials: uploadedMaterials
          });
        }

        console.log('✅ [LessonManager] Lesson created successfully');

        setFormData({
          title: '',
          description: '',
          order: lessons.length + 2,
          videoFile: null,
          materials: [],
        });
        setShowForm(false);
        setUploading(false);
        setUploadProgress(0);

        loadLessons(selectedModule.id);
        showToast({ type: 'success', message: 'Лекција успешно додата!' });
      } catch (error) {
        console.error('❌ [LessonManager] Error creating lesson:', error);
        showToast({ type: 'error', message: error.message || 'Грешка при креирању лекције' });
        setUploading(false);
      }
    }
  };

  const handleEdit = (lesson) => {
    console.log('🔵 [LessonManager] Editing lesson:', lesson.id);
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      order: lesson.order || 1,
      videoFile: null, // Don't load existing video file
      materials: lesson.materials || [], // Load existing materials
    });
    setShowForm(true);
  };

  const handleDelete = async (lesson) => {
    setConfirmModal({
      isOpen: true,
      title: 'Брисање лекције',
      message: `Да ли сте сигурни да желите да обришете лекцију "${lesson.title}"?`,
      onConfirm: async () => {
        try {
          console.log('🔵 [LessonManager] Deleting lesson:', lesson.id);

          // Delete video from R2 if it exists
          if (lesson.videoPath) {
            console.log('🔵 [LessonManager] Deleting video from R2:', lesson.videoPath);
            await deleteVideoFromR2(lesson.videoPath);
          }

          // Delete lesson document
          await deleteDoc(doc(db, 'lessons', lesson.id));

          console.log('✅ [LessonManager] Lesson deleted successfully');

          loadLessons(selectedModule.id);
          showToast({ type: 'success', message: 'Лекција обрисана' });
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        } catch (error) {
          console.error('❌ [LessonManager] Error deleting lesson:', error);
          showToast({ type: 'error', message: 'Грешка при брисању лекције' });
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      },
    });
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
          <h3 className="text-xl font-bold mb-4 text-[#1A1A1A]">Области ({modules.length})</h3>
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
                      <p className="text-sm text-gray-600">{module.lessonCount || 0} лекција</p>
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
                          setEditingLesson(null);
                          setFormData({ title: '', description: '', order: lessons.length + 1, videoFile: null, materials: [] });
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
                        <h4 className="text-lg font-bold mb-4 text-[#1A1A1A]">
                          {editingLesson ? 'Измени лекцију' : 'Нова лекција'}
                        </h4>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
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
                            <div className="w-28">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Редослед</label>
                              <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#D62828] focus:outline-none transition-colors text-center font-bold"
                                min="1"
                                required
                                disabled={uploading}
                              />
                            </div>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Видео фајл {editingLesson && '(опционо - остави празно да задржиш постојећи)'}
                            </label>
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
                              ) : editingLesson ? (
                                <div>
                                  <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="font-medium text-gray-700">Кликните да промените видео</p>
                                  <p className="text-xs text-gray-500">Тренутни видео ће бити задржан ако не отпремите нови</p>
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

                          {/* Materials Upload Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Paperclip className="w-4 h-4 inline mr-1" />
                              Материјали за лекцију (опционо)
                            </label>
                            <input
                              type="file"
                              multiple
                              onChange={handleMaterialsChange}
                              className="hidden"
                              id="materialsFile"
                              disabled={uploading}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                            />
                            <label
                              htmlFor="materialsFile"
                              className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center cursor-pointer block hover:border-[#D62828] hover:bg-gray-50 transition-all"
                            >
                              <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="font-medium text-gray-700">Кликните да додате материјале</p>
                              <p className="text-xs text-gray-500">PDF, DOC, PPT, XLS, ZIP (макс 50MB по фајлу)</p>
                            </label>

                            {/* Materials List */}
                            {formData.materials.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {formData.materials.map((material, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-[#D62828]/10 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-[#D62828]" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-[#1A1A1A] text-sm">{material.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {(material.size / 1024).toFixed(0)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeMaterial(index)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      disabled={uploading}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
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
                              disabled={uploading || (!editingLesson && !formData.videoFile)}
                              className="flex-1 bg-[#D62828] text-white py-3 rounded-2xl font-bold hover:bg-[#B91F1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  {editingLesson ? 'Ажурирање...' : 'Upload...'}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-5 h-5" />
                                  {editingLesson ? 'Сачувај измене' : 'Додај лекцију'}
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowForm(false);
                                setEditingLesson(null);
                                setFormData({ title: '', description: '', order: 1, videoFile: null, materials: [] });
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
                                <span className="font-bold text-[#1A1A1A]">{lesson.order || idx + 1}</span>
                              </div>
                              <div>
                                <p className="font-bold text-[#1A1A1A]">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(lesson)}
                                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                                title="Измени лекцију"
                              >
                                <Edit className="w-5 h-5 text-blue-700" />
                              </button>
                              <button
                                onClick={() => handleDelete(lesson)}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
                                title="Обриши лекцију"
                              >
                                <Trash2 className="w-5 h-5 text-red-700" />
                              </button>
                            </div>
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        type="danger"
      />
    </div>
  );
}
