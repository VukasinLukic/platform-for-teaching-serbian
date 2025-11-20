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
  Clock,
  Award,
  Sparkles,
  MessageCircle,
  Play,
  BookOpen,
} from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';

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

  const stats = [
    { number: '500+', label: 'Učenika' },
    { number: '98%', label: 'Uspešnosti' },
    { number: '15+', label: 'Godina iskustva' },
    { number: '100+', label: 'Video lekcija' },
  ];

  const features = [
    {
      icon: Video,
      title: 'Video lekcije',
      description: 'Pristupite video lekcijama bilo kada i bilo gde, sa neograničenim ponavljanjem i HD kvalitetom',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      icon: Users,
      title: 'Uživo časovi',
      description: 'Interaktivni časovi sa profesorkom jednom nedeljno preko video-chata uz mogućnost postavljanja pitanja',
      gradient: 'from-secondary/20 to-secondary/5',
    },
    {
      icon: GraduationCap,
      title: 'Priprema za maturu',
      description: 'Sveobuhvatna priprema za malu maturu sa testovima, materijalima i simulacijama ispita',
      gradient: 'from-accent/20 to-accent/5',
    },
  ];

  const benefits = [
    'Sistematsku pripremu za malu maturu',
    '100+ video lekcija koje može da ponavlja neograničeno',
    'Nedeljne online časove putem video poziva',
    'Testove i simulacije ispita',
    'Sve materijale za štampu',
    'Praćenje napretka',
    'Podršku profesorke tokom cele pripreme',
    'Potpuno bezbednu i proverenu platformu',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Book className="h-7 w-7 text-white" />
                </div>
              </div>
              <span className="text-2xl font-black text-gradient">
                Nauči Srpski
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#kursevi" className="nav-link">
                Kursevi
              </a>
              <a href="#profesor" className="nav-link">
                Profesor
              </a>
              <a href="#kontakt" className="nav-link">
                Kontakt
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="btn-secondary py-2 px-6 text-sm">
                    Odjavi se
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link hidden sm:block">
                    Prijavi se
                  </Link>
                  <Link to="/register" className="btn-primary py-2.5 px-6 text-sm">
                    Registruj se
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-gradient-radial"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass-card px-6 py-3 rounded-full mb-8 animate-fade-in">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Online platforma za učenje srpskog jezika
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-8 animate-slide-up">
              Online priprema za malu maturu uz{' '}
              <span className="text-gradient">proverene rezultate</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Profesorka Marina Lukić — 15 godina iskustva, preko 500 uspešnih učenika i 98% prolaznosti na prijemnom.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
              ➡️ Dajte svom detetu sigurnost, znanje i rezultat.
            </p>

            {/* CTA Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scale-in">
                <a href="#kursevi" className="btn-primary group">
                  Pogledajte kurseve
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#kontakt" className="btn-secondary">
                  Zakažite uvodni razgovor
                </a>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-card p-6 rounded-2xl hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl md:text-5xl font-black text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-6">
              Zašto roditelji biraju baš <span className="text-gradient">našu online pripremu?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dokazano poverenje roditelja širom Srbije
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group glass-card p-10 rounded-3xl hover-lift hover:border-primary/40 transition-all duration-500"
                >
                  <div className={`bg-gradient-to-br ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Saznaj više</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits Grid */}
          <div className="mt-16 glass-card rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-center mb-10">Šta Vaše dete dobija?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="#kursevi" className="btn-primary">
                Pogledajte sve pogodnosti
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Professor Section - Marina Lukić */}
      <section id="profesor" className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl"></div>
              <div className="relative glass-card rounded-3xl p-2 overflow-hidden">
                {/* Professor images */}
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src="/slika2.jpeg"
                    alt="Profesorka Marina Lukić"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <img
                    src="/slika3.jpeg"
                    alt="Profesorka Marina Lukić"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="inline-block glass-card px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-semibold text-primary">
                  Vaš mentor
                </span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-black">
                Marina Lukić
              </h2>

              <div className="mb-4">
                <p className="text-lg text-muted-foreground">Profesor srpskog jezika i književnosti</p>
                <p className="text-lg text-muted-foreground">15+ godina iskustva</p>
                <p className="text-lg text-muted-foreground font-semibold">Specijalista za pripremu osmaka</p>
              </div>

              <p className="text-xl text-muted-foreground leading-relaxed">
                ✔️ Preko 500 učenika pripremila za malu maturu<br/>
                ✔️ 98% njih upisalo željenu srednju školu<br/>
                ✔️ Roditelji je ocenjuju prosečnom ocenom 4.9/5
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Stručnost</h4>
                    <p className="text-muted-foreground">
                      Magistar filologije, licenciran profesor srpskog jezika i književnosti
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Iskustvo</h4>
                    <p className="text-muted-foreground">
                      Više od 500 uspešno pripremljenih učenika za malu maturu
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Pristup</h4>
                    <p className="text-muted-foreground">
                      Personalizovan pristup svakom učeniku, sa fokusom na rezultate
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <a href="#kontakt" className="btn-primary">
                  Kontaktiraj profesorku
                </a>
                <a href="#kursevi" className="btn-secondary">
                  Pogledaj video uvod
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="kursevi" className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-6">
              Dostupni <span className="text-gradient">kursevi</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Odaberite kurs koji odgovara vašim potrebama i počnite sa učenjem danas
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-6 text-muted-foreground text-lg">Učitavanje kurseva...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl max-w-2xl mx-auto">
              <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Kursevi će uskoro biti dostupni!</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
                Trenutno radimo na novim kursevima. Prijavite se da budete prvi obavešteni!
              </p>
              <Link to="/register" className="btn-primary">
                Prijavite se
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="group glass-card rounded-3xl overflow-hidden hover-lift hover:border-primary/40 transition-all duration-500 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 group-hover:scale-110 transition-transform duration-700"></div>
                    <Book className="h-24 w-24 text-primary opacity-40 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-primary/90 p-4 rounded-full">
                        <Play className="h-8 w-8 text-black" />
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 glass-card px-4 py-2 rounded-full">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold">4.9</span>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-4 left-4 bg-primary text-black px-4 py-2 rounded-full text-xs font-bold">
                      {course.type === 'video' ? '🎥 Video kurs' : '👨‍🏫 Uživo časovi'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex justify-between items-center pt-6 border-t border-border">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Cena</div>
                        <span className="text-3xl font-black text-gradient">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                      <Link
                        to={`/course/${course.id}`}
                        className="btn-primary py-3 px-6 group/btn"
                      >
                        <span>Vidi više</span>
                        <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

          <div className="container-custom relative z-10">
            <div className="glass-card rounded-3xl p-12 lg:p-20 text-center max-w-4xl mx-auto">
              <h2 className="mb-6">
                Spremni da <span className="text-gradient">počnete?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Pridružite se stotinama učenika koji već uče srpski jezik uz profesorku
                Marinu Lukić
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary">
                  Registruj se besplatno
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </Link>
                <a href="#kontakt" className="btn-secondary">
                  Kontaktiraj nas
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="kontakt" className="bg-card border-t border-border py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-gradient">Nauči Srpski</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Najbolja online platforma za učenje srpskog jezika sa profesorkom Marinom
                Lukić
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-primary/10 hover:bg-primary/20 p-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-primary" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Linkovi</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#kursevi" className="text-muted-foreground hover:text-primary transition-colors">
                    Kursevi
                  </a>
                </li>
                <li>
                  <a href="#profesor" className="text-muted-foreground hover:text-primary transition-colors">
                    O profesorki
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Prijavi se
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Pravno</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Uslovi korišćenja
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Privatnost
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
