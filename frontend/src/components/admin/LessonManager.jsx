import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { Plus, Trash2, Loader2, Upload, Video, FileVideo, CheckCircle, Edit2, Tag, FileText } from 'lucide-react';

export default function LessonManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
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

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadLessons(selectedCourse);
    } else {
      setLessons([]);
    }
  }, [selectedCourse]);

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

  const loadLessons = async (courseId) => {
    try {
      const q = query(
        collection(db, 'lessons'),
        where('course_id', '==', courseId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
      // If error is due to missing index, show message
      if (error.code === 'failed-precondition') {
        alert('Firestore index potreban. Kliknite na link u konzoli da kreirate index.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Molimo odaberite video fajl');
        return;
      }
      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        alert('Video fajl je prevelik. Maksimalna veličina je 500MB.');
        return;
      }
      setFormData({ ...formData, videoFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.videoFile || !selectedCourse) {
      alert('Molimo popunite sva polja i odaberite video');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload video to Firebase Storage
      const timestamp = Date.now();
      const fileName = `videos/${selectedCourse}/${timestamp}_${formData.videoFile.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, formData.videoFile);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          alert('Greška pri upload-u videa');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save lesson to Firestore
          await addDoc(collection(db, 'lessons'), {
            course_id: selectedCourse,
            title: formData.title,
            description: formData.description,
            video_key: uploadTask.snapshot.ref.fullPath,
            video_url: downloadURL, // For development/testing
            order: lessons.length + 1,
            duration: 0, // TODO: Extract video duration
            created_at: new Date().toISOString(),
          });

          // Reset form
          setFormData({
            title: '',
            description: '',
            videoFile: null,
          });
          setShowForm(false);
          setUploading(false);
          setUploadProgress(0);

          // Reload lessons
          loadLessons(selectedCourse);
        }
      );
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Greška pri kreiranju lekcije');
      setUploading(false);
    }
  };

  const handleDelete = async (lessonId, lessonTitle) => {
    if (!confirm(`Da li ste sigurni da želite da obrišete lekciju "${lessonTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      loadLessons(selectedCourse);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Greška pri brisanju lekcije');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upravljanje lekcijama</h2>
      </div>

      {/* Course Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-2">Odaberi kurs</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">-- Izaberi kurs --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse ? (
        <>
          {/* Add Lesson Button */}
          {!showForm && (
            <button
              onClick={() => {
                setEditingLesson(null);
                setFormData({ title: '', description: '', videoFile: null });
                setShowForm(true);
              }}
              className="btn-primary mb-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Dodaj lekciju
            </button>
          )}

          {/* Lesson Form */}
          {showForm && (
            <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-gray-900">
                {editingLesson ? 'Izmeni lekciju' : 'Nova lekcija'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naziv lekcije</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="npr. Lekcija 1: Uvod u gramatiku"
                        required
                        disabled={uploading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opis lekcije</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        rows={3}
                        placeholder="Kratak opis lekcije..."
                        disabled={uploading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video fajl</label>
                  <div className="relative group">
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
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer block transition-all ${
                        formData.videoFile 
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-300 hover:border-black hover:bg-gray-50'
                      }`}
                    >
                        {formData.videoFile ? (
                            <div className="flex items-center justify-center space-x-4">
                                <div className="bg-black text-white p-3 rounded-lg">
                                    <FileVideo className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">{formData.videoFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button 
                                    type="button"
                                    className="text-sm text-gray-500 underline hover:text-black ml-4"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('videoFile').click();
                                    }}
                                >
                                    Promeni
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                                <p className="font-medium text-gray-900">Kliknite da otpremite video</p>
                                <p className="text-xs text-gray-500">MP4, MOV (maks 500MB)</p>
                            </div>
                        )}
                    </label>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2 pt-2">
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

                <div className="flex space-x-4 pt-6 border-t border-gray-100 mt-6">
                    <button
                    type="submit"
                    disabled={uploading || (!formData.videoFile && !editingLesson)}
                    className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {formData.videoFile ? 'Upload...' : 'Čuvanje...'}
                      </>
                    ) : (
                      <>
                        {editingLesson ? <CheckCircle className="h-5 w-5 mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
                        {editingLesson ? 'Sačuvaj izmene' : 'Dodaj lekciju'}
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
                    className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lessons List */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg mb-4">
              Lekcije ({lessons.length})
            </h3>

            {lessons.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <p className="text-muted-foreground">Nema lekcija za ovaj kurs</p>
              </div>
            ) : (
              lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="glass-card rounded-xl p-6 flex items-center justify-between hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="font-bold text-lg text-secondary">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{lesson.title}</p>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setFormData({
                          title: lesson.title,
                          description: lesson.description || '',
                          videoFile: null
                        });
                        setShowForm(true);
                      }}
                      className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors mr-2"
                      title="Izmeni"
                    >
                      <Edit2 className="h-5 w-5 text-secondary" />
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id, lesson.title)}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    title="Obriši"
                  >
                    <Trash2 className="h-5 w-5 text-red-700" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Odaberite kurs da biste upravljali lekcijama</p>
        </div>
      )}
    </div>
  );
}
