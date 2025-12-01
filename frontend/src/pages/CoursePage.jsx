import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, Book, CheckCircle, Clock, Award, Shield, Star, 
  Video, Users, FileText, Lock, Unlock 
} from 'lucide-react';
import { getCourseById } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import PaymentModal from '../components/payment/PaymentModal';

export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeModule, setActiveModule] = useState(0);

  // Mock syllabus data if not in DB yet
  const syllabus = [
    {
      title: 'Modul 1: Gramatika',
      lessons: ['Glasovne promene', 'Vrste reči', 'Sintaksa', 'Padeži']
    },
    {
      title: 'Modul 2: Književnost',
      lessons: ['Epska poezija', 'Lirska poezija', 'Drama', 'Roman']
    },
    {
      title: 'Modul 3: Pravopis',
      lessons: ['Veliko slovo', 'Spojeno i odvojeno pisanje', 'Interpunkcija']
    }
  ];

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await getCourseById(id);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#003366]">Kurs nije pronađen</h2>
          <Link to="/courses" className="text-[#FF6B35] hover:underline mt-4 block">
            Nazad na kurseve
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* HERO SECTION - Premium Style */}
      <section className="bg-gradient-to-br from-[#003366] to-[#002244] text-white pt-16 pb-32 relative overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#42A5F5] opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF6B35] opacity-10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               {/* Left Content */}
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-[#BFECC9] text-[#003366] px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#BFECC9]/20 animate-fade-in-up">
                    <Star className="w-4 h-4 fill-[#003366]" /> Najpopularniji kurs
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                    {course.title}
                  </h1>
                  
                  <p className="text-xl text-white/80 leading-relaxed max-w-xl">
                    {course.description}
                  </p>

                  <div className="flex items-end gap-6">
                     <div className="text-5xl font-bold text-white">
                       {formatPrice(course.price)}
                     </div>
                     {/* Optional: Old price with strikethrough */}
                     {/* <div className="text-xl text-white/40 line-through mb-2">15.000 RSD</div> */}
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-[#FF6B35] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#E55A28] transition-all shadow-xl hover:shadow-[#FF6B35]/40 hover:-translate-y-1 flex items-center gap-3"
                    >
                      Kupi Ovaj Kurs <ArrowRight className="w-6 h-6" />
                    </button>
                    <div className="mt-4 flex items-center gap-6 text-sm text-white/60 font-medium">
                       <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#BFECC9]" /> Jednokratno plaćanje</span>
                       <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#BFECC9]" /> 7 dana garancija</span>
                    </div>
                  </div>
               </div>

               {/* Right Content - 3D Illustration Placeholder */}
               <div className="relative hidden lg:block">
                  <div className="relative z-10 transform rotate-3 hover:rotate-0 transition-all duration-700">
                     {/* Main Card */}
                     <div className="bg-white rounded-[3rem] p-4 shadow-2xl border-8 border-white/10 backdrop-blur-sm">
                        <div className="bg-[#F5F3EF] rounded-[2.5rem] overflow-hidden relative h-[500px] flex items-center justify-center group">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/5 to-[#003366]/10"></div>
                           
                           {/* Stacked Elements */}
                           <div className="relative z-10 text-center space-y-6">
                              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
                                 <Play className="w-12 h-12 text-[#FF6B35] fill-[#FF6B35] ml-2" />
                              </div>
                              <div>
                                 <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl inline-block shadow-lg mb-2">
                                    <span className="font-bold text-[#003366]">Pregled Kursa</span>
                                 </div>
                                 <div className="flex justify-center gap-2 mt-4">
                                    <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#BFECC9]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#003366]"></div>
                                 </div>
                              </div>
                           </div>

                           {/* Decorative Floating Icons */}
                           <div className="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg animate-bounce-slow">
                              <Book className="w-8 h-8 text-[#003366]" />
                           </div>
                           <div className="absolute bottom-20 left-10 bg-[#FFD700] p-3 rounded-xl shadow-lg animate-float">
                              <Award className="w-8 h-8 text-[#003366]" />
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* Back Glow */}
                  <div className="absolute inset-0 bg-white opacity-20 blur-3xl -z-10 transform scale-90 translate-y-10"></div>
               </div>
            </div>
         </div>
      </section>

      {/* CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
           
           {/* Left Column - Bento Grid Content */}
           <div className="space-y-8">
              
              {/* About Card */}
              <div className="bg-white rounded-[2.5rem] p-10 shadow-lg">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#F5F3EF] p-3 rounded-2xl">
                       <FileText className="w-8 h-8 text-[#003366]" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold">O Kursu</h2>
                 </div>
                 <p className="text-gray-600 leading-relaxed text-lg">
                    {course.description || 
                      "Ovaj kurs pruža sveobuhvatnu pripremu za polaganje male mature iz srpskog jezika. Kroz seriju video lekcija, interaktivnih vežbi i testova, prelazimo celokupno gradivo od 5. do 8. razreda. Poseban fokus je na oblastima koje učenicima predstavljaju najveći izazov: glasovne promene, sintaksa i književnost."
                    }
                 </p>
                 
                 <div className="grid sm:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#F5F3EF] p-4 rounded-2xl text-center">
                       <div className="font-black text-2xl text-[#FF6B35]">30+</div>
                       <div className="text-xs font-bold text-gray-500 uppercase mt-1">Sati videa</div>
                    </div>
                    <div className="bg-[#F5F3EF] p-4 rounded-2xl text-center">
                       <div className="font-black text-2xl text-[#42A5F5]">50+</div>
                       <div className="text-xs font-bold text-gray-500 uppercase mt-1">Lekcija</div>
                    </div>
                    <div className="bg-[#F5F3EF] p-4 rounded-2xl text-center">
                       <div className="font-black text-2xl text-[#BFECC9]">24/7</div>
                       <div className="text-xs font-bold text-gray-500 uppercase mt-1">Pristup</div>
                    </div>
                 </div>
              </div>

              {/* Syllabus Card */}
              <div className="bg-white rounded-[2.5rem] p-10 shadow-lg">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#F5F3EF] p-3 rounded-2xl">
                       <Book className="w-8 h-8 text-[#003366]" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold">Plan i Program</h2>
                 </div>

                 <div className="space-y-4">
                    {syllabus.map((module, index) => (
                       <div key={index} className="border-2 border-gray-100 rounded-3xl overflow-hidden">
                          <button 
                            onClick={() => setActiveModule(activeModule === index ? -1 : index)}
                            className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                          >
                             <span className="font-bold text-lg">{module.title}</span>
                             <div className={`p-2 rounded-full ${activeModule === index ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <ChevronDown className={`w-5 h-5 transition-transform ${activeModule === index ? 'rotate-180' : ''}`} />
                             </div>
                          </button>
                          
                          {activeModule === index && (
                             <div className="bg-[#F5F3EF] p-6 border-t-2 border-gray-100">
                                <ul className="space-y-3">
                                   {module.lessons.map((lesson, lIndex) => (
                                      <li key={lIndex} className="flex items-center gap-3">
                                         <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                            <Play className="w-3 h-3 text-[#FF6B35] fill-[#FF6B35]" />
                                         </div>
                                         <span className="text-gray-700 font-medium">{lesson}</span>
                                         <span className="ml-auto text-xs text-gray-400 font-mono">15 min</span>
                                      </li>
                                   ))}
                                </ul>
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column - Sticky Sidebar */}
           <div className="lg:block">
              <div className="sticky top-24 space-y-6">
                 {/* Benefits Card */}
                 <div className="bg-[#003366] text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#BFECC9] opacity-10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                    
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <Award className="text-[#FFD700]" /> Šta dobijate?
                    </h3>
                    
                    <ul className="space-y-4 mb-8">
                       {[
                          'Neograničen pristup 24/7',
                          'Sertifikat po završetku',
                          '30+ sati video materijala',
                          'PDF materijali za učenje',
                          'Podrška profesorke',
                          'Pristup zajednici'
                       ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/90">
                             <div className="bg-[#BFECC9] rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-[#003366]" />
                             </div>
                             {item}
                          </li>
                       ))}
                    </ul>

                    <div className="text-center bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-white/10">
                       <div className="text-3xl font-bold text-[#FFD700] mb-1">98%</div>
                       <div className="text-xs uppercase tracking-widest opacity-70">Prolaznost učenika</div>
                    </div>

                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full bg-[#FF6B35] text-white py-4 rounded-full font-bold hover:bg-[#E55A28] transition shadow-lg"
                    >
                       Kupi Ovaj Kurs
                    </button>
                 </div>

                 {/* Guarantee Badge */}
                 <div className="bg-white rounded-3xl p-6 flex items-center gap-4 shadow-md border border-gray-100">
                    <Shield className="w-10 h-10 text-[#BFECC9] fill-[#003366]" />
                    <div>
                       <div className="font-bold text-[#003366]">100% Sigurno</div>
                       <div className="text-xs text-gray-500">SSL Enkripcija & Sigurno plaćanje</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#002244] text-white py-12 text-center mt-12">
        <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          course={course}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}

function ChevronDown({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}
