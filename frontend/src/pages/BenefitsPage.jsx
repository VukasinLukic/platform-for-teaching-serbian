import { CheckCircle, Video, Users, FileText, Award, Clock, BookOpen, Headphones, TrendingUp, Shield, Zap } from 'lucide-react';
import Header from '../components/ui/Header';
import { Link } from 'react-router-dom';

export default function BenefitsPage() {
  const benefits = [
    {
      icon: Video,
      title: '100+ Video lekcija',
      description: 'Pristup svim video lekcijama 24/7 sa neograničenim ponavljanjem i HD kvalitetom.',
      color: 'text-[#FF6B35]',
      bg: 'bg-[#FF6B35]/10'
    },
    {
      icon: Users,
      title: 'Nedeljni uživo časovi',
      description: 'Interaktivni časovi sa profesorkom preko video poziva uz mogućnost postavljanja pitanja.',
      color: 'text-[#003366]',
      bg: 'bg-[#003366]/10'
    },
    {
      icon: FileText,
      title: 'PDF materijali',
      description: 'Svi materijali za štampu - testovi, vežbanja, analize dela dostupni za download.',
      color: 'text-[#BFECC9]',
      bg: 'bg-[#BFECC9]/30' // Darker for visibility
    },
    {
      icon: Award,
      title: 'Sertifikat po završetku',
      description: 'Dobijate zvanični sertifikat nakon uspešnog završetka kursa kao dokaz o znanju.',
      color: 'text-[#FFD700]',
      bg: 'bg-[#FFD700]/10'
    },
    {
      icon: Clock,
      title: 'Doživotni pristup',
      description: 'Jednokratna uplata za neograničen pristup svim materijalima. Učite svojim tempom.',
      color: 'text-[#003366]',
      bg: 'bg-[#003366]/10'
    },
    {
      icon: BookOpen,
      title: 'Simulacije ispita',
      description: 'Vežbajte na realnim primerima ispita iz prethodnih godina i smanjite tremu.',
      color: 'text-[#FF6B35]',
      bg: 'bg-[#FF6B35]/10'
    },
    {
      icon: Headphones,
      title: 'Podrška profesorke',
      description: 'Direktna komunikacija sa profesorkom tokom cele pripreme putem emaila ili chata.',
      color: 'text-[#BFECC9]',
      bg: 'bg-[#BFECC9]/30'
    },
    {
      icon: TrendingUp,
      title: 'Praćenje napretka',
      description: 'Detaljan uvid u vaš napredak i rezultate kroz interaktivni dashboard.',
      color: 'text-[#FFD700]',
      bg: 'bg-[#FFD700]/10'
    },
  ];

  const includedFeatures = [
    'Sistematska priprema za malu maturu',
    'Detaljne analize književnih dela',
    'Tehnike pisanja eseja',
    'Gramatika i pravopis detaljno',
    'Testovi znanja nakon lekcija',
    'Simulacije prijemnog ispita',
    'Strategije za polaganje',
    'Materijali za preuzimanje (PDF)',
    'Uživo Q&A sesije',
    'Email podrška 24/7',
    'Pristup zajednici učenika',
    'Redovni update-ovi sadržaja',
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Sve što vam treba za <br />
            <span className="text-[#FF6B35] relative inline-block">
              uspeh
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#BFECC9] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
            {' '}na maloj maturi
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Dobijate pristup kompletnom paketu za pripremu - video lekcije, uživo časove,
            materijale i podršku profesorke. Sve na jednom mestu!
          </p>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col items-center text-center group border border-gray-50"
                >
                  <div className={`w-16 h-16 rounded-2xl ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[#003366] mb-3">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DETAILED FEATURES SPLIT */}
      <section className="py-24 bg-white rounded-t-[4rem] mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Checklist */}
            <div>
              <h2 className="text-4xl font-serif font-bold mb-8">Šta je sve uključeno?</h2>
              <div className="bg-[#F5F3EF] rounded-[3rem] p-10">
                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  {includedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-[#BFECC9] rounded-full p-1 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-[#003366]" />
                      </div>
                      <span className="font-medium text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Guarantee & CTA */}
            <div className="space-y-8">
              {/* Guarantee Card */}
              <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#FFD700] p-3 rounded-xl text-[#003366]">
                      <Award size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Garancija Kvaliteta</h3>
                  </div>
                  <p className="text-blue-100 mb-8 leading-relaxed">
                    Ako niste zadovoljni u prvih 7 dana, vraćamo vam novac. Bez pitanja.
                    Verujemo u kvalitet naše nastave.
                  </p>
                  <div className="flex gap-8 border-t border-white/10 pt-6">
                     <div>
                       <div className="text-3xl font-bold text-[#BFECC9]">98%</div>
                       <div className="text-xs opacity-70 uppercase tracking-wider">Prolaznost</div>
                     </div>
                     <div>
                       <div className="text-3xl font-bold text-[#BFECC9]">500+</div>
                       <div className="text-xs opacity-70 uppercase tracking-wider">Učenika</div>
                     </div>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
              </div>

              {/* Simple CTA Card */}
              <div className="bg-white border-2 border-[#FF6B35] rounded-[3rem] p-10 text-center">
                <h3 className="text-xl font-bold mb-2">Jednokratna uplata</h3>
                <p className="text-gray-500 text-sm mb-6">Bez skrivenih mesečnih troškova</p>
                <Link to="/register">
                  <button className="w-full bg-[#FF6B35] text-white py-4 rounded-full font-bold hover:bg-[#E55A28] transition shadow-lg hover:shadow-xl">
                    Prijavi se Sada
                  </button>
                </Link>
              </div>
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
                <BookOpen className="w-8 h-8 text-[#BFECC9]" />
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
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-[#BFECC9]">Kontakt</h4>
              <ul className="space-y-4 text-gray-400">
                <li>info@naucisrpski.rs</li>
                <li>+381 60 123 4567</li>
                <li>Beograd, Srbija</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
