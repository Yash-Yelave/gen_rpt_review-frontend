// src/utils/locationIndex.ts
// Builds a location index from ReportSection[].
// Maps paragraph DOM IDs to their resolved metadata.
// This is the shared navigation map for AI Review, Human Comments, and future annotation systems.

import type { ReportSection } from '@/types';
import { slugify, paragraphId } from './locationParser';

export interface ParagraphEntry {
  sectionHeading: string;
  sectionSlug: string;
  paragraphIndex: number;   // 1-based
  id: string;               // DOM id, e.g. "key-highlights-p1"
  snippet: string;          // first 80 chars of paragraph text
}

export interface SectionEntry {
  heading: string;
  slug: string;
  anchorId: string;         // DOM id for section heading, e.g. "section-key-highlights"
  paragraphs: ParagraphEntry[];
}

export interface LocationIndex {
  sections: SectionEntry[];
  /** Fast lookup: DOM id → ParagraphEntry */
  byId: Record<string, ParagraphEntry>;
}

/**
 * Split a section body into paragraph strings (same logic as ReportRenderer).
 * Paragraphs are separated by double newlines.
 */
function splitParagraphs(body: string): string[] {
  return body
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Build the full LocationIndex from a report's sections.
 * Call once per report; result can be memoised.
 */
export function buildLocationIndex(sections: ReportSection[]): LocationIndex {
  const index: LocationIndex = { sections: [], byId: {} };

  for (const section of sections) {
    if (section.isDisclaimer) continue;

    const slug = slugify(section.heading);
    const anchorId = `section-${slug}`;
    const paragraphs = splitParagraphs(section.body);

    const sectionEntry: SectionEntry = {
      heading: section.heading,
      slug,
      anchorId,
      paragraphs: [],
    };

    paragraphs.forEach((text, idx) => {
      const oneBasedIdx = idx + 1;
      const id = paragraphId(section.heading, oneBasedIdx);
      const entry: ParagraphEntry = {
        sectionHeading: section.heading,
        sectionSlug: slug,
        paragraphIndex: oneBasedIdx,
        id,
        snippet: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
      };
      sectionEntry.paragraphs.push(entry);
      index.byId[id] = entry;
    });

    index.sections.push(sectionEntry);
  }

  return index;
}

/**
 * Resolve a ParsedLocation to a concrete DOM id using the LocationIndex.
 *
 * Strategy:
 * 1. Exact or case-insensitive section slug match
 * 2. If paragraph number provided → use that paragraph's id
 * 3. Otherwise → use first paragraph of matched section
 *
 * Returns null if no match found.
 */
export function resolveLocation(
  section: string,
  paragraph: number | null,
  index: LocationIndex
): string | null {
  const targetSlug = slugify(section);

  const sectionEntry = index.sections.find(
    (s) =>
      s.slug === targetSlug ||
      s.heading.toLowerCase() === section.toLowerCase()
  );
  if (!sectionEntry) return null;
  if (!sectionEntry.paragraphs.length) return null;

  if (paragraph !== null) {
    const para = sectionEntry.paragraphs.find((p) => p.paragraphIndex === paragraph);
    return para?.id ?? sectionEntry.paragraphs[0].id;
  }

  return sectionEntry.paragraphs[0].id;
}
