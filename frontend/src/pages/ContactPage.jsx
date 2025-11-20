import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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

    // Simulacija slanja (ovde dodati EmailJS ili backend API)
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setFormData({ ime: '', email: '', telefon: '', poruka: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Kontaktirajte nas</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Imate pitanja? Rado ćemo vam pomoći! Pošaljite nam poruku i javićemo vam se u najkraćem roku.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card variant="elevated">
              <CardBody className="p-8">
                <h2 className="text-3xl font-bold text-[#003366] mb-6">Pošaljite poruku</h2>

                {success ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#003366] mb-4">
                      Poruka uspešno poslata!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Hvala što ste nas kontaktirali. Odgovorićemo vam u roku od 24 sata.
                    </p>
                    <Button variant="primary" onClick={() => setSuccess(false)}>
                      Pošalji novu poruku
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      type="text"
                      name="ime"
                      label="Ime i prezime"
                      placeholder="Vaše ime"
                      value={formData.ime}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      type="email"
                      name="email"
                      label="Email adresa"
                      placeholder="vas@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      leftIcon={Mail}
                      required
                    />

                    <Input
                      type="tel"
                      name="telefon"
                      label="Telefon"
                      placeholder="0612345678"
                      value={formData.telefon}
                      onChange={handleChange}
                      leftIcon={Phone}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poruka <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="poruka"
                        value={formData.poruka}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#BFECC9] focus:ring-4 focus:ring-[#BFECC9]/20 focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                        placeholder="Kako možemo da vam pomognemo?"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      loading={loading}
                      disabled={loading}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {loading ? 'Slanje...' : 'Pošalji poruku'}
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card variant="gradient" className="border-2 border-[#BFECC9]/30">
              <CardBody className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-[#42A5F5] p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#003366] mb-2">Email</h3>
                    <p className="text-gray-600">kontakt@naucisprski.com</p>
                    <p className="text-sm text-gray-500 mt-1">Odgovaramo u roku od 24h</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="gradient" className="border-2 border-[#FFD700]/30">
              <CardBody className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FFD700] p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-[#003366]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#003366] mb-2">Telefon</h3>
                    <p className="text-gray-600">+381 60 123 4567</p>
                    <p className="text-sm text-gray-500 mt-1">Pon-Pet: 9:00 - 17:00</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="gradient" className="border-2 border-[#FF6B35]/30">
              <CardBody className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF6B35] p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#003366] mb-2">Lokacija</h3>
                    <p className="text-gray-600">Beograd, Srbija</p>
                    <p className="text-sm text-gray-500 mt-1">Online platforma</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* FAQ Note */}
            <Card variant="elevated">
              <CardBody className="p-8 text-center">
                <h3 className="font-bold text-lg text-[#003366] mb-3">
                  Često postavljana pitanja
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Pre nego što nas kontaktirate, proverite da li ste pronašli odgovor u našem FAQ odeljku.
                </p>
                <Button variant="outline" size="sm">
                  Pogledajte FAQ
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
