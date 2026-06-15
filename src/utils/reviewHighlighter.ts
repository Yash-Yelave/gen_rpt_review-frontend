// src/utils/reviewHighlighter.ts
//
// Parses the raw text of a review.md file and extracts inline-highlight
// annotations — each annotation carries:
//   • exactQuote   – the text to highlight inside the report
//   • explanation  – the issue description / context
//   • section      – which report section it belongs to
//   • paragraph    – paragraph number (1-based), if specified
//
// Supported location line formats (both → and -> are accepted):
//
//   (A) Full format with single-quoted exact quote:
//       > Location → [Section Name] | Para N | 'exact quote from report' -> 'context/explanation'
//
//   (B) Start-to-end range format:
//       > Location -> [Section] | Para N | 'start text' -> 'end text'
//       (In this form the "explanation" is derived from the surrounding finding text)
//
//   (C) No quote — section + paragraph only:
//       > Location -> [Section] | Para N
//
// The "explanation" is always the text immediately preceding the location line
// (i.e. the bullet / finding text that owns that location).

export interface ReviewAnnotation {
  /** Exact string to search and highlight in the report body */
  exactQuote: string;
  /** Human-readable issue / explanation text to show in the sidebar */
  explanation: string;
  /** Raw section name from the location line, e.g. "Key Highlights" */
  section: string;
  /** 1-based paragraph number, or null if not specified */
  paragraph: number | null;
  /** The start text (first single-quoted token), same as exactQuote when only one quote */
  startText: string;
  /** The end/context text (second single-quoted token), or null */
  endText: string | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Arrow variants — both Unicode → and ASCII ->
 */
const ARROW = String.raw`(?:→|->)`;

/**
 * Regex to detect a "Location" line (blockquote or plain).
 *
 * Captures:
 *   [1] section name
 *   [2] paragraph number (optional)
 *   [3] first single-quoted text (optional)
 *   [4] second single-quoted text after the arrow (optional)
 *
 * Examples matched:
 *   > Location → [Key Highlights] | Para 1 | 'China's private equity' -> 'cautious stance'
 *   > Location -> [Section] | Para 2 | 'The Chinese private' -> 'more mature phase'
 *   > Location → [Disclaimer] | Para 1 | "This document" -> "strategy discussion only"
 */
const LOCATION_LINE_RE = new RegExp(
  String.raw`(?:^|\n)\s*>?\s*Location\s*` +
    ARROW +
    String.raw`\s*\[([^\]]+)\]` +           // [1] section
    String.raw`(?:\s*\|\s*Para\s*([\d-]+))?` + // [2] paragraph (optional, may be "1-4")
    String.raw`(?:\s*\|` +
    // First quote — single OR double quotes
    String.raw`\s*(?:['"])((?:[^'"\\]|\\.)*)(?:['"])` + // [3] first quoted text
    String.raw`\s*` + ARROW + String.raw`\s*` +
    // Second quote — single OR double quotes
    String.raw`(?:['"])((?:[^'"\\]|\\.)*)(?:['"])` +    // [4] second quoted text
    String.raw`)?`,
  'gi'
);

/**
 * Find the "explanation" for a location line.
 * It is the last non-empty, non-location line that precedes the location line
 * in the same logical block (bullet, list item, or paragraph).
 *
 * We look backward through `lines` from `locationLineIndex`.
 */
function extractExplanation(lines: string[], locationLineIndex: number): string {
  for (let i = locationLineIndex - 1; i >= 0; i--) {
    const stripped = lines[i]
      .replace(/^[\s>*\-#]+/, '')  // strip blockquote markers, list markers, headings
      .trim();

    if (!stripped) continue; // skip blank lines
    // Stop at section headers (##, ###, etc.)
    if (/^#{1,6}\s/.test(lines[i].trim())) break;
    // Skip meta lines like "- Missing:", "- Fix:", "- Example:"
    if (/^[-*]\s+(Missing|Fix|Example|Expected Impact)\s*:/i.test(stripped)) continue;

    return stripped;
  }
  return '';
}

/**
 * Normalise a paragraph specifier like "1-4" → null (range, can't pinpoint)
 * or "2" → 2.
 */
function parseParagraphNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  if (raw.includes('-')) return null; // paragraph range — not a single para
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse the raw text of a review.md file and return all inline highlight
 * annotations that have an exact quote to search for.
 *
 * @param reviewMdText  Raw string contents of review.md
 * @returns             Array of ReviewAnnotation objects (may be empty)
 */
export function parseReviewAnnotations(reviewMdText: string): ReviewAnnotation[] {
  const annotations: ReviewAnnotation[] = [];
  const lines = reviewMdText.split('\n');

  // We iterate line-by-line and test each line against LOCATION_LINE_RE.
  // Using exec on the full text gives us match positions; we map back to lines.

  // Reset regex state (lastIndex)
  LOCATION_LINE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = LOCATION_LINE_RE.exec(reviewMdText)) !== null) {
    const [, section, paragraphRaw, firstQuote, secondQuote] = match;

    // Only emit annotations where we have at least one quoted text to find
    if (!firstQuote) continue;

    const exactQuote = firstQuote.trim();
    if (!exactQuote) continue;

    // Map match position back to a line index so we can extract explanation
    const matchStart = match.index;
    const textBeforeMatch = reviewMdText.slice(0, matchStart);
    const locationLineIndex = textBeforeMatch.split('\n').length; // 0-based line of location

    const explanation = extractExplanation(lines, locationLineIndex) ||
      (secondQuote ? `Context: "${secondQuote.trim()}"` : `Issue in ${section}`);

    annotations.push({
      exactQuote,
      explanation,
      section: section.trim(),
      paragraph: parseParagraphNumber(paragraphRaw),
      startText: exactQuote,
      endText: secondQuote ? secondQuote.trim() : null,
    });
  }

  return annotations;
}

// ---------------------------------------------------------------------------
// DOM highlighter
// ---------------------------------------------------------------------------

/**
 * Walk the text nodes inside `container`, find occurrences of `exactQuote`,
 * and wrap each occurrence in a <span class="highlight-error"> element.
 *
 * Clicking any such span calls `onAnnotationClick` with the associated annotation.
 *
 * Returns the number of matches replaced.
 *
 * NOTE: This function mutates the DOM directly — call it after React has
 * finished rendering (e.g. inside a useEffect).
 */
export function applyHighlightsToDOM(
  container: HTMLElement,
  annotations: ReviewAnnotation[],
  onAnnotationClick: (annotation: ReviewAnnotation) => void
): number {
  // Remove existing highlights first (idempotent re-application)
  container.querySelectorAll('span.highlight-error').forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    // Unwrap: replace <span>text</span> with bare text node
    parent.replaceChild(document.createTextNode(el.textContent ?? ''), el);
    parent.normalize();
  });

