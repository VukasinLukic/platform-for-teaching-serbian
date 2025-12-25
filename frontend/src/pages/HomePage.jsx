import { useState, useEffect } from 'react';
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
  Shield,
  Book,
  Target
} from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadCourses();
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

  const benefits = [
    {
      icon: Heart,
      title: 'Учење с разумевањем',
      description: 'Српски језик учимо са љубављу и посвећеношћу. Свака лекција је осмишљена тако да изграђује дубоко разумевање, а не напамет учење.',
    },
    {
      icon: Users,
      title: 'Индивидуална пажња',
      description: 'Свако дете је јединствено. Прилагођавамо наставу вашим потребама и пратимо напредак са посвећеношћу искусне професорке.',
    },
    {
      icon: Shield,
      title: 'Проверени резултати',
      description: 'Преко 15 година искуства и стотине задовољних ученика који су остварили своје снове. Ваш успех је наш успех.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Ученика' },
    { number: '98%', label: 'Успешност' },
    { number: '15', label: 'Година искуства' },
  ];

  const testimonials = [
    {
      text: '"Професорка Марина је са толико љубави и стрпљења објашњавала градиво. Коначно разумем српски језик!"',
      author: 'Марко П.',
      role: 'Ученик',
      rating: 5,
    },
    {
      text: '"Нисам веровала да онлајн настава може бити овако топла и ефикасна. Све препоруке!"',
      author: 'Јелена М.',
      role: 'Родитељ',
      rating: 5,
    },
    {
      text: '"Уписао сам жељену гимназију захваљујући овој припреми. Хвала вам од срца!"',
      author: 'Стефан К.',
      role: 'Ученик',
      rating: 5,
    },
  ];

  const features = [
    {
      icon: Video,
      title: 'Модерне видео лекције',
      description: 'Учите кроз забавне и интерактивне видео материјале прилагођене вашем темпу.',
    },
    {
      icon: Target,
      title: 'Гарантован успех',
      description: 'Пратимо ваш напредак и гарантујемо резултате уз нашу проверену методологију.',
    },
    {
      icon: Users,
      title: 'Подршка заједнице',
      description: 'Учите у групи вршњака и уз сталну подршку ментора током целог процеса.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-white to-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div className="relative z-10 space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-[#1A1A1A]">
                Српски језик <br />
                <span className="relative inline-block">
                  учимо срцем
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#D62828] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>{' '}
                и с разумевањем
              </h1>

              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Припрема за малу матуру уз искусну професорку која верује да се језик учи љубављу,
                стрпљењем и посвећеношћу. Ваш успех је наш успех.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/courses">
                  <button className="bg-[#D62828] text-white px-10 py-4 rounded-full hover:bg-[#B91F1F] transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg font-semibold tracking-wide">
                    Погледај курсеве
                  </button>
                </Link>
                <Link to="/about">
                  <button className="px-10 py-4 rounded-full border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all text-lg font-semibold">
                    О нама
                  </button>
                </Link>
              </div>

              <div className="pt-6 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#D62828] fill-[#D62828]" /> 500+ Ученика
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#D62828] fill-[#D62828]" /> 98% Успешност
                </div>
              </div>
            </div>

            {/* Right - Dynamic Illustration */}
            <div className="relative">
              {/* Gradient Background Orbs */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-[#D62828]/30 via-[#F2C94C]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-tr from-[#F2C94C]/30 via-[#D62828]/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>

              {/* Main Visual - Serbian Flag Inspired Design */}
              <div className="relative z-10 space-y-6">
                {/* Top Card - Trophy Achievement */}
                <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:shadow-[#D62828]/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-white">
                      <div className="text-4xl font-black">98%</div>
                      <div className="text-sm font-bold uppercase tracking-wider opacity-90">Успешност</div>
                    </div>
                  </div>
                </div>

                {/* Middle Card - Students Count */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-3xl p-8 shadow-2xl ml-12 transform hover:-translate-y-2 transition-all duration-300 border-2 border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#F2C94C] p-4 rounded-2xl">
                      <Users className="w-12 h-12 text-[#1A1A1A]" />
                    </div>
                    <div className="text-[#1A1A1A]">
                      <div className="text-4xl font-black">500+</div>
                      <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Задовољних ученика</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card - Heart/Love for Language */}
                <div className="bg-gradient-to-br from-[#1A1A1A] to-gray-800 rounded-3xl p-8 shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#D62828] p-4 rounded-2xl">
                      <Heart className="w-12 h-12 text-white fill-white" />
                    </div>
                    <div className="text-white">
                      <div className="text-2xl font-black">Учимо срцем</div>
                      <div className="text-sm font-bold uppercase tracking-wider opacity-90">и с разумевањем</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Elements */}
              <div className="absolute -top-6 -left-6 bg-[#F2C94C] p-3 rounded-full shadow-lg z-20 animate-bounce">
                <Star className="w-6 h-6 text-[#1A1A1A] fill-[#1A1A1A]" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#D62828] p-3 rounded-full shadow-lg z-20 animate-bounce" style={{animationDelay: '0.5s'}}>
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION - CREATIVE REDESIGN */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #D62828 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-[#F2C94C] text-[#1A1A1A] text-sm font-bold px-4 py-1 rounded-full mb-4">
              НАШЕ ВРЕДНОСТИ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Зашто нас бирају ученици
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const colors = [
                { bg: 'from-[#D62828] to-[#B91F1F]', accent: 'bg-white/20', text: 'text-white' },
                { bg: 'from-[#F2C94C] to-[#F4A261]', accent: 'bg-[#1A1A1A]/10', text: 'text-[#1A1A1A]' },
                { bg: 'from-[#1A1A1A] to-gray-800', accent: 'bg-[#D62828]', text: 'text-white' }
              ];
              const color = colors[index];

              return (
                <div
                  key={index}
                  className={`group bg-gradient-to-br ${color.bg} rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 transform hover:scale-105 relative overflow-hidden`}
                >
                  {/* Animated Background Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative z-10">
                    {/* Icon with Special Background */}
                    <div className={`w-20 h-20 ${color.accent} rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                      <Icon className={`w-10 h-10 ${color.text}`} />
                    </div>

                    {/* Title */}
                    <h3 className={`text-2xl font-bold ${color.text} mb-4 group-hover:translate-x-1 transition-transform`}>
                      {benefit.title}
                    </h3>

                    {/* Description */}
                    <p className={`${color.text} ${index === 1 ? 'opacity-90' : 'opacity-80'} leading-relaxed`}>
                      {benefit.description}
                    </p>

                    {/* Decorative Corner Element */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-white/20 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section className="py-20 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Зашто СРПСКИ У СРЦУ?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Комбинујемо традицију и модерне технологије за најбоље резултате
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-[2rem] text-center hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="bg-[#F7F7F7] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Icon className="w-8 h-8 text-[#D62828]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS & TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* FAQ CTA */}
          <div className="bg-[#D62828] text-white rounded-[3rem] p-10 text-center mb-20 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Често постављана питања</h2>
              <p className="text-white/90 max-w-2xl mx-auto mb-8">
                Имате недоумице? Погледајте одговоре на најчешћа питања пре него што нас контактирате.
              </p>
              <Link to="/faq">
                <button className="bg-white text-[#D62828] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                  Погледајте FAQ
                </button>
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-b border-gray-100 pb-12">
            <div className="col-span-2 md:col-span-1 text-center md:text-left">
               <h3 className="text-lg font-medium text-gray-500 mb-2">Наш успех у бројкама</h3>
               <p className="text-sm text-gray-400">Резултати говоре више од речи</p>
            </div>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-[#D62828] mb-2">{stat.number}</div>
                <div className="text-sm font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION - FULL WIDTH */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">Шта кажу наши ученици</h2>
            <p className="text-gray-600 text-lg">Искуства која инспиришу</p>
          </div>
        </div>

        {/* Full Width Scrolling Container */}
        <div className="relative w-full overflow-hidden py-8">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="flex gap-8 animate-scroll pl-8">
            {/* Duplicate testimonials for infinite effect */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-[#F7F7F7] to-white p-10 rounded-3xl relative hover:shadow-2xl transition-all flex-shrink-0 w-[420px] border-2 border-gray-100 hover:border-[#D62828]/30">
                {/* Star Badge - Positioned Inside Card */}
                <div className="absolute top-6 right-6">
                  <div className="bg-[#F2C94C] rounded-full p-3 shadow-lg">
                    <Star className="w-5 h-5 text-[#1A1A1A] fill-[#1A1A1A]" />
                  </div>
                </div>

                {/* Quote Content */}
                <p className="text-[#1A1A1A] text-lg italic mb-8 leading-relaxed pt-4">
                  {t.text}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#1A1A1A] text-lg">{t.author}</div>
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wide">{t.role}</div>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#D62828] via-[#F2C94C] to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-white relative z-10 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D62828] opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F2C94C] opacity-5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block bg-[#D62828] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 animate-pulse">
            Упис је у току!
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[#1A1A1A]">
            Немојте чекати, <br/>
            <span className="text-[#D62828]">успех почиње данас.</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Придружите се стотинама ученика који су већ осигурали своје место у жељеној средњој школи.
            Креирајте налог за мање од минут.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <button className="bg-[#D62828] text-white px-12 py-5 rounded-full hover:bg-[#B91F1F] transition-all transform hover:scale-105 shadow-xl text-xl font-bold tracking-wide flex items-center gap-2">
                Направи Налог <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
            <Link to="/courses">
              <button className="bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] px-12 py-5 rounded-full hover:bg-[#1A1A1A] hover:text-white transition-all text-xl font-bold">
                Истражи Курсеве
              </button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#D62828]" /> Без скривених трошкова
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#D62828]" /> 7 дана гаранција
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
