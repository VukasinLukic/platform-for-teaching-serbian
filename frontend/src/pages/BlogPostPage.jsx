import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';

// Mock blog post data - u budućnosti iz CMS-a ili baze
const blogPostsData = {
  'kako-se-pripremiti-za-malu-maturu': {
    title: 'Како се припремити за малу матуру из српског језика',
    excerpt: 'Комплетан водич за родитеље и ученике - шта се учи, кад почети, како планирати припрему за завршни испит.',
    category: 'Припрема',
    author: 'Марина Лукић',
    date: '2025-02-10',
    readTime: '8 мин',
    image: '/heroSekcija.png',
    content: `
      <h2>Увод</h2>
      <p>Мала матура је важан корак у образовању сваког ученика осмог разреда. Припрема за завршни испит из српског језика и књижевности захтева планирање, организацију и редовно вежбање.</p>

      <h2>Када почети са припремом?</h2>
      <p>Идеално је почети са припремом најмање 3-6 месеци пре испита. Ово омогућава:</p>
      <ul>
        <li>Детаљно понављање целог градива</li>
        <li>Решавање великог броја тестова</li>
        <li>Идентификацију и рад на слабим тачкама</li>
        <li>Смањење стреса пред испит</li>
      </ul>

      <h2>Шта обухвата градиво?</h2>
      <p>Завршни испит из српског језика обухвата:</p>
      <ul>
        <li><strong>Граматику:</strong> падежи, гласовне промене, врсте речи, синтакса</li>
        <li><strong>Књижевност:</strong> лектире, стилске фигуре, анализа текста</li>
        <li><strong>Правопис:</strong> велика слова, интерпункција, акценти</li>
      </ul>

      <h2>План учења</h2>
      <p>Саветујемо следећи приступ:</p>
      <ol>
        <li><strong>Прве 2 недеље:</strong> Понављање граматике (падежи, гласовне промене)</li>
        <li><strong>Недеље 3-6:</strong> Лектире и књижевност</li>
        <li><strong>Недеље 7-10:</strong> Правопис и вежбање тестова</li>
        <li><strong>Последње 2 недеље:</strong> Решавање завршних тестова и провера знања</li>
      </ol>

      <h2>Корисни савети</h2>
      <ul>
        <li>Учите по 45-60 минута дневно, са паузама</li>
        <li>Правите белешке и резимее</li>
        <li>Решавајте што више пробних тестова</li>
        <li>Не остављајте све за последњи тренутак</li>
        <li>Питајте професора када нешто није јасно</li>
      </ul>

      <h2>Закључак</h2>
      <p>Припрема за малу матуру не мора бити стресна ако почнете на време и будете редовни. Наши online видео курсеви вам нуде детаљне лекције, вежбе и тестове који ће вас оптимално припремити за испит.</p>
    `,
  },
  'padezi-u-srpskom-jeziku': {
    title: 'Падежи у српском језику: Једноставно објашњење',
    excerpt: 'Све што треба да знаш о падежима за малу матуру. Са примерима и вежбама.',
    category: 'Српски Језик',
    author: 'Марина Лукић',
    date: '2025-02-08',
    readTime: '12 мин',
    image: '/heroSekcija.png',
    content: `
      <h2>Шта су падежи?</h2>
      <p>Падежи су облици именица, придева и заменица који показују њихову улогу у реченици. У српском језику имамо <strong>7 падежа</strong>.</p>

      <h2>7 падежа у српском језику</h2>
      <ol>
        <li><strong>Номинатив</strong> (Ко? Шта?) - основни облик</li>
        <li><strong>Генитив</strong> (Кога? Чега?)</li>
        <li><strong>Датив</strong> (Коме? Чему?)</li>
        <li><strong>Акузатив</strong> (Кога? Шта?)</li>
        <li><strong>Вокатив</strong> (ословљавање)</li>
        <li><strong>Инструментал</strong> (С ким? С чим?)</li>
        <li><strong>Локатив</strong> (О коме? О чему?)</li>
      </ol>

      <h2>Примери падежа</h2>
      <p>Узмимо именицу <strong>мајка</strong>:</p>
      <ul>
        <li>Н: <strong>мајка</strong> (То је моја мајка)</li>
        <li>Г: <strong>мајке</strong> (Нема моје мајке)</li>
        <li>Д: <strong>мајци</strong> (Дао сам мајци књигу)</li>
        <li>А: <strong>мајку</strong> (Видим своју мајку)</li>
        <li>В: <strong>мајко</strong> (Мајко, где си?)</li>
        <li>И: <strong>мајком</strong> (Разговарам са мајком)</li>
        <li>Л: <strong>мајци</strong> (Причам о мајци)</li>
      </ul>

      <h2>Како вежбати падеже?</h2>
      <p>Најбољи начин је кроз:</p>
      <ul>
        <li>Решавање вежби из уџбеника</li>
        <li>Прављење својих реченица са именицама у различитим падежима</li>
        <li>Решавање тестова са малих матура прошлих година</li>
      </ul>

      <p>У нашим видео курсевима имамо детаљне лекције о падежима са примерима и вежбама!</p>
    `,
  },
  'motivacija-deteta-za-ucenje': {
    title: 'Како мотивисати дете за учење српског језика',
    excerpt: 'Практични савети за родитеље: како помоћи детету да заволи учење и припрему за испит.',
    category: 'Савети за Родитеље',
    author: 'Марина Лукић',
    date: '2025-02-05',
    readTime: '6 мин',
    image: '/heroSekcija.png',
    content: `
      <h2>Зашто је мотивација важна?</h2>
      <p>Мотивисано дете учи ефикасније, задржава информације боље и има позитиван став према школовању. Као родитељ, можете много да помогнете.</p>

      <h2>5 начина да мотивишете дете</h2>

      <h3>1. Поставите реалне циљеве</h3>
      <p>Немојте очекивати савршенство одмах. Поставите мале, остварљиве циљеве (нпр. "научи 3 падежа ове недеље").</p>

      <h3>2. Направите пријатан простор за учење</h3>
      <p>Обезбедите тихо место без ометања, добро осветљење, удобну столицу.</p>

      <h3>3. Похвалите напредак</h3>
      <p>Фокусирајте се на оно што дете зна, а не на грешке. Похвалите труд, не само резултат.</p>

      <h3>4. Учините учење интересантним</h3>
      <p>Користите видео лекције, квизове, игре. Online курсеви су интерактивни и привлаче пажњу.</p>

      <h3>5. Будите подршка, не притисак</h3>
      <p>Понудите помоћ, али не преузимајте учење уместо детета. Покажите да сте ту.</p>

      <h2>Шта избегавати?</h2>
      <ul>
        <li>Поређење са другом децом</li>
        <li>Критиковање уместо конструктивне повратне информације</li>
        <li>Превелики притисак и очекивања</li>
        <li>Казне због лоших оцена</li>
      </ul>

      <h2>Закључак</h2>
      <p>Мотивација долази изнутра, али родитељи могу створити окружење које подстиче љубав према учењу. Будите стрпљиви, позитивни и подржавајући!</p>
    `,
  },
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPostsData[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Чланак није пронађен</h1>
          <Link to="/blog" className="text-[#D62828] hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={20} />
            Назад на блог
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.date,
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "Српски у Срцу",
      "logo": {
        "@type": "ImageObject",
        "url": "https://srpskiusrcu.rs/logoFULL.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://srpskiusrcu.rs/blog/${slug}`
    }
  };

  return (
    <>
      <SEO
        title={`${post.title} | Блог`}
        description={post.excerpt}
        canonical={`/blog/${slug}`}
        ogType="article"
        jsonLd={[articleJsonLd]}
      />
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
        <Header />

        {/* Back to Blog */}
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#D62828] transition-colors"
          >
            <ArrowLeft size={20} />
            Назад на блог
          </Link>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-6 pb-16">
          <div className="mb-8">
            <span className="inline-block bg-[#D62828] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

            {/* Meta */}
            <div className="flex items-center gap-6 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.date).toLocaleDateString('sr-RS', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <span>{post.readTime} читања</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-3xl overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-[#1A1A1A]
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:mb-2 prose-li:text-gray-700
              prose-strong:text-[#D62828] prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#D62828] to-[#B91C1C] rounded-3xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Спремни за малу матуру?</h3>
            <p className="text-white/90 text-lg mb-8">
              Придружите се нашим online видео курсевима и савладајте градиво са лакоћом
            </p>
            <Link
              to="/courses"
              className="inline-block bg-white text-[#D62828] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Погледајте курсеве
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
