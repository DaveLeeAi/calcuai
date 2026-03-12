// ═══════════════════════════════════════════════════════
// ArticleContent — Premium Post-Calculator Section Renderer
// ═══════════════════════════════════════════════════════
//
// Renders MDX article content as discrete, scannable sections
// with context-aware headings, visual hierarchy, and
// progressive disclosure.
//
// Key design decisions:
//   - Headings vary by category (finance ≠ health ≠ construction)
//   - Per-spec heading overrides via sectionHeadings
//   - Section icons for visual scanning (subtle, monochrome)
//   - Expanded card treatment (7 section types, not just 4)
//   - Better spacing (space-y-8 not space-y-2)
//   - Tier-aware collapsibility (utility collapses more)
//   - YMYL assumptions surfaced prominently
//
// Server component — all content is in the SSR output for SEO.
// Collapsible sections use native <details>/<summary>.

import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Category, DisclaimerType, Priority } from '@/lib/types';
import {
  parseArticleSections,
  parseFaqItems,
  sortSections,
  getSectionBehavior,
  getSectionStyle,
  getContextualHeading,
  SECTION_ICONS,
  type ParsedSection,
  type SectionBehavior,
  type SectionStyle,
  type ArticleSectionType,
  type SectionIcon,
} from '@/lib/content-sections';

// ─── MDX render options (shared) ─────────────────────

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
};

// ─── Props ───────────────────────────────────────────

interface ArticleContentProps {
  mdxSource: string;
  tier: Priority;
  category: Category;
  disclaimer: DisclaimerType;
  /** Per-calculator heading overrides from spec.sectionHeadings */
  sectionHeadings?: Partial<Record<string, string>>;
}

// ─── Main Component ──────────────────────────────────

export function ArticleContent({
  mdxSource,
  tier,
  category,
  disclaimer,
  sectionHeadings,
}: ArticleContentProps) {
  const rawSections = parseArticleSections(mdxSource);
  const sections = sortSections(rawSections);

  if (sections.length === 0) return null;

  return (
    <div className="max-w-content mx-auto mt-10 space-y-8">
      {sections.map((section, i) => {
        const behavior = getSectionBehavior(
          section.type,
          tier,
          category,
          disclaimer
        );
        if (!behavior.visible) return null;

        // FAQ gets special accordion rendering
        if (section.type === 'faq') {
          const faqHeading = getContextualHeading(
            'faq',
            section.heading,
            category,
            sectionHeadings
          );
          return (
            <FaqSection
              key={`faq-${i}`}
              section={section}
              disclaimer={disclaimer}
              heading={faqHeading}
            />
          );
        }

        const style = getSectionStyle(section.type, disclaimer);
        const displayHeading = getContextualHeading(
          section.type,
          section.heading,
          category,
          sectionHeadings
        );
        const icon = SECTION_ICONS[section.type];

        return (
          <ArticleSection
            key={`${section.type}-${i}`}
            heading={displayHeading}
            content={section.content}
            behavior={behavior}
            style={style}
            sectionType={section.type}
            icon={icon}
          />
        );
      })}
    </div>
  );
}

// ─── Section Icon Component ──────────────────────────

function SectionIconSvg({ icon }: { icon: SectionIcon }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${icon.colorClass}`}
      fill="none"
      viewBox={icon.viewBox}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

// ─── Single Section Renderer ─────────────────────────

interface ArticleSectionProps {
  heading: string;
  content: string;
  behavior: SectionBehavior;
  style: SectionStyle;
  sectionType: ArticleSectionType;
  icon?: SectionIcon;
}

function ArticleSection({
  heading,
  content,
  behavior,
  style,
  sectionType,
  icon,
}: ArticleSectionProps) {
  const proseClasses =
    'prose prose-gray prose-headings:scroll-mt-20 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-table:text-sm prose-td:py-2 prose-td:px-3 prose-th:py-2 prose-th:px-3 max-w-none';

  const cardClasses = style.card
    ? `rounded-lg border-l-4 ${style.accentClass} ${style.bgClass} px-5 py-5 sm:px-6`
    : '';

  const wrapperClasses = `article-section ${cardClasses}`.trim();

  // ── Collapsible sections ──
  if (behavior.collapsible) {
    return (
      <details
        className={`article-section-details group ${style.card ? `rounded-lg border-l-4 ${style.accentClass} ${style.bgClass}` : ''}`}
        open={behavior.defaultOpen || undefined}
      >
        <summary className={`flex cursor-pointer items-center gap-2.5 select-none list-none px-5 py-4 sm:px-6 ${!style.card ? 'border-b border-gray-100' : ''}`}>
          <svg
            className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {icon && <SectionIconSvg icon={icon} />}
          <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
        </summary>
        <div className={`${proseClasses} px-5 pb-5 pt-2 sm:px-6`}>
          <MDXRemote source={content} options={mdxOptions} />
        </div>
      </details>
    );
  }

  // ── Always-open sections ──
  return (
    <section className={wrapperClasses}>
      <div className="flex items-center gap-2.5 mb-4">
        {icon && <SectionIconSvg icon={icon} />}
        <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
      </div>
      <div className={proseClasses}>
        <MDXRemote source={content} options={mdxOptions} />
      </div>
    </section>
  );
}

// ─── FAQ Accordion Section ───────────────────────────

interface FaqSectionProps {
  section: ParsedSection;
  disclaimer: DisclaimerType;
  heading: string;
}

function FaqSection({ section, heading }: FaqSectionProps) {
  const items = parseFaqItems(section.content);
  if (items.length === 0) return null;

  const icon = SECTION_ICONS.faq;

  return (
    <section className="article-section">
      <div className="flex items-center gap-2.5 mb-4">
        {icon && <SectionIconSvg icon={icon} />}
        <h2 className="text-2xl font-bold text-gray-900">
          {heading}
        </h2>
      </div>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {items.map((item, i) => (
          <details key={i} className="group faq-item">
            <summary className="flex cursor-pointer items-center justify-between gap-3 select-none list-none px-5 py-4">
              <span className="text-base font-medium text-gray-900 text-left">
                {item.question}
              </span>
              <svg
                className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="prose prose-gray prose-sm max-w-none px-5 pb-4 pt-0 text-gray-600">
              <MDXRemote source={item.answer} options={mdxOptions} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
