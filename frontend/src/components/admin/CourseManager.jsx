import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, CheckCircle, Tag, FileText, Video, Users, MonitorPlay } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

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
  });
  const [formLoading, setFormLoading] = useState(false);

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

  const handleOpenForm = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        type: course.type,
        status: course.status,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        type: 'video',
        status: 'draft',
      });
    }
    setShowForm(true);
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
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.title.trim().length < 3) {
      alert('Naziv kursa mora imati bar 3 karaktera');
      return;
    }
    if (formData.price < 0) {
      alert('Cena ne sme biti negativna');
      return;
    }

    setFormLoading(true);

    try {
      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          ...formData,
          updated_at: new Date().toISOString(),
        });
        alert('Kurs uspešno izmenjen!');
      } else {
        // Create new course
        await addDoc(collection(db, 'courses'), {
          ...formData,
          created_at: new Date().toISOString(),
        });
        alert('Kurs uspešno kreiran!');
      }

      handleCloseForm();
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Greška pri čuvanju kursa: ' + error.message);
    } finally {
      setFormLoading(false);
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
      alert('Greška pri promeni statusa');
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
      alert('Greška pri brisanju kursa');
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
