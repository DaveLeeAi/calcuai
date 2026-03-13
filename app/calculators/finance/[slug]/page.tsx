import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSpec } from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import CalculatorRenderer from '@/components/calculator/CalculatorRenderer';
import StickyCalculator from '@/components/calculator/StickyCalculator';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/lib/site-config';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import type { CalculatorSpec } from '@/lib/types';
import salesTaxData from '@/content/data/us-sales-tax-2026.json';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

interface StateTaxEntry {
  stateCode: string;
  stateName: string;
  fips: string;
  stateTaxRate: number;
  avgLocalTaxRate: number;
  combinedRate: number;
  groceryTaxStatus: string;
  groceryTaxRate: number | null;
  clothingTaxStatus: string;
  clothingTaxNote?: string;
  changedFrom2025: boolean;
  changeNote: string | null;
}

interface Props {
  params: { slug: string };
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function stateNameToSlug(stateName: string): string {
  return (
    stateName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '-sales-tax'
  );
}

/** Format a rate number, dropping unnecessary trailing zeros. */
function fmt(n: number): string {
  if (n === 0) return '0';
  // toFixed(3) then strip trailing zeros
  return n
    .toFixed(3)
    .replace(/\.?0+$/, '');
}

/** Format a dollar amount to USD string. */
function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

/** Look up a state entry by slug. */
function getStateBySlug(slug: string): StateTaxEntry | undefined {
  return (salesTaxData.states as StateTaxEntry[]).find(
    (s) => stateNameToSlug(s.stateName) === slug
  );
}

// ═══════════════════════════════════════════════════════
// Neighboring states for internal linking
// ═══════════════════════════════════════════════════════

const STATE_NEIGHBORS: Record<string, string[]> = {
  AL: ['GA', 'FL', 'MS', 'TN'],
  AK: ['WA', 'OR', 'ID', 'MT'],
  AZ: ['CA', 'NV', 'UT', 'NM'],
  AR: ['MO', 'TX', 'LA', 'MS'],
  CA: ['AZ', 'NV', 'OR', 'WA'],
  CO: ['UT', 'NM', 'KS', 'WY'],
  CT: ['NY', 'MA', 'RI'],
  DE: ['NJ', 'PA', 'MD'],
  DC: ['MD', 'VA'],
  FL: ['GA', 'AL', 'SC'],
  GA: ['FL', 'AL', 'SC', 'TN'],
  HI: ['CA', 'OR', 'WA'],
  ID: ['WA', 'OR', 'MT', 'NV'],
  IL: ['MO', 'IN', 'WI', 'IA'],
  IN: ['OH', 'KY', 'IL', 'MI'],
  IA: ['MN', 'WI', 'IL', 'MO'],
  KS: ['MO', 'OK', 'CO', 'NE'],
  KY: ['TN', 'VA', 'WV', 'OH'],
  LA: ['TX', 'MS', 'AR'],
  ME: ['NH', 'MA', 'VT'],
  MD: ['VA', 'DC', 'PA', 'DE'],
  MA: ['NY', 'CT', 'RI', 'NH'],
  MI: ['OH', 'IN', 'WI'],
  MN: ['WI', 'IA', 'SD', 'ND'],
  MS: ['AL', 'TN', 'LA', 'AR'],
  MO: ['IL', 'KS', 'OK', 'AR'],
  MT: ['ID', 'WY', 'SD', 'ND'],
  NE: ['IA', 'KS', 'MO', 'CO'],
  NV: ['CA', 'AZ', 'UT', 'OR'],
  NH: ['MA', 'ME', 'VT'],
  NJ: ['NY', 'PA', 'DE'],
  NM: ['TX', 'AZ', 'CO', 'OK'],
  NY: ['NJ', 'CT', 'MA', 'PA'],
  NC: ['VA', 'TN', 'SC', 'GA'],
  ND: ['MN', 'SD', 'MT'],
  OH: ['PA', 'WV', 'KY', 'IN'],
  OK: ['TX', 'KS', 'MO', 'AR'],
  OR: ['WA', 'CA', 'ID', 'NV'],
  PA: ['NY', 'NJ', 'OH', 'WV'],
  RI: ['MA', 'CT'],
  SC: ['NC', 'GA'],
  SD: ['ND', 'MN', 'NE', 'WY'],
  TN: ['KY', 'VA', 'NC', 'GA'],
  TX: ['OK', 'LA', 'NM', 'AR'],
  UT: ['NV', 'AZ', 'CO', 'ID'],
  VT: ['NY', 'NH', 'MA'],
  VA: ['MD', 'DC', 'NC', 'TN'],
  WA: ['OR', 'ID', 'CA'],
  WV: ['VA', 'KY', 'OH', 'PA'],
  WI: ['MN', 'MI', 'IL', 'IA'],
  WY: ['MT', 'ID', 'UT', 'CO'],
};

interface NeighborLink {
  stateName: string;
  slug: string;
  combinedRate: number;
}

function getNeighborLinks(stateCode: string): NeighborLink[] {
  const neighborCodes = (STATE_NEIGHBORS[stateCode] ?? []).slice(0, 4);
  return neighborCodes
    .map((code) => {
      const entry = (salesTaxData.states as StateTaxEntry[]).find(
        (s) => s.stateCode === code
      );
      if (!entry) return null;
      return {
        stateName: entry.stateName,
        slug: stateNameToSlug(entry.stateName),
        combinedRate: entry.combinedRate,
      };
    })
    .filter((n): n is NeighborLink => n !== null);
}

// ═══════════════════════════════════════════════════════
// Content generators
// ═══════════════════════════════════════════════════════

const NATIONAL_AVG = 6.6;

function getGroceryText(entry: StateTaxEntry): string {
  const { stateName, groceryTaxStatus, groceryTaxRate } = entry;
  switch (groceryTaxStatus) {
    case 'exempt':
      return `Groceries are exempt from sales tax in ${stateName}. Unprepared food items purchased at grocery stores are not subject to state sales tax, which provides meaningful savings for households on everyday purchases.`;
    case 'taxed':
      return `Groceries are fully taxable in ${stateName} at the standard ${fmt(entry.stateTaxRate)}% state rate${entry.avgLocalTaxRate > 0 ? ', plus applicable local rates' : ''}. This includes most food purchased at grocery stores for home consumption.`;
    case 'reduced':
      return `${stateName} taxes groceries at a reduced rate${groceryTaxRate !== null ? ` of ${fmt(groceryTaxRate)}%` : ''}, rather than the full ${fmt(entry.stateTaxRate)}% state rate. Many states phase down grocery taxes over time to reduce the regressive impact on lower-income households.`;
    case 'varies':
      return `Grocery tax treatment varies by locality in ${stateName}. Some jurisdictions may exempt groceries, while others tax them at the standard or a reduced rate. Check with your specific county or city for the applicable treatment.`;
    case 'N/A':
      return `${stateName} has no state sales tax, so groceries are not subject to state-level taxation.`;
    default:
      return `Consult the ${stateName} Department of Revenue for current grocery tax treatment.`;
  }
}

function getClothingText(entry: StateTaxEntry): string {
  const { stateName, clothingTaxStatus, clothingTaxNote } = entry;
  switch (clothingTaxStatus) {
    case 'exempt':
      if (clothingTaxNote) {
        return `${stateName} exempts most clothing from sales tax. ${clothingTaxNote}.`;
      }
      return `Clothing is generally exempt from sales tax in ${stateName}, which reduces the cost burden on everyday apparel purchases.`;
    case 'taxed':
      return `Clothing is taxable at the standard sales tax rate in ${stateName}. There are no broad clothing exemptions, though some specific items (such as protective work clothing) may qualify for exemption.`;
    case 'varies':
      return `Clothing tax treatment varies by locality in ${stateName}. Check with the specific jurisdiction for applicable rates and exemptions.`;
    case 'N/A':
      return `${stateName} has no sales tax, so clothing purchases are not taxed.`;
    default:
      return `Consult the ${stateName} Department of Revenue for current clothing tax treatment.`;
  }
}

function getComparisonText(combinedRate: number): string {
  const diff = Math.abs(combinedRate - NATIONAL_AVG);
  if (combinedRate > NATIONAL_AVG + 0.5) {
    return `above the national average combined rate of approximately ${fmt(NATIONAL_AVG)}% by ${fmt(diff)} percentage points`;
  }
  if (combinedRate < NATIONAL_AVG - 0.5) {
    return `below the national average combined rate of approximately ${fmt(NATIONAL_AVG)}% by ${fmt(diff)} percentage points`;
  }
  return `close to the national average combined rate of approximately ${fmt(NATIONAL_AVG)}%`;
}

// ═══════════════════════════════════════════════════════
// generateStaticParams — one slug per state
// ═══════════════════════════════════════════════════════

export function generateStaticParams(): { slug: string }[] {
  return (salesTaxData.states as StateTaxEntry[]).map((s) => ({
    slug: stateNameToSlug(s.stateName),
  }));
}

// ═══════════════════════════════════════════════════════
// generateMetadata — unique per state
// ═══════════════════════════════════════════════════════

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getStateBySlug(params.slug);
  if (!entry) return {};

