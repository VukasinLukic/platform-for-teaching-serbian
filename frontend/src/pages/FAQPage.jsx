import Header from '../components/ui/Header';
import Accordion from '../components/ui/Accordion';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function FAQPage() {
  const faqs = [
    {
      title: 'Kako funkcioniše online nastava?',
      content: 'Nastava se odvija putem naše platforme. Dobijate pristup video lekcijama koje možete gledati kada god poželite. Pored toga, organizujemo redovne uživo konsultacije preko Zoom-a gde možete postaviti pitanja profesorki.'
    },
    {
      title: 'Koliko dugo imam pristup kursu?',
      content: 'Nakon kupovine kursa, pristup materijalima je doživotan. Možete se vraćati lekcijama koliko god puta želite, čak i nakon završetka pripreme.'
    },
    {
      title: 'Da li mogu da pratim kurs preko telefona?',
      content: 'Da! Naša platforma je potpuno prilagođena za mobilne uređaje. Možete učiti preko telefona, tableta ili računara.'
    },
    {
      title: 'Šta ako nisam zadovoljan/na kursom?',
      content: 'Nudimo povraćaj novca u roku od 7 dana od kupovine ukoliko niste zadovoljni sadržajem kursa. Vaše zadovoljstvo nam je na prvom mestu.'
    },
    {
      title: 'Kako da platim kurs?',
      content: 'Plaćanje se vrši uplatom na račun (uplatnica u pošti/banci ili e-banking). Nakon prijave dobićete instrukcije za plaćanje na email.'
    },
    {
      title: 'Da li dobijam sertifikat?',
      content: 'Da, nakon uspešnog završetka kursa i položenog završnog testa na platformi, dobijate zvanični sertifikat o završenoj pripremi.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#BFECC9] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <HelpCircle className="w-8 h-8 text-[#003366]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Često postavljana pitanja
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ovde možete pronaći odgovore na najčešća pitanja o našim kursevima, načinu rada i plaćanju.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <Accordion items={faqs} />

          {/* Contact CTA */}
          <div className="mt-12 text-center">
             <div className="inline-block bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100">
               <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="bg-[#FF6B35]/10 p-4 rounded-full">
                   <MessageCircle className="w-8 h-8 text-[#FF6B35]" />
                 </div>
                 <div className="text-left">
                   <h3 className="text-xl font-bold mb-1">Niste pronašli odgovor?</h3>
                   <p className="text-gray-500 text-sm">Tu smo da pomognemo. Javite nam se direktno.</p>
                 </div>
                 <Link to="/contact">
                   <Button variant="primary">
                     Kontaktirajte nas
                   </Button>
                 </Link>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002244] text-white py-12 text-center">
        <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
      </footer>
    </div>
  );
}

