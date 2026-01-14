import { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const [counters, setCounters] = useState({
    experience: 0,
    awards: 0,
    students: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  const stats = [
    { key: 'experience', number: 27, suffix: '', label: 'Година искуства' },
    { key: 'awards', number: 10, suffix: '+', label: 'Републичких награда' },
    { key: 'students', number: 700, suffix: '+', label: 'Ученика' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          stats.forEach(stat => {
            const duration = 2000;
            const steps = 60;
            const increment = stat.number / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= stat.number) {
                current = stat.number;
                clearInterval(timer);
              }

              setCounters(prev => ({
                ...prev,
                [stat.key]: stat.decimals ? current.toFixed(1) : Math.floor(current)
              }));
            }, duration / steps);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-16 pb-24 px-6 bg-gradient-to-b from-white to-[#F7F7F7]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Више од наставе, <br />
            <span className="text-[#D62828]">пут ка успеху.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            СРПСКИ У СРЦУ је платформа која помаже ученицима да се припреме за малу матуру
            из српског језика и књижевности. Са наставницом Марином Лукић, која има радно искуство од 27 година, обезбеђујемо квалитетну наставу која доноси резултате.
          </p>

          {/* Stats Bar */}
          <div ref={statsRef} className="bg-white rounded-[3rem] p-8 shadow-xl max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center border-r last:border-r-0 border-gray-100">
                <div className="text-4xl font-black text-[#D62828] mb-1">
                  {counters[stat.key]}{stat.suffix}
                </div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SECTION - Split Layout */}
      <section className="py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Mobile: Image First with Title Overlay */}
          <div className="lg:hidden mb-12">
            <div className="relative">
              <img
                src="/Nenaslovljeni dizajn (1).png"
                alt="Професорка Марина"
                className="w-full object-contain h-auto rounded-3xl"
              />
              {/* Title Overlay on Mobile */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 rounded-b-3xl">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight text-white">
                  Упознајте наставницу <br />
                  <span className="text-[#F2C94C] relative">
                    Марину Лукић
                  </span>
                </h2>
              </div>
            </div>

            {/* Mobile: Content Below Image */}
            <div className="mt-8 space-y-6">
              <div className="space-y-5 text-base text-gray-600 leading-relaxed">
                <p>
                  Наставница Марина Лукић ради 27 година у основној школи са ученицима од петог до осмог разреда.
                  Завршила је Филолошки факултет у Београду, смер српски језик и књижевност.
                </p>
                <p>
                  Освојила је са својим ученицима бројне републичке награде на Књижевној олимпијади
                  у Сремским Карловцима и Републичком такмичењу из српског језика у Тршићу. Редовно похађа
                  стручна усавршавања и радила је рецензије уџбеника.
                </p>
                <p>
                  Од првог радног дана припрема децу за завршни испит (малу матуру) као и за пријемне испите
                  за упис на факултете. <strong className="text-[#D62828]">Сви њени ученици су успешно урадили тест и уписали жељене
                  школе и факултете.</strong>
                </p>
                <p>
                  Дугогодишње искуство као и велика љубав према деци и образовању довела је до јединствене
                  методологије која комбинује традиционалне технике са модерним приступом.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                {[
                   'Филолошки факултет',
                   'Републичке награде',
                   'Рецензент уџбеника',
                   'Стручна усавршавања'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-[#FFF5F5] to-white p-4 rounded-xl shadow-sm border border-[#D62828]/20">
                    <CheckCircle className="text-[#D62828] flex-shrink-0" size={20} />
                    <span className="font-semibold text-[#1A1A1A]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Side by Side Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-20 items-center">
            {/* Image Side */}
            <div className="relative">
               <img
                 src="/Nenaslovljeni dizajn (1).png"
                 alt="Професорка Марина"
                 className="w-full object-contain h-auto"
               />
            </div>

            {/* Text Side */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Упознајте наставницу <br />
                <span className="text-[#D62828] relative">
                  Марину Лукић
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#F2C94C]"></div>
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Наставница Марина Лукић ради 27 година у основној школи са ученицима од петог до осмог разреда.
                  Завршила је Филолошки факултет у Београду, смер српски језик и књижевност.
                </p>
                <p>
                  Освојила је са својим ученицима бројне републичке награде на Књижевној олимпијади
                  у Сремским Карловцима и Републичком такмичењу из српског језика у Тршићу. Редовно похађа
                  стручна усавршавања и радила је рецензије уџбеника.
                </p>
                <p>
                  Од првог радног дана припрема децу за завршни испит (малу матуру) као и за пријемне испите
                  за упис на факултете. <strong>Сви њени ученици су успешно урадили тест и уписали жељене
                  школе и факултете.</strong>
                </p>
                <p>
                  Дугогодишње искуство као и велика љубав према деци и образовању довела је до јединствене
                  методологије која комбинује традиционалне технике са модерним приступом.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                   'Филолошки факултет',
                   'Републичке награде',
                   'Рецензент уџбеника',
                   'Стручна усавршавања'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <CheckCircle className="text-[#D62828]" size={20} />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-[#D62828] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Придружите се успешним ученицима
            </h2>
            <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
              Започните наставу данас и остварите најбоље резултате на малој матури.
              Упис је у току!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <button className="bg-white text-[#D62828] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                  Погледајте Курсеве
                </button>
              </Link>
              <Link to="/online-nastava">
                <button className="bg-[#F2C94C] text-[#1A1A1A] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#D4A843] transition shadow-lg">
                  Online Настава
                </button>
              </Link>
              <Link to="/contact">
                <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#D62828] transition">
                  Контактирајте Нас
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
