import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Accordion from '../components/ui/Accordion';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
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
          <div className="bg-brand/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 transform rotate-3 hover:rotate-0 transition-transform">
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
          <div className="mt-10 md:mt-16 text-center">
             <div className="bg-surface p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border-2 border-gray-100">
               <div className="flex flex-col md:flex-row items-center gap-5 md:gap-6">
                 <div className="bg-brand/10 p-4 md:p-5 rounded-2xl">
                   <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-brand" />
                 </div>
                 <div className="text-center md:text-left">
                   <h3 className="text-xl md:text-2xl font-bold mb-2 text-ink">Нисте пронашли одговор?</h3>
                   <p className="text-gray-600 text-sm md:text-base">Ту смо да помогнемо. Јавите нам се директно.</p>
                 </div>
                 <Link to="/contact" className="w-full md:w-auto">
                   <Button variant="primary" size="lg" className="w-full md:w-auto">
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
    </>
  );
}
