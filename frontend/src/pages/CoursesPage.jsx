import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Book, Video, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
import { coursePath } from '../seo/courseSlug';
import { useOnboarding } from '../context/OnboardingContext';
import MascotHint from '../components/mascot/MascotHint';

export default function CoursesPage() {
  const { checkAndStartTutorial } = useOnboarding();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState([false, false, false, false]);
  const [expandedCards, setExpandedCards] = useState({});
  const stepRefs = useRef([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (!loading) {
      checkAndStartTutorial('courses');
    }
  }, [loading, checkAndStartTutorial]);

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

  const coursesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Online Курсеви Српског Језика за Малу Матуру",
    "description": "Комплетни видео курсеви за припрему завршног испита из српског језика",
    "url": "https://srpskiusrcu.rs/courses",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу",
      "url": "https://srpskiusrcu.rs"
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Почетна", "item": "https://srpskiusrcu.rs/" },
      { "@type": "ListItem", "position": 2, "name": "Курсеви", "item": "https://srpskiusrcu.rs/courses" }
    ]
  };

  const courseSchemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Припрема за малу матуру из српског језика",
    "description": "Комплетни видео курсеви за припрему мале матуре из српског језика — граматика, књижевност, правопис. HD видео лекције, задаци са решењима, пробни тестови.",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу",
      "url": "https://srpskiusrcu.rs",
      "sameAs": "https://www.instagram.com/srpskiusrcu"
    },
    "educationalLevel": "Основна школа (5-8. разред)",
    "inLanguage": "sr",
    "teaches": "Српски језик и књижевност — граматика, правопис, стилске фигуре, анализа књижевних дела, припрема за завршни испит",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Person",
        "name": "Марина Лукић",
        "jobTitle": "Наставница српског језика и књижевности"
      }
    }
  };

  return (
    <>
      <SEO
        title="ОНЛАЈН КУРСЕВИ СРПСКОГ | ПРИПРЕМА МАЛЕ МАТУРЕ ИЗ СРПСКОГ ЈЕЗИКА"
        description="Комплетни видео курсеви за припрему мале матуре из српског језика. Граматика, књижевност, правопис. Учи у своје време са наставницом са 27 год искуства."
        canonical="/courses"
        jsonLd={[coursesJsonLd, breadcrumbJsonLd, courseSchemaJsonLd]}
        keywords="online kursevi srpskog jezika, priprema za malu maturu, video lekcije srpski, gramatika srpski jezik, knjizevnost 8 razred, zavrsni ispit srpski, kurs srpskog online"
      />
    <div className="min-h-screen bg-white font-sans text-ink">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand to-brand-700 text-white py-14 md:py-20 rounded-b-3xl md:rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6">
            Наши курсеви
          </h1>
          <p className="text-base md:text-2xl text-white max-w-3xl mx-auto">
            Изаберите програм који вам највише одговара и започните припрему за малу матуру на време.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-surface to-white py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-ink mb-3 md:mb-4">
              Како функционише?
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Једноставан процес од уписа до учења
            </p>
          </div>

          <div data-tour="courses-how-it-works" className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            {/* Step 1 */}
            <div
              ref={el => stepRefs.current[0] = el}
              className={`text-center group transition-all duration-700 ${
                visibleSteps[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-brand w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 motion-safe:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3">
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
              <div className="bg-brand w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 motion-safe:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3">
                Извршите уплату
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Кликните на "Затражи курс" и пратите инструкције за уплату
              </p>
            </div>

            {/* Step 3 */}
            <div
              ref={el => stepRefs.current[2] = el}
              className={`text-center group transition-all duration-700 ${
                visibleSteps[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-brand w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 motion-safe:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3">
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
              <div className="bg-brand w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 motion-safe:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3">
                Почните да учите
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Приступите курсу и започните своје учење
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <Book className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-ink mb-4">Ускоро ће бити доступни нови курсеви</h3>
            <p className="text-gray-600 mb-8">Радимо на изради квалитетних материјала за вас.</p>
            <Button as={Link} to="/contact" variant="primary" size="md">Контактирајте нас
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Link
                key={course.id}
                to={coursePath(course)}
                className="h-full block"
                {...(index === 0 ? { 'data-tour': 'courses-first-card' } : {})}
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 motion-safe:hover:-translate-y-2 border border-gray-100 h-full flex flex-col overflow-hidden cursor-pointer">
                  {/* Card Header Image */}
                  <div className="h-40 md:h-48 bg-surface relative overflow-hidden flex items-center justify-center">
                     {course.thumbnail_url ? (
                       <img
                         src={course.thumbnail_url}
                         alt={course.title}
                         className="w-full h-full object-cover"
                         loading="lazy"
                       />
                     ) : course.type === 'video' ? (
                       <Video className="w-20 h-20 text-brand/20" />
                     ) : (
                       <Users className="w-20 h-20 text-brand/20" />
                     )}
                     <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       {course.type === 'video' ? 'Видео курс' : 'Уживо настава'}
                     </div>
                  </div>

                  <div className="p-5 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-ink mb-3">{course.title}</h3>
                    <p className={`text-gray-600 text-sm mb-6 leading-relaxed ${expandedCards[course.id] ? '' : 'line-clamp-3'}`}>
                      {course.description}
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-brand" />
                        <span>Комплетан материјал</span>
                      </div>

                      {expandedCards[course.id] && (
                        <div className="space-y-3 py-4 border-t border-gray-100">
                          <h4 className="font-bold text-ink text-sm mb-3">Шта добијате уз курс:</h4>
                          <div className="space-y-2">
                            {['HD видео лекције', 'Материјали који прате сваку лекцију', 'Задаци за вежбање са решењима', 'Пробни пријемни и online квизови', 'Подршка наставнице', 'Трајан приступ'].map((f, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-brand flex-shrink-0" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedCards(prev => ({ ...prev, [course.id]: !prev[course.id] }));
                        }}
                        className="text-sm text-brand font-semibold hover:underline w-full text-left py-2 -my-2"
                      >
                        {expandedCards[course.id] ? 'Прикажи мање ▲' : 'Прикажи више ▼'}
                      </button>

                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-brand">
                            {formatPrice(course.price)}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" showArrow>
                          Детаљније
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming Soon - Припрема за малу матуру 2. део */}
            <div className="relative h-full">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
                <div className="h-40 md:h-48 bg-gradient-to-br from-brand/5 to-gold/10 relative flex items-center justify-center">
                  <div className="text-center">
                    <Book className="w-14 h-14 text-brand/20 mx-auto mb-2" />
                    <span className="text-brand/30 text-xs font-bold uppercase tracking-wider">Мала матура</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-gold text-ink px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Видео курс
                  </div>
                </div>

                <div className="p-5 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-ink mb-3">Припрема за малу матуру 2. део</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Други део припреме за малу матуру из српског језика - напредно градиво, додатни задаци и пробни тестови.
                  </p>

                  <div className="space-y-3 mb-6">
                    {['HD видео лекције', 'Напредно градиво', 'Пробни тестови', 'Задаци за вежбање', 'Подршка наставнице', 'Трајан приступ'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-brand/40 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center gap-2">
                <h4 className="text-3xl font-black text-brand">Ускоро</h4>
                <p className="text-ink text-sm font-semibold">Курс је у изради</p>
              </div>
            </div>

            {/* Coming Soon - Потпун курс за малу матуру */}
            <div className="relative h-full">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
                <div className="h-40 md:h-48 bg-gradient-to-br from-ink/5 to-brand/5 relative flex items-center justify-center">
                  <div className="text-center">
                    <Book className="w-14 h-14 text-ink/15 mx-auto mb-2" />
                    <span className="text-ink/25 text-xs font-bold uppercase tracking-wider">Комплетан курс</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-gold text-ink px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Видео курс
                  </div>
                </div>

                <div className="p-5 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-ink mb-3">Потпун курс за малу матуру</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Комплетна припрема за малу матуру из српског језика - све области, сви задаци, сви пробни тестови на једном месту.
                  </p>

                  <div className="space-y-3 mb-6">
                    {['Комплетно градиво', 'HD видео лекције', 'Пробни тестови', 'Задаци са решењима', 'Подршка наставнице', 'Трајан приступ'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-ink/30 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center gap-2">
                <h4 className="text-3xl font-black text-ink">Ускоро</h4>
                <p className="text-ink text-sm font-semibold">Курс је у изради</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto px-6 pb-16">
        <MascotHint message="Питања око цена? 💬" />
      </div>

      <Footer />

    </div>
    </>
  );
}
