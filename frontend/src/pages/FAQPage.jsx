import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Accordion from '../components/ui/Accordion';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function FAQPage() {
  const faqs = [
    {
      title: 'Како функционише онлајн настава?',
      content: 'Настава се одвија преко наше платформе. Добијате приступ видео лекцијама које можете гледати када год пожелите. Поред тога, организујемо редовне уживо консултације преко Zoom-а где можете поставити питања професорки.'
    },
    {
      title: 'Колико дуго имам приступ курсу?',
      content: 'Након куповине курса, приступ материјалима је доживотан. Можете се враћати лекцијама колико год пута желите, чак и након завршетка припреме.'
    },
    {
      title: 'Да ли могу да пратим курс преко телефона?',
      content: 'Да! Наша платформа је потпуно прилагођена за мобилне уређаје. Можете учити преко телефона, таблета или рачунара.'
    },
    {
      title: 'Шта ако нисам задовољан/на курсом?',
      content: 'Нудимо повраћај новца у року од 7 дана од куповине уколико нисте задовољни садржајем курса. Ваше задовољство нам је на првом месту.'
    },
    {
      title: 'Како да платим курс?',
      content: 'Плаћање се врши уплатом на рачун (уплатница у пошти/банци или е-banking). Након пријаве добићете инструкције за плаћање на емаил.'
    },
    {
      title: 'Да ли добијам сертификат?',
      content: 'Да, након успешног завршетка курса и положеног завршног теста на платформи, добијате званични сертификат о завршеној припреми.'
    },
    {
      title: 'Колико траје припрема?',
      content: 'Препоручујемо минимум 3 месеца припреме, али можете приступити материјалима у било које време. Сваки ученик ради својим темпом.'
    },
    {
      title: 'Да ли постоји подршка током курса?',
      content: 'Апсолутно! Можете поставити питања професорки преко чета, емаила или на недељним уживо сесијама. Ту смо да вам помогнемо на сваком кораку.'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center bg-gradient-to-b from-white to-[#F7F7F7]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#D62828]/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform">
            <HelpCircle className="w-10 h-10 text-[#D62828]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#1A1A1A]">
            Често постављана питања
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Овде можете пронаћи одговоре на најчешћа питања о нашим курсевима, начину рада и плаћању.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <Accordion items={faqs} />

          {/* Contact CTA */}
          <div className="mt-16 text-center">
             <div className="inline-block bg-[#F7F7F7] p-10 rounded-[3rem] shadow-xl border-2 border-gray-100">
               <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="bg-[#D62828]/10 p-5 rounded-2xl">
                   <MessageCircle className="w-10 h-10 text-[#D62828]" />
                 </div>
                 <div className="text-center md:text-left">
                   <h3 className="text-2xl font-bold mb-2 text-[#1A1A1A]">Нисте пронашли одговор?</h3>
                   <p className="text-gray-600">Ту смо да помогнемо. Јавите нам се директно.</p>
                 </div>
                 <Link to="/contact">
                   <Button variant="primary" size="lg">
                     Контактирајте нас
                   </Button>
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
