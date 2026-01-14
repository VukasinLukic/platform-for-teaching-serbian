import { Link } from 'react-router-dom';

export default function Footer() {
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  return (
    <footer className="bg-white text-[#1A1A1A] pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Link to="/" className="inline-block">
                <img
                  src="/footer.png"
                  alt="СРПСКИ У СРЦУ"
                  className="h-40 md:h-64 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-600 max-w-sm leading-relaxed">
              Ваш поуздан партнер у припреми за малу матуру.
              Комбинујемо традицију и модерне технологије за најбоље резултате.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D62828]">Линкови</h4>
            <ul className="space-y-4 text-gray-600">
              <li><Link to="/" className="hover:text-[#D62828] transition-colors">Почетна</Link></li>
              <li><Link to="/courses" className="hover:text-[#D62828] transition-colors">Курсеви</Link></li>
              <li><Link to="/about" className="hover:text-[#D62828] transition-colors">О Нама</Link></li>
              <li><Link to="/contact" className="hover:text-[#D62828] transition-colors">Контакт</Link></li>
              <li><Link to="/register" className="hover:text-[#D62828] transition-colors">Пријави се</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D62828]">Контакт</h4>
            <ul className="space-y-4 text-gray-600">
              <li>info@srpskiusrcu.rs</li>
              <li>{contactPhone}</li>
              <li>Крушевац, Србија</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; 2025 СРПСКИ У СРЦУ. Сва права задржана.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-[#D62828] transition-colors">Политика приватности</Link>
            <Link to="/terms" className="hover:text-[#D62828] transition-colors">Услови коришћења</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
