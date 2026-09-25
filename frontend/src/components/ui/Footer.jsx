import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const CONTACT_EMAIL = 'profesorka.marinalukic@gmail.com';

const COLUMNS = [
  {
    title: 'Курсеви',
    links: [
      { to: '/courses', label: 'Сви курсеви' },
      { to: '/online-nastava', label: 'Онлајн настава' },
      { to: '/benefits', label: 'Зашто ми' },
    ],
  },
  {
    title: 'Тестови',
    links: [
      { to: '/inicijalni-test/5', label: 'Иницијални тест — 5. разред' },
      { to: '/inicijalni-test/6', label: 'Иницијални тест — 6. разред' },
      { to: '/inicijalni-test/7', label: 'Иницијални тест — 7. разред' },
      { to: '/inicijalni-test/8', label: 'Иницијални тест — 8. разред' },
      { to: '/probni-prijemni', label: 'Пробни пријемни' },
      { to: '/kvizovi', label: 'Квизови' },
    ],
  },
  {
    title: 'Платформа',
    links: [
      { to: '/about', label: 'О нама' },
      { to: '/blog', label: 'Блог' },
      { to: '/faq', label: 'Честа питања' },
      { to: '/contact', label: 'Контакт' },
      { to: '/login', label: 'Пријави се' },
      { to: '/register', label: 'Региструј се' },
    ],
  },
  {
    title: 'Правно',
    links: [
      { to: '/privacy', label: 'Политика приватности' },
      { to: '/terms', label: 'Услови коришћења' },
    ],
  },
];

const linkClass =
  'inline-block py-1 text-[15px] text-gray-600 hover:text-[#D62828] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40';

export default function Footer() {
  // Only show a phone number when one is configured (no placeholder numbers in the UI).
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE;
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-white text-[#1A1A1A] border-t border-gray-100 overflow-hidden">
      {/* Subtle school-notebook motif: faint ruled lines + red margin line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(59,130,246,0.07) 31px, rgba(59,130,246,0.07) 32px)',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 sm:left-8 lg:left-16 w-px bg-[#D62828]/15" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 pt-12 pb-8 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40" aria-label="Српски у срцу — почетна">
              <img src="/footer.webp" alt="" className="h-14 md:h-16 w-auto" width="766" height="291" loading="lazy" />
            </Link>
            <p className="mt-4 text-gray-600 max-w-sm leading-relaxed">
              Припрема за малу матуру из српског језика и књижевности — видео лекције, онлајн часови и бесплатни тестови.
            </p>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-[#1A1A1A] font-semibold hover:text-[#D62828] transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#D62828] flex-shrink-0" aria-hidden="true" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              {contactPhone && (
                <li>
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2 text-gray-700 hover:text-[#D62828] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#D62828]" aria-hidden="true" />
                    {contactPhone}
                  </a>
                </li>
              )}
              <li className="inline-flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-[#D62828]" aria-hidden="true" />
                Крушевац, Србија
              </li>
            </ul>
          </div>

          {/* Link columns */}
          <nav aria-label="Линкови у подножју" className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#D62828] mb-3">{col.title}</h2>
                <ul className="space-y-1">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 text-center">
          <p>&copy; {year} Српски у срцу. Сва права задржана.</p>
          <p>
            Наставница: Марина Лукић ·{' '}
            <Link to="/contact" className="hover:text-[#D62828] underline-offset-2 hover:underline">
              пишите нам
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