  const { stateName, stateTaxRate, avgLocalTaxRate, combinedRate } = entry;
  const canonicalUrl = `${siteConfig.url}/calculators/finance/${params.slug}`;

  const title = `${stateName} Sales Tax Calculator (2026) — Free Online Calculator`;
  const description = `Calculate ${stateName} sales tax instantly. State rate: ${fmt(stateTaxRate)}%, average local: ${fmt(avgLocalTaxRate)}%, combined: ${fmt(combinedRate)}%. Rates updated January 2026.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: 'en_US',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ═══════════════════════════════════════════════════════
// Schema builders
// ═══════════════════════════════════════════════════════

function buildStateWebPageSchema(
  entry: StateTaxEntry,
  slug: string,
  title: string,
  description: string
): Record<string, unknown> {
  const url = `${siteConfig.url}/calculators/finance/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}/#webpage`,
    name: title,
    description,
    url,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: {
      '@type': 'Thing',
      name: `${entry.stateName} Sales Tax`,
    },
    author: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
    dateModified: salesTaxData.lastVerified,
    datePublished: salesTaxData.effectiveDate,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.bluf-intro', 'h1'],
    },
  };
}

function buildStateBreadcrumbSchema(stateName: string, slug: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Finance',
        item: `${siteConfig.url}/finance`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Sales Tax Calculator',
        item: `${siteConfig.url}/finance/sales-tax-calculator`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${stateName} Sales Tax`,
        item: `${siteConfig.url}/calculators/finance/${slug}`,
      },
    ],
  };
}

function buildStateFAQSchema(
  entry: StateTaxEntry
): Record<string, unknown> {
  const { stateName, combinedRate } = entry;
  const taxOn100 = (100 * combinedRate) / 100;
  const taxOn1000 = (1000 * combinedRate) / 100;
  const totalOn1000 = 1000 + taxOn1000;

  let groceryAnswer: string;
  switch (entry.groceryTaxStatus) {
    case 'exempt':
      groceryAnswer = `No, groceries are exempt from sales tax in ${stateName}. Unprepared food items are not subject to the standard sales tax rate.`;
      break;
    case 'taxed':
      groceryAnswer = `Yes, groceries are fully taxable in ${stateName} at the standard ${fmt(entry.stateTaxRate)}% state rate plus applicable local taxes.`;
      break;
    case 'reduced':
      groceryAnswer = `Groceries are taxed at a reduced rate in ${stateName}${entry.groceryTaxRate !== null ? ` of ${fmt(entry.groceryTaxRate)}%` : ''}, rather than the full state rate.`;
      break;
    case 'N/A':
      groceryAnswer = `${stateName} has no state sales tax, so groceries are not taxed at the state level.`;
      break;
    default:
      groceryAnswer = `Grocery tax treatment varies by locality in ${stateName}. Check with your specific county or city.`;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the sales tax rate in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            combinedRate === 0
              ? `${stateName} has no state or local sales tax. The combined rate is 0%.`
              : `The combined sales tax rate in ${stateName} is ${fmt(combinedRate)}% as of 2026, consisting of a ${fmt(entry.stateTaxRate)}% state rate plus an average local rate of ${fmt(entry.avgLocalTaxRate)}%.`,
        },
      },
      {
        '@type': 'Question',
        name: `Does ${stateName} tax groceries?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: groceryAnswer,
        },
      },
      {
        '@type': 'Question',
        name: `How much is sales tax on a $1,000 purchase in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            combinedRate === 0
              ? `${stateName} has no sales tax, so a $1,000 purchase costs exactly $1,000 — no tax is added.`
              : `At the combined rate of ${fmt(combinedRate)}%, a $1,000 purchase in ${stateName} incurs ${fmtUSD(taxOn1000)} in sales tax, bringing the total to ${fmtUSD(totalOn1000)}.`,
        },
      },
    ],
  };
}

function buildStateSoftwareAppSchema(
  entry: StateTaxEntry,
  slug: string,
  title: string,
  description: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description,
    url: `${siteConfig.url}/calculators/finance/${slug}`,
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Calculator',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
  };
}

// ═══════════════════════════════════════════════════════
// Pre-fill the sales tax spec for this state
// ═══════════════════════════════════════════════════════

function buildStateSpec(
  baseSpec: CalculatorSpec,
  stateCode: string,
  combinedRate: number
): CalculatorSpec {
  return {
    ...baseSpec,
    inputs: baseSpec.inputs.map((input) => {
      if (input.id === 'stateCode') {
        return { ...input, defaultValue: stateCode };
      }
      if (input.id === 'taxRate') {
        return { ...input, defaultValue: combinedRate };
      }
      return input;
    }),
  };
}

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════

export default function StateSalesTaxPage({ params }: Props) {
  const entry = getStateBySlug(params.slug);
  if (!entry) notFound();

  const baseSpec = getSpec('finance', 'sales-tax-calculator');
  if (!baseSpec) notFound();

  const {
    stateName,
    stateCode,
    stateTaxRate,
    avgLocalTaxRate,
    combinedRate,
    changedFrom2025,
    changeNote,
  } = entry;

  const stateSpec = buildStateSpec(baseSpec, stateCode, combinedRate);
  const neighborLinks = getNeighborLinks(stateCode);

  // Worked example values
  const tax100 = (100 * combinedRate) / 100;
  const total100 = 100 + tax100;
  const tax16k = (16000 * combinedRate) / 100;
  const total16k = 16000 + tax16k;
  const tax1k = (1000 * combinedRate) / 100;
  const total1k = 1000 + tax1k;

  const isNoTaxState = combinedRate === 0;
  const stateOnlyNoTax = stateTaxRate === 0 && combinedRate > 0; // AK

  const title = `${stateName} Sales Tax Calculator (2026)`;
  const description = `Calculate ${stateName} sales tax instantly. State rate: ${fmt(stateTaxRate)}%, average local: ${fmt(avgLocalTaxRate)}%, combined: ${fmt(combinedRate)}%. Rates updated January 2026.`;
  const canonicalSlug = params.slug;

  // Schema objects
  const webPageSchema = buildStateWebPageSchema(entry, canonicalSlug, title, description);
  const breadcrumbSchema = buildStateBreadcrumbSchema(stateName, canonicalSlug);
  const faqSchema = buildStateFAQSchema(entry);
  const softwareAppSchema = buildStateSoftwareAppSchema(entry, canonicalSlug, title, description);

  return (
    <article>
      {/* Schema: WebPage */}
      <JsonLd data={webPageSchema} id="schema-webpage" />
      {/* Schema: BreadcrumbList */}
      <JsonLd data={breadcrumbSchema} id="schema-breadcrumb" />
      {/* Schema: FAQPage */}
      <JsonLd data={faqSchema} id="schema-faq" />
      {/* Schema: SoftwareApplication */}
      <JsonLd data={softwareAppSchema} id="schema-software-app" />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Finance', href: '/finance' },
          { label: 'Sales Tax Calculator', href: '/finance/sales-tax-calculator' },
          { label: `${stateName} Sales Tax` },
        ]}
      />

      {/* H1 */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">
        {title}
      </h1>

      {/* BLUF intro */}
      <div className="bluf-intro text-lg text-gray-700 dark:text-slate-300 leading-relaxed mb-8" data-speakable="true">
        {isNoTaxState ? (
          <p>
            <strong>{stateName} has no state sales tax and no local sales tax</strong> — making it
            one of only five states in the US with a combined rate of 0%. Purchases in{' '}
            {stateName} are not subject to sales tax at any level, which can represent meaningful
            savings compared to neighboring states. This calculator can help you compare what you
            would have paid in sales tax if buying the same item in another state.
          </p>
        ) : stateOnlyNoTax ? (
          <p>
            <strong>
              Alaska has no statewide sales tax, but local jurisdictions impose an average rate
              of {fmt(avgLocalTaxRate)}%
            </strong>
            , bringing the combined average to {fmt(combinedRate)}% as of 2026. Because there is
            no state rate, the actual tax you pay varies significantly by city and borough — from
            0% in many rural areas to over 7% in some municipalities. Use the calculator below to
            estimate tax based on the average combined rate.
          </p>
        ) : (
          <p>
            The{' '}
            <strong>
              {stateName} sales tax rate is {fmt(stateTaxRate)}%
            </strong>{' '}
            at the state level, with an average local rate of{' '}
            <strong>{fmt(avgLocalTaxRate)}%</strong>, bringing the combined average to{' '}
            <strong>{fmt(combinedRate)}%</strong> as of 2026. That rate is{' '}
            {getComparisonText(combinedRate)}, meaning a{' '}
            <strong>$100 purchase</strong> carries a sales tax of{' '}
            <strong>{fmtUSD(tax100)}</strong> for a total of{' '}
            <strong>{fmtUSD(total100)}</strong>. Use the calculator below to get an instant
            estimate for any purchase amount.
            {changedFrom2025 && changeNote && (
              <>
                {' '}
                <em>
                  Note: {changeNote} (effective January 1, 2026).
                </em>
              </>
            )}
          </p>
        )}
      </div>

      {/* ─── Mobile: calculator above article ─── */}
      <div className="lg:hidden my-8">
        <CalculatorRenderer spec={stateSpec} />
      </div>

      {/* ─── Desktop: 2-column layout ─── */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">

        {/* Left: article content */}
        <div className="min-w-0 space-y-8">

          {/* Section 1: What is the sales tax rate? */}
          <section id="rate">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What Is the Sales Tax Rate in {stateName}?
            </h2>

            {isNoTaxState ? (
              <div className="space-y-4 text-gray-700 dark:text-slate-300">
                <p>
                  {stateName} is one of five US states — alongside Alaska, Montana, New Hampshire,
                  and Oregon — with no state or local sales tax. Retailers in {stateName} collect
                  no sales tax on purchases of tangible personal property, making it a
                  tax-friendly destination for large purchases like electronics, furniture, and
                  vehicles.
                </p>
                <p>
                  While {stateName} has no sales tax, it typically offsets this with other revenue
                  sources. Residents and visitors should be aware that online purchases shipped to
                  {' '}{stateName} from out-of-state retailers may still be subject to use tax
                  obligations in some circumstances. However, for the vast majority of everyday
                  in-person purchases, no sales tax applies.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {stateName} Sales Tax at a Glance (2026)
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>State rate: 0%</li>
                    <li>Average local rate: 0%</li>
                    <li>Combined rate: 0%</li>
                    <li>Source: Tax Foundation, 2026</li>
                  </ul>
                </div>
              </div>
            ) : stateOnlyNoTax ? (
              <div className="space-y-4 text-gray-700 dark:text-slate-300">
                <p>
                  Alaska has no statewide sales tax — one of only five US states without one.
                  However, Alaska uniquely allows local jurisdictions (boroughs and cities) to
                  levy their own sales taxes. As of 2026, the average local rate across Alaska
                  is <strong>{fmt(avgLocalTaxRate)}%</strong>.
                </p>
                <p>
                  Local rates vary widely. Some areas of Alaska (particularly rural boroughs)
                  have no local sales tax at all, while cities like Juneau charge around 5%.
                  When shopping in Alaska, the tax you owe depends entirely on the specific
                  municipality where the purchase occurs.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Alaska Sales Tax at a Glance (2026)
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>State rate: 0% (no statewide tax)</li>
                    <li>Average local rate: {fmt(avgLocalTaxRate)}%</li>
                    <li>Combined average: {fmt(combinedRate)}%</li>
                    <li>Source: Tax Foundation, 2026</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-gray-700 dark:text-slate-300">
                <p>
                  {stateName}&apos;s sales tax consists of two components: a{' '}
                  <strong>state rate of {fmt(stateTaxRate)}%</strong> set by the state
                  legislature, and an <strong>average local rate of {fmt(avgLocalTaxRate)}%</strong>{' '}
                  that varies by county and city. The combined average of{' '}
                  <strong>{fmt(combinedRate)}%</strong> is {getComparisonText(combinedRate)}.
                </p>

                {changedFrom2025 && changeNote && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Rate Change for 2026
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      {changeNote}
                    </p>
                  </div>
                )}

                {avgLocalTaxRate > 0 && (
                  <p>
                    The {fmt(avgLocalTaxRate)}% local average reflects taxes levied by counties,
                    cities, and special taxing districts within {stateName}. Your actual combined
                    rate may differ from the average depending on where you make a purchase — the
                    rate in a major city can be higher than in a rural area.
                  </p>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {stateName} Sales Tax at a Glance (2026)
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>State rate: {fmt(stateTaxRate)}%</li>
                    <li>Average local rate: {fmt(avgLocalTaxRate)}%</li>
                    <li>Combined average: {fmt(combinedRate)}%</li>
                    <li>National average: ~{fmt(NATIONAL_AVG)}%</li>
                    <li>Source: Tax Foundation, State and Local Sales Tax Rates, 2026</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: How to calculate */}
          <section id="how-to-calculate">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              How to Calculate Sales Tax in {stateName}
            </h2>

            {isNoTaxState ? (
              <div className="space-y-4 text-gray-700 dark:text-slate-300">
                <p>
                  Because {stateName} has no sales tax, calculating your total purchase cost is
                  straightforward: <strong>the total price equals the pre-tax price</strong>.
                  No additional calculation is needed.
                </p>
                <p>
                  If you&apos;re comparing the cost of a purchase in {stateName} vs. a state
                  with sales tax, the formula is:
                </p>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
                  <p>Tax savings = Purchase price × (Other state&apos;s rate / 100)</p>
                </div>
                <p>
                  For example, a $1,000 purchase in {stateName} vs. a state with a 7% combined
                  rate would save you <strong>$70</strong> in tax.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-gray-700 dark:text-slate-300">
                <p>
                  The sales tax formula is simple: multiply the pre-tax purchase price by the
                  tax rate expressed as a decimal.
                </p>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm space-y-1">
                  <p>Sales Tax = Purchase Price × (Tax Rate / 100)</p>
                  <p>Total Price = Purchase Price + Sales Tax</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white pt-2">
                  Example 1: $100 Everyday Purchase
                </h3>
                <p>
                  Using {stateName}&apos;s combined rate of {fmt(combinedRate)}%:
                </p>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 text-sm space-y-2">
                  <p>Purchase price: <strong>$100.00</strong></p>
                  <p>Sales tax: $100.00 × ({fmt(combinedRate)} / 100) = <strong>{fmtUSD(tax100)}</strong></p>
                  <p>Total paid: $100.00 + {fmtUSD(tax100)} = <strong>{fmtUSD(total100)}</strong></p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white pt-2">
                  Example 2: $16,000 Vehicle Purchase
                </h3>
                <p>
                  For a larger purchase such as a used car at $16,000 in {stateName}:
                </p>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 text-sm space-y-2">
                  <p>Vehicle price: <strong>$16,000.00</strong></p>
                  <p>Sales tax: $16,000.00 × ({fmt(combinedRate)} / 100) = <strong>{fmtUSD(tax16k)}</strong></p>
                  <p>Total cost before fees: <strong>{fmtUSD(total16k)}</strong></p>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Note: Vehicle purchases may involve additional registration fees, title fees,
                  and documentation charges not reflected above. The local rate applied to vehicle
                  purchases in {stateName} may also differ from the general average used here.
                </p>

                {avgLocalTaxRate > 1.5 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      Local Rate Tip
                    </p>
                    <p className="mt-1 text-amber-700 dark:text-amber-400">
                      {stateName} has a significant average local rate of {fmt(avgLocalTaxRate)}%.
                      Always confirm the exact rate for your specific city or county, as your
                      actual total may vary from these examples.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section 3: Exemptions */}
          <section id="exemptions">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What Items Are Exempt from Sales Tax in {stateName}?
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-slate-300">
              {isNoTaxState ? (
                <p>
                  Since {stateName} has no sales tax, all tangible personal property is
                  effectively &ldquo;exempt&rdquo; — there is no tax to apply. This includes
                  groceries, clothing, electronics, furniture, and all other goods.
                </p>
              ) : (
                <>
                  <p>
                    Most US states exempt certain categories of goods from sales tax. Below are
                    the key exemption rules for {stateName} as of 2026.
                  </p>

                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Groceries
                      </h3>
                      <p className="text-sm">{getGroceryText(entry)}</p>
                    </div>

                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Clothing
                      </h3>
                      <p className="text-sm">{getClothingText(entry)}</p>
                    </div>

                    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Prescription Drugs &amp; Medical Devices
                      </h3>
                      <p className="text-sm">
                        Most states, including {stateName}, exempt prescription medications and
                        most durable medical equipment from sales tax. Over-the-counter medicines
                        may be taxed depending on state rules. Consult the{' '}
                        {stateName} Department of Revenue for a complete list of medical exemptions.
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    For a complete list of taxable and exempt items, consult the official{' '}
                    {stateName} Department of Revenue or your tax professional. Exemptions may
                    also vary by locality.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Section 4: FAQ */}
          <section id="faq">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-5">
              {/* Q1 */}
              <details className="group border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-gray-900 dark:text-white">
                  What is the sales tax rate in {stateName}?
                  <span className="ml-4 shrink-0 text-brand-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                  {isNoTaxState ? (
                    <p>
                      {stateName} has no sales tax — the combined state and local rate is 0%. It
                      is one of five US states with no sales tax of any kind.
                    </p>
                  ) : stateOnlyNoTax ? (
                    <p>
                      Alaska has no state sales tax (0% state rate), but local jurisdictions
                      collect an average of {fmt(avgLocalTaxRate)}% in local taxes, for a
                      combined average of {fmt(combinedRate)}% as of 2026. The exact rate depends
                      on the city or borough where you make your purchase.
                    </p>
                  ) : (
                    <p>
                      The combined sales tax rate in {stateName} is{' '}
                      <strong>{fmt(combinedRate)}%</strong> as of 2026, made up of a{' '}
                      {fmt(stateTaxRate)}% state rate and an average{' '}
                      {fmt(avgLocalTaxRate)}% local rate. Local rates vary by jurisdiction, so
                      your actual rate may differ slightly from the average.
                    </p>
                  )}
                </div>
              </details>

              {/* Q2 */}
              <details className="group border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-gray-900 dark:text-white">
                  Does {stateName} tax groceries?
                  <span className="ml-4 shrink-0 text-brand-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                  <p>{getGroceryText(entry)}</p>
                </div>
              </details>

              {/* Q3 */}
              <details className="group border border-gray-200 dark:border-slate-700 rounded-lg">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-gray-900 dark:text-white">
                  How much is sales tax on a $1,000 purchase in {stateName}?
                  <span className="ml-4 shrink-0 text-brand-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                  {isNoTaxState ? (
                    <p>
                      {stateName} has no sales tax, so a $1,000 purchase costs exactly{' '}
                      <strong>$1,000</strong> — no tax is added.
                    </p>
                  ) : (
                    <p>
                      At the combined rate of {fmt(combinedRate)}%, a $1,000 purchase in{' '}
                      {stateName} incurs <strong>{fmtUSD(tax1k)}</strong> in sales tax, bringing
                      the total to <strong>{fmtUSD(total1k)}</strong>. For a precise estimate
                      based on your exact locality, use the calculator above.
                    </p>
                  )}
                </div>
              </details>
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer">
            <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-sm text-gray-600 dark:text-slate-400">
              <p className="font-semibold mb-1">Data &amp; Disclaimer</p>
              <p>
                Sales tax rates shown are effective January 1, 2026, sourced from the{' '}
                <strong>Tax Foundation, State and Local Sales Tax Rates, 2026</strong>.
                Average local rates are population-weighted averages and may not reflect the
                exact rate for your specific location. Actual rates vary by city, county, and
                special taxing district. This calculator is for estimation only — always confirm
                the current rate with the {stateName} Department of Revenue or your tax
                professional before making financial decisions.
              </p>
            </div>
          </section>

          {/* Internal links */}
          <section id="related">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Compare Neighboring States
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {neighborLinks.map((neighbor) => (
                <Link
                  key={neighbor.slug}
                  href={`/calculators/finance/${neighbor.slug}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-3 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {neighbor.stateName} Sales Tax
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold">
                    {fmt(neighbor.combinedRate)}%
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/finance/sales-tax-calculator"
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                ← Back to full Sales Tax Calculator
              </Link>
              <Link
                href="/finance/income-tax-calculator"
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                Income Tax Calculator →
              </Link>
            </div>
          </section>

          {/* Feedback */}
          <FeedbackWidget
            calculatorSlug={`${stateCode.toLowerCase()}-sales-tax`}
            calculatorTitle={`${stateName} Sales Tax Calculator`}
          />
        </div>

        {/* Right: Sticky calculator (desktop only) */}
        <div className="hidden lg:block min-w-0">
          <StickyCalculator spec={stateSpec} />
        </div>
      </div>
    </article>
  );
}
