import Header from '../../components/ui/Header';
import Card, { CardBody } from '../../components/ui/Card';
import SEO from '../../components/SEO';

export default function TermsPage() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'kontakt@srpskiusrcu.com';
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  return (
    <>
      <SEO title="УСЛОВИ КОРИШЋЕЊА" description="Услови коришћења платформе Српски у Срцу." canonical="/terms" />
    <div className="min-h-screen bg-surface">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Card variant="elevated">
          <CardBody className="p-12">
            <h1 className="text-4xl font-serif font-bold text-ink mb-8">
              Услови коришћења
            </h1>

            <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
              <p className="text-sm text-gray-500">Последње ажурирање: 19. јануар 2025.</p>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">1. Prihvatanje uslova</h2>
                <p>
                  Коришћењем платформе "Научи Српски", пристајете на ове услове коришћења. Ако се не слажете са било којим делом услова, не користите платформу.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">2. Opis usluge</h2>
                <p>
                  "Научи Српски" пружа онлајн платформу за припрему ученика за малу матуру из српског језика и књижевности. Услуга укључује видео лекције, уживо часове, материјале за преузимање и подршку професорке.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">3. Registracija naloga</h2>
                <p>За приступ курсевима, морате креирати налог са важећом имејл адресом и лозинком. Одговорни сте за:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Чување поверљивости вашег налога</li>
                  <li>Све активности које се дешавају под вашим налогом</li>
                  <li>Обавештавање нас о неовлашћеном коришћењу</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">4. Плаћање и повраћај новца</h2>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Цене курсева су приказане у динарима (RSD)</li>
                  <li>Плаћање се врши уплатницом на наш банковни рачун</li>
                  <li>Приступ курсу се одобрава након потврде уплате од стране админа</li>
                  <li>Повраћај новца је могућ у року од 7 дана од куповине ако нисте приступили више од 2 лекције</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">5. Intelektualna svojina</h2>
                <p>
                  Сви материјали на платформи (видео лекције, текстови, PDF-ови, тестови) су заштићени ауторским правима и власништво су платформе "Научи Српски" и професорке Марине Лукић.
                </p>
                <p>Забрањено је:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Kopiranje, distribuiranje ili prodavanje materijala</li>
                  <li>Снимање видео лекција</li>
                  <li>Дељење приступних података са другим лицима</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">6. Понашање корисника</h2>
                <p>Забрањено је:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Узнемиравање других корисника или професорке</li>
                  <li>Постављање увредљивих или неприкладних порука</li>
                  <li>Покушај неовлашћеног приступа систему</li>
                  <li>Коришћење платформе у незаконите сврхе</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">7. Ограничење одговорности</h2>
                <p>
                  Иако се трудимо да пружимо квалитетну припрему, не гарантујемо пролазност на пријемном испиту. Резултати зависе од индивидуалног труда и способности ученика.
                </p>
                <p>
                  Нисмо одговорни за техничке проблеме, прекиде услуге или губитак података ван наше контроле.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">8. Prekid usluge</h2>
                <p>
                  Задржавамо право да суспендујемо или укинемо ваш приступ платформи уколико кршите ове услове коришћења.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">9. Izmene uslova</h2>
                <p>
                  Задржавамо право да ажурирамо ове услове. О значајним изменама ћемо вас обавестити путем имејла или обавештења на платформи.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">10. Закон и јурисдикција</h2>
                <p>
                  Ови услови се регулишу законима Републике Србије. Сви спорови ће бити решавани у надлежним судовима у Београду.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-ink mt-8 mb-4">11. Kontakt</h2>
                <p>
                  За сва питања везана за услове коришћења, можете нас контактирати на:
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
    </>
  );
}
