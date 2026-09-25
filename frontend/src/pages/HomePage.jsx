import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../services/firebase';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
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
  MessageCircle,
  Clock,
  Play,
  Sparkles,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Pause
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { inicijalniTestoviList } from '../data/inicijalniTestovi';
import { useOnboarding } from '../context/OnboardingContext';
import MascotHint from '../components/mascot/MascotHint';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';


// Link to a course: slug route when available, legacy id route otherwise.
export function courseHref(course) {
  if (!course) return '/courses';
  return course.slug ? `/kurs/${course.slug}` : `/course/${course.id}`;
}

/**
 * Loads the featured course and live counts (active courses, lessons) from Firestore.
 * Returns { loading, featured, coursesCount, lessonsCount }. Counts stay null on error,
 * so the UI shows neutral labels instead of invented numbers.
 */
function useHomeCatalog() {
  const [state, setState] = useState({ loading: true, featured: null, coursesCount: null, lessonsCount: null });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'courses'), where('status', '==', 'active')));
        const courses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Featured: explicit `featured` flag first, then lowest `order`, then first found.
        const featured =
          courses.find((c) => c.featured === true) ||
          [...courses].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))[0] ||
          null;
        let lessonsCount = null;
        try {
          const ids = courses.map((c) => c.id);
          if (ids.length) {
            const counts = await Promise.all(
              ids.map((id) =>
                getCountFromServer(query(collection(db, 'lessons'), where('courseId', '==', id))).then((r) => r.data().count)
              )
            );
            lessonsCount = counts.reduce((a, b) => a + b, 0);
          } else {
            lessonsCount = 0;
          }
        } catch {
          lessonsCount = null;
        }
        if (!cancelled) setState({ loading: false, featured, coursesCount: courses.length, lessonsCount });
      } catch {
        if (!cancelled) setState({ loading: false, featured: null, coursesCount: null, lessonsCount: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

function StatChip({ loading, value, label }) {
  if (loading) return <span className="inline-block h-4 w-24 rounded bg-white/25 motion-safe:animate-pulse" aria-hidden="true" />;
  if (value == null || value === 0) return null;
  return (
    <span>
      {value} {label}
    </span>
  );
}

function pluralLessons(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'видео лекције';
  return 'видео лекција';
}
function pluralCourses(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'курс';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'курса';
  return 'курсева';
}

/** Video preview card: links to the featured course (skeleton while loading). */
function VideoPreviewCard({ catalog, className = '' }) {
  const { loading, featured, coursesCount, lessonsCount } = catalog;
  return (
    <Link
      to={courseHref(featured)}
      className={`group relative block overflow-hidden rounded-3xl bg-ink shadow-xl ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40 ${className}`}
      aria-label={featured?.title ? `Погледај курс: ${featured.title}` : 'Погледај курсеве'}
    >
      <div className="aspect-video relative">
        {featured?.thumbnail_url ? (
          <img src={featured.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink to-brand-950" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-2xl motion-safe:transition-transform motion-safe:group-hover:scale-110">
            <Play className="w-7 h-7 text-white ml-1" fill="white" aria-hidden="true" />
          </span>
        </div>
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
          <Video className="w-3.5 h-3.5" aria-hidden="true" /> Погледај како функционише
        </span>
      </div>
      <div className="px-4 py-3 bg-ink text-white">
        {loading ? (
          <span className="block h-4 w-2/3 rounded bg-white/20 motion-safe:animate-pulse" aria-hidden="true" />
        ) : (
          <span className="block text-sm font-bold truncate">{featured?.title || 'Видео курсеви за малу матуру'}</span>
        )}
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
          <StatChip loading={loading} value={lessonsCount} label={pluralLessons(lessonsCount || 0)} />
          <StatChip loading={loading} value={coursesCount} label={pluralCourses(coursesCount || 0)} />
          <span>Часови уживо</span>
        </span>
      </div>
    </Link>
  );
}

function TestimonialCard({ t, className = '' }) {
  return (
    <figure className={`flex flex-col bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      <blockquote className="text-ink text-base leading-relaxed flex-1">
        <p>{t.text}</p>
      </blockquote>
      <figcaption className="flex items-center gap-3 mt-6">
        <span className="w-11 h-11 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-lg" aria-hidden="true">
          {t.author.charAt(0)}
        </span>
        <span>
          <span className="block font-bold text-ink">{t.author}</span>
          <span className="block text-sm text-gray-500">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Desktop (>=768px, motion allowed): slow marquee; the duplicated copy is aria-hidden,
 * pauses on hover/focus and via an explicit button. Reduced motion: static grid.
 * Mobile: scroll-snap carousel with peek of the next card, dots and "1 / N".
 */
function Testimonials({ items }) {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  const onScroll = () => {
    const el = trackRef.current;
    const card = el?.firstElementChild;
    if (!card) return;
    const step = card.getBoundingClientRect().width + 16;
    setActive(Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / step))));
  };
  const goTo = (i) => {
    const el = trackRef.current;
    const card = el?.children[i];
    if (card) el.scrollTo({ left: card.offsetLeft - 20, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        {reduced ? (
          <ul className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-6">
            {items.map((t) => (
              <li key={t.author} className="flex">
                <TestimonialCard t={t} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <div
              className="flex w-max gap-6 animate-testimonial-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
              style={paused ? { animationPlayState: 'paused' } : undefined}
            >
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex gap-6" aria-hidden={copy === 1 ? 'true' : undefined}>
                  {[...items, ...items].map((t, i) => (
                    <li key={i} className="w-[min(380px,40vw)] flex" aria-hidden={i >= items.length ? 'true' : undefined}>
                      <TestimonialCard t={t} className="w-full" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300"
              >
                {paused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
                {paused ? 'Настави померање' : 'Заустави померање'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden" role="region" aria-roledescription="carousel" aria-label="Искуства">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          className="relative flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((t, i) => (
            <li
              key={t.author}
              className="snap-start shrink-0 w-[84%] flex"
              aria-roledescription="slide"
              aria-label={`${i + 1} од ${items.length}`}
            >
              <TestimonialCard t={t} className="w-full" />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => goTo(Math.max(0, active - 1))} disabled={active === 0} className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40" aria-label="Претходно искуство">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Искуство ${i + 1}`}
                aria-current={active === i ? 'true' : undefined}
                className="p-1.5"
              >
                <span className={`block h-2 rounded-full motion-safe:transition-all ${active === i ? 'w-6 bg-brand' : 'w-2 bg-gray-300'}`} />
              </button>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-600 tabular-nums" aria-live="polite">{active + 1} / {items.length}</span>
          <button type="button" onClick={() => goTo(Math.min(items.length - 1, active + 1))} disabled={active === items.length - 1} className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40" aria-label="Следеће искуство">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}

// Counter Animation Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(parseInt(end, 10));
      return undefined;
    }
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
  }, [end, duration, hasAnimated, reduced]);

  return (
    <span ref={countRef}>
      {count}{suffix}
    </span>
  );
}

// Scroll Fade-In Wrapper
function FadeInSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`motion-safe:transition-all motion-safe:duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Featured Course Showcase Card with expand-right animation
function FeaturedCourseCard() {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reduced) {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);

  const features = [
    { icon: Video, text: 'HD видео лекције', desc: 'Квалитетни снимци за свако градиво' },
    { icon: BookOpen, text: 'Материјали уз лекције', desc: 'Писани материјали који прате сваку лекцију' },
    { icon: Target, text: 'Задаци са решењима', desc: 'Вежбање уз детаљна објашњења' },
    { icon: Award, text: 'Пробни тестови', desc: 'Пријемни и online квизови за проверу' },
    { icon: MessageCircle, text: 'Подршка наставнице', desc: 'Помоћ кад год вам затреба' },
    { icon: Clock, text: 'Трајан приступ', desc: 'Учите својим темпом, без рокова' },
  ];

  return (
    <div ref={ref} className="mb-16 max-w-5xl mx-auto">
      <div
        className={`rounded-3xl overflow-hidden shadow-2xl border border-gray-100 transition-all duration-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="grid md:grid-cols-5">
          {/* Left Panel - main info */}
          <div
            className={`md:col-span-2 bg-gradient-to-br from-brand to-brand-700 p-8 md:p-12 text-white flex flex-col justify-center transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
              Шта добијате уз наше курсеве?
            </h3>
            <p className="text-white leading-relaxed mb-8">
              Све што вам је потребно за успешну припрему мале матуре — на једном месту.
            </p>
            <Link
              to="/courses"
              className="self-start bg-white text-brand px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg"
            >
              Погледај курсеве <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Right Panel - features, slides in from right */}
          <div
            className={`md:col-span-3 bg-white p-8 md:p-12 transition-all duration-700 delay-300 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 md:translate-x-full translate-y-8 md:translate-y-0'
            }`}
          >
            <h4
              className={`text-lg font-bold text-ink mb-6 transition-all duration-500 delay-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Уз сваки курс добијате:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 rounded-2xl hover:bg-red-50/50 transition-all duration-500 group cursor-default ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${700 + i * 100}ms` }}
                  >
                    <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-all motion-safe:group-hover:scale-110 transform duration-300">
                      <Icon className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h5 className="font-bold text-ink text-sm">{f.text}</h5>
                      <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const { checkAndStartTutorial } = useOnboarding();
  const catalog = useHomeCatalog();
  const reducedMotion = usePrefersReducedMotion();
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const howItWorksRef = useRef(null);

  useEffect(() => {
    checkAndStartTutorial('home');
  }, [checkAndStartTutorial]);

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
      features: ['Онлајн часови', 'Материјали', 'Подршка']
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
      text: '"Видео лекције су нас спасиле. Дете све разуме из прве, без драме и без мог живцирања. Ја се коначно одморила."',
      author: 'Јелена М.',
      role: 'Родитељ',
    },
    {
      text: '"Купили смо курс и за недељу дана дете само седне и учи. Не морам ништа да објашњавам. Вреди сваки динар."',
      author: 'Марина Т.',
      role: 'Родитељ',
    },
    {
      text: '"Уписао сам жељену гимназију. Лекције су ми биле јасне, а задаци су ме стварно спремили за пријемни."',
      author: 'Стефан К.',
      role: 'Ученик',
    },
  ];

  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Српски у Срцу",
      "alternateName": "Srpski u Srcu",
      "url": "https://srpskiusrcu.rs",
      "description": "Srpski u Srcu - Online платформа за видео курсеве српског језика и припрему мале матуре (mala matura)",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://srpskiusrcu.rs/courses?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Српски у Срцу",
      "alternateName": "Srpski u Srcu",
      "url": "https://srpskiusrcu.rs",
      "logo": "https://srpskiusrcu.rs/logoFULL.svg",
      "founder": {
        "@type": "Person",
        "name": "Марина Лукић",
        "jobTitle": "Наставница српског језика",
        "description": "Наставница са 27 година искуства, дипломирани филолог"
      },
      "description": "Online платформа за видео курсеве српског језика за припрему мале матуре",
      "areaServed": "RS",
      "availableLanguage": "sr",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "ratingCount": "700",
        "reviewCount": "3"
      },
      "review": [
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Јелена М." },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Видео лекције су нас спасиле. Дете све разуме из прве, без драме и без мог живцирања."
        },
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Марина Т." },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Купили смо курс и за недељу дана дете само седне и учи. Не морам ништа да објашњавам. Вреди сваки динар."
        },
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Стефан К." },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Уписао сам жељену гимназију. Лекције су ми биле јасне, а задаци су ме стварно спремили за пријемни."
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу",
      "url": "https://srpskiusrcu.rs",
      "description": "Online платформа за припрему мале матуре из српског језика — видео курсеви, online часови уживо, пробни тестови",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Крушевац",
        "addressCountry": "RS"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "43.58",
        "longitude": "21.33"
      },
      "areaServed": [
        { "@type": "City", "name": "Београд" },
        { "@type": "City", "name": "Крушевац" },
        { "@type": "City", "name": "Нови Сад" },
        { "@type": "Country", "name": "Србија" }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="ПРИПРЕМА МАЛЕ МАТУРЕ ИЗ СРПСКОГ - ОНЛАЈН ВИДЕО КУРСЕВИ"
        description="Srpski u Srcu - Online видео курсеви за припрему мале матуре (mala matura) из српског језика. Наставница Марина Лукић са 27 година искуства. Учи у своје време, 24/7 приступ."
        canonical="/"
        jsonLd={homeJsonLd}
        keywords="mala matura srpski jezik, priprema za malu maturu, online kursevi srpskog, video lekcije srpski jezik, zavrsni ispit 8 razred, srpski jezik online nastava, kurs srpskog za malu maturu"
      />
    <div className="min-h-screen bg-paper font-sans text-ink">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Subtle notebook motif: ruled lines + red margin (static, decorative) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 35px, rgba(59,130,246,0.06) 35px, rgba(59,130,246,0.06) 36px)' }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-2.5 sm:left-4 w-px bg-brand/15 lg:hidden" />

        {/* Desktop illustration with monitor (>=1024px) */}
        <div className="absolute right-0 bottom-0 hidden lg:block w-[55%]">
          <div className="relative">
            <img src="/pozadinaHeroSekcija.webp" alt="" className="w-full h-auto" draggable={false} width="1122" height="779" />
            <Link
              to={courseHref(catalog.featured)}
              className="group absolute overflow-hidden bg-black rounded-[0.5%] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/50"
              style={{ top: '15%', left: '37%', width: '52%', height: '45%' }}
              aria-label={catalog.featured?.title ? `Погледај курс: ${catalog.featured.title}` : 'Погледај курсеве'}
            >
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 text-white text-xs font-medium">
                <Video className="w-3.5 h-3.5" aria-hidden="true" /> Погледај како функционише
              </span>
              <span className="absolute inset-0 flex items-center justify-center pb-[8%]">
                <span className="w-20 h-20 bg-brand rounded-full flex items-center justify-center shadow-2xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110">
                  <Play className="w-9 h-9 text-white ml-1" fill="white" aria-hidden="true" />
                </span>
              </span>
              <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex items-center justify-center gap-4 text-white text-xs font-medium">
                <StatChip loading={catalog.loading} value={catalog.lessonsCount} label={pluralLessons(catalog.lessonsCount || 0)} />
                <StatChip loading={catalog.loading} value={catalog.coursesCount} label={pluralCourses(catalog.coursesCount || 0)} />
                <span>Часови уживо</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-6 pt-8 pb-12 sm:pt-12 md:pb-16 lg:pt-28 lg:pb-24 lg:min-h-[680px]">
          <div className="grid md:grid-cols-[1fr_auto] lg:block items-center gap-6">
            <div className="max-w-2xl relative z-10 text-center md:text-left">
              <h1 className="font-bold leading-[1.1] text-ink flex flex-col gap-1 lg:gap-2">
                <span className="text-[1.75rem] sm:text-4xl lg:text-5xl">Учите српски језик и књижевност</span>
                <span className="text-[1.75rem] sm:text-4xl lg:text-6xl">са разумевањем</span>
                <span className="text-[2.6rem] sm:text-6xl lg:text-8xl relative inline-block self-center md:self-start mt-1">
                  и љубављу.
                  <svg aria-hidden="true" className="absolute w-full h-3 lg:h-4 -bottom-1 lg:-bottom-2 left-0 text-brand" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="6" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="mt-5 lg:mt-7 text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                Платформа која гради трајно знање кроз видео материјале и онлајн часове.
              </p>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start">
                {['Видео лекције 24/7', 'Припрема за малу матуру', 'Онлајн часови уживо'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand" aria-hidden="true" />
                    <span className="text-sm sm:text-base font-medium text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <Link
                  to="/courses"
                  data-tour="home-hero-cta"
                  className="inline-flex items-center justify-center gap-2 min-h-[52px] bg-brand text-white px-8 py-3.5 rounded-full hover:bg-brand-700 transition-colors shadow-xl shadow-red-900/10 text-lg font-bold"
                >
                  Приступи курсевима <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <a
                  href="#kako-funkcionise"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('kako-funkcionise')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
                  }}
                  className="inline-flex items-center justify-center min-h-[52px] px-8 py-3.5 rounded-full border-2 border-ink text-ink hover:bg-ink hover:text-white transition-colors text-lg font-bold"
                >
                  Како функционише?
                </a>
              </div>

              {/* Compact trust row — visible on every width */}
              <dl className="mt-8 grid grid-cols-3 max-w-md mx-auto md:mx-0 rounded-2xl bg-white/80 border border-gray-100 shadow-sm divide-x divide-gray-100">
                {stats.map((st) => (
                  <div key={st.label} className="px-2 py-3 text-center flex flex-col-reverse">
                    <dt className="text-xs sm:text-sm text-gray-500 font-medium">{st.label}</dt>
                    <dd className="text-2xl sm:text-3xl font-black text-ink leading-tight">{st.number}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Tablet: mascot next to text */}
            <img
              src="/mascot/alano-wave.webp"
              alt="Алано, маскота платформе, маше"
              className="hidden md:block lg:hidden w-56 h-auto drop-shadow-xl"
              width="394"
              height="596"
            />
          </div>

          {/* Phone + tablet: video preview card under the CTA */}
          <div className="lg:hidden relative mt-10 max-w-xl mx-auto md:mx-0">
            <VideoPreviewCard catalog={catalog} />
          </div>
        </div>
      </section>

      {/* 1.5 INICIJALNI TESTOVI SECTION — full screen */}
      <section
        id="inicijalni-testovi"
        className="md:min-h-screen flex flex-col justify-center py-14 md:py-20 bg-gradient-to-b from-paper via-white to-paper relative overflow-hidden scroll-mt-24"
      >

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
          <FadeInSection>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-red-50 text-brand text-sm font-bold px-4 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                Бесплатно · без регистрације
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-ink text-center mb-4">
              Припреми се за иницијалне тестове
            </h2>
            <p className="text-gray-600 text-lg md:text-xl text-center max-w-2xl mx-auto mb-14">
              Провери своје знање из српског језика пре почетка школске године. Одабери свој
              разред и уради иницијални тест — тачне одговоре видиш одмах.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {inicijalniTestoviList.map((test, i) => (
              <FadeInSection key={test.razred} delay={i * 120}>
                <Link
                  to={`/inicijalni-test/${test.razred}`}
                  className="group flex flex-col h-full bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:border-brand/40 motion-safe:hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center shadow-lg motion-safe:group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-black text-white">{test.razred}</span>
                    </div>
                    <ClipboardList className="w-6 h-6 text-gray-300 group-hover:text-brand transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-ink mb-1">
                    {test.razred}. разред
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                    {test.kratakOpis}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-5">
                    <span>{test.pitanja.length} питања</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>~5 мин</span>
                  </div>

                  <span className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-ink text-white text-sm font-bold group-hover:bg-brand transition-colors">
                    Уради тест
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection delay={200}>
            <p className="text-center text-sm text-gray-500 mt-10">
              Тестови за 5, 6, 7. и 8. разред — граматика, правопис и књижевност.
            </p>
          </FadeInSection>

          <div className="mt-8 max-w-md mx-auto">
            <MascotHint message="Треба ти помоћ око тестова? 👋" />
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section
        id="kako-funkcionise"
        ref={howItWorksRef}
        className={`pt-16 pb-12 md:pt-32 md:pb-24 bg-paper relative overflow-hidden scroll-mt-20 motion-safe:transition-all motion-safe:duration-700 ${howItWorksVisible || reducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink mb-4">
              Како функционише?
            </h2>
          </div>

          {/* Vertical Snake Path Layout */}
          <div className="relative">
            {/* Red Curved Path - SVG */}
            <svg className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 hidden md:block" style={{ zIndex: 1 }} preserveAspectRatio="none" viewBox="0 0 400 900">
              <path
                d="M 200 60 Q 100 140, 200 220 Q 300 300, 200 380 Q 100 460, 200 540 Q 300 620, 200 700"
                stroke="#D62828"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>

            <div className="space-y-10 md:space-y-16 relative" style={{ zIndex: 2 }}>

              {/* Step 1 - Left */}
              <div className="flex items-center gap-4 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-[6px] border-brand relative z-10">
                    <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-brand" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">1</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-ink mb-2">
                    Изаберите курс
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Прегледајте наше курсеве или пакете онлајн наставе и изаберите онај који вам одговара.
                  </p>
                </div>
              </div>

              {/* Step 2 - Right */}
              <div className="flex items-center gap-4 md:gap-8 flex-row-reverse">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-[6px] border-brand relative z-10">
                    <svg className="w-8 h-8 md:w-12 md:h-12 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">2</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-ink mb-2">
                    Извршите уплату
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Пратите упутства за уплату и на вашем панелу окачите доказ о извршеној трансакцији.
                  </p>
                </div>
              </div>

              {/* Step 3 - Left */}
              <div className="flex items-center gap-4 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-[6px] border-brand relative z-10">
                    <svg className="w-8 h-8 md:w-12 md:h-12 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">3</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-ink mb-2">
                    Потврда уплате
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Контактираћемо вас email-ом у року од 24h са потврдом и даљим инструкцијама.
                  </p>
                </div>
              </div>

              {/* Step 4 - Right */}
              <div className="flex items-center gap-4 md:gap-8 flex-row-reverse">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-[6px] border-brand relative z-10">
                    <Video className="w-8 h-8 md:w-12 md:h-12 text-brand" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center shadow-lg z-20">
                    <span className="text-xl font-black text-white">4</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 md:p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl md:text-2xl font-bold text-ink mb-2">
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
      <section className="py-14 md:py-20 bg-paper overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
                Наши курсеви
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Одаберите курс који одговара вашим потребама
              </p>
            </div>
          </FadeInSection>

          <FeaturedCourseCard />
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="py-14 md:py-20 bg-paper relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <FadeInSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-bold text-ink mb-4">
                Наш успех у бројкама
              </h2>
              <p className="text-gray-600 text-xl">
                Резултати говоре више од речи
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <FadeInSection delay={0}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-700 rounded-3xl blur-xl opacity-10"></div>
                <div className="relative bg-white border-2 border-brand/30 rounded-3xl p-6 md:p-10 text-center hover:border-brand transition-all hover:shadow-2xl">
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-brand to-brand-700 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end="700" suffix="+" />
                  </div>
                  <div className="text-base font-bold uppercase tracking-wider text-gray-600">Ученика</div>
                </div>
              </div>
            </FadeInSection>

            {/* Stat 2 */}
            <FadeInSection delay={150}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-ink to-gray-700 rounded-3xl blur-xl opacity-10"></div>
                <div className="relative bg-white border-2 border-gray-300 rounded-3xl p-6 md:p-10 text-center hover:border-ink transition-all hover:shadow-2xl">
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-ink to-gray-700 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end="98" suffix="%" />
                  </div>
                  <div className="text-base font-bold uppercase tracking-wider text-gray-600">Успешност</div>
                </div>
              </div>
            </FadeInSection>

            {/* Stat 3 */}
            <FadeInSection delay={300}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-700 rounded-3xl blur-xl opacity-10"></div>
                <div className="relative bg-white border-2 border-brand/30 rounded-3xl p-6 md:p-10 text-center hover:border-brand transition-all hover:shadow-2xl">
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-brand to-brand-700 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end="27" />
                  </div>
                  <div className="text-base font-bold uppercase tracking-wider text-gray-600">Година искуства</div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      {/* TODO(content): with written parental permission, add real first name + initial,
          school and final exam score to each testimonial to make them verifiable. */}
      <section className="py-14 md:py-20 bg-paper overflow-hidden" aria-labelledby="testimonials-title">
        <FadeInSection>
          <div className="mb-10 md:mb-12 text-center px-6">
            <h2 id="testimonials-title" className="text-3xl md:text-4xl font-bold text-ink mb-4">Речи наших ученика</h2>
            <p className="text-gray-600 text-lg">Искуства родитеља и ученика</p>
          </div>
        </FadeInSection>
        <Testimonials items={testimonials} />
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-16 md:py-24 bg-paper relative overflow-hidden">

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <FadeInSection>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-ink">
              Немојте чекати, <br />
              <span className="text-brand">почните данас.</span>
            </h2>

            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
              Придружите се стотинама ученика који су већ осигурали своје место.
            </p>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-brand text-white px-8 md:px-14 py-4 md:py-5 rounded-full hover:bg-brand-700 transition-colors shadow-xl text-lg md:text-xl font-bold flex items-center justify-center gap-3"
              >
                Направи налог <ArrowRight className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
              </Link>
              <Link
                to="/courses"
                className="w-full sm:w-auto border-2 border-ink text-ink px-8 md:px-14 py-4 md:py-5 rounded-full hover:bg-ink hover:text-white transition-colors text-lg md:text-xl font-bold text-center"
              >
                Истражи курсеве
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
    </>
  );
}
