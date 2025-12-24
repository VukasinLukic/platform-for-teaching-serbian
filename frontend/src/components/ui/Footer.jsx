import { Link } from 'react-router-dom';

export default function Footer() {
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  return (
    <footer className="bg-[#1A1A1A] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6 transition-transform hover:scale-105">
              <img
                src="/logoFOOTER.svg"
                alt="СРПСКИ У СРЦУ"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Ваш поуздан партнер у припреми за малу матуру.
              Комбинујемо традицију и модерне технологије за најбоље резултате.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D62828]">Линкови</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Почетна</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Курсеви</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">О Нама</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Контакт</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Пријави се</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D62828]">Контакт</h4>
            <ul className="space-y-4 text-gray-400">
              <li>info@srpskiusrcu.rs</li>
              <li>{contactPhone}</li>
              <li>Београд, Србија</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; 2025 СРПСКИ У СРЦУ. Сва права задржана.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">Политика приватности</Link>
            <Link to="/terms" className="hover:text-white">Услови коришћења</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
