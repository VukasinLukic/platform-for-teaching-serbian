import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';

const blogPosts = [
  {
    id: 1,
    slug: 'kako-se-pripremiti-za-malu-maturu',
    title: 'Како се припремити за малу матуру из српског језика',
    excerpt: 'Практичан водич кроз градиво, план рада и савете за ученике који полажу завршни испит из српског језика.',
    category: 'Припрема',
    author: 'Марина Лукић',
    date: '2025-02-10',
    readTime: '8 мин',
  },
  {
    id: 2,
    slug: 'padezi-u-srpskom-jeziku',
    title: 'Падежи у српском језику — преглед, примери и вежбе',
    excerpt: 'Преглед свих 7 падежа са питањима, примерима деклинације и типичним грешкама.',
    category: 'Граматика',
    author: 'Марина Лукић',
    date: '2025-02-08',
    readTime: '10 мин',
  },
  {
    id: 3,
    slug: 'motivacija-deteta-za-ucenje',
    title: 'Како помоћи детету да заволи учење српског језика',
    excerpt: 'Савети за родитеље: како створити позитивно окружење за учење и подржати дете у припреми за испит.',
    category: 'Савети',
    author: 'Марина Лукић',
    date: '2025-02-05',
    readTime: '6 мин',
  },
  {
    id: 4,
    slug: 'glasovne-promene-u-srpskom-jeziku',
    title: 'Гласовне промене у српском језику — јотовање, палатализација, сибиларизација',
    excerpt: 'Детаљно објашњење свих гласовних промена са примерима, правилима и вежбама за ученике.',
    category: 'Граматика',
    author: 'Марина Лукић',
    date: '2025-02-15',
    readTime: '12 мин',
  },
  {
    id: 5,
    slug: 'najcesce-greske-na-maloj-maturi',
    title: '10 најчешћих грешака ученика на малој матури из српског',
    excerpt: 'Анализа типичних грешака на завршном испиту и практични савети како их избећи.',
    category: 'Припрема',
    author: 'Марина Лукић',
    date: '2025-02-18',
    readTime: '9 мин',
  },
  {
    id: 6,
    slug: 'vrste-reci-u-srpskom-jeziku',
    title: 'Врсте речи у српском језику — именице, придеви, глаголи и остале',
    excerpt: 'Комплетан преглед свих врста речи: променљиве и непроменљиве, са примерима и објашњењима.',
    category: 'Граматика',
    author: 'Марина Лукић',
    date: '2025-02-22',
    readTime: '11 мин',
  },
  {
    id: 7,
    slug: 'stilske-figure-u-srpskom-jeziku',
    title: 'Стилске фигуре — метафора, поређење, персонификација и друге',
    excerpt: 'Преглед најважнијих стилских фигура за малу матуру: дефиниције, примери из лектире и вежбе.',
    category: 'Књижевност',
    author: 'Марина Лукић',
    date: '2025-02-25',
    readTime: '10 мин',
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

        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Блог</h1>
          <p className="text-gray-500 mb-12">Чланци о српском језику, припреми за испит и савети за родитеље.</p>

          <div className="space-y-0 divide-y divide-gray-200">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block py-8 first:pt-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-[#D62828] uppercase tracking-wide">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(post.date).toLocaleDateString('sr-RS', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-[#D62828] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-3 text-sm text-gray-400">{post.readTime} читања</span>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-300 group-hover:text-[#D62828] group-hover:translate-x-1 transition-all mt-2 flex-shrink-0"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
