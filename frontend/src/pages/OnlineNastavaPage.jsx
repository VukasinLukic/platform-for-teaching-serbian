import { useState, useEffect, useRef } from 'react';
import { ensureEmailVerifiedForPurchase } from '../components/auth/verification';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Video, Calendar, Users, Clock, CheckCircle, X, BookOpen } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { formatPrice } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import { functions } from '../services/firebase';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import AuthRequiredModal from '../components/ui/AuthRequiredModal';

export default function OnlineNastavaPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState([false, false, false, false]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [purchasingId, setPurchasingId] = useState(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    loadPackages();
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

  const loadPackages = async () => {
    try {
      // Load packages from JSON file in public folder
      const response = await fetch('/paketiOnlajnNastave.json');
      const packagesList = await response.json();
      setPackages(packagesList);
    } catch (error) {
      console.error('Error loading packages:', error);
      // Fallback to empty array if fetch fails
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Get color classes based on package ID (hardcoded for Tailwind to detect)
  const getPackageColor = (packageId) => {
    switch (packageId) {
      case 'basic':
        return 'from-purple-600 to-purple-800';
      case 'group':
        return 'from-brand to-brand-700';
      case 'individual':
        return 'from-ink to-gray-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const handlePurchase = async (pkg) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const verification = await ensureEmailVerifiedForPurchase();
    if (!verification.ok) {
      alert(verification.message);
      return;
    }

    setPurchasingId(pkg.id);
    try {
      // Generate payment reference using Cloud Function
      const generatePaymentRefFunction = httpsCallable(functions, 'generatePaymentReference');
      const result = await generatePaymentRefFunction();
      const paymentRef = result.data.paymentReference;

      // For group package, first month is discounted to 2500 RSD
      const amount = pkg.id === 'group' ? 2500 : pkg.price;

      // Navigate to payment slip page with payment data
      navigate('/uplatnica', {
        state: {
          paymentData: {
            amount,
            packageName: pkg.name,
            paymentReference: paymentRef,
            userName: userProfile?.ime || '',
          }
        }
      });
    } catch (error) {
      console.error('Error generating payment reference:', error);
      alert('Грешка при креирању уплатнице. Покушајте поново.');
    } finally {
      setPurchasingId(null);
    }
  };

  const onlineFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Шта ако пропустим час?", "acceptedAnswer": { "@type": "Answer", "text": "Сви часови се снимају и биће доступни 48 сати након одржавања часа. Можете их погледати у своје време." } },
      { "@type": "Question", "name": "Који разреди могу да се пријаве?", "acceptedAnswer": { "@type": "Answer", "text": "Онлајн настава је намењена ученицима од 5. до 8. разреда основне школе који се припремају за малу матуру из српског језика." } },
      { "@type": "Question", "name": "Могу ли да откажем претплату?", "acceptedAnswer": { "@type": "Answer", "text": "Да! Пошто су пакети месечни, можете отказати у било ком тренутку. Нема обавеза, нема скривених трошкова." } },
      { "@type": "Question", "name": "Који термин бирам за групне/индивидуалне часове?", "acceptedAnswer": { "@type": "Answer", "text": "Групни: Четвртком у 18:00. Индивидуални: Уторком, термин бирате при упису." } },
      { "@type": "Question", "name": "Шта ми треба за online часове?", "acceptedAnswer": { "@type": "Answer", "text": "Потребан вам је компјутер, таблет или телефон са интернетом, камером и микрофоном. Користимо Google Meet који је бесплатан." } }
    ]
  };

  const onlineBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Почетна", "item": "https://srpskiusrcu.rs/" },
      { "@type": "ListItem", "position": 2, "name": "Онлајн настава", "item": "https://srpskiusrcu.rs/online-nastava" }
    ]
  };

  const onlineCourseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Онлајн настава српског језика уживо",
    "description": "Интерактивни online часови српског језика са наставницом уживо преко Google Meet. Групни и индивидуални часови за припрему мале матуре.",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу",
      "url": "https://srpskiusrcu.rs"
    },
    "educationalLevel": "Основна школа (5-8. разред)",
    "inLanguage": "sr",
    "hasCourseInstance": [
      {
        "@type": "CourseInstance",
        "courseMode": "online",
        "name": "Групни часови",
        "instructor": { "@type": "Person", "name": "Марина Лукић" },
        "courseSchedule": { "@type": "Schedule", "repeatFrequency": "P1W", "byDay": "Thursday", "startTime": "18:00" }
      },
      {
        "@type": "CourseInstance",
        "courseMode": "online",
        "name": "Индивидуални часови",
        "instructor": { "@type": "Person", "name": "Марина Лукић" },
        "courseSchedule": { "@type": "Schedule", "repeatFrequency": "P1W", "byDay": "Tuesday" }
      }
    ]
  };

  return (
    <>
      <SEO
        title="ОНЛАЈН НАСТАВА СРПСКОГ ЈЕЗИКА | ЧАСОВИ УЖИВО ОД 2500 ДИН"
        description="Online часови српског језика уживо са наставницом. Групни часови 3500 дин, индивидуални 6000 дин месечно. Припрема за малу матуру 5-8. разред."
        canonical="/online-nastava"
        jsonLd={[onlineFaqJsonLd, onlineBreadcrumbJsonLd, onlineCourseJsonLd]}
        keywords="online nastava srpskog jezika, casovi uzivo srpski, grupni casovi srpski, individualni casovi srpski jezik, priprema mala matura online, online profesor srpski"
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Молимо вас да се пријавите или направите налог како бисте купили online часове."
      />

    <div className="min-h-screen bg-white font-sans text-ink">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand to-brand-700 text-white py-14 md:py-20 rounded-b-3xl md:rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
            <span className="text-sm font-bold uppercase tracking-wider">Онлајн настава уживо</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">
            Интерактивни часови<br />са наставницом
          </h1>
          <p className="text-base md:text-xl text-white max-w-3xl mx-auto">
            Придружите се нашим online групним часовима уживо преко Google Meet. Учите у интерактивној атмосфери где сваки ученик добија пажњу и подршку коју заслужује.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-surface to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-ink mb-3 md:mb-4">
              Како функционише?
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Једноставан процес од уписа до учења
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
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
                Изаберите пакет
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Изаберите пакет који вам одговара и извршите уплату
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
                Потврда уплате
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Контактираћемо вас email-ом у року од 24h
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
                Распоред часова
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Добијате линк за групу и распоред часова
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
                Придружите се часовима и напредујте
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Info */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-12 bg-gradient-to-br from-ink to-gray-800 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Распоред часова</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Групни часови</h3>
                      <p className="text-white">4 часа месечно (по 1 сат)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Calendar className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Индивидуални часови</h3>
                      <p className="text-white">Уторком (по договору) - 4 часа месечно (по 1 сат)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Video className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Платформа</h3>
                      <p className="text-white">Google Meet - лако приступ са било ког уређаја</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Величина групе</h3>
                      <p className="text-white">Групни: макс. 8 ученика | Индивидуални: 1-на-1</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-ink mb-6">Шта добијате?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Директну интеракцију са наставницом</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Могућност постављања питања у реалном времену</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Снимљени часови на платформи и вежбања са наставницом</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Материјале за вежбање после сваког часа</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Праћење напретка и персонализоване препоруке</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Подршку преко email-а између часова</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-bold text-ink mb-3 md:mb-4">
              Изаберите свој пакет
            </h2>
            <p className="text-gray-600 text-base md:text-lg">
              Флексибилни месечни пакети прилагођени вашим потребама
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6 items-stretch max-w-5xl mx-auto">

            {/* LEFT - Individual Package */}
            {(() => {
              const pkg = packages.find(p => p.id === 'individual');
              if (!pkg) return null;
              return (
                <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 motion-safe:hover:-translate-y-1 overflow-hidden border border-info-400/30 flex flex-col">
                  <div className="bg-info-600/10 p-6">
                    <h3 className="text-lg font-bold mb-1 text-info-600">Индивидуални часови</h3>
                    <p className="text-info-600 text-sm mb-4">Индивидуална настава 1-на-1</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-info-600">{formatPrice(pkg.price)}</span>
                    </div>
                    <p className="text-info-600 text-xs mt-1">месечно</p>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4 pb-4 border-b border-info-400/15">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Број часова:</span>
                        <span className="font-bold text-info-600 text-base">{pkg.sessions}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasingId === pkg.id}
                      className="w-full bg-info-600 hover:bg-info-500 text-white px-6 py-3 rounded-full hover:shadow-md transition-all font-bold text-sm transform motion-safe:hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2 mt-auto"
                    >
                      {purchasingId === pkg.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Учитавање...
                        </>
                      ) : (
                        'Купи пакет'
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* CENTER - Group Package (Featured) */}
            {(() => {
              const pkg = packages.find(p => p.id === 'group');
              if (!pkg) return null;
              return (
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:-translate-y-1 overflow-hidden border-2 border-brand/40 md:scale-105 z-10 flex flex-col">
                  {/* Most Popular Banner */}
                  <div className="absolute top-5 -right-10 bg-brand text-white px-10 py-1.5 rotate-45 text-xs font-bold uppercase tracking-wider shadow-md z-20">
                    Најпопуларније
                  </div>

                  <div className="bg-brand-50 p-6">
                    <h3 className="text-lg font-bold mb-1 text-brand">Групни часови</h3>
                    <p className="text-brand-800 text-xs mb-3">Групна настава уживо</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base line-through text-brand-800">{formatPrice(pkg.price)}</span>
                      <span className="text-3xl font-black text-brand-800 whitespace-nowrap">2.500 дин</span>
                    </div>
                    <p className="text-brand-800 text-xs mt-1 font-medium">1 месец</p>
                    <p className="text-brand-800 text-xs mt-0.5">Остали месеци: {formatPrice(pkg.price)}</p>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4 pb-4 border-b border-brand/15">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Број часова:</span>
                        <span className="font-bold text-brand-800 text-base">{pkg.sessions}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasingId === pkg.id}
                      className="w-full bg-brand hover:bg-brand-700 text-white px-6 py-3 rounded-full hover:shadow-md transition-all font-bold text-sm transform motion-safe:hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2 mt-auto"
                    >
                      {purchasingId === pkg.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Учитавање...
                        </>
                      ) : (
                        'Купи пакет'
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* RIGHT - Create Your Own Group */}
            <div className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 motion-safe:hover:-translate-y-1 overflow-hidden border border-brand-900/25 flex flex-col">
              <div className="bg-brand-900/10 p-6">
                <h3 className="text-lg font-bold mb-1 text-brand-900">Направи своју групу</h3>
                <p className="text-brand-900/80 text-sm mb-4">Учите заједно по повољнијој цени</p>
                <div className="flex items-center gap-3">
                  <Users className="w-10 h-10 text-brand-900/50" />
                  <div>
                    <div className="text-base font-bold text-brand-900">По договору</div>
                    <div className="text-xs text-brand-900/75">Прилагођено вама</div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4 pb-4 border-b border-brand-900/15">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium text-sm">Број часова:</span>
                    <span className="font-bold text-brand-900 text-base">По договору</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-900/70 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Флексибилан термин часова</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-900/70 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Прилагођен програм за групу</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-900/70 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Посебне цене за групе</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-900/70 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Снимљени часови на платформи</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-900/70 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Интерактивна настава уживо</span>
                  </div>
                </div>

                <Button as={Link} to="/contact" variant="primary" size="md" className="mt-auto w-full">
                    Контактирајте нас
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-bold text-ink mb-4">
              Често постављана питања
            </h2>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg md:text-xl font-bold text-ink mb-3">
                Шта ако пропустим час?
              </h3>
              <p className="text-gray-600">
                Нема проблема! Сви часови се снимају и биће доступни 48 сати након одржавања часа. Можете их погледати у своје време.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg md:text-xl font-bold text-ink mb-3">
                Који разреди могу да се пријаве?
              </h3>
              <p className="text-gray-600">
                Онлајн настава је намењена ученицима од 5. до 8. разреда основне школе који се припремају за малу матуру из српског језика.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg md:text-xl font-bold text-ink mb-3">
                Могу ли да откажем претплату?
              </h3>
              <p className="text-gray-600">
                Да! Пошто су пакети месечни, можете отказати у било ком тренутку. Нема обавеза, нема скривених трошкова.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg md:text-xl font-bold text-ink mb-3">
                Који термин бирам за групне/индивидуалне часове?
              </h3>
              <p className="text-gray-600">
                <strong>Групни:</strong> Четвртком у 18:00. <strong>Индивидуални:</strong> Уторком, термин бирате при упису.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg md:text-xl font-bold text-ink mb-3">
                Шта ми треба за online часове?
              </h3>
              <p className="text-gray-600">
                Потребан вам је компјутер, таблет или телефон са интернетом, камером и микрофоном. Користимо Google Meet који је бесплатан.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-brand to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">
            Спремни за успех?
          </h2>
          <p className="text-base md:text-xl text-white mb-8">
            Придружите се стотинама задовољних ученика који су постигли одличне резултате
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full sm:w-auto bg-white text-brand px-8 md:px-12 py-4 md:py-5 rounded-full hover:bg-gray-100 transition-all font-bold text-base md:text-xl shadow-lg motion-safe:hover:scale-105 transform"
            >
              Изабери пакет
            </button>
            <Button as={Link} to="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
                Контактирајте нас
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
