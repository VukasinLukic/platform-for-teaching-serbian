import { Award, CheckCircle } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const stats = [
    { number: '15+', label: 'Година искуства' },
    { number: '500+', label: 'Ученика' },
    { number: '98%', label: 'Успешност' },
    { number: '4.9', label: 'Просечна оцена' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-16 pb-24 px-6 bg-gradient-to-b from-white to-[#F7F7F7]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Више од наставе, <br />
            <span className="text-[#D62828]">пут ка успеху.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            СРПСКИ У СРЦУ је платформа која помаже ученицима да се припреме за малу матуру
            из српског језика. Са професорком Марином Лукић, стручњаком са 15 година
            искуства, обезбеђујемо квалитетну наставу која доноси резултате.
          </p>

          {/* Stats Bar */}
          <div className="bg-white rounded-[3rem] p-8 shadow-xl max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center border-r last:border-r-0 border-gray-100">
                <div className="text-4xl font-black text-[#D62828] mb-1">{stat.number}</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SECTION - Split Layout */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
               {/* Decorative background */}
               <div className="absolute top-0 left-0 w-full h-full bg-[#D62828] opacity-5 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transform rotate-6 scale-110 -z-10"></div>
               <img
                 src="/Nenaslovljeni dizajn (1).png"
                 alt="Професорка Марина"
                 className="rounded-[3rem] shadow-2xl w-full object-cover h-[600px] transform -rotate-2 hover:rotate-0 transition-transform duration-500"
               />

               {/* Badge */}
               <div className="absolute bottom-10 -right-6 bg-white p-6 rounded-3xl shadow-xl max-w-xs">
                 <div className="flex items-start gap-4">
                   <div className="bg-[#D62828] p-3 rounded-full text-white">
                     <Award size={24} />
                   </div>
                   <div>
                     <div className="font-bold text-lg mb-1 text-[#1A1A1A]">Професорка српског језика</div>
                     <div className="text-sm text-gray-500">15 година искуства</div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Text Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Упознајте професорку <br />
                <span className="text-[#D62828] relative">
                  Марину Лукић
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#F2C94C]"></div>
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Професорка Марина Лукић посветила је 15 година свог живота образовању и припреми ученика
                  за малу матуру. Са дугогодишњим искуством и страшћу за предавање, Марина је
                  развила јединствену методологију која комбинује традиционалне технике са модерним приступом.
                </p>
                <p>
                  Кроз године рада, Марина је припремила преко 500 ученика, од којих је 98% успешно положило
                  пријемни испит и уписало жељену средњу школу. Њена посвећеност, стрпљење и разумевање
                  индивидуалних потреба сваког ученика чини је омиљеном међу родитељима и ученицима.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                   'Проверени резултати',
                   'Персонализован приступ',
                   'Флексибилност онлајн учења',
                   'Стална подршка'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <CheckCircle className="text-[#D62828]" size={20} />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-[#D62828] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Придружите се успешним ученицима
            </h2>
            <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">
              Започните наставу данас и остварите најбоље резултате на малој матури.
              Упис је у току!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <button className="bg-white text-[#D62828] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                  Погледајте Курсеве
                </button>
              </Link>
              <Link to="/contact">
                <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#D62828] transition">
                  Контактирајте Нас
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
