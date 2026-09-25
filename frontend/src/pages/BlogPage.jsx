import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SEO from '../components/SEO';
import { blogPosts } from '../data/blogPosts';

export default function BlogPage() {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-white font-sans text-ink">
        <Header />

        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 md:pt-28 md:pb-20">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Блог</h1>
          <p className="text-gray-500 mb-8 md:mb-12">Чланци о српском језику, припреми за испит и савети за родитеље.</p>

          <div className="space-y-0 divide-y divide-gray-200">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group block py-8 first:pt-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-brand uppercase tracking-wide">
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
                    <h2 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-3 text-sm text-gray-400">{post.readTime} читања</span>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all mt-2 flex-shrink-0"
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
