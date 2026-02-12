import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, CheckCircle, Tag, FileText, Video, Users, MonitorPlay, Upload, Image, List, Clock, X } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import { useToast } from '../ui/Toast';

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    type: 'video',
    status: 'draft',
    thumbnailFile: null,
    thumbnail_url: '',
    modules: [],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

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

  const handleOpenForm = async (course = null) => {
    if (course) {
      setEditingCourse(course);

      // Load existing modules and lessons from Firestore
      let existingModules = [];
      try {
        console.log('🔵 [CourseManager] Loading modules for editing course:', course.id);

        // Fetch modules
        const modulesQuery = query(
          collection(db, 'modules'),
          where('courseId', '==', course.id)
        );
        const modulesSnapshot = await getDocs(modulesQuery);

        // Process each module
        for (const moduleDoc of modulesSnapshot.docs) {
          const moduleData = moduleDoc.data();

          existingModules.push({
            title: moduleData.title || '',
            order: moduleData.order || 0,
          });
        }

        // Sort modules by order
        existingModules.sort((a, b) => (a.order || 0) - (b.order || 0));

        console.log('✅ [CourseManager] Loaded modules:', existingModules);
      } catch (error) {
        console.error('❌ [CourseManager] Error loading modules:', error);
      }

      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        type: course.type,
        status: course.status,
        thumbnailFile: null,
        thumbnail_url: course.thumbnail_url || '',
        modules: existingModules,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        type: 'video',
        status: 'draft',
        thumbnailFile: null,
        thumbnail_url: '',
        modules: [],
      });
    }
    setShowForm(true);
    setUploadProgress(0);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      type: 'video',
      status: 'draft',
      thumbnailFile: null,
      thumbnail_url: '',
      modules: [],
    });
    setUploadProgress(0);
  };

  // Module (Oblast) management functions
  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: '', order: formData.modules.length + 1 }]
    });
  };

  const removeModule = (moduleIndex) => {
    const newModules = formData.modules.filter((_, idx) => idx !== moduleIndex);
    setFormData({ ...formData, modules: newModules });
  };

  const updateModule = (moduleIndex, field, value) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex][field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast({ type: 'warning', message: 'Molimo odaberite sliku (JPG, PNG, WebP)' });
        return;
      }
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast({ type: 'warning', message: 'Slika je prevelika. Maksimalna veličina je 5MB.' });
        return;
      }
      setFormData({ ...formData, thumbnailFile: file });
    }
  };

  // Helper function to delete old modules and lessons
  const deleteOldModulesAndLessons = async (courseId) => {
    console.log('🔵 [CourseManager] Deleting old modules/lessons for course:', courseId);

    // Delete old modules
    const modulesQuery = query(
      collection(db, 'modules'),
      where('courseId', '==', courseId)
    );
    const modulesSnapshot = await getDocs(modulesQuery);

    for (const moduleDoc of modulesSnapshot.docs) {
      // First delete lessons of this module
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('moduleId', '==', moduleDoc.id)
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);

      for (const lessonDoc of lessonsSnapshot.docs) {
        await deleteDoc(lessonDoc.ref);
      }

      // Then delete the module
      await deleteDoc(moduleDoc.ref);
    }

    console.log('✅ [CourseManager] Old modules/lessons deleted');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.title.trim().length < 3) {
      showToast({ type: 'warning', message: 'Naziv kursa mora imati bar 3 karaktera' });
      return;
    }
    if (formData.price < 0) {
      showToast({ type: 'warning', message: 'Cena ne sme biti negativna' });
      return;
    }

    setFormLoading(true);
    setUploadProgress(0);

    try {
      console.log('🔵 [CourseManager] Saving course with modules:', formData.modules);

      let thumbnailUrl = formData.thumbnail_url;

      // Upload thumbnail if a new file was selected
      if (formData.thumbnailFile) {
        const timestamp = Date.now();
        const fileExtension = formData.thumbnailFile.name.split('.').pop();
        const fileName = `thumbnails/${timestamp}_${formData.title.replace(/\s+/g, '_')}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, formData.thumbnailFile);

        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error('❌ [CourseManager] Upload error:', error);
              showToast({ type: 'error', message: 'Greška pri upload-u slike' });
              reject(error);
            },
            async () => {
              thumbnailUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // Prepare course data (exclude thumbnailFile, modules, include thumbnail_url)
      const { thumbnailFile, modules, ...courseData } = formData;
      const dataToSave = {
        ...courseData,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      };

      let courseId;

      if (editingCourse) {
        // Update existing course
        console.log('🔵 [CourseManager] Updating existing course:', editingCourse.id);
        await updateDoc(doc(db, 'courses', editingCourse.id), dataToSave);
        courseId = editingCourse.id;

        // Delete old modules and lessons before creating new ones
        await deleteOldModulesAndLessons(courseId);
      } else {
        // Create new course
        console.log('🔵 [CourseManager] Creating new course...');
        const courseDoc = await addDoc(collection(db, 'courses'), {
          ...dataToSave,
          created_at: new Date().toISOString(),
        });
        courseId = courseDoc.id;
        console.log('✅ [CourseManager] Course created:', courseId);
      }

      // Save modules to separate collection
      console.log('🔵 [CourseManager] Saving', formData.modules.length, 'modules...');

      for (let i = 0; i < formData.modules.length; i++) {
        const module = formData.modules[i];

        if (!module.title.trim()) {
          console.warn('⚠️ [CourseManager] Skipping module with empty title');
          continue;
        }

        console.log(`🔵 [CourseManager] Creating module ${i + 1}:`, module.title);

        const moduleDoc = await addDoc(collection(db, 'modules'), {
          courseId: courseId,
          title: module.title,
          order: module.order || (i + 1),
          created_at: new Date().toISOString(),
        });

        console.log(`✅ [CourseManager] Module created:`, moduleDoc.id);

        // Note: Lessons are managed separately via LessonManager
      }

      console.log('✅ [CourseManager] All modules and lessons saved successfully!');
      showToast({ type: 'success', message: editingCourse ? 'Kurs uspešno izmenjen!' : 'Kurs uspešno kreiran!' });

      handleCloseForm();
      loadCourses();
    } catch (error) {
      console.error('❌ [CourseManager] Error saving course:', error);
      console.error('❌ [CourseManager] Error details:', error.message);
      showToast({ type: 'error', message: 'Greška pri čuvanju kursa: ' + error.message });
    } finally {
      setFormLoading(false);
      setUploadProgress(0);
    }
  };

  const toggleStatus = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      await updateDoc(doc(db, 'courses', courseId), {
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
      loadCourses();
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast({ type: 'error', message: 'Greška pri promeni statusa' });
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!confirm(`Da li ste sigurni da želite da obrišete kurs "${courseTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'courses', courseId));
      loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast({ type: 'error', message: 'Greška pri brisanju kursa' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upravljanje kursevima</h2>
        <button
          onClick={() => handleOpenForm()}
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novi kurs
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              {editingCourse ? 'Izmeni kurs' : 'Novi kurs'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Naziv kursa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-gray-900"
                    placeholder="npr. Priprema za malu maturu"
                    required
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Opis</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-gray-900"
                    rows={4}
                    placeholder="Detaljan opis kursa..."
                    required
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Slika kursa (thumbnail)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnailFile"
                    disabled={formLoading}
                  />
                  <label
                    htmlFor="thumbnailFile"
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer block transition-all ${
                      formData.thumbnailFile || formData.thumbnail_url
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-black hover:bg-gray-50'
                    }`}
                  >
                    {formData.thumbnailFile ? (
                      <div className="flex items-center justify-center space-x-4">
                        <div className="bg-black text-white p-3 rounded-lg">
                          <Image className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">{formData.thumbnailFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(formData.thumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-gray-500 underline hover:text-black ml-4"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('thumbnailFile').click();
                          }}
                        >
                          Promeni
                        </button>
                      </div>
                    ) : formData.thumbnail_url ? (
                      <div className="flex items-center justify-center space-x-4">
                        <img
                          src={formData.thumbnail_url}
                          alt="Current thumbnail"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Trenutna slika</p>
                          <p className="text-sm text-gray-500">Kliknite da promenite</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-8 w-8 text-gray-400 group-hover:text-black transition-colors" />
                        </div>
                        <p className="font-medium text-gray-900">Kliknite da otpremite sliku</p>
                        <p className="text-xs text-gray-500">JPG, PNG, WebP (maks 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-900">Upload u toku...</span>
                      <span className="font-bold text-gray-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Cena (RSD)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-sm">RSD</span>
                    </div>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="pl-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-gray-900"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'draft' })}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        formData.status === 'draft'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'active' })}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        formData.status === 'active'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Aktivan
                    </button>
                  </div>
                </div>
              </div>

              {/* Course Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tip kursa</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'video' })}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'video'
                        ? 'border-black bg-gray-50 text-black'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    <MonitorPlay className={`w-6 h-6 mr-2 ${formData.type === 'video' ? 'text-black' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-semibold">Video kurs</div>
                      <div className="text-xs opacity-70">Unapred snimljene lekcije</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'live' })}
                    className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'live'
                        ? 'border-black bg-gray-50 text-black'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500'
                    }`}
                  >
                    <Users className={`w-6 h-6 mr-2 ${formData.type === 'live' ? 'text-black' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-semibold">Uživo časovi</div>
                      <div className="text-xs opacity-70">Termini u realnom vremenu</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Oblasti (Areas) Editor */}
              <div className="border-t-2 border-gray-100 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5 text-gray-700" />
                    <label className="block text-sm font-medium text-gray-900">Oblasti kursa</label>
                  </div>
                  <button
                    type="button"
                    onClick={addModule}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-700 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj oblast
                  </button>
                </div>

                {formData.modules.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <List className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Još nema oblasti. Kliknite "Dodaj oblast" da započnete.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={module.order || moduleIndex + 1}
                            onChange={(e) => updateModule(moduleIndex, 'order', Number(e.target.value))}
                            className="w-14 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900 font-bold text-center"
                            min="1"
                            title="Redosled oblasti"
                          />
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                            placeholder={`Naziv oblasti ${moduleIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeModule(moduleIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Obriši oblast"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">* Lekcije se dodaju u sekciji "Lekcije" nakon kreiranja kursa</p>
              </div>

              <div className="flex space-x-4 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Čuvanje...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Sačuvaj
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-500 mb-4">Nema kreiranih kurseva</p>
          <button
            onClick={() => handleOpenForm()}
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Kreiraj prvi kurs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-black transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      course.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.status === 'active' ? 'Aktivan' : 'Draft'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      {course.type === 'video' ? 'Video kurs' : 'Uživo časovi'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {formatPrice(course.price)}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleStatus(course.id, course.status)}
                    className={`p-2 rounded-lg transition-colors border ${
                      course.status === 'active'
                        ? 'bg-white border-gray-300 text-gray-500 hover:text-black hover:border-black'
                        : 'bg-black text-white border-black hover:bg-gray-800'
                    }`}
                    title={course.status === 'active' ? 'Deaktiviraj' : 'Aktiviraj'}
                  >
                    {course.status === 'active' ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenForm(course)}
                    className="p-2 bg-white border border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-lg transition-colors"
                    title="Izmeni"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="p-2 bg-white border border-gray-300 text-red-600 hover:border-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Obriši"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
