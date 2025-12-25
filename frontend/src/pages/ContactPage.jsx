import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Instagram } from 'lucide-react';
import { sendContactFormEmail } from '../services/email.service';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';

  const [formData, setFormData] = useState({
    ime: '',
    email: '',
    telefon: '',
    poruka: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await sendContactFormEmail(formData);
      if (result.success) {
        setSuccess(true);
        setFormData({ ime: '', email: '', telefon: '', poruka: '' });
      } else {
        throw new Error('Грешка при слању поруке.');
      }
    } catch (err) {
      setError('Дошло је до грешке при слању поруке. Молимо покушајте поново.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Side - Form (Span 7) */}
          <div className="lg:col-span-7 relative">
            {/* Floating Elements */}
            <div className="absolute -left-12 -top-12 hidden lg:block">
               <div className="bg-[#D62828] p-4 rounded-2xl transform -rotate-12 shadow-lg">
                 <Send className="w-8 h-8 text-white" />
               </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl relative z-10 border border-gray-100">
               {success ? (
                  <div className="text-center py-20">
                    <div className="bg-[#D62828]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#D62828]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Порука послата!</h3>
                    <p className="text-gray-600 mb-8">Јавићемо вам се ускоро.</p>
                    <Button variant="primary" onClick={() => setSuccess(false)}>Нова порука</Button>
                  </div>
               ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                   <Input
                     name="ime"
                     placeholder="Име и презиме"
                     value={formData.ime}
                     onChange={handleChange}
                     className="bg-[#F7F7F7] border-gray-100 rounded-2xl py-4"
                     required
                   />
                   <Input
                     type="email"
                     name="email"
                     placeholder="Емаил адреса"
                     value={formData.email}
                     onChange={handleChange}
                     className="bg-[#F7F7F7] border-gray-100 rounded-2xl py-4"
                     required
                   />
                   <Input
                     type="tel"
                     name="telefon"
                     placeholder="Телефон"
                     value={formData.telefon}
                     onChange={handleChange}
                     className="bg-[#F7F7F7] border-gray-100 rounded-2xl py-4"
                   />
                   <textarea
                     name="poruka"
                     value={formData.poruka}
                     onChange={handleChange}
                     rows={5}
                     className="w-full px-6 py-4 bg-[#F7F7F7] border-2 border-gray-100 rounded-2xl focus:border-[#D62828] focus:outline-none transition-colors resize-none"
                     placeholder="Ваша порука..."
                     required
                   />

                   {error && <div className="text-red-500 text-sm">{error}</div>}

                   <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-[#D62828] text-white font-bold py-4 rounded-full hover:bg-[#B91F1F] transition shadow-lg hover:shadow-xl disabled:opacity-70"
                   >
                     {loading ? 'Слање...' : 'Пошаљи Поруку'}
                   </button>
                 </form>
               )}
            </div>

            {/* Chat Bubble Decoration */}
            <div className="absolute -right-6 bottom-20 hidden lg:block z-20">
              <div className="bg-[#F2C94C] p-4 rounded-[2rem] rounded-bl-none shadow-lg transform rotate-6">
                <MessageSquare className="w-8 h-8 text-[#1A1A1A]" />
              </div>
            </div>
          </div>

          {/* Right Side - Info Cards (Span 5) */}
          <div className="lg:col-span-5 space-y-6 pt-8">
            {/* Email Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-[#D62828] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <Mail />
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A]">info@srpskiusrcu.rs</div>
                <div className="text-sm text-gray-500">Одговарамо у року од 24ч</div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-[#F2C94C] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-[#1A1A1A]">
                <Phone />
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A]">{contactPhone}</div>
                <div className="text-sm text-gray-500">Пон-Пет: 10:00 - 18:00</div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-[#1A1A1A] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <MapPin />
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A]">Београд, Србија</div>
                <div className="text-sm text-gray-500">Онлајн настава</div>
              </div>
            </div>

            {/* FAQ Promo */}
            <div className="bg-[#D62828] text-white p-8 rounded-[2.5rem] text-center mt-8">
               <h3 className="text-xl font-bold mb-2">Често постављана питања</h3>
               <p className="text-white/90 text-sm mb-6">
                 Пре него што нас контактирате, проверите да ли сте пронашли одговор у нашем FAQ одељку.
               </p>
               <Link to="/faq">
                 <button className="bg-white text-[#D62828] px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-100 transition w-full">
                   Погледајте FAQ
                 </button>
               </Link>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
