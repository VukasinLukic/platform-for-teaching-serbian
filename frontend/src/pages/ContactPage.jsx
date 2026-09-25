import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '../components/auth/zodResolver';
import { functionsErrorMessage } from '../components/auth/errorMessages';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, MessageCircle, Instagram } from 'lucide-react';
import { sendContactFormEmail } from '../services/email.service';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const contactSchema = z.object({
  ime: z.string().trim().min(2, 'Унесите име и презиме').max(80, 'Име је предугачко'),
  email: z.string().trim().min(1, 'Унесите имејл адресу').pipe(z.email('Имејл адреса није исправна (нпр. ime@gmail.com)')),
  telefon: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\+?[\d\s/-]{6,20}$/.test(v), 'Неисправан број телефона'),
  poruka: z.string().trim().min(10, 'Порука треба да има бар 10 карактера').max(3000, 'Порука је предугачка (највише 3000 карактера)'),
});

const fieldClass = (hasError) =>
  `w-full px-6 py-4 bg-[#F7F7F7] border-2 rounded-2xl focus:outline-none transition-colors ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-[#D62828]'
  }`;

function FieldError({ id, error }) {
  if (!error) return null;
  return <p id={id} role="alert" className="mt-2 text-sm font-medium text-red-600">{error.message}</p>;
}

export default function ContactPage() {
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+381 XX XXX XXXX';
  const viberNumber = contactPhone.replace(/[^\d+]/g, '');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { ime: '', email: '', telefon: '', poruka: '' },
  });

  const onSubmit = async (data) => {
    setError('');
    const result = await sendContactFormEmail(data);
    if (result.success) {
      setSuccess(true);
      reset();
    } else {
      setError(functionsErrorMessage(result.error, 'Порука није послата. Покушајте поново или нам пишите директно на имејл.'));
    }
  };
  const loading = isSubmitting;

  return (
    <>
      <SEO
        title="КОНТАКТ | ПИШИТЕ НАМ ИЛИ ПОЗОВИТЕ"
        description="Контактирајте нас за питања о online курсевима српског језика и припреми мале матуре. Одговарамо у року од 24 часа."
        canonical="/contact"
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Почетна", "item": "https://srpskiusrcu.rs/" },
            { "@type": "ListItem", "position": 2, "name": "Контакт", "item": "https://srpskiusrcu.rs/contact" }
          ]
        }]}
        keywords="kontakt srpski u srcu, kontakt online nastava, pitanja o kursevima, email profesorka Marina"
      />
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20">
        <header className="mb-8 md:mb-12 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-3">Контакт</h1>
          <p className="text-gray-600 text-base md:text-lg">
            Имате питање о курсевима или припреми за малу матуру? Пишите нам — одговарамо у року од 24 часа.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Side - Form (Span 7) */}
          <div className="lg:col-span-7 relative">
            {/* Floating Elements */}
            <div className="absolute -left-12 -top-12 hidden lg:block">
               <div className="bg-[#D62828] p-4 rounded-2xl transform -rotate-12 shadow-lg">
                 <Send className="w-8 h-8 text-white" />
               </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-xl relative z-10 border border-gray-100">
               {success ? (
                  <div className="text-center py-12 md:py-20">
                    <div className="bg-[#D62828]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#D62828]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Порука послата!</h3>
                    <p className="text-gray-600 mb-8">Јавићемо вам се ускоро.</p>
                    <Button variant="primary" onClick={() => setSuccess(false)}>Нова порука</Button>
                  </div>
               ) : (
                 <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                   <div>
                     <label htmlFor="contact-ime" className="block text-sm font-semibold text-[#1A1A1A] mb-2">Име и презиме</label>
                     <input id="contact-ime" type="text" autoComplete="name" placeholder="Марко Марковић"
                       aria-invalid={!!errors.ime} aria-describedby={errors.ime ? 'contact-ime-error' : undefined}
                       className={fieldClass(errors.ime)} {...register('ime')} />
                     <FieldError id="contact-ime-error" error={errors.ime} />
                   </div>
                   <div>
                     <label htmlFor="contact-email" className="block text-sm font-semibold text-[#1A1A1A] mb-2">Имејл адреса</label>
                     <input id="contact-email" type="email" inputMode="email" autoComplete="email" placeholder="ime@gmail.com"
                       aria-invalid={!!errors.email} aria-describedby={errors.email ? 'contact-email-error' : undefined}
                       className={fieldClass(errors.email)} {...register('email')} />
                     <FieldError id="contact-email-error" error={errors.email} />
                   </div>
                   <div>
                     <label htmlFor="contact-telefon" className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                       Телефон <span className="font-normal text-gray-400">(опционо)</span>
                     </label>
                     <input id="contact-telefon" type="tel" inputMode="tel" autoComplete="tel" placeholder="0612345678"
                       aria-invalid={!!errors.telefon} aria-describedby={errors.telefon ? 'contact-telefon-error' : undefined}
                       className={fieldClass(errors.telefon)} {...register('telefon')} />
                     <FieldError id="contact-telefon-error" error={errors.telefon} />
                   </div>
                   <div>
                     <label htmlFor="contact-poruka" className="block text-sm font-semibold text-[#1A1A1A] mb-2">Порука</label>
                     <textarea id="contact-poruka" rows={5} placeholder="Ваша порука..."
                       aria-invalid={!!errors.poruka} aria-describedby={errors.poruka ? 'contact-poruka-error' : undefined}
                       className={`${fieldClass(errors.poruka)} resize-none`} {...register('poruka')} />
                     <FieldError id="contact-poruka-error" error={errors.poruka} />
                   </div>

                   {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">{error}</div>}

                   <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-[#D62828] text-white font-bold py-4 rounded-full hover:bg-[#B91F1F] transition shadow-lg hover:shadow-xl disabled:opacity-70"
                   >
                     {loading ? 'Слање...' : 'Пошаљи поруку'}
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
              <div className="min-w-0">
                <div className="font-bold text-[#1A1A1A] break-all">profesorka.marinalukic@gmail.com</div>
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

            {/* Viber Card */}
            <a
              href={`viber://chat?number=${encodeURIComponent(viberNumber)}`}
              className="bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-6 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="bg-[#7360F2] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <MessageCircle />
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A]">Пошаљите нам Viber поруку</div>
                <div className="text-sm text-gray-500">Брз одговор, {contactPhone}</div>
              </div>
            </a>

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
                   Погледајте честа питања
                 </button>
               </Link>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}
