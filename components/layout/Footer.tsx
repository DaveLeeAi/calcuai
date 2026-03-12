import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

const CATEGORIES = [
  { name: 'Finance', slug: 'finance' },
  { name: 'Health', slug: 'health' },
  { name: 'Math', slug: 'math' },
  { name: 'Construction', slug: 'construction' },
  { name: 'Science', slug: 'science' },
  { name: 'Everyday', slug: 'everyday' },
  { name: 'Business', slug: 'business' },
  { name: 'Conversion', slug: 'conversion' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Categories */}
          <div className="col-span-2">
            <h3 className="text-white font-semibold mb-4">Calculators</h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <div className="flex flex-col gap-2">
              <Link href="/glossary" className="text-sm hover:text-white transition-colors w-fit">Glossary</Link>
              <Link href="/methodology" className="text-sm hover:text-white transition-colors w-fit">Methodology</Link>
              <Link href="/sitemap-page" className="text-sm hover:text-white transition-colors w-fit">Sitemap</Link>
              <Link href="/about" className="text-sm hover:text-white transition-colors w-fit">About</Link>
            </div>
          </div>

          {/* Brand */}
          <div>
            <h3 className="text-white font-semibold mb-4">{siteConfig.name}</h3>
            <p className="text-sm">
              Free, accurate, and fast online calculators. No signup required.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} {siteConfig.name}. All calculators are for informational purposes only.
        </div>
      </div>
    </footer>
  );
}
