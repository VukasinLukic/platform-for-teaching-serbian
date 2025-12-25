import Header from '../../components/ui/Header';
import Card, { CardBody } from '../../components/ui/Card';

export default function TermsPage() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'kontakt@naucisprski.com';
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Card variant="elevated">
          <CardBody className="p-12">
            <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] mb-8">
              Uslovi korišćenja
            </h1>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
              <p className="text-sm text-gray-500">Poslednje ažuriranje: 19. januar 2025.</p>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">1. Prihvatanje uslova</h2>
                <p>
                  Korišćenjem platforme "Nauči Srpski", pristajete na ove uslove korišćenja. Ako se ne slažete sa bilo kojim delom uslova, ne koristite platformu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">2. Opis usluge</h2>
                <p>
                  "Nauči Srpski" pruža online platformu za pripremu učenika za malu maturu iz srpskog jezika i književnosti. Usluga uključuje video lekcije, uživo časove, materijale za preuzimanje i podršku profesorke.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">3. Registracija naloga</h2>
                <p>Za pristup kursevima, morate kreirati nalog sa važećom email adresom i lozinkom. Odgovorni ste za:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Čuvanje poverljivosti vašeg naloga</li>
                  <li>Sve aktivnosti koje se dešavaju pod vašim nalogom</li>
                  <li>Obaveštavanje nas o neovlašćenom korišćenju</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">4. Plaćanje i povraćaj novca</h2>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Cene kurseva su prikazane u dinarima (RSD)</li>
                  <li>Plaćanje se vrši uplatnicom na naš bankovni račun</li>
                  <li>Pristup kursu se odobrava nakon potvrde uplate od strane admina</li>
                  <li>Povraćaj novca je moguć u roku od 7 dana od kupovine ako niste pristupili više od 2 lekcije</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">5. Intelektualna svojina</h2>
                <p>
                  Svi materijali na platformi (video lekcije, tekstovi, PDF-ovi, testovi) su zaštićeni autorskim pravima i vlasništvo su platforme "Nauči Srpski" i profesorke Marine Lukić.
                </p>
                <p>Zabranjeno je:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Kopiranje, distribuiranje ili prodavanje materijala</li>
                  <li>Snimanje video lekcija</li>
                  <li>Deljenje pristupnih podataka sa drugim licima</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">6. Ponašanje korisnika</h2>
                <p>Zabranjeno je:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Uznemiravanje drugih korisnika ili profesorke</li>
                  <li>Postavljanje uvredljivih ili neprikladnih poruka</li>
                  <li>Pokušaj neovlašćenog pristupa sistemu</li>
                  <li>Korišćenje platforme u nezakonite svrhe</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">7. Ograničenje odgovornosti</h2>
                <p>
                  Iako se trudimo da pružimo kvalitetnu pripremu, ne garantujemo prolaznost na prijemnom ispitu. Rezultati zavise od individualnog truda i sposobnosti učenika.
                </p>
                <p>
                  Nismo odgovorni za tehničke probleme, prekide usluge ili gubitak podataka van naše kontrole.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">8. Prekid usluge</h2>
                <p>
                  Zadržavamo pravo da suspendujemo ili ukinemo vaš pristup platformi ukoliko kršite ove uslove korišćenja.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">9. Izmene uslova</h2>
                <p>
                  Zadržavamo pravo da ažuriramo ove uslove. O značajnim izmenama ćemo vas obavestiti putem email-a ili obaveštenja na platformi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">10. Zakon i jurisdikcija</h2>
                <p>
                  Ovi uslovi se regulišu zakonima Republike Srbije. Svi sporovi će biti rešavani u nadležnim sudovima u Beogradu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mt-8 mb-4">11. Kontakt</h2>
                <p>
                  Za sva pitanja vezana za uslove korišćenja, možete nas kontaktirati na:
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
