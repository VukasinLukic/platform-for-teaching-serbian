import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';

// Mock blog posts - u budućnosti ćete ih učitavati iz baze ili CMS-a
const blogPosts = [
  {
    id: 1,
    slug: 'kako-se-pripremiti-za-malu-maturu',
    title: 'Kako se припремити за малу матуру из српског језика',
    excerpt: 'Комплетан водич за родитеље и ученике - шта се учи, кад почети, како планирати припрему за завршни испит.',
    category: 'Припрема',
    author: 'Марина Лукић',
    date: '2025-02-10',
    readTime: '8 мин',
    image: '/heroSekcija.png',
  },
  {
    id: 2,
    slug: 'padezi-u-srpskom-jeziku',
    title: 'Падежи у српском језику: Једноставно објашњење',
    excerpt: 'Све што треба да знаш о падежима за малу матуру. Са примерима и вежбама.',
    category: 'Српски Језик',
    author: 'Марина Лукић',
    date: '2025-02-08',
    readTime: '12 мин',
    image: '/heroSekcija.png',
  },
  {
    id: 3,
    slug: 'motivacija-deteta-za-ucenje',
    title: 'Како мотивисати дете за учење српског језика',
    excerpt: 'Практични савети за родитеље: како помоћи детету да заволи учење и припрему за испит.',
    category: 'Савети за Родитеље',
    author: 'Марина Лукић',
    date: '2025-02-05',
    readTime: '6 мин',
    image: '/heroSekcija.png',
  },
];

export default function BlogPage() {
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Српски у Срцу Блог",
    "description": "Чланци, савети и водичи за припрему мале матуре из српског језика",
    "url": "https://srpskiusrcu.rs/blog",
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу"
    }
  };

  return (
    <>
      <SEO
        title="Блог | Савети и Водичи за Малу Матуру"
        description="Чланци, савети и водичи за припрему мале матуре из српског језика. Граматика, књижевност, савети за родитеље и ученике."
        canonical="/blog"
        jsonLd={[blogJsonLd]}
      />
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
        <Header />

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 bg-gradient-to-b from-white to-[#F7F7F7]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#D62828]/10 text-[#D62828] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <BookOpen size={18} />
              Блог
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Савети и водичи за <br />
              <span className="text-[#D62828]">малу матуру</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Корисни чланци о припреми, граматици, књижевности и савети за родитеље
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#D62828] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 group-hover:text-[#D62828] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(post.date).toLocaleDateString('sr-RS', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>{post.readTime}</span>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-[#D62828] group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Coming Soon Message */}
            <div className="mt-16 text-center">
              <div className="bg-[#F7F7F7] rounded-3xl p-12 max-w-2xl mx-auto">
                <BookOpen size={48} className="text-[#D62828] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Ускоро још чланака</h3>
                <p className="text-gray-600">
                  Редовно објављујемо нове чланке са саветима, водичима и објашњењима.
                  Пратите нас!
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
