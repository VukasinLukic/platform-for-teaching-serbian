import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Newspaper, Home } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';

const LINKS = [
  { to: '/courses', label: 'Курсеви', text: 'Видео лекције за малу матуру', Icon: BookOpen },
  { to: '/kvizovi', label: 'Квизови и тестови', text: 'Провери знање бесплатно', Icon: ClipboardCheck },
  { to: '/blog', label: 'Блог', text: 'Савети и водичи', Icon: Newspaper },
  { to: '/', label: 'Почетна', text: 'Назад на почетну страну', Icon: Home },
];

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Страница није пронађена" description="Тражена страница не постоји." noindex />
      <div className="min-h-screen bg-white font-sans text-ink flex flex-col">
        <Header />
        <section className="flex-1 px-4 sm:px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto grid md:grid-cols-[220px_1fr] gap-8 md:gap-12 items-center">
            <img
              src="/mascot/alano-reading.webp"
              alt="Алано чита књигу"
              width="220"
              height="310"
              className="w-40 md:w-full h-auto mx-auto"
            />
            <div className="text-center md:text-left">
              <p className="text-primary font-bold tracking-widest text-sm mb-2">ГРЕШКА 404</p>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Ова страница није пронађена
              </h1>
              <p className="text-gray-600 text-base md:text-lg mb-8">
                Алано је прелистао све књиге, али ову страницу није нашао. Можда је адреса погрешно укуцана или је страница премештена.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {LINKS.map(({ to, label, text, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-primary/40 hover:bg-white hover:shadow-md transition"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-bold group-hover:text-primary">{label}</span>
                      <span className="block text-sm text-gray-500">{text}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}
