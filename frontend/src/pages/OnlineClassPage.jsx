import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Video, Star, Award, CheckCircle, X,
  User, Mail, Phone, MessageSquare
} from 'lucide-react';
import { getCourseById } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function OnlineClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    level: 'beginner',
    motivation: ''
  });

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await getCourseById(id);
      if (data.type !== 'live') {
        // Redirect to regular course page if not a live class
        navigate(`/course/${id}`);
        return;
      }
      setCourse(data);
    } catch (error) {
      console.error('Error loading online class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    // TODO: Submit registration to Firestore
    console.log('Registration submitted:', formData);
    setShowRegistrationForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#003366] mb-4">Časovi nisu pronađeni</h2>
          <Button onClick={() => navigate('/courses')}>Nazad na kurseve</Button>
        </div>
      </div>
    );
  }

  // Mock schedule data (will come from course.schedule in future)
  const schedule = course.schedule || {
    startDate: '15. Januar 2025',
    endDate: '15. Mart 2025',
    sessions: [
      { day: 'Ponedeljak', time: '18:00-19:30' },
      { day: 'Sreda', time: '18:00-19:30' },
      { day: 'Petak', time: '18:00-19:30' }
    ],
    totalWeeks: 10,
    totalClasses: 30,
    maxStudents: 15,
    currentEnrolled: 8
  };

  const spotsLeft = schedule.maxStudents - schedule.currentEnrolled;

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#003366] to-[#002244] text-white pt-16 pb-32 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BFECC9] opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF6B35] opacity-10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-fade-in-up">
                <Video className="w-4 h-4" /> Uživo Časovi
              </div>

              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                {course.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#BFECC9]">{schedule.totalWeeks}</div>
                  <div className="text-xs text-gray-300 mt-1">Sedmica</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#42A5F5]">{schedule.totalClasses}</div>
                  <div className="text-xs text-gray-300 mt-1">Časova</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#FFD700]">{spotsLeft}</div>
                  <div className="text-xs text-gray-300 mt-1">Slobodno</div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="bg-[#FF6B35] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#E55A28] transition-all shadow-xl hover:shadow-[#FF6B35]/40 hover:-translate-y-1 flex items-center gap-3"
                >
                  Prijavi se za Časove
                </button>
              </div>
            </div>

            {/* Right Content - Teacher Card */}
            <div className="relative hidden lg:block">
              <div className="bg-white rounded-[3rem] p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003366] to-[#42A5F5] mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                    {course.teacherName?.charAt(0) || 'M'}
                  </div>
                  <h3 className="text-2xl font-bold text-[#003366]">
                    {course.teacherName || 'Profesorka Marina'}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Magistar srpskog jezika i književnosti
                  </p>
                </div>

                <div className="bg-[#F5F3EF] rounded-2xl p-6 space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {course.teacherBio || 'Sa više od 10 godina iskustva u nastavi, pomažem učenicima da ostvare najbolje rezultate na maloj maturi.'}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                    <span className="font-semibold">98% učenika zadovoljno</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Schedule Card */}
            <Card variant="elevated">
              <CardBody className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-[#F5F3EF] p-3 rounded-2xl">
                    <Calendar className="w-8 h-8 text-[#003366]" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Raspored Časova</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#F5F3EF] rounded-2xl p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Početak</div>
                        <div className="text-lg font-bold text-[#003366]">{schedule.startDate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Kraj</div>
                        <div className="text-lg font-bold text-[#003366]">{schedule.endDate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#42A5F5]" />
                      Termini
                    </div>
                    {schedule.sessions.map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#BFECC9] flex items-center justify-center font-bold text-[#003366]">
                            {session.day.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#003366]">{session.day}</div>
                            <div className="text-sm text-gray-500">{session.time}</div>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-[#BFECC9]" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Benefits Card */}
            <Card variant="elevated">
              <CardBody className="p-10">
                <h2 className="text-2xl font-serif font-bold mb-6">Šta dobijate?</h2>

                <div className="space-y-4">
                  {[
                    'Uživo interakcija sa profesorkom',
                    'Male grupe (max 15 učenika)',
                    'Personalizovan pristup',
                    'Snimci časova dostupni 24/7',
                    'Dodatni materijali i vežbe',
                    'Probni testovi',
                    'WhatsApp grupa za pitanja'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#BFECC9] flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="space-y-8">
            {/* Price Card */}
            <Card variant="elevated" className="sticky top-8">
              <CardBody className="p-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-2">Cena paketa</div>
                  <div className="text-4xl font-black text-[#FF6B35]">
                    {formatPrice(course.price)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    (~{Math.round(course.price / schedule.totalClasses)} RSD po času)
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dostupna mesta:</span>
                    <span className="font-bold text-[#003366]">{spotsLeft} / {schedule.maxStudents}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#BFECC9] h-full rounded-full transition-all"
                      style={{ width: `${(schedule.currentEnrolled / schedule.maxStudents) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="w-full bg-[#FF6B35] text-white py-4 rounded-xl font-bold hover:bg-[#E55A28] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Prijavi se za Časove
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                  <p>📞 Pitanja? Pozovite nas</p>
                  <a href="tel:+381641234567" className="font-bold text-[#003366] hover:text-[#42A5F5]">
                    +381 64 123 4567
                  </a>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <button
              onClick={() => setShowRegistrationForm(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-bold text-[#003366] mb-2">Prijava za Časove</h3>
            <p className="text-gray-600 mb-8">Popunite formular i javićemo vam se u najkraćem roku.</p>

            <form onSubmit={handleSubmitRegistration} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Ime i prezime</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    placeholder="Petar Petrović"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    placeholder="petar@primer.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Telefon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    placeholder="+381 64 123 4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Nivo znanja</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                >
                  <option value="beginner">Početni</option>
                  <option value="intermediate">Srednji</option>
                  <option value="advanced">Napredni</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Cilj / Motivacija (opciono)</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    rows={4}
                    placeholder="Šta želite da postignete sa ovim časovima?"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#FF6B35] text-white py-4 rounded-lg font-bold hover:bg-[#E55A28] transition-all"
                >
                  Pošalji Prijavu
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-200 transition-all"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
