import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book, ArrowLeft } from 'lucide-react';
import { getCourseById, checkUserAccess, getCourseLessons } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import InvoiceGenerator from '../components/payment/InvoiceGenerator';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id, user]);

  const loadCourse = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      if (user) {
        const access = await checkUserAccess(user.uid, id);
        setHasAccess(access);

        if (access) {
          const lessonsData = await getCourseLessons(id);
          setLessons(lessonsData);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje kursa...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Kurs nije pronađen</p>
          <Link to="/" className="text-secondary hover:underline">
            Nazad na početnu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold text-secondary">Nauči Srpski</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-secondary mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Nazad</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Course Info */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-primary/20 text-secondary text-sm font-semibold px-3 py-1 rounded-full">
                {course.type === 'video' ? 'Video kurs' : 'Uživo časovi'}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-secondary mb-4">{course.title}</h1>
            <p className="text-gray-700 text-lg mb-6">{course.description}</p>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-4">Šta ćete naučiti:</h3>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Priprema za malu maturu</li>
                <li>Analiza književnih dela</li>
                <li>Vežbe iz gramatike</li>
                <li>Pisanje eseja i analiza teksta</li>
              </ul>
            </div>

            {hasAccess && lessons.length > 0 && (
              <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold mb-4">Lekcije ({lessons.length})</h3>
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="flex items-center space-x-2 text-gray-700">
                      <span className="text-sm font-semibold">{idx + 1}.</span>
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Purchase/Access Section */}
          <div>
            {hasAccess ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  ✓ Imate pristup ovom kursu
                </h3>
                <p className="text-gray-700 mb-4">
                  Možete gledati sve video lekcije i preuzimati materijale.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-block w-full bg-secondary text-white text-center py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
                >
                  Idi na Dashboard
                </Link>
              </div>
            ) : user ? (
              <InvoiceGenerator
                courseId={course.id}
                courseName={course.title}
                price={course.price}
              />
            ) : (
              <div className="glass-card rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-4">Kupovina kursa</h3>
                <p className="text-muted-foreground mb-6">
                  Morate biti prijavljeni da biste kupili kurs.
                </p>
                <Link
                  to="/login"
                  className="btn-primary w-full mb-4"
                >
                  Prijavite se
                </Link>
                <p className="text-sm text-center text-muted-foreground">
                  Nemate nalog?{' '}
                  <Link to="/register" className="text-secondary font-semibold hover:underline">
                    Registrujte se
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
