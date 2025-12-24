import { Award, Users, Trophy, Heart, Target, Lightbulb, CheckCircle, BookOpen } from 'lucide-react';
import Header from '../components/ui/Header';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  const values = [
    {
      icon: Heart,
      title: 'Posvećenost uspehu',
      description: 'Svaki učenik je važan. Prilagođavamo pristup individualnim potrebama kako bi svako ostvario svoj maksimum.',
      color: 'bg-[#FF6B35]',
    },
    {
      icon: Target,
      title: 'Fokus na rezultate',
      description: 'Naš cilj je jasan - maksimalan broj bodova na prijemnom. 98% naših učenika upisuje željenu školu.',
      color: 'bg-[#BFECC9]',
    },
    {
      icon: Lightbulb,
      title: 'Inovativne metode',
      description: 'Kombinujemo tradicionalno i savremeno. Koristimo video lekcije, interaktivne kvizove i mape uma.',
      color: 'bg-[#003366]',
    },
  ];

  const stats = [
    { number: '15+', label: 'Godina iskustva' },
    { number: '500+', label: 'Učenika' },
    { number: '98%', label: 'Prolaznost' },
    { number: '4.9', label: 'Prosečna ocena' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-16 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
            Više od pripreme, <br />
            <span className="text-[#FF6B35]">put ka uspehu.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Nauči Srpski je platforma koja pomaže učenicima osmog razreda da se pripreme za malu maturu 
            iz srpskog jezika i književnosti. Sa profesorkom Marinom Lukić, stručnjakom sa 15 godina 
            iskustva, obezbeđujemo kvalitetnu pripremu koja donosi rezultate.
          </p>
          
          {/* Stats Bar */}
          <div className="bg-white rounded-[3rem] p-8 shadow-xl max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center border-r last:border-r-0 border-gray-100">
                <div className="text-4xl font-black text-[#003366] mb-1">{stat.number}</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SECTION - Split Layout with Organic Shape */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
               {/* Mint Blob */}
               <div className="absolute top-0 left-0 w-full h-full bg-[#BFECC9] opacity-40 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transform rotate-6 scale-110 -z-10"></div>
               <img 
                 src="/slika2.jpeg" 
                 alt="Profesorka Marina" 
                 className="rounded-[3rem] shadow-2xl w-full object-cover h-[600px] transform -rotate-3 hover:rotate-0 transition-transform duration-500"
               />
               
               {/* Badge */}
               <div className="absolute bottom-10 -right-6 bg-white p-6 rounded-3xl shadow-xl max-w-xs animate-bounce-slow">
                 <div className="flex items-start gap-4">
                   <div className="bg-[#FF6B35] p-3 rounded-full text-white">
                     <Award size={24} />
                   </div>
                   <div>
                     <div className="font-bold text-lg mb-1">Magistar filologije</div>
                     <div className="text-sm text-gray-500">Univerzitet u Beogradu</div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                Upoznajte profesorku <br />
                <span className="text-[#003366] border-b-4 border-[#BFECC9]">Marinu Lukić</span>
              </h2>
              
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Profesorka Marina Lukić posvetila je 15 godina svog života obrazovanju i pripremi učenika
                  za malu maturu. Sa magistarskom diplomom iz filologije i strašću za predavanje, Marina je
                  razvila jedinstvenu metodologiju koja kombinuje tradicionalne tehnike sa modernim pristupom.
                </p>
                <p>
                  Kroz godine rada, Marina je pripremila preko 500 učenika, od kojih je 98% uspešno položilo
                  prijemni ispit i upisalo željenu srednju školu. Njena posvećenost, strpljenje i razumevanje
                  individualnih potreba svakog učenika čini je omiljenom među roditeljima i učenicima.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                   'Provereni rezultati', 
                   'Personalizovan pristup', 
                   'Fleksibilnost online učenja',
                   'Stalna podrška'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <CheckCircle className="text-[#BFECC9] fill-[#003366]" size={20} />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VALUES - Bento Grid */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-serif font-bold mb-4">Naša misija i vrednosti</h2>
             <p className="text-gray-600 text-lg max-w-2xl mx-auto">
               Osnažujemo učenike da ostvare svoj pun potencijal kroz poverenje, podršku i kvalitetnu pripremu.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-[#F5F3EF] p-10 rounded-[3rem] hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`${value.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#003366] mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-[#003366] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#BFECC9] opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF6B35] opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Pridružite se uspešnim učenicima
            </h2>
            <p className="text-[#BFECC9] text-xl mb-10 max-w-2xl mx-auto">
              Započnite pripremu danas i ostvarite najbolje rezultate na maloj maturi. 
              Upis je u toku!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="bg-[#FF6B35] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#E55A28] transition shadow-lg hover:shadow-[#FF6B35]/50">
                  Pogledajte Kurseve
                </button>
              </Link>
              <Link to="/contact">
                <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#003366] transition">
                  Kontaktirajte Nas
                </button>
              </Link>
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
                <li>{contactPhone}</li>
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
