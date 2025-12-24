import Header from '../../components/ui/Header';
import Card, { CardBody } from '../../components/ui/Card';

export default function PrivacyPage() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'kontakt@naucisprski.com';
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Card variant="elevated">
          <CardBody className="p-12">
            <h1 className="text-4xl font-serif font-bold text-[#003366] mb-8">
              Politika privatnosti
            </h1>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
              <p className="text-sm text-gray-500">Poslednje ažuriranje: 19. januar 2025.</p>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">1. Uvod</h2>
                <p>
                  Dobrodošli na platformu "Nauči Srpski". Poštujemo vašu privatnost i posvećeni smo zaštiti vaših ličnih podataka. Ova politika privatnosti objašnjava kako prikupljamo, koristimo i čuvamo vaše informacije.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">2. Podaci koje prikupljamo</h2>
                <p>Prikupljamo sledeće vrste informacija:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Lične informacije (ime, prezime, email adresa, broj telefona)</li>
                  <li>Podatke o uplati (broj transakcije, iznos, datum)</li>
                  <li>Podatke o korišćenju platforme (pristup lekcijama, napredak)</li>
                  <li>Tehničke podatke (IP adresa, tip uređaja, browser)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">3. Kako koristimo vaše podatke</h2>
                <p>Vaše podatke koristimo za:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Pružanje pristupa kursevima i materijalima</li>
                  <li>Komunikaciju vezanu za kurseve i uplate</li>
                  <li>Poboljšanje kvaliteta naših usluga</li>
                  <li>Praćenje napretka i generisanje izveštaja</li>
                  <li>Slanje obaveštenja o novim kursevima i promocijama</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">4. Zaštita podataka</h2>
                <p>
                  Koristimo Firebase Authentication i Firestore bazu podataka sa sigurnosnim pravilima koja štite vaše podatke. Svi podaci su kriptovani tokom prenosa (SSL/TLS) i skladišteni na bezbednim serverima.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">5. Deljenje podataka</h2>
                <p>
                  Ne delimo vaše lične podatke sa trećim licima osim u sledećim slučajevima:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Sa vašom izričitom saglasošću</li>
                  <li>Kada to zahteva zakon</li>
                  <li>Za procesiranje plaćanja (banke, platni procesori)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">6. Vaša prava</h2>
                <p>Imate pravo da:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Pristupite svojim podacima</li>
                  <li>Ispravite netačne podatke</li>
                  <li>Zatražite brisanje podataka</li>
                  <li>Povučete saglasnost za obradu podataka</li>
                  <li>Prenesete podatke drugom provajderu</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">7. Kolačići (Cookies)</h2>
                <p>
                  Koristimo kolačiće za poboljšanje korisničkog iskustva, praćenje sesija i analitiku. Možete onemogućiti kolačiće u podešavanjima vašeg browser-a, ali to može uticati na funkcionalnost platforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">8. Izmene politike</h2>
                <p>
                  Zadržavamo pravo da ažuriramo ovu politiku privatnosti. O svim značajnim izmenama ćemo vas obavestiti putem email-a ili obaveštenja na platformi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#003366] mt-8 mb-4">9. Kontakt</h2>
                <p>
                  Za sva pitanja vezana za privatnost, možete nas kontaktirati na:
                </p>
                <p className="font-semibold">
                  Email: {contactEmail}<br />
                  Telefon: {contactPhone}
                </p>
              </section>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
