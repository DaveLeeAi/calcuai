interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

/**
 * Renders a JSON-LD structured data script tag.
 * Used for WebPage, FAQPage, BreadcrumbList, and other schema types.
 *
 * @example
 * <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: "..." }} />
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
