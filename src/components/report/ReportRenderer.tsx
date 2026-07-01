// src/components/report/ReportRenderer.tsx
// Renders a single section's body text as structured React elements.
// Each paragraph gets a stable DOM id (e.g. "key-highlights-p1") for navigation.
// Highlights the paragraph whose id matches the current highlightedId in the nav store.

import React, { useEffect, useRef } from 'react';
import { paragraphId } from '@/utils/locationParser';
import { useReportNavStore } from '@/store/reportNavigationStore';
import { AIEditingToolbar } from '@/components/review/AIEditingToolbar';

interface ReportParagraphProps {
  id: string;
  children: React.ReactNode;
  isHighlighted: boolean;
  onHighlightDone: () => void;
}

const ReportParagraph: React.FC<ReportParagraphProps> = ({
  id,
  children,
  isHighlighted,
  onHighlightDone,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);

  // Scroll into view + clear after animation when highlighted
  useEffect(() => {
    if (!isHighlighted || !ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(onHighlightDone, 2600);
    return () => clearTimeout(timer);
  }, [isHighlighted, onHighlightDone]);

  return (
    <div className="relative group">
      <AIEditingToolbar paragraphId={id} currentText={typeof children === 'string' ? children : ''} />
      <p
        id={id}
        ref={ref}
        className={`mb-3 text-gray-700 transition-all duration-300 ${
          isHighlighted ? 'para-highlighted' : ''
        }`}
      >
        {children}
      </p>
    </div>
  );
};

interface ReportListItemProps {
  line: string;
}

const ReportListItem: React.FC<ReportListItemProps> = ({ line }) => (
  <li className="text-gray-700 mb-1">
    {/* Strip leading "- " or "1. " */}
    {line.replace(/^[-\d.]+\s*/, '')}
  </li>
);

interface ReportSectionRendererProps {
  heading: string;
  body: string;
  isDisclaimer?: boolean;
}

export const ReportSectionRenderer: React.FC<ReportSectionRendererProps> = ({
  heading,
  body,
  isDisclaimer,
}) => {
  const highlightedId = useReportNavStore((s) => s.highlightedId);
  const clearHighlight = useReportNavStore((s) => s.clearHighlight);

  if (isDisclaimer) {
    return (
      <div className="report-disclaimer">
        <strong>Disclaimer:</strong> {body}
      </div>
    );
  }

  // Split body into paragraphs
  const rawParagraphs = body
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  let paraCounter = 0; // 1-based counter for non-list paragraphs

  const elements = rawParagraphs.map((para, i) => {
    const lines = para.split('\n');
    const isList = lines.some(
      (l) => l.trim().startsWith('- ') || /^\d+\./.test(l.trim())
    );

    if (isList) {
      // Lists don't get paragraph IDs — they're structural, not prose targets
      const isOrdered = lines.every((l) => /^\d+\./.test(l.trim()));
      const Tag = isOrdered ? 'ol' : 'ul';
      return (
        <Tag
          key={i}
          className={isOrdered ? 'list-decimal pl-5 mb-3' : 'list-disc pl-5 mb-3'}
        >
          {lines.map((line, j) => (
            <ReportListItem key={j} line={line} />
          ))}
        </Tag>
      );
    }

    // Prose paragraph — assign stable id
    paraCounter++;
    const id = paragraphId(heading, paraCounter);
    const isHighlighted = highlightedId === id;

    return (
      <ReportParagraph
        key={i}
        id={id}
        isHighlighted={isHighlighted}
        onHighlightDone={clearHighlight}
      >
        {para}
      </ReportParagraph>
    );
  });

  return (
    <div className="mb-6">
      <div id={`section-${heading.toLowerCase().replace(/[^\w]+/g, '-')}`} className="report-section-heading">
        {heading}
      </div>
      <div className="report-section-body">{elements}</div>
    </div>
  );
};
