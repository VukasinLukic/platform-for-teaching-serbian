import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Video,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Star,
  Trophy,
  BookOpen,
  Target,
  GraduationCap,
  MessageCircle
} from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

// Counter Animation Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const endValue = parseInt(end);
          const startTime = Date.now();

          const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentCount = Math.floor(progress * endValue);

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(endValue);
            }
          };

          updateCount();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={countRef}>
      {count}{suffix}
    </span>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const stepsRef = useRef([]);
  const howItWorksRef = useRef(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !howItWorksVisible) {
          setHowItWorksVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (howItWorksRef.current) {
      observer.observe(howItWorksRef.current);
    }

    return () => observer.disconnect();
  }, [howItWorksVisible]);

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

  const whatWeOffer = [
    {
      icon: BookOpen,
      grade: '5. разред',
      title: 'Основе језичке културе',
      description: 'Врсте речи, падежи, синтакса реченице. Изградите чврсту језичку основу.',
      features: ['Видео лекције', 'Вежбе', 'Тестови']
    },
    {
      icon: GraduationCap,
      grade: '6. разред',
      title: 'Проширивање знања',
      description: 'Сложени падежи, сложене реченице, правопис. Надоградите своје вештине.',
      features: ['Online часови', 'Материјали', 'Подршка']
    },
    {
      icon: Trophy,
      grade: '7. разред',
      title: 'Припрема за изазове',
      description: 'Књижевност, стилске фигуре, анализа дела. Припремите се за такмичења.',
      features: ['Групне сесије', 'Практичан рад', 'Провере']
    },
    {
      icon: MessageCircle,
      grade: '8. разред',
      title: 'Мала матура - спремни!',
      description: 'Интензивна припрема за завршни испит. Све што треба за успех.',
      features: ['Индивидуални рад', 'Пробни тестови', '24/7 подршка']
    },
  ];

  const stats = [
    { number: '700+', label: 'Ученика' },
    { number: '98%', label: 'Успешност' },
    { number: '27', label: 'Година искуства' },
  ];

  const testimonials = [
    {
      text: '"Професорка Марина је са толико љубави и стрпљења објашњавала градиво. Коначно разумем српски језик!"',
      author: 'Марко П.',
      role: 'Ученик',
    },
    {
      text: '"Нисам веровала да онлајн настава може бити овако топла и ефикасна. Све препоруке!"',
      author: 'Јелена М.',
      role: 'Родитељ',
    },
    {
      text: '"Уписао сам жељену гимназију захваљујући овој припреми. Хвала вам од срца!"',
      author: 'Стефан К.',
      role: 'Ученик',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pb-0 flex items-start pt-16 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Text */}
            <div className="relative z-10 space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-[#1A1A1A]">
                Учите српски језик и књижевност <br />
                са разумевањем и{' '}
                <span className="relative inline-block">
                  љубављу.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#D62828]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="6" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Платформа која гради трајно знање кроз видео материјале и online часове.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                <Link to="/register">
                  <button className="bg-[#D62828] text-white px-10 py-4 rounded-full hover:bg-[#B91F1F] transition-all transform hover:scale-105 shadow-xl text-lg font-bold">
                    Започни учење
                  </button>
                </Link>
                <Link to="/about">
                  <button className="px-10 py-4 rounded-full border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all text-lg font-bold">
                    Сазнај више
                  </button>
                </Link>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative flex items-center justify-center lg:-mt-8">
              <img
                src="/heroSekcija.png"
                alt="Професорка са децом"
                className="w-[125%] max-w-none h-auto relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section
        ref={howItWorksRef}
        className={`pt-24 pb-16 bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden transition-all duration-1000 ${
          howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        {/* Playful Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] mb-4">
              Како функционише?
            </h2>
          </div>

          {/* Vertical Snake Path Layout */}
          <div className="relative">
            {/* Red Curved Path - SVG */}
            <svg className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 hidden md:block" style={{zIndex: 1}} preserveAspectRatio="none" viewBox="0 0 400 900">
              <path
                d="M 200 60 Q 100 140, 200 220 Q 300 300, 200 380 Q 100 460, 200 540 Q 300 620, 200 700"
                stroke="#D62828"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>

            <div className="space-y-20 md:space-y-16 relative" style={{zIndex: 2}}>

              {/* Step 1 - Left */}
              <div className="flex items-center gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-6 border-[#D62828] relative z-10">
                    <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-[#D62828]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">1</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-2">
                    Изаберите курс
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Прегледајте наше курсеве или пакете online наставе и изаберите онај који вам одговара.
                  </p>
                </div>
              </div>

              {/* Step 2 - Right */}
              <div className="flex items-center gap-6 md:gap-8 flex-row-reverse">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-6 border-[#D62828] relative z-10">
                    <svg className="w-10 h-10 md:w-12 md:h-12 text-[#D62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">2</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-2">
                    Извршите уплату
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Пратите упутства за уплату и на вашем панелу окачите доказ о извршеној трансакцији.
                  </p>
                </div>
              </div>

              {/* Step 3 - Left */}
              <div className="flex items-center gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-6 border-[#D62828] relative z-10">
                    <svg className="w-10 h-10 md:w-12 md:h-12 text-[#D62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">3</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-2">
                    Потврда уплате
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Контактираћемо вас email-ом у року од 24h са потврдом и даљим инструкцијама.
                  </p>
                </div>
              </div>

              {/* Step 4 - Right */}
              <div className="flex items-center gap-6 md:gap-8 flex-row-reverse">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-6 border-[#D62828] relative z-10">
                    <Video className="w-10 h-10 md:w-12 md:h-12 text-[#D62828]" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">4</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-2">
                    Почните да учите
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Приступите курсевима преко вашег панела или придружите се online часовима.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COURSES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              Наши курсеви
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Одаберите курс који одговара вашим потребама
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-[#D62828] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Ускоро ће бити доступни нови курсеви</h3>
              <p className="text-gray-600">Радимо на изради квалитетних материјала за вас.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 h-full flex flex-col border border-gray-100">
                    {/* Thumbnail Image */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#D62828] to-[#B91F1F] flex items-center justify-center">
                          <BookOpen className="w-20 h-20 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-[#D62828] text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                        {formatPrice(course.price)}
                      </div>

                      {/* Level Badge */}
                      {course.level && (
                        <div className="absolute bottom-4 left-4">
                          <span className={`${course.level === 'basic' ? 'bg-green-500' : course.level === 'medium' ? 'bg-yellow-500' : 'bg-purple-500'} text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                            {course.level === 'basic' ? 'Основни' : course.level === 'medium' ? 'Средњи' : 'Напредни'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#D62828] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                        {course.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Video className="w-4 h-4 text-[#D62828]" />
                          <span className="font-medium">{course.lessonsCount || course.modulesCount || 0} лекција</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#D62828] font-bold text-sm">
                          Детаљније
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/courses">
              <button className="bg-[#D62828] text-white px-10 py-4 rounded-full hover:bg-[#B91F1F] transition-all font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transform">
                Сви курсеви
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Наш успех у бројкама
            </h2>
            <p className="text-gray-600 text-xl">
              Резултати говоре више од речи
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white border-2 border-[#D62828]/30 rounded-3xl p-10 text-center hover:border-[#D62828] transition-all hover:shadow-2xl">
                <div className="text-6xl font-black bg-gradient-to-br from-[#D62828] to-[#B91F1F] bg-clip-text text-transparent mb-2">
                  <AnimatedCounter end="500" suffix="+" />
                </div>
                <div className="text-base font-bold uppercase tracking-wider text-gray-600">Ученика</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-gray-700 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white border-2 border-gray-300 rounded-3xl p-10 text-center hover:border-[#1A1A1A] transition-all hover:shadow-2xl">
                <div className="text-6xl font-black bg-gradient-to-br from-[#1A1A1A] to-gray-700 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter end="98" suffix="%" />
                </div>
                <div className="text-base font-bold uppercase tracking-wider text-gray-600">Успешност</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white border-2 border-[#D62828]/30 rounded-3xl p-10 text-center hover:border-[#D62828] transition-all hover:shadow-2xl">
                <div className="text-6xl font-black bg-gradient-to-br from-[#D62828] to-[#B91F1F] bg-clip-text text-transparent mb-2">
                  <AnimatedCounter end="27" />
                </div>
                <div className="text-base font-bold uppercase tracking-wider text-gray-600">Година искуства</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-20 bg-[#F7F7F7] overflow-hidden">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Речи наших ученика</h2>
          <p className="text-gray-600 text-lg">Успеси који говоре за нас</p>
        </div>

        {/* Desktop: Infinite Horizontal Scroll */}
        <div className="relative hidden md:block">
          <style>{`
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll-left 40s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="flex gap-6 animate-scroll">
            {/* Duplicate testimonials for infinite effect */}
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[380px] bg-white p-8 rounded-xl hover:shadow-xl transition-all border-2 border-gray-100"
              >
                {/* Quote Content */}
                <p className="text-[#1A1A1A] text-base italic mb-6 leading-relaxed min-h-[100px]">
                  {t.text}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#1A1A1A] text-base">{t.author}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Manual Horizontal Scroll */}
        <div className="md:hidden">
          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-6">
            <div className="flex gap-4">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[85vw] bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100 snap-center"
                >
                  {/* Quote Content */}
                  <p className="text-[#1A1A1A] text-sm italic mb-4 leading-relaxed">
                    {t.text}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#1A1A1A] text-sm">{t.author}</div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator Arrow */}
          <div className="flex justify-center mt-6 animate-bounce">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Prevucite levo-desno</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D62828] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F2C94C] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-[#1A1A1A]">
            Немојте чекати, <br/>
            <span className="text-[#D62828]">почните данас.</span>
          </h2>

          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Придружите се стотинама ученика који су већ осигурали своје место.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-[#D62828] text-white px-8 md:px-16 py-4 md:py-6 rounded-full hover:bg-[#B91F1F] transition-all transform hover:scale-105 shadow-xl text-lg md:text-2xl font-bold flex items-center justify-center gap-3">
                Направи Налог <ArrowRight className="w-5 h-5 md:w-7 md:h-7" />
              </button>
            </Link>
            <Link to="/courses" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] px-8 md:px-16 py-4 md:py-6 rounded-full hover:bg-[#1A1A1A] hover:text-white transition-all text-lg md:text-2xl font-bold">
                Истражи Курсеве
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