  if (!annotations.length) return 0;

  let totalMatches = 0;

  // Build a map: quote → annotation (last one wins if duplicates)
  const quoteMap = new Map<string, ReviewAnnotation>();
  for (const ann of annotations) {
    quoteMap.set(ann.exactQuote, ann);
  }

  /**
   * Recursively walk text nodes and replace matches.
   * We avoid re-walking nodes we've just inserted.
   */
  function walkNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (!text.trim()) return;

      // Check each annotation's exact quote against this text node
      for (const [quote, ann] of quoteMap) {
        const idx = text.indexOf(quote);
        if (idx === -1) continue;

        const parent = node.parentNode;
        if (!parent) continue;

        // Split into [before, match, after]
        const before = text.slice(0, idx);
        const after = text.slice(idx + quote.length);

        const span = document.createElement('span');
        span.className = 'highlight-error';
        span.setAttribute('data-quote', quote);
        span.style.cssText =
          'cursor:pointer;background-color:rgba(239,68,68,0.15);border-bottom:2px dashed #dc2626;border-radius:2px;transition:background-color 0.2s;';
        span.textContent = quote;
        span.title = ann.explanation; // tooltip fallback

        span.addEventListener('mouseenter', () => {
          span.style.backgroundColor = 'rgba(239,68,68,0.28)';
        });
        span.addEventListener('mouseleave', () => {
          span.style.backgroundColor = 'rgba(239,68,68,0.15)';
        });
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          onAnnotationClick(ann);
        });

        // Replace original text node with: before + span + after(text node)
        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(span);
        if (after) fragment.appendChild(document.createTextNode(after));

        parent.replaceChild(fragment, node);
        totalMatches++;

        // After replacement the original node is gone; stop iterating this node.
        // The "after" part will be picked up in subsequent sibling walks.
        break;
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).tagName !== 'SCRIPT' &&
      (node as Element).tagName !== 'STYLE' &&
      !(node as Element).classList.contains('highlight-error')
    ) {
      // Clone childNodes to avoid mutation during iteration
      Array.from(node.childNodes).forEach(walkNode);
    }
  }

  walkNode(container);
  return totalMatches;
}
