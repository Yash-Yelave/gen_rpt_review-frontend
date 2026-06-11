// src/utils/locationParser.ts
// Parses AI review location strings into structured ParsedLocation objects.
//
// Supported format (future backend output):
//   Location → [Key Highlights] | Para 1 |
//   "China's private equity"
//   →
//   "cautious stance"
//
// Fallback (current data):
//   [High] Vague statements in Key Highlights without concrete definitions
//   → tries to match section name from a list of known sections

export interface ParsedLocation {
  section: string;        // raw section name, e.g. "Key Highlights"
  paragraph: number | null;
  startText: string | null;
  endText: string | null;
}

/**
 * Convert a section heading to a stable DOM-safe slug.
 * e.g. "Key Highlights" → "key-highlights"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // remove special chars
    .replace(/[\s_]+/g, '-')      // spaces/underscores → dash
    .replace(/^-+|-+$/g, '');     // trim leading/trailing dashes
}

/**
 * Build the paragraph DOM id used by ReportRenderer.
 * e.g. section "Key Highlights", para 2 → "key-highlights-p2"
 */
export function paragraphId(sectionHeading: string, paraIndex: number): string {
  return `${slugify(sectionHeading)}-p${paraIndex}`;
}

/**
 * Parse a formal location string of the form:
 *   Location → [Section Name] | Para N |
 *   "opening text"
 *   →
 *   "closing text"
 *
 * Returns null if the string doesn't match this format.
 */
export function parseFormalLocation(raw: string): ParsedLocation | null {
  // Match the header line: Location → [Section] | Para N |
  const headerMatch = raw.match(
    /Location\s*[→>]\s*\[([^\]]+)\](?:\s*\|\s*Para\s*(\d+)\s*\|)?/i
  );
  if (!headerMatch) return null;

  const section = headerMatch[1].trim();
  const paragraph = headerMatch[2] ? parseInt(headerMatch[2], 10) : null;

  // Extract quoted start/end texts
  const quoteMatches = [...raw.matchAll(/"([^"]+)"/g)];
  const startText = quoteMatches[0]?.[1]?.trim() ?? null;
  const endText   = quoteMatches[1]?.[1]?.trim() ?? null;

  return { section, paragraph, startText, endText };
}

/**
 * Severity prefix pattern: [High], [Medium], [Low]
 */
const SEVERITY_RE = /^\[(High|Medium|Low)\]\s*/i;

/**
 * Strip severity prefix from a finding string.
 * "[High] Vague statements..." → "Vague statements..."
 */
export function stripSeverity(text: string): string {
  return text.replace(SEVERITY_RE, '').trim();
}

/**
 * Extract severity from a finding string.
 * "[High] ..." → "High"
 */
export function extractSeverity(text: string): 'High' | 'Medium' | 'Low' | null {
  const m = text.match(SEVERITY_RE);
  if (!m) return null;
  const s = m[1].toLowerCase();
  if (s === 'high') return 'High';
  if (s === 'medium') return 'Medium';
  if (s === 'low') return 'Low';
  return null;
}

/**
 * Best-effort: scan a plain finding text for any known section heading.
 * Returns the first section heading found (case-insensitive substring match).
 *
 * @param text     The finding text, e.g. "Vague statements in Key Highlights"
 * @param sections Known section headings from the report
 */
export function inferSectionFromText(
  text: string,
  sections: string[]
): string | null {
  const lower = text.toLowerCase();
  // Sort longest first so "Government Funding & Policy" beats "Policy"
  const sorted = [...sections].sort((a, b) => b.length - a.length);
  for (const heading of sorted) {
    if (lower.includes(heading.toLowerCase())) return heading;
  }
  return null;
}

/**
 * Parse any AI review finding string into a location.
 * Tries formal format first, then falls back to section-name inference.
 *
 * @param raw      Raw finding string
 * @param sections Known section headings from the current report
 */
export function parseLocation(
  raw: string,
  sections: string[]
): ParsedLocation | null {
  // 1. Try formal structured format
  const formal = parseFormalLocation(raw);
  if (formal) return formal;

  // 2. Fall back: infer section from mention in finding text
  const inferredSection = inferSectionFromText(stripSeverity(raw), sections);
  if (inferredSection) {
    return { section: inferredSection, paragraph: null, startText: null, endText: null };
  }

  return null;
}
