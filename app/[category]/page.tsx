import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCategories, getCategory, getSpecsByCategory } from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildCategoryMetadata, buildCollectionPageSchema } from '@/components/seo/MetaTags';
import salesTaxData from '@/content/data/us-sales-tax-2026.json';

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategory(params.category);
  if (!cat) return {};
  return buildCategoryMetadata(cat.metaTitle, cat.metaDescription, cat.slug);
}

export default function CategoryHubPage({ params }: Props) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const specs = getSpecsByCategory(params.category);
  const collectionSchema = buildCollectionPageSchema(cat.name, cat.metaDescription, cat.slug);

  return (
    <div>
      <JsonLd data={collectionSchema} id="schema-collection" />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: cat.name },
      ]} />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{cat.name}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 max-w-content">{cat.description}</p>

      {/* Subcategory sections */}
      {cat.subcategories.length > 0 && (
        <section className="mb-12">
          <h2 className="section-heading">Browse by Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cat.subcategories.map((sub) => (
              <div key={sub.id} className="category-card">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{sub.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{sub.description}</p>
                <ul className="space-y-1">
                  {sub.calculators.slice(0, 5).map((calcId) => {
                    const spec = specs.find(s => s.id === calcId);
                    const label = spec?.title ?? calcId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <li key={calcId}>
                        {spec ? (
                          <Link href={`/${params.category}/${spec.slug}`} className="text-sm text-brand-500 hover:text-brand-600 hover:underline">
                            {label}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-slate-500">{label}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-brand-500 font-medium mt-3">
                  {sub.calculators.length} calculators
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All calculators in this category */}
      <section className="mb-12">
        <h2 className="section-heading">All {cat.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {specs.map((spec) => (
            <Link key={spec.id} href={`/${params.category}/${spec.slug}`} className="related-calc-link">
              <span className="font-medium text-brand-600">{spec.title}</span>
            </Link>
          ))}
        </div>
        {specs.length === 0 && (
          <p className="text-gray-500 dark:text-slate-400">No calculators published in this category yet. Coming soon.</p>
        )}
      </section>

      {/* State Sales Tax Calculators — finance category only */}
      {params.category === 'finance' && (
        <section>
          <h2 className="section-heading">State Sales Tax Calculators</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            Find the exact sales tax rate for your state, with worked examples, local rate breakdowns, and grocery and clothing exemptions.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
            {salesTaxData.states.map((state) => {
              const slug = state.stateName.toLowerCase().replace(/\s+/g, '-') + '-sales-tax';
              return (
                <li key={state.stateCode}>
                  <Link
                    href={`/finance/${slug}`}
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 hover:underline"
                  >
                    Calculate sales tax in {state.stateName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
