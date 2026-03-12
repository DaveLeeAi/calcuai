import type { CalculatorSpec } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

interface AIDiscoveryProps {
  spec: CalculatorSpec;
  /** The BLUF intro text (plain text, for the key takeaway summary) */
  blufText?: string;
}

/**
 * AI/LLM Discovery Optimization component.
 *
 * Adds invisible-to-user but crawler-visible structured content:
 * - citation meta tags for academic-style citation
 * - Key Takeaway summary block in a semantic <aside>
 * - data-speakable attributes are handled via speakableSelectors in WebPage schema
 *
 * Server component — outputs static HTML for crawlers.
 */
export function AIDiscovery({ spec, blufText }: AIDiscoveryProps) {
  const canonical = `${siteConfig.url}/${spec.category}/${spec.slug}`;

  return (
    <>
      {/* Citation meta tags — helps AI engines attribute content */}
      <meta name="citation_title" content={spec.title} />
      <meta name="citation_author" content={siteConfig.name} />
      {spec.lastContentUpdate && (
        <meta
          name="citation_publication_date"
          content={spec.lastContentUpdate}
        />
      )}
      <meta name="citation_public_url" content={canonical} />

      {/* Key Takeaway block — semantic aside for AI search engines to extract */}
      {blufText && (
        <aside
          aria-label="summary"
          className="sr-only"
          itemScope
          itemType="https://schema.org/WebPageElement"
        >
          <meta itemProp="cssSelector" content=".bluf-intro" />
          <p itemProp="text">{blufText}</p>
        </aside>
      )}
    </>
  );
}
