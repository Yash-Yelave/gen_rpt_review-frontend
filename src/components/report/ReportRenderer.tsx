// src/components/report/ReportRenderer.tsx
// Renders a single section's body text as structured React elements.
// Each paragraph gets a stable DOM id (e.g. "key-highlights-p1") for navigation.
// Highlights the paragraph whose id matches the current highlightedId in the nav store.
//
// EDITING:
//   Each prose paragraph is directly editable (contentEditable).
//   - onFocus:   captures the snapshot of original text into a ref
//   - onBlur:    calls editStore.setEdit(id, newText, originalText)
//   - onKeyDown: Escape restores original text + calls editStore.clearEdit(id)
//   A pencil indicator appears when the paragraph has an unsaved edit.

import React, { useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { paragraphId } from '@/utils/locationParser';
import { useReportNavStore } from '@/store/reportNavigationStore';
import { useEditStore } from '@/store/editStore';
import { AIEditingToolbar } from '@/components/review/AIEditingToolbar';

interface ReportParagraphProps {
  id: string;
  children: React.ReactNode;
  isHighlighted: boolean;
  onHighlightDone: () => void;
  originalText: string;
}

const ReportParagraph: React.FC<ReportParagraphProps> = ({
  id,
  children,
  isHighlighted,
  onHighlightDone,
  originalText,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  // Snapshot of text at the moment the user focuses — stable, never re-derived
  const originalRef = useRef<string>(originalText);

  const setEdit = useEditStore((s) => s.setEdit);
  const clearEdit = useEditStore((s) => s.clearEdit);
  const hasPendingEdit = useEditStore((s) => !!s.edits[id]);

  // Scroll into view + clear after animation when highlighted
  useEffect(() => {
    if (!isHighlighted || !ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(onHighlightDone, 2600);
    return () => clearTimeout(timer);
  }, [isHighlighted, onHighlightDone]);

  const handleBlur = () => {
    const el = ref.current;
    if (!el) return;
    const newText = el.innerText ?? '';
    setEdit(id, newText, originalRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      const el = ref.current;
      if (!el) return;
      // Restore original text
      el.innerText = originalRef.current;
      clearEdit(id);
      el.blur();
    }
  };

  return (
    <div className="relative group">
      <AIEditingToolbar paragraphId={id} currentText={typeof children === 'string' ? children : ''} />

      {/* Dirty indicator — shown when paragraph has an unsaved edit */}
      {hasPendingEdit && (
        <span
          title="Unsaved edit — click 'Save Edits' in the toolbar to commit"
          className="absolute -right-5 top-0.5 text-amber-500 opacity-70"
          aria-label="Unsaved edit"
        >
          <Pencil className="w-3 h-3" />
        </span>
      )}

      <p
        id={id}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`mb-3 text-gray-700 transition-all duration-300 cursor-text outline-none
          focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 focus:rounded-sm
          ${isHighlighted ? 'para-highlighted' : ''}
          ${hasPendingEdit ? 'border-l-2 border-amber-400 pl-2' : ''}
        `}
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
        originalText={para}
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
