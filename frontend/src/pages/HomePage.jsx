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
  Shield
} from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

export default function HomePage() {
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

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
                  <button className="bg-[#D62828] text-white px-10 py-4 rounded-full hover:bg-[#b01f1f] transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg font-semibold tracking-wide">
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

            {/* Right - Image & Blob */}
            <div className="relative">
              {/* Abstract Blob Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] z-0">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#BFECC9] opacity-60 animate-pulse-slow">
                  <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.2,22.9,71,35.4C59.8,47.9,48.7,59.3,35.9,68.5C23.1,77.7,8.6,84.7,-4.8,92.9C-18.2,101.1,-30.5,110.5,-41.8,104.1C-53.1,97.7,-63.4,75.5,-71.6,58.2C-79.8,40.9,-85.9,28.5,-88.3,15.5C-90.7,2.5,-89.4,-11.1,-82.9,-22.6C-76.4,-34.1,-64.7,-43.5,-52.9,-51.3C-41.1,-59.1,-29.2,-65.3,-16.9,-69.9C-4.6,-74.5,8.1,-77.5,21.3,-78.9" transform="translate(100 100)" />
                </svg>
              </div>

              {/* Main Image */}
              <div className="relative z-10">
                <img 
                  src="/slika2.jpeg" 
                  alt="Profesorka Marina" 
                  className="relative z-10 w-full max-w-md mx-auto rounded-[3rem] shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500 border-4 border-white"
                />

                {/* Floating Elements */}
                {/* Book Icon */}
                <div className="absolute -top-10 -left-4 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce-slow">
                   <Book className="w-8 h-8 text-[#FF6B35]" />
                </div>

                {/* 98% Badge */}
                <div className="absolute top-10 -right-8 bg-white p-4 rounded-2xl shadow-xl z-20 transform rotate-6 animate-float">
                   <div className="text-center">
                     <div className="text-3xl font-black text-[#003366]">98%</div>
                     <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prolaznost</div>
                   </div>
                </div>

                {/* Trophy */}
                <div className="absolute -bottom-6 right-10 bg-[#FFD700] p-4 rounded-full shadow-xl z-20 border-4 border-white">
                  <Trophy className="w-8 h-8 text-[#003366]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-[#BFECC9]/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#BFECC9] transition-colors">
                    <Icon className="w-8 h-8 text-[#003366]" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#003366] mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS & SOCIAL PROOF */}
      <section className="py-20 bg-white rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Why Nauči Srpski? */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#003366] mb-4">
                Zašto Nauči Srpski?
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#F5F3EF] p-8 rounded-[2rem] text-center hover:shadow-lg transition">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-[#FF6B35]">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#003366] mb-2">Moderne Video Lekcije</h3>
                <p className="text-gray-600">Učite kroz zabavne i interaktivne video materijale prilagođene vašem tempu.</p>
              </div>
              <div className="bg-[#F5F3EF] p-8 rounded-[2rem] text-center hover:shadow-lg transition">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-[#BFECC9]">
                   <CheckCircle className="w-8 h-8 text-[#003366]" />
                </div>
                <h3 className="text-xl font-bold text-[#003366] mb-2">Garantovan Uspeh</h3>
                <p className="text-gray-600">Pratimo vaš napredak i garantujemo rezultate uz našu proverenu metodologiju.</p>
              </div>
              <div className="bg-[#F5F3EF] p-8 rounded-[2rem] text-center hover:shadow-lg transition">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-[#003366]">
                   <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#003366] mb-2">Podrška Zajednice</h3>
                <p className="text-gray-600">Učite u grupi vršnjaka i uz stalnu podršku mentora tokom celog procesa.</p>
              </div>
            </div>
          </div>

          {/* FAQ Button Section */}
          <div className="bg-[#003366] text-white rounded-[3rem] p-10 text-center mb-20 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-serif font-bold mb-4">Često postavljana pitanja</h2>
              <p className="text-[#BFECC9] max-w-2xl mx-auto mb-8">
                Imate nedoumice? Pogledajte odgovore na najčešća pitanja pre nego što nas kontaktirate.
              </p>
              <Link to="/faq">
                <button className="bg-white text-[#003366] px-8 py-3 rounded-full font-bold hover:bg-[#BFECC9] transition">
                  Pogledajte FAQ
                </button>
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#BFECC9] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF6B35] opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-b border-gray-100 pb-12">
            <div className="col-span-2 md:col-span-1 text-center md:text-left">
               <h3 className="text-lg font-medium text-gray-500 mb-2">Naš uspeh u brojkama</h3>
               <p className="text-sm text-gray-400">Rezultati govore više od reči</p>
            </div>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-serif font-bold text-[#003366] mb-2">{stat.number}</div>
                <div className="text-sm font-bold uppercase tracking-widest text-[#FF6B35]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid lg:grid-cols-3 gap-8">
             {testimonials.map((t, i) => (
               <div key={i} className="bg-[#F5F3EF] p-8 rounded-3xl relative">
                 <div className="absolute -top-4 left-8">
                   <div className="bg-[#FF6B35] rounded-full p-2">
                     <Star className="w-4 h-4 text-white fill-white" />
                   </div>
                 </div>
                 <p className="text-[#003366] text-lg italic mb-6 leading-relaxed opacity-80">
                   {t.text}
                 </p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                     {t.author.charAt(0)}
                   </div>
                   <div>
                     <div className="font-bold text-[#003366]">{t.author}</div>
                     <div className="text-xs text-gray-500 uppercase font-bold">{t.role}</div>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-[#003366] text-white rounded-t-[4rem] -mt-10 relative z-10 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#BFECC9] opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block bg-[#FF6B35] text-white text-sm font-bold px-4 py-1 rounded-full mb-6 animate-pulse">
            Upis je u toku!
          </div>
          
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Nemojte čekati, <br/>
            <span className="text-[#BFECC9]">uspeh počinje danas.</span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Pridružite se stotinama učenika koji su već osigurali svoje mesto u željenoj srednjoj školi.
            Kreirajte nalog za manje od minut.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <button className="bg-[#BFECC9] text-[#003366] px-12 py-5 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(191,236,201,0.4)] text-xl font-bold tracking-wide flex items-center gap-2">
                Napravi Nalog <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
            <Link to="/courses">
              <button className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-full hover:bg-white/10 transition-all text-xl font-bold">
                Istraži Kurseve
              </button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-medium text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#BFECC9]" /> Bez skrivenih troškova
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#BFECC9]" /> 7 dana garancija
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#002244] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <Book className="w-8 h-8 text-[#BFECC9]" />
                <span className="text-2xl font-serif font-bold">Nauči Srpski</span>
              </Link>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Vaš pouzdan partner u pripremi za malu maturu. 
                Kombinujemo tradiciju i moderne tehnologije za najbolje rezultate.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-[#BFECC9]">Linkovi</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Početna</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">O Nama</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Prijavi se</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-[#BFECC9]">Kontakt</h4>
              <ul className="space-y-4 text-gray-400">
                <li>info@naucisrpski.rs</li>
                <li>{contactPhone}</li>
                <li>Beograd, Srbija</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white">Politika privatnosti</Link>
              <Link to="/terms" className="hover:text-white">Uslovi korišćenja</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add some custom animations in your global CSS or tailwind config if needed, 
// or use standard tailwind animate classes. 
// For now, using standard tailwind classes where possible.

