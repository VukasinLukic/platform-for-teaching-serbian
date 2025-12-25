import { CheckCircle, Video, Users, FileText, Award, Clock, BookOpen, Headphones, TrendingUp, Shield, Zap } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Link } from 'react-router-dom';

export default function BenefitsPage() {
  const benefits = [
    {
      icon: Video,
      title: '100+ Видео лекција',
      description: 'Приступ свим видео лекцијама 24/7 са неограниченим понављањем и HD квалитетом.',
      color: 'text-[#D62828]',
      bg: 'bg-[#D62828]/10'
    },
    {
      icon: Users,
      title: 'Недељни уживо часови',
      description: 'Интерактивни часови са професорком преко видео позива уз могућност постављања питања.',
      color: 'text-[#1A1A1A]',
      bg: 'bg-[#1A1A1A]/10'
    },
    {
      icon: FileText,
      title: 'PDF материјали',
      description: 'Сви материјали за штампу - тестови, вежбања, анализе дела доступни за download.',
      color: 'text-[#F2C94C]',
      bg: 'bg-[#F2C94C]/20'
    },
    {
      icon: Award,
      title: 'Сертификат по завршетку',
      description: 'Добијате званични сертификат након успешног завршетка курса као доказ о знању.',
      color: 'text-[#D62828]',
      bg: 'bg-[#D62828]/10'
    },
    {
      icon: Clock,
      title: 'Доживотни приступ',
      description: 'Једнократна уплата за неограничен приступ свим материјалима. Учите својим темпом.',
      color: 'text-[#1A1A1A]',
      bg: 'bg-[#1A1A1A]/10'
    },
    {
      icon: BookOpen,
      title: 'Симулације испита',
      description: 'Вежбајте на реалним примерима испита из претходних година и смањите трему.',
      color: 'text-[#F2C94C]',
      bg: 'bg-[#F2C94C]/20'
    },
    {
      icon: Headphones,
      title: 'Подршка професорке',
      description: 'Директна комуникација са професорком током целе припреме путем емаила или чата.',
      color: 'text-[#D62828]',
      bg: 'bg-[#D62828]/10'
    },
    {
      icon: TrendingUp,
      title: 'Праћење напретка',
      description: 'Детаљан увид у ваш напредак и резултате кроз интерактивни dashboard.',
      color: 'text-[#1A1A1A]',
      bg: 'bg-[#1A1A1A]/10'
    },
  ];

  const includedFeatures = [
    'Систематска припрема за малу матуру',
    'Детаљне анализе књижевних дела',
    'Технике писања есеја',
    'Граматика и правопис детаљно',
    'Тестови знања након лекција',
    'Симулације пријемног испита',
    'Стратегије за полагање',
    'Материјали за преузимање (PDF)',
    'Уживо Q&A сесије',
    'Емаил подршка 24/7',
    'Приступ заједници ученика',
    'Редовни update-ови садржаја',
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* VALUES SECTION - Minimal */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-[#1A1A1A]">Наше вредности</h2>
          <p className="text-gray-600 mb-16">Зашто нас бирају ученици</p>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-3 text-[#1A1A1A]">Учење с разумевањем</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Српски језик учимо са љубављу и посвећеношћу. Свака лекција је осмишљена тако да изграђује дубоко разумевање, а не напамет учење.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold mb-3 text-[#1A1A1A]">Индивидуална пажња</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Свако дете је јединствено. Прилагођавамо наставу вашим потребама и пратимо напредак са посвећеношћу искусне професорке.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold mb-3 text-[#1A1A1A]">Проверени резултати</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Преко 15 година искуства и стотине задовољних ученика који су остварили своје снове. Ваш успех је наш успех.
              </p>
            </div>
          </div>
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
                  className="bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col items-center text-center group border border-gray-100"
                >
                  <div className={`w-16 h-16 rounded-2xl ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">{benefit.title}</h3>
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
      <section className="py-24 bg-[#F7F7F7] mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Checklist */}
            <div>
              <h2 className="text-4xl font-bold mb-8">Шта је све укључено?</h2>
              <div className="bg-white rounded-[3rem] p-10 shadow-lg">
                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                  {includedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-[#D62828]/10 rounded-full p-1 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-[#D62828]" />
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
              <div className="bg-gradient-to-br from-[#D62828] to-[#B91F1F] text-white rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#F2C94C] p-3 rounded-xl text-[#1A1A1A]">
                      <Award size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Гаранција Квалитета</h3>
                  </div>
                  <p className="text-white/90 mb-8 leading-relaxed">
                    Ако нисте задовољни у првих 7 дана, враћамо вам новац. Без питања.
                    Верујемо у квалитет наше наставе.
                  </p>
                  <div className="flex gap-8 border-t border-white/10 pt-6">
                     <div>
                       <div className="text-3xl font-bold text-white">98%</div>
                       <div className="text-xs opacity-70 uppercase tracking-wider">Успешност</div>
                     </div>
                     <div>
                       <div className="text-3xl font-bold text-white">500+</div>
                       <div className="text-xs opacity-70 uppercase tracking-wider">Ученика</div>
                     </div>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
              </div>

              {/* Simple CTA Card */}
              <div className="bg-white border-2 border-[#D62828] rounded-[3rem] p-10 text-center shadow-lg">
                <h3 className="text-xl font-bold mb-2">Једнократна уплата</h3>
                <p className="text-gray-500 text-sm mb-6">Без скривених месечних трошкова</p>
                <Link to="/register">
                  <button className="w-full bg-[#D62828] text-white py-4 rounded-full font-bold hover:bg-[#B91F1F] transition shadow-lg hover:shadow-xl">
                    Пријави се Сада
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
