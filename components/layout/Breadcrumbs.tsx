import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-300">/</span>}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className="text-gray-700 font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
