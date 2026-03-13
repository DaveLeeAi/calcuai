/**
 * glossary-auto-linker.ts — Preprocesses MDX source to auto-link glossary terms.
 *
 * Scans MDX article text for known glossary term occurrences and wraps the
 * first occurrence of each term with a link to its glossary page.
 *
 * Rules:
 * - Only links the FIRST occurrence of each term (avoids link spam)
 * - Skips terms inside headings, links, code blocks, and the BLUF intro
 * - Matches whole words only (case-insensitive)
 * - Maximum 5 auto-links per article to keep it natural
 */
import type { GlossaryTerm } from './types';

const MAX_AUTO_LINKS = 5;

/**
 * Build a map of glossary term display names to their slugs.
 * Includes common variations (e.g., "compound interest" for slug "compound-interest").
 */
function buildTermPatterns(terms: GlossaryTerm[]): { pattern: RegExp; slug: string; title: string }[] {
  return terms
    .map((term) => {
      // Use the title as the match text
      const escaped = term.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return {
        // Match whole word, case-insensitive
        pattern: new RegExp(`(?<![\\w/])${escaped}(?![\\w/"-])`, 'i'),
        slug: term.slug,
        title: term.title,
      };
    })
    // Sort by length descending so longer terms match first
    // (e.g., "compound interest" before "interest")
    .sort((a, b) => b.title.length - a.title.length);
}

/**
 * Check if a position in the source is inside a region that should not be linked:
 * - Inside markdown headings (## ...)
 * - Inside existing markdown links [text](url)
 * - Inside code blocks (``` or `)
 * - Inside the BLUF intro div
 * - Inside HTML tags
 */
function isInProtectedRegion(source: string, matchIndex: number): boolean {
  // Check if inside a heading line
  const lineStart = source.lastIndexOf('\n', matchIndex) + 1;
  const linePrefix = source.substring(lineStart, matchIndex);
  if (/^#{1,6}\s/.test(linePrefix)) return true;

  // Check if inside an existing markdown link [...](...) or link text
  // Look backwards for [ without a closing ]
  const before = source.substring(Math.max(0, matchIndex - 200), matchIndex);
  const lastOpenBracket = before.lastIndexOf('[');
  const lastCloseBracket = before.lastIndexOf(']');
  if (lastOpenBracket > lastCloseBracket) return true;

  // Check if inside a link URL (...)
  const lastOpenParen = before.lastIndexOf('](');
  const lastCloseParen = before.lastIndexOf(')');
  if (lastOpenParen > lastCloseParen) return true;

  // Check if inside inline code `...`
  const beforeStr = source.substring(0, matchIndex);
  const backtickCount = (beforeStr.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) return true;

  // Check if inside fenced code block ```
  const codeBlockCount = (beforeStr.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) return true;

  // Check if inside BLUF intro (handles div, section, article, aside wrappers)
  const blufMatch = source.match(/<(?:div|section|article|aside) className="bluf-intro">/);
  if (blufMatch && blufMatch.index !== undefined) {
    const blufStart = blufMatch.index;
    const blufEnd = source.indexOf('</', blufStart + blufMatch[0].length);
    if (blufStart >= 0 && matchIndex > blufStart && matchIndex < blufEnd) return true;
  }

  // Check if inside an HTML tag
  const lastOpenTag = before.lastIndexOf('<');
  const lastCloseTag = before.lastIndexOf('>');
  if (lastOpenTag > lastCloseTag) return true;

  return false;
}

/**
 * Process MDX source and insert glossary links for the first occurrence
 * of each matching glossary term.
 */
export function autoLinkGlossaryTerms(
  mdxSource: string,
  glossaryTerms: GlossaryTerm[]
): string {
  if (glossaryTerms.length === 0) return mdxSource;

  const termPatterns = buildTermPatterns(glossaryTerms);
  let result = mdxSource;
  let linksInserted = 0;
  const linkedSlugs = new Set<string>();

  for (const { pattern, slug, title } of termPatterns) {
    if (linksInserted >= MAX_AUTO_LINKS) break;
    if (linkedSlugs.has(slug)) continue;

    const match = pattern.exec(result);
    if (!match) continue;

    // Check if this match is in a protected region
    if (isInProtectedRegion(result, match.index)) {
      // Try to find the next occurrence
      let searchFrom = match.index + match[0].length;
      let found = false;

      while (searchFrom < result.length) {
        const nextPattern = new RegExp(pattern.source, 'i');
        const remaining = result.substring(searchFrom);
        const nextMatch = nextPattern.exec(remaining);
        if (!nextMatch) break;

        const absoluteIndex = searchFrom + nextMatch.index;
        if (!isInProtectedRegion(result, absoluteIndex)) {
          // Found a safe occurrence — link it
          const matchedText = nextMatch[0];
          const link = `[${matchedText}](/glossary/${slug})`;
          result =
            result.substring(0, absoluteIndex) +
            link +
            result.substring(absoluteIndex + matchedText.length);
          linksInserted++;
          linkedSlugs.add(slug);
          found = true;
          break;
        }

        searchFrom = absoluteIndex + nextMatch[0].length;
      }

      if (!found) continue;
    } else {
      // Link this first occurrence
      const matchedText = match[0];
      const link = `[${matchedText}](/glossary/${slug})`;
      result =
        result.substring(0, match.index) +
        link +
        result.substring(match.index + matchedText.length);
      linksInserted++;
      linkedSlugs.add(slug);
    }
  }

  return result;
}
