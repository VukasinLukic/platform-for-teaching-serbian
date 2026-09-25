import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Accordion from '../components/ui/Accordion';
import { HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import MascotHint from '../components/mascot/MascotHint';
import { faqs } from '../data/faqs';

export default function FAQPage() {
  return (
    <>
      <SEO />
    <div className="min-h-screen bg-white font-sans text-ink">
      <Header />

      {/* Hero */}
      <section className="pt-12 pb-10 md:pt-20 md:pb-16 px-6 text-center bg-gradient-to-b from-white to-surface">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-50 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 transform rotate-3 hover:rotate-0 transition-transform">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-brand" />
          </div>
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 text-ink">
            Често постављана питања
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Овде можете пронаћи одговоре на најчешћа питања о нашим курсевима, начину рада и плаћању.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-6 py-14 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <Accordion items={faqs} />

          {/* Contact CTA */}
          <div className="mt-10 md:mt-16">
            <MascotHint message="Ниси нашао одговор? 🤔" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
