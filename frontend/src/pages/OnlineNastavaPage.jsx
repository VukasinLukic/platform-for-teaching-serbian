import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Users, Clock, CheckCircle, X, BookOpen } from 'lucide-react';
import { formatPrice } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import PaymentModal from '../components/payment/PaymentModal';

export default function OnlineNastavaPage() {
  const { user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState([false, false, false, false]);
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
      case 'semester':
        return 'from-[#D62828] to-[#B91F1F]';
      case 'annual':
        return 'from-[#1A1A1A] to-gray-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const handlePurchase = (pkg) => {
    if (!user) {
      alert('Молимо вас да се пријавите како бисте купили online часове');
      return;
    }

    setSelectedPackage(pkg);
    // Generate payment reference
    const reference = `ONL-${Date.now()}-${pkg.id.toUpperCase()}`;
    setPaymentReference(reference);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] text-white py-20 rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
            <span className="text-sm font-bold uppercase tracking-wider">Online настава уживо</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Интерактивни часови<br />са професором
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Придружите се нашим online групним часовима уживо преко Google Meet. Максимално 8 ученика по групи за квалитетну интеракцију и пажњу сваком детету.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-[#F7F7F7] to-white">
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
              <div className="bg-gradient-to-br from-[#F77F00] to-[#DC6B00] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
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
              <div className="bg-gradient-to-br from-[#F2C94C] to-[#D4A927] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
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
              <div className="bg-gradient-to-br from-[#27AE60] to-[#1E8449] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-12 bg-gradient-to-br from-[#1A1A1A] to-gray-800 text-white">
                <h2 className="text-3xl font-bold mb-6">Распоред часова</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-[#F2C94C] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Трајање?</h3>
                      <p className="text-white/80">90 минута интерактивне наставе</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Video className="w-6 h-6 text-[#F2C94C] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Платформа?</h3>
                      <p className="text-white/80">Google Meet - лако приступ са било ког уређаја</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-[#F2C94C] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">Величина групе?</h3>
                      <p className="text-white/80">Максимум 8 ученика за квалитетну интеракцију</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-12">
                <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">Шта добијате?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Директну интеракцију са професором</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Могућност постављања питања у реалном времену</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Снимке свих часова за касније прегледање</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Материјале за вежбање после сваког часа</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Праћење напретка и персонализоване препоруке</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-1" />
                    <p className="text-gray-700">Подршку преко email-а између часова</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Изаберите свој пакет
            </h2>
            <p className="text-gray-600 text-lg">
              Флексибилни пакети прилагођени вашим потребама
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 ${
                  pkg.popular ? 'border-[#D62828]' : 'border-gray-100'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-6 -right-12 bg-[#F2C94C] text-[#1A1A1A] px-12 py-2 rotate-45 text-xs font-bold uppercase tracking-wider shadow-lg">
                    Најпопуларније
                  </div>
                )}

                <div className={`bg-gradient-to-br ${getPackageColor(pkg.id)} p-8 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-white/80 text-sm mb-6">{pkg.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black">{formatPrice(pkg.price)}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-2">{pkg.duration}</p>
                </div>

                <div className="p-8">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Број часова:</span>
                      <span className="font-bold text-[#1A1A1A] text-lg">{pkg.sessions}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#D62828] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    className={`w-full bg-gradient-to-r ${getPackageColor(pkg.id)} text-white px-8 py-4 rounded-full hover:shadow-xl transition-all font-bold text-base transform hover:scale-105`}
                  >
                    Купи пакет
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Често постављана питања
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Шта ако пропустим час?
              </h3>
              <p className="text-gray-600">
                Нема проблема! Сви часови се снимају и биће доступни 48 сати након одржавања часа. Можете их погледати у своје време.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Који разреди могу да се пријаве?
              </h3>
              <p className="text-gray-600">
                Online настава је намењена ученицима од 5. до 8. разреда основне школе који се припремају за малу матуру из српског језика.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Могу ли да променим термин часа?
              </h3>
              <p className="text-gray-600">
                Да! При упису бирате између суботе у 10:00 или 12:00. Можете променити термин уз предходну најаву.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
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
      <section className="py-20 bg-gradient-to-br from-[#D62828] to-[#B91F1F] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Спремни за успех?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Придружите се стотинама задовољних ученика који су постигли одличне резултате
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact">
              <button className="bg-white text-[#D62828] px-12 py-5 rounded-full hover:bg-gray-100 transition-all font-bold text-xl shadow-lg hover:scale-105 transform">
                Контактирајте нас
              </button>
            </Link>
            <Link to="/courses">
              <button className="bg-[#1A1A1A] text-white px-12 py-5 rounded-full hover:bg-gray-800 transition-all font-bold text-xl shadow-lg hover:scale-105 transform">
                Погледај видео курсеве
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaymentModal
          type="online_package"
          packageData={selectedPackage}
          paymentReference={paymentReference}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
