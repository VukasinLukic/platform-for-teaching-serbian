import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Instagram, Globe } from 'lucide-react';
import { sendContactFormEmail } from '../services/email.service';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';

export default function ContactPage() {
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
        throw new Error('Greška pri slanju poruke.');
      }
    } catch (err) {
      setError('Došlo je do greške pri slanju poruke. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* Hero Text */}
      <div className="text-center pt-16 pb-8">
        <h1 className="text-5xl font-serif font-bold mb-4">Tu smo za sva vaša <br/> pitanja.</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side - Form (Span 7) */}
          <div className="lg:col-span-7 relative">
            {/* Floating Elements */}
            <div className="absolute -left-12 -top-12 hidden lg:block">
               <div className="bg-[#BFECC9] p-4 rounded-2xl transform -rotate-12 shadow-lg">
                 <Send className="w-8 h-8 text-[#003366]" />
               </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl relative z-10">
               {success ? (
                  <div className="text-center py-20">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Poruka poslata!</h3>
                    <p className="text-gray-600 mb-8">Javićemo vam se uskoro.</p>
                    <Button onClick={() => setSuccess(false)}>Nova poruka</Button>
                  </div>
               ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                   <Input
                     name="ime"
                     placeholder="Ime i prezime"
                     value={formData.ime}
                     onChange={handleChange}
                     className="bg-gray-50 border-gray-100 rounded-2xl py-4"
                     required
                   />
                   <Input
                     type="email"
                     name="email"
                     placeholder="Email adresa"
                     value={formData.email}
                     onChange={handleChange}
                     className="bg-gray-50 border-gray-100 rounded-2xl py-4"
                     required
                   />
                   <Input
                     type="tel"
                     name="telefon"
                     placeholder="Telefon"
                     value={formData.telefon}
                     onChange={handleChange}
                     className="bg-gray-50 border-gray-100 rounded-2xl py-4"
                   />
                   <textarea
                     name="poruka"
                     value={formData.poruka}
                     onChange={handleChange}
                     rows={5}
                     className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#BFECC9] focus:outline-none transition-colors resize-none"
                     placeholder="Vaša poruka..."
                     required
                   />
                   
                   {error && <div className="text-red-500 text-sm">{error}</div>}

                   <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full bg-[#FF6B35] text-white font-bold py-4 rounded-full hover:bg-[#E55A28] transition shadow-lg hover:shadow-xl disabled:opacity-70"
                   >
                     {loading ? 'Slanje...' : 'Pošalji Poruku'}
                   </button>
                 </form>
               )}
            </div>

            {/* Chat Bubble Decoration */}
            <div className="absolute -right-6 bottom-20 hidden lg:block z-20">
              <div className="bg-[#003366] p-4 rounded-[2rem] rounded-bl-none shadow-lg transform rotate-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Right Side - Info Cards (Span 5) */}
          <div className="lg:col-span-5 space-y-6 pt-8">
            {/* Email Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow">
              <div className="bg-[#42A5F5] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <Mail />
              </div>
              <div>
                <div className="font-bold text-[#003366]">email@naucisrpski.rs</div>
                <div className="text-sm text-gray-500">Odgovaramo u roku od 24h</div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow">
              <div className="bg-[#BFECC9] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-[#003366]">
                <Phone />
              </div>
              <div>
                <div className="font-bold text-[#003366]">+381 60 123 4567</div>
                <div className="text-sm text-gray-500">Pon-Pet: 10:00 - 18:00</div>
              </div>
            </div>

            {/* Social Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow">
              <div className="bg-[#FFD700] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-[#003366]">
                <Instagram />
              </div>
              <div>
                <div className="font-bold text-[#003366]">Drustvene Mreže</div>
                <div className="text-sm text-gray-500 space-x-2">
                  <a href="#" className="hover:text-[#FF6B35]">Instagram</a>
                  <span>•</span>
                  <a href="#" className="hover:text-[#FF6B35]">Facebook</a>
                </div>
              </div>
            </div>

            {/* FAQ Promo */}
            <div className="bg-[#003366] text-white p-8 rounded-[2.5rem] text-center mt-8">
               <h3 className="text-xl font-serif font-bold mb-2">Često postavljana pitanja</h3>
               <p className="text-white/70 text-sm mb-6">
                 Pre nego što nas kontaktirate, proverite da li ste pronašli odgovor u našem FAQ odeljku.
               </p>
               <Link to="/faq">
                 <button className="bg-white text-[#003366] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#BFECC9] transition w-full">
                   Pogledajte FAQ
                 </button>
               </Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#002244] text-white py-12 text-center mt-12">
        <div className="flex justify-center gap-8 mb-8 text-sm opacity-70">
            <Link to="/about" className="hover:text-white">O nama</Link>
            <Link to="/contact" className="hover:text-white">Kontakt</Link>
            <Link to="/terms" className="hover:text-white">Uslovi</Link>
        </div>
        <p>&copy; 2025 Nauči Srpski.</p>
      </footer>
    </div>
  );
}
