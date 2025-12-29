import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Book, Video, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState([false, false, false, false]);
  const stepRefs = useRef([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setTimeout(() => {
              setVisibleSteps(prev => {
                const newSteps = [...prev];
                newSteps[index] = true;
                return newSteps;
              });
            }, index * 200); // Staggered delay: 0ms, 200ms, 400ms, 600ms
          }
        },
        { threshold: 0.3 }
      );

      if (ref) {
        observer.observe(ref);
      }

      return observer;
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] text-white py-20 rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Наши Курсеви
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Изаберите програм који вам највише одговара и започните припрему за малу матуру на време.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D62828] border-t-transparent"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <Book className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Ускоро ће бити доступни нови курсеви</h3>
            <p className="text-gray-600 mb-8">Радимо на изради квалитетних материјала за вас.</p>
            <Link to="/contact">
              <Button variant="primary">Контактирајте нас</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="h-full">
                <div className="bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 h-full flex flex-col overflow-hidden">
                  {/* Card Header Image */}
                  <div className="h-48 bg-[#F7F7F7] relative overflow-hidden flex items-center justify-center group">
                     {course.thumbnail_url ? (
                       <img
                         src={course.thumbnail_url}
                         alt={course.title}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       />
                     ) : course.type === 'video' ? (
                       <Video className="w-20 h-20 text-[#D62828]/20 group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                       <Users className="w-20 h-20 text-[#D62828]/20 group-hover:scale-110 transition-transform duration-500" />
                     )}
                     <div className="absolute top-4 right-4 bg-[#F2C94C] text-[#1A1A1A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       {course.type === 'video' ? 'Видео Курс' : 'Уживо Настава'}
                     </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">{course.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {course.description}
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-[#D62828]" />
                        <span>Комплетан материјал</span>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-2xl font-black text-[#D62828]">
                          {formatPrice(course.price)}
                        </div>
                        <Link to={course.type === 'live' ? `/online-class/${course.id}` : `/course/${course.id}`}>
                          <Button variant="outline" size="sm" showArrow>
                            Детаљније
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-[#F7F7F7] to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Како функционише?
            </h2>
            <p className="text-xl text-gray-600">
              Једноставан процес од уписа до учења
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div
              ref={el => stepRefs.current[0] = el}
              className={`text-center group transition-all duration-700 ${
                visibleSteps[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                Изаберите курс
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Погледајте наше курсеве и изаберите онај који вам одговара
              </p>
            </div>

            {/* Step 2 */}
            <div
              ref={el => stepRefs.current[1] = el}
              className={`text-center group transition-all duration-700 ${
                visibleSteps[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-gradient-to-br from-[#F77F00] to-[#DC6B00] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                Извршите уплату
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Кликните на "Купи курс" и пратите инструкције за уплату
              </p>
            </div>

            {/* Step 3 */}
            <div
              ref={el => stepRefs.current[2] = el}
              className={`text-center group transition-all duration-700 ${
                visibleSteps[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-gradient-to-br from-[#F2C94C] to-[#D4A927] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                Потврда уплате
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Контактираћемо вас email-ом у року од 24h
              </p>
            </div>

            {/* Step 4 */}
            <div
              ref={el => stepRefs.current[3] = el}
              className={`text-center group transition-all duration-700 ${
                visibleSteps[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-gradient-to-br from-[#27AE60] to-[#1E8449] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                Почните да учите
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Приступите курсу и започните своје учење
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
