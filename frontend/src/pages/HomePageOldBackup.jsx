import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  Video,
  GraduationCap,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  MessageCircle,
  Play,
  BookOpen,
  Lightbulb,
  Trophy,
  FileText,
  Calendar,
  Target,
  Sparkles,
} from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();

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

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-12">
          <svg width="60" height="80" viewBox="0 0 60 80" className="opacity-30">
            <path d="M 30,20 Q 20,10 10,20 L 30,50 L 50,20 Q 40,10 30,20" fill="#BFECC9" />
            <line x1="30" y1="50" x2="30" y2="75" stroke="#003366" strokeWidth="2" />
          </svg>
        </div>

        <div className="absolute top-0 right-12">
          <div className="relative">
            <Lightbulb className="w-12 h-12 text-[#FFD700]" fill="#FFD700" />
            <Sparkles className="w-6 h-6 text-[#BFECC9] absolute -top-2 -right-2" fill="#BFECC9" />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Online priprema za malu maturu uz{' '}
            <span className="text-[#FF6B35]">proverene rezultate</span>
          </h1>

          <div className="flex items-center justify-center gap-8 text-sm mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#BFECC9]" />
              <span>Bez kreditne kartice</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#BFECC9]" />
              <span>Probni period 7 dana</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#BFECC9]" />
              <span>Besplatno za prvi čas</span>
            </div>
          </div>

          <Link to="#kursevi">
            <button className="bg-[#FF6B35] text-white px-10 py-4 rounded-full hover:bg-[#E55A28] transition text-lg font-semibold shadow-lg inline-flex items-center gap-2 mb-8">
              Započni učenje <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Profesorka Marina Lukić — 15 godina iskustva, preko 500 uspešnih učenika i 98% prolaznosti na
            prijemnom.
            <br />
            <strong className="text-[#003366]">
              ➡️ Dajte svom detetu sigurnost, znanje i rezultat.
            </strong>
          </p>
        </div>

        {/* Hero Images Section */}
        <div className="flex items-center justify-center gap-12 mb-16 flex-wrap lg:flex-nowrap">
          {/* Left Student */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#BFECC9] rounded-[40%_60%_70%_30%] transform rotate-6 w-56 h-64"></div>
            <img
              src="/slika2.jpeg"
              alt="Profesorka Marina Lukić"
              className="relative w-56 h-64 object-cover rounded-[40%_60%_70%_30%] shadow-xl"
            />
            <div className="absolute -left-6 top-1/2 bg-white p-3 rounded-full shadow-lg">
              <Trophy className="w-8 h-8 text-[#FF6B35]" />
            </div>
          </div>

          {/* Center Illustration */}
          <div className="mx-8 hidden lg:block">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <g transform="translate(75, 75)">
                {/* Glava */}
                <ellipse cx="0" cy="-25" rx="35" ry="40" fill="white" stroke="#003366" strokeWidth="3" />
                {/* Oči */}
                <circle cx="-12" cy="-30" r="5" fill="#003366" />
                <circle cx="12" cy="-30" r="5" fill="#003366" />
                {/* Osmeh */}
                <path d="M -15,-15 Q 0,-10 15,-15" stroke="#003366" strokeWidth="3" fill="none" />
                {/* Knjiga */}
                <rect x="-20" y="0" width="40" height="28" rx="4" fill="#BFECC9" stroke="#003366" strokeWidth="3" />
                <line x1="0" y1="0" x2="0" y2="28" stroke="#003366" strokeWidth="2" />
                {/* Dekoracije */}
                <circle cx="-50" cy="-40" r="6" fill="#FFD700" />
                <circle cx="50" cy="-35" r="5" fill="#FF6B35" />
                <path d="M 45,15 L 55,10 M 50,20 L 58,18" stroke="#BFECC9" strokeWidth="3" />
                <path d="M -45,15 L -55,10" stroke="#FF6B35" strokeWidth="3" />
              </g>
            </svg>
          </div>

          {/* Right Student */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFD700] rounded-[30%_70%_60%_40%] w-56 h-64"></div>
            <img
              src="/slika3.jpeg"
              alt="Profesorka Marina Lukić"
              className="relative w-56 h-64 object-cover rounded-[30%_70%_60%_40%] shadow-xl"
            />
            <div className="absolute -right-6 bottom-12 bg-white p-3 rounded-full shadow-lg">
              <Star className="w-8 h-8 text-[#FFD700]" fill="#FFD700" />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-[#003366] rounded-2xl p-12 grid md:grid-cols-3 gap-8 text-white shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-[#FF6B35] p-3 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">500+</div>
              <div className="text-gray-300 text-sm">
                Pripremljeno učenika
                <br />
                širom Srbije
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-[#BFECC9] p-3 rounded-lg flex-shrink-0">
              <Trophy className="w-6 h-6 text-[#003366]" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">98%</div>
              <div className="text-gray-300 text-sm">
                Uspešnosti na
                <br />
                prijemnom ispitu
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-[#FFD700] p-3 rounded-lg flex-shrink-0">
              <Video className="w-6 h-6 text-[#003366]" />
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">100+</div>
              <div className="text-gray-300 text-sm">
                Video lekcija
                <br />
                dostupno 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-start mb-12 flex-wrap gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              Zašto roditelji biraju baš{' '}
              <span className="text-[#FF6B35]">našu online pripremu?</span>
            </h2>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-gray-700 mb-4 max-w-md">
              Učimo pametno, korak po korak.
              <br />
              Jedna lekcija u isto vreme!
            </p>
            <Link to="/register">
              <button className="border-2 border-[#003366] px-6 py-2 rounded-md hover:bg-[#003366] hover:text-white transition inline-flex items-center gap-2">
                Prijavite se sada <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#FF6B35] rounded-3xl p-8 relative overflow-hidden min-h-[400px]">
            <svg className="absolute top-8 left-8 opacity-20" width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="30" r="25" stroke="white" strokeWidth="4" fill="none" />
              <path d="M 40,55 L 40,75" stroke="white" strokeWidth="4" />
            </svg>
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-tl-[100px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <Video className="w-12 h-12 text-white mb-4" />
              <h3 className="text-white text-2xl font-serif font-bold mb-2">
                Video lekcije
                <br />
                na zahtev
              </h3>
              <p className="text-white/90 text-sm mt-4">
                Pristupite lekcijama bilo kada, sa neograničenim ponavljanjem i HD kvalitetom.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#BFECC9] rounded-3xl p-8 relative overflow-hidden min-h-[400px]">
            <svg className="absolute top-8 left-8" width="60" height="60" viewBox="0 0 60 60">
              <circle cx="20" cy="20" r="18" stroke="#003366" strokeWidth="3" fill="none" />
              <path d="M 35,15 Q 45,20 40,35" stroke="#003366" strokeWidth="3" fill="none" />
            </svg>
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-tl-[100px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <Users className="w-12 h-12 text-[#003366] mb-4" />
              <h3 className="text-[#003366] text-2xl font-serif font-bold mb-2">
                Uživo časovi
                <br />
                nedeljno
              </h3>
              <p className="text-gray-700 text-sm mt-4">
                Interaktivni časovi sa profesorkom preko video-chata uz mogućnost postavljanja pitanja.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#42A5F5] rounded-3xl p-8 relative overflow-hidden min-h-[400px]">
            <svg className="absolute top-8 right-8" width="40" height="40" viewBox="0 0 40 40">
              <path d="M 5,25 Q 10,5 25,10 Q 35,15 30,30" stroke="white" strokeWidth="3" fill="none" />
            </svg>
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-tl-[100px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <GraduationCap className="w-12 h-12 text-white mb-4" />
              <h3 className="text-white text-2xl font-serif font-bold mb-2">
                Priprema
                <br />
                za maturu
              </h3>
              <p className="text-white/90 text-sm mt-4">
                Sveobuhvatna priprema sa testovima, materijalima i simulacijama ispita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Students Get Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-gray-600 mb-4">Fokusiramo se na jedan važan koncept u isto vreme</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Šta Vaše dete <span className="text-[#FF6B35]">dobija?</span>
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Sistematsku pripremu za malu maturu',
              '100+ video lekcija koje može da ponavlja neograničeno',
              'Nedeljne online časove putem video poziva',
              'Testove i simulacije ispita',
              'Sve materijale za štampu (PDF)',
              'Praćenje napretka i rezultata',
              'Podršku profesorke tokom cele pripreme',
              'Potpuno bezbednu i proverenu platformu',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-[#BFECC9] flex-shrink-0 mt-1" />
                <span className="text-lg font-medium text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/benefits">
              <button className="bg-[#FF6B35] text-white px-10 py-4 rounded-full hover:bg-[#E55A28] transition text-lg font-semibold shadow-lg inline-flex items-center gap-2">
                Pogledajte sve pogodnosti <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Professor Section */}
      <section id="profesor" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BFECC9]/30 to-[#FF6B35]/30 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white rounded-3xl p-3 shadow-2xl">
              <div className="grid grid-cols-2 gap-3">
                <img
                  src="/slika2.jpeg"
                  alt="Profesorka Marina Lukić"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <img
                  src="/slika3.jpeg"
                  alt="Profesorka Marina Lukić"
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-[#FFD700] rounded-full p-4 shadow-xl">
              <Star className="w-8 h-8 text-[#003366]" fill="#003366" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="inline-block bg-[#BFECC9] px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-[#003366]">Vaš mentor</span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-black font-serif text-[#003366]">
              Marina Lukić
            </h2>

            <div className="space-y-2">
              <p className="text-lg text-gray-700">Profesor srpskog jezika i književnosti</p>
              <p className="text-lg text-gray-700">15+ godina iskustva</p>
              <p className="text-lg text-[#003366] font-bold">Specijalista za pripremu osmaka</p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#BFECC9] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Preko 500 učenika pripremila za malu maturu</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#BFECC9] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">98% njih upisalo željenu srednju školu</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#BFECC9] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Roditelji je ocenjuju prosečnom ocenom 4.9/5</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-6">
              <div className="bg-gradient-to-br from-[#BFECC9]/20 to-transparent p-4 rounded-xl border-2 border-[#BFECC9]/30">
                <Award className="w-8 h-8 text-[#FF6B35] mb-2" />
                <h4 className="font-bold text-sm mb-1">Stručnost</h4>
                <p className="text-xs text-gray-600">Magistar filologije</p>
              </div>

              <div className="bg-gradient-to-br from-[#BFECC9]/20 to-transparent p-4 rounded-xl border-2 border-[#BFECC9]/30">
                <Users className="w-8 h-8 text-[#FF6B35] mb-2" />
                <h4 className="font-bold text-sm mb-1">Iskustvo</h4>
                <p className="text-xs text-gray-600">500+ učenika</p>
              </div>

              <div className="bg-gradient-to-br from-[#BFECC9]/20 to-transparent p-4 rounded-xl border-2 border-[#BFECC9]/30">
                <MessageCircle className="w-8 h-8 text-[#FF6B35] mb-2" />
                <h4 className="font-bold text-sm mb-1">Pristup</h4>
                <p className="text-xs text-gray-600">Personalizovan</p>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="bg-[#FF6B35] text-white px-8 py-3 rounded-full hover:bg-[#E55A28] transition text-center font-semibold shadow-lg"
              >
                Kontaktiraj profesorku
              </Link>
              <a
                href="#kursevi"
                className="border-2 border-[#003366] text-[#003366] px-8 py-3 rounded-full hover:bg-[#003366] hover:text-white transition text-center font-semibold"
              >
                Pogledaj video uvod
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="kako-funkcionise" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Kako funkcioniše <span className="text-[#FF6B35]">priprema?</span>
            </h2>
            <p className="text-gray-600 text-lg">Jednostavno za roditelje i decu</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Pregled kursa',
                desc: 'Roditelj pogledom vidi šta dete uči i kako izgleda svaka faza.',
                color: '#BFECC9',
              },
              {
                icon: FileText,
                title: 'Plaćanje preko uplatnice',
                desc: 'Sistem generiše uplatnicu na ime roditelja i čuva račun.',
                color: '#FFD700',
              },
              {
                icon: Play,
                title: 'Pristup lekcijama',
                desc: 'Dete odmah dobija pristup sa kompjutera ili telefona, bez instalacija.',
                color: '#42A5F5',
              },
              {
                icon: Video,
                title: 'Nedeljni online čas',
                desc: 'U realnom vremenu sa profesorkom — postavljanje pitanja, rad po zadacima.',
                color: '#FF6B35',
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-300 mb-2">{index + 1}</div>
                  <h3 className="text-xl font-bold mb-3 text-[#003366]">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="kursevi" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Dostupni <span className="text-[#FF6B35]">kursevi</span>
          </h2>
          <p className="text-gray-600 text-lg">Odaberite kurs koji odgovara vašim potrebama</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Učitavanje kurseva...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl max-w-2xl mx-auto shadow-xl">
            <div className="bg-[#BFECC9]/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-[#003366]" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-[#003366]">Kursevi će uskoro biti dostupni!</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
              Trenutno radimo na novim kursevima. Prijavite se da budete prvi obavešteni!
            </p>
            <Link
              to="/register"
              className="bg-[#FF6B35] text-white px-10 py-4 rounded-full hover:bg-[#E55A28] transition text-lg font-semibold shadow-lg inline-block"
            >
              Prijavite se
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#BFECC9]/30 to-[#FFD700]/30 flex items-center justify-center overflow-hidden">
                  <Book className="h-20 w-20 text-[#003366] opacity-40" />
                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#FFD700]" fill="#FFD700" />
                      <span className="text-sm font-bold text-[#003366]">4.9</span>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-[#FF6B35] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                    {course.type === 'video' ? '🎥 Video kurs' : '👨‍🏫 Uživo časovi'}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-[#003366]">{course.title}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-2">{course.description}</p>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Cena</div>
                      <span className="text-3xl font-black text-[#FF6B35]">{formatPrice(course.price)}</span>
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="bg-[#003366] text-white py-3 px-6 rounded-full hover:bg-[#002244] transition font-semibold inline-flex items-center gap-2 shadow-lg"
                    >
                      Vidi više <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#FFD700] rounded-3xl p-12 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-sm">
              <h3 className="text-4xl font-serif font-bold mb-4 text-[#003366]">
                Sigurnost koja gradi
                <br />
                bolju budućnost
              </h3>
              <p className="text-gray-800 mb-6">
                Osnažujemo decu da otkriju svoj pun potencijal kroz poverenje i podršku.
              </p>
              <Link to="/contact">
                <button className="bg-white text-[#003366] px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold shadow-lg inline-flex items-center gap-2">
                  Zakažite razgovor <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
            <svg className="absolute bottom-0 left-0 opacity-20" width="200" height="200" viewBox="0 0 200 200">
              <path d="M 20,100 L 60,60 L 60,140 Z" fill="#003366" />
              <rect x="50" y="50" width="15" height="100" fill="#003366" />
            </svg>
          </div>

          <div className="bg-[#FF6B35] rounded-3xl p-12 relative overflow-hidden text-white shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-4xl font-serif font-bold mb-4">
                Pomažemo deci da
                <br />
                ostvare snove
              </h3>
              <p className="text-white/90 mb-6">Zajedno ka uspehu, korak po korak.</p>
              <Link to="/about">
                <button className="bg-white text-[#FF6B35] px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold shadow-lg inline-flex items-center gap-2">
                  Saznajte više <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
            <div className="absolute bottom-0 right-0">
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="80" cy="80" r="50" fill="white" opacity="0.1" />
                <path d="M 50,80 L 80,50 L 80,110" stroke="white" strokeWidth="3" opacity="0.2" />
              </svg>
            </div>
            <div className="absolute top-8 right-8">
              <Trophy className="w-12 h-12 text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontakt" className="bg-[#003366] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#BFECC9] p-2 rounded-xl">
                  <Book className="h-6 w-6 text-[#003366]" />
                </div>
                <span className="text-2xl font-serif font-bold">Nauči Srpski</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Najbolja online platforma za učenje srpskog jezika i pripremu za malu maturu sa profesorkom
                Marinom Lukić.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#BFECC9]">Brzi linkovi</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#kursevi" className="hover:text-[#BFECC9] transition">
                    Kursevi
                  </a>
                </li>
                <li>
                  <a href="#profesor" className="hover:text-[#BFECC9] transition">
                    O profesorki
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#BFECC9] transition">
                    Prijavi se
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#BFECC9]">Pravno</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="hover:text-[#BFECC9] transition">
                    Uslovi korišćenja
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#BFECC9] transition">
                    Privatnost
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#BFECC9] transition">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Nauči Srpski — Online priprema za malu maturu. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
