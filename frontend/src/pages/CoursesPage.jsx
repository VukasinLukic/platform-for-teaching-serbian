import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Video, Users, Clock, ArrowRight } from 'lucide-react';
import { getAllCourses } from '../services/course.service';
import { formatPrice } from '../utils/helpers';
import Header from '../components/ui/Header';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans text-[#003366]">
      <Header />

      {/* Hero */}
      <div className="bg-[#003366] text-white py-20 rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Naši Kursevi
          </h1>
          <p className="text-xl text-[#BFECC9] max-w-2xl mx-auto">
            Izaberite program koji vam najviše odgovara i započnite pripremu za malu maturu na vreme.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="h-full">
                <Card variant="elevated" hover className="h-full flex flex-col">
                  {/* Card Header Image */}
                  <div className="h-48 bg-[#F5F3EF] relative overflow-hidden flex items-center justify-center group">
                     {course.thumbnail_url ? (
                       <img
                         src={course.thumbnail_url}
                         alt={course.title}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       />
                     ) : course.type === 'video' ? (
                       <Video className="w-20 h-20 text-[#003366]/20 group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                       <Users className="w-20 h-20 text-[#003366]/20 group-hover:scale-110 transition-transform duration-500" />
                     )}
                     <div className="absolute top-4 right-4 bg-[#BFECC9] text-[#003366] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       {course.type === 'video' ? 'Video Kurs' : 'Uživo Nastava'}
                     </div>
                  </div>
                  
                  <CardBody className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-[#003366] mb-3">{course.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
                      {course.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>48 lekcija</span>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-2xl font-black text-[#FF6B35]">
                          {formatPrice(course.price)}
                        </div>
                        <Link to={course.type === 'live' ? `/online-class/${course.id}` : `/course/${course.id}`}>
                          <Button variant="outline" size="sm" showArrow>
                            Detaljnije
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-[#002244] text-white py-12 text-center">
        <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
      </footer>
    </div>
  );
}

