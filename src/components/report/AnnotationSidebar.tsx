// src/components/report/AnnotationSidebar.tsx
//
// Floating sidebar panel that appears when the user clicks a highlighted
// quote in the report.  It shows the issue explanation from review.md.
//
// Usage:
//   <AnnotationSidebar />
//
// The panel reads from `useAnnotationStore` — no props needed.

import React, { useEffect, useRef } from 'react';
import { X, MapPin, AlertTriangle } from 'lucide-react';
import { useAnnotationStore } from '@/store/annotationStore';

export const AnnotationSidebar: React.FC = () => {
  const activeAnnotation = useAnnotationStore((s) => s.activeAnnotation);
  const closeAnnotation = useAnnotationStore((s) => s.closeAnnotation);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!activeAnnotation) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAnnotation();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeAnnotation, closeAnnotation]);

  // Close when clicking outside the panel
  useEffect(() => {
    if (!activeAnnotation) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeAnnotation();
      }
    };
    // Use a small timeout so the click that opened the panel doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [activeAnnotation, closeAnnotation]);

  if (!activeAnnotation) return null;

  const { exactQuote, explanation, section, paragraph, endText } = activeAnnotation;

  return (
    // Backdrop (semi-transparent, dismisses on click via useEffect above)
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      aria-hidden="true"
    >
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Issue explanation"
        className="pointer-events-auto fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] bg-white border border-red-200 rounded-xl shadow-2xl overflow-hidden"
        style={{
          animation: 'annotation-slide-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-700">Review Issue</span>
          </div>
          <button
            onClick={closeAnnotation}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors rounded p-0.5 hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">
          {/* Quoted excerpt */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
              Flagged text
            </div>
            <blockquote className="border-l-2 border-red-400 pl-3 text-xs text-gray-700 italic leading-relaxed bg-red-50 py-1.5 pr-2 rounded-r">
              "{exactQuote}"
              {endText && endText !== exactQuote && (
                <span className="text-gray-400"> … "{endText}"</span>
              )}
            </blockquote>
          </div>

          {/* Explanation */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
              Issue
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{explanation}</p>
          </div>

          {/* Location badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
            <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span className="font-medium text-gray-600 truncate">{section}</span>
            {paragraph !== null && (
              <span className="text-gray-400 flex-shrink-0">· Para {paragraph}</span>
            )}
          </div>
        </div>
      </div>

      {/* CSS keyframe injected inline — avoids a separate stylesheet */}
      <style>{`
        @keyframes annotation-slide-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};
