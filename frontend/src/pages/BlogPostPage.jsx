import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import NotFoundPage from './NotFoundPage';
import { getBlogPost } from '../data/blogPosts';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) return <NotFoundPage />;

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A]">
        <Header />

        <article className="max-w-4xl mx-auto px-6 pt-16 pb-12 md:pt-28 md:pb-20">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D62828] transition-colors text-sm mb-10"
          >
            <ArrowLeft size={16} />
            Блог
          </Link>

          {/* Title & Meta */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-10 pb-8 border-b border-gray-200">
            <span>{post.author}</span>
            <span>·</span>
            <span>
              {new Date(post.date).toLocaleDateString('sr-RS', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span>{post.readTime} читања</span>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-[#1A1A1A]
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:mb-1.5 prose-li:text-gray-700
              prose-strong:text-[#1A1A1A] prose-strong:font-semibold
              prose-em:text-gray-600"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Simple CTA */}
          <div className="mt-14 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Погледајте наше курсеве и припремите се за испит.</p>
            <Link
              to="/courses"
              className="inline-block bg-[#D62828] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#B91F1F] transition"
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
