import { CheckCircle, Video, Users, FileText, Award, Clock, BookOpen, Headphones, TrendingUp } from 'lucide-react';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function BenefitsPage() {
  const benefits = [
    {
      icon: Video,
      title: '100+ Video lekcija',
      description: 'Pristup svim video lekcijama 24/7 sa neograničenim ponavljanjem i HD kvalitetom',
      color: '#FF6B35',
    },
    {
      icon: Users,
      title: 'Nedeljni uživo časovi',
      description: 'Interaktivni časovi sa profesorkom preko video poziva uz mogućnost postavljanja pitanja',
      color: '#42A5F5',
    },
    {
      icon: FileText,
      title: 'PDF materijali',
      description: 'Svi materijali za štampu - testovi, vežbanja, analize dela',
      color: '#BFECC9',
    },
    {
      icon: Award,
      title: 'Sertifikat po završetku',
      description: 'Dobijate zvani\u010dni sertifikat nakon uspešnog završetka kursa',
      color: '#FFD700',
    },
    {
      icon: Clock,
      title: 'Doživotni pristup',
      description: 'Jednokratna uplata za neograničen pristup svim materijalima',
      color: '#42A5F5',
    },
    {
      icon: BookOpen,
      title: 'Simulacije ispita',
      description: 'Vežbajte na realnim primerima ispita iz prethodnih godina',
      color: '#FF6B35',
    },
    {
      icon: Headphones,
      title: 'Podrška profesorke',
      description: 'Direktna komunikacija sa profesorkom tokom cele pripreme',
      color: '#BFECC9',
    },
    {
      icon: TrendingUp,
      title: 'Praćenje napretka',
      description: 'Detaljan uvid u vaš napredak i rezultate kroz kurs',
      color: '#FFD700',
    },
  ];

  const includedFeatures = [
    'Sistematska priprema za malu maturu iz srpskog jezika',
    'Detaljne analize književnih dela iz programa',
    'Tehnike pisanja eseja, kompozicije i interpretacije',
    'Gramatika i pravopis - sve oblasti detaljno objašnjene',
    'Testovi znanja nakon svake lekcije',
    'Simulacije prijemnog ispita',
    'Strategije za uspešno polaganje',
    'Materijali za preuzimanje (PDF)',
    'Uživo Q&A sesije',
    'Email podrška 24/7',
    'Pristup zajednici učenika',
    'Redovni update-ovi sadržaja',
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Sve što vam treba za<br />
            <span className="text-[#BFECC9]">uspeh na maloj maturi</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Dobijate pristup kompletnom paketu za pripremu - video lekcije, uživo časove,
            materijale i podršku profesorke. Sve na jednom mestu!
          </p>
        </div>
      </div>

      {/* Main Benefits Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#003366] mb-4">
            Šta dobijate u kursu?
          </h2>
          <p className="text-xl text-gray-600">
            Kompletan paket za uspešnu pripremu
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} variant="elevated" hover>
                <CardBody className="p-8 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: benefit.color }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#003366] mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Detailed Features List */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Card variant="elevated">
            <CardBody className="p-10">
              <h3 className="text-3xl font-serif font-bold text-[#003366] mb-8">
                Uključeno u kursu:
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {includedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#BFECC9] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-8">
            <Card variant="gradient" className="border-2 border-[#BFECC9]/30">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold text-[#003366] mb-4">
                  Garancija kvaliteta
                </h3>
                <p className="text-gray-700 mb-6">
                  Naši kursevi su provereni sa preko 500 uspešnih učenika i 98% prolaznosti na
                  prijemnom ispitu. Vaš uspeh je naš prioritet!
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-black text-[#FF6B35]">500+</div>
                    <div className="text-xs text-gray-600">Učenika</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#FF6B35]">98%</div>
                    <div className="text-xs text-gray-600">Prolaznost</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#FF6B35]">4.9/5</div>
                    <div className="text-xs text-gray-600">Ocena</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="elevated">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold text-[#003366] mb-4">
                  Jednokratna uplata
                </h3>
                <p className="text-gray-700 mb-6">
                  Bez skrivenih troškova ili mesečnih pretplata. Platite jednom i dobijete
                  doživotni pristup svim materijalima i budućim update-ovima.
                </p>
                <div className="bg-[#BFECC9]/20 rounded-xl p-4">
                  <p className="text-sm text-gray-700 text-center">
                    <strong className="text-[#003366]">Bonus:</strong> Svi koji se upišu sada dobijaju besplatno
                    dodatne materijale i pristup ekskluzivnim webinarima!
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A28] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Spremni da započnete?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Pridružite se stotinama zadovoljnih učenika i roditelja koji su već ostvarili uspeh!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/#kursevi">
              <Button variant="outlineWhite" size="xl">
                Pogledajte kurseve
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="xl">
                Kontaktirajte nas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
