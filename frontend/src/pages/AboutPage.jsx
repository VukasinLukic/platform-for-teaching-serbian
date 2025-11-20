import { Award, Users, Trophy, Heart, Target, Lightbulb, CheckCircle } from 'lucide-react';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Posvećenost uspehu',
      description: 'Svaki učenik je važan. Prilagođavamo pristup individualnim potrebama.',
      color: '#FF6B35',
    },
    {
      icon: Target,
      title: 'Fokus na rezultate',
      description: '98% prolaznost na prijemnom ispitu govori sama za sebe.',
      color: '#BFECC9',
    },
    {
      icon: Lightbulb,
      title: 'Inovativne metode',
      description: 'Kombinujemo tradicionalno i savremeno za najbolje učenje.',
      color: '#42A5F5',
    },
  ];

  const achievements = [
    { number: '500+', label: 'Uspešnih učenika' },
    { number: '98%', label: 'Prolaznost na ispitu' },
    { number: '15+', label: 'Godina iskustva' },
    { number: '4.9/5', label: 'Prosečna ocena' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
                O nama
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Nauči Srpski je platforma koja pomaže učenicima osmog razreda da se pripreme za malu maturu
                iz srpskog jezika i književnosti. Sa profesorkom Marinom Lukić, stručnjakom sa 15 godina
                iskustva, obezbeđujemo kvalitetnu pripremu koja donosi rezultate.
              </p>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20">
                <img
                  src="/slika2.jpeg"
                  alt="Profesorka Marina Lukić"
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-6 -right-6 bg-[#FFD700] rounded-full p-6 shadow-2xl">
                <Trophy className="w-12 h-12 text-[#003366]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <Card key={index} variant="elevated">
              <CardBody className="p-8 text-center">
                <div className="text-4xl font-black text-[#FF6B35] mb-2">
                  {achievement.number}
                </div>
                <div className="text-sm text-gray-600">{achievement.label}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission & Values */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#003366] mb-4">
            Naša misija i vrednosti
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Osnažujemo učenike da ostvare svoj pun potencijal kroz poverenje, podršku i kvalitetnu pripremu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} variant="elevated" hover>
                <CardBody className="p-8 text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: value.color }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003366] mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Story Section */}
        <Card variant="gradient" className="border-2 border-[#BFECC9]/30">
          <CardBody className="p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-serif font-bold text-[#003366] mb-6">
                  Naša priča
                </h3>
                <div className="space-y-4 text-gray-700">
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
                  <p>
                    Platforma "Nauči Srpski" nastala je iz želje da se kvalitetna priprema učini dostupnom
                    svima, bez obzira na lokaciju. Online format omogućava fleksibilnost, a uživo časovi
                    održavaju personalnu povezanost sa profesorkom.
                  </p>
                </div>
              </div>
              <div>
                <Card variant="elevated">
                  <CardBody className="p-8">
                    <h4 className="font-bold text-lg text-[#003366] mb-4">
                      Zašto roditelji biraju nas?
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'Provereni rezultati sa 98% prolaznosti',
                        'Personalizovan pristup svakom učeniku',
                        'Fleksibilnost online učenja',
                        'Direktna komunikacija sa profesorkom',
                        'Sveobuhvatni materijali i testovi',
                        'Doživotna podrška nakon kursa',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#BFECC9] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Professor Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-[#003366] mb-4">
              Upoznajte profesorku Marinu Lukić
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card variant="elevated" hover>
              <CardBody className="p-8 text-center">
                <Award className="w-12 h-12 text-[#FF6B35] mx-auto mb-4" />
                <h3 className="font-bold text-lg text-[#003366] mb-2">Obrazovanje</h3>
                <p className="text-gray-600 text-sm">
                  Magistar filologije<br />
                  Univerzitet u Beogradu
                </p>
              </CardBody>
            </Card>

            <Card variant="elevated" hover>
              <CardBody className="p-8 text-center">
                <Users className="w-12 h-12 text-[#42A5F5] mx-auto mb-4" />
                <h3 className="font-bold text-lg text-[#003366] mb-2">Iskustvo</h3>
                <p className="text-gray-600 text-sm">
                  15+ godina rada<br />
                  500+ pripremljenih učenika
                </p>
              </CardBody>
            </Card>

            <Card variant="elevated" hover>
              <CardBody className="p-8 text-center">
                <Trophy className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                <h3 className="font-bold text-lg text-[#003366] mb-2">Rezultati</h3>
                <p className="text-gray-600 text-sm">
                  98% prolaznost<br />
                  4.9/5 prosečna ocena
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A28] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Pridružite se stotinama zadovoljnih učenika!
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Započnite pripremu danas i ostvarite najbolje rezultate na maloj maturi.
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
