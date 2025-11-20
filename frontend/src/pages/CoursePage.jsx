import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, CheckCircle, Star, Video, FileText, Award } from 'lucide-react';
import { getCourseById, checkUserAccess, getCourseLessons } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import InvoiceGenerator from '../components/payment/InvoiceGenerator';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Učitavanje kursa...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <Card variant="elevated" className="p-12 max-w-md text-center">
          <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Book className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-[#003366]">Kurs nije pronađen</h3>
          <p className="text-gray-600 mb-8">Ovaj kurs ne postoji ili je uklonjen.</p>
          <Link to="/">
            <Button variant="primary" showArrow>
              Nazad na početnu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      {/* Breadcrumb / Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#003366] transition font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Nazad
        </button>
      </div>

      {/* Course Hero */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#BFECC9] px-4 py-2 rounded-full text-sm font-bold text-[#003366] mb-6">
                {course.type === 'video' ? '🎥 Video kurs' : '👨‍🏫 Uživo časovi'}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{course.title}</h1>
              <p className="text-xl text-white/90 mb-8">{course.description}</p>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Video, text: '100+ video lekcija' },
                  { icon: FileText, text: 'PDF materijali' },
                  { icon: Award, text: 'Sertifikat po završetku' },
                  { icon: CheckCircle, text: 'Doživotni pristup' },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#FFD700]" fill="#FFD700" />
                ))}
                <span className="ml-2 text-sm text-white/80">(4.9/5 - 127 ocena)</span>
              </div>
            </div>

            {/* Course Image Placeholder */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20">
                <div className="aspect-video bg-gradient-to-br from-[#BFECC9]/30 to-[#FFD700]/30 rounded-2xl flex items-center justify-center">
                  <Book className="h-32 w-32 text-white opacity-40" />
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-[#FFD700] rounded-full p-4 shadow-2xl">
                <Star className="w-8 h-8 text-[#003366]" fill="#003366" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card variant="elevated">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-[#003366]">Šta ćete naučiti:</h3>
                <ul className="space-y-3">
                  {[
                    'Sveobuhvatnu pripremu za malu maturu iz srpskog jezika',
                    'Detaljnu analizu književnih dela iz programa',
                    'Tehnike pisanja eseja i kompozicije',
                    'Gramatiku i pravopis - sve oblasti detaljno objašnjene',
                    'Interpretaciju književnih tekstova',
                    'Strategije za uspešno polaganje ispita',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#BFECC9] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {/* Lessons List - Only if user has access */}
            {hasAccess && lessons.length > 0 && (
              <Card variant="elevated">
                <CardBody className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-[#003366]">
                    Lekcije ({lessons.length})
                  </h3>
                  <div className="space-y-3">
                    {lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-[#BFECC9]/10 transition"
                      >
                        <div className="bg-[#003366] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#003366]">{lesson.title}</h4>
                          {lesson.duration && (
                            <p className="text-sm text-gray-500">{lesson.duration} min</p>
                          )}
                        </div>
                        <Video className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Purchase/Access */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {hasAccess ? (
                <Card variant="gradient" className="border-2 border-[#BFECC9]">
                  <CardBody className="p-8 text-center">
                    <div className="bg-[#BFECC9] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#003366]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#003366] mb-4">
                      Imate pristup ovom kursu!
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Možete gledati sve video lekcije i preuzimati materijale.
                    </p>
                    <Link to="/dashboard">
                      <Button variant="primary" size="lg" className="w-full" showArrow>
                        Idi na Dashboard
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              ) : user ? (
                <Card variant="elevated">
                  <CardBody className="p-8">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-black text-[#FF6B35] mb-2">
                        {formatPrice(course.price)}
                      </div>
                      <p className="text-sm text-gray-600">Jednokratna uplata, doživotni pristup</p>
                    </div>
                    <InvoiceGenerator
                      courseId={course.id}
                      courseName={course.title}
                      price={course.price}
                    />
                  </CardBody>
                </Card>
              ) : (
                <Card variant="elevated">
                  <CardBody className="p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4 text-[#003366]">Kupovina kursa</h3>
                    <div className="text-4xl font-black text-[#FF6B35] mb-6">
                      {formatPrice(course.price)}
                    </div>
                    <p className="text-gray-600 mb-6">
                      Morate biti prijavljeni da biste kupili kurs.
                    </p>
                    <Link to="/login">
                      <Button variant="primary" size="lg" className="w-full mb-4" showArrow>
                        Prijavite se
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-600">
                      Nemate nalog?{' '}
                      <Link to="/register" className="text-[#FF6B35] font-bold hover:underline">
                        Registrujte se besplatno
                      </Link>
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* Money-back guarantee */}
              <Card variant="bordered" className="mt-6">
                <CardBody className="p-6 text-center">
                  <Award className="w-12 h-12 text-[#FFD700] mx-auto mb-3" />
                  <h4 className="font-bold text-[#003366] mb-2">Garancija kvaliteta</h4>
                  <p className="text-sm text-gray-600">
                    Proveren sadržaj sa preko 500 uspešnih učenika
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
