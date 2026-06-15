// src/hooks/useReviewHighlighter.ts
//
// React hook that:
//   1. Accepts raw review.md text and a ref to the report DOM container.
//   2. Parses annotations from the review text via `parseReviewAnnotations`.
//   3. After each render, walks the report DOM and wraps exact-quote matches
//      in <span class="highlight-error"> using `applyHighlightsToDOM`.
//   4. On click, opens the AnnotationSidebar via `useAnnotationStore`.
//
// Usage:
//   const containerRef = useRef<HTMLDivElement>(null);
//   useReviewHighlighter(reviewMdText, containerRef);
//   // Render <div ref={containerRef}> around the report body.
//   // Render <AnnotationSidebar /> anywhere in the tree.

import { useEffect, useMemo } from 'react';
import { parseReviewAnnotations, applyHighlightsToDOM } from '@/utils/reviewHighlighter';
import { useAnnotationStore } from '@/store/annotationStore';
import type { ReviewAnnotation } from '@/utils/reviewHighlighter';

/**
 * @param reviewMdText  Raw string of review.md (empty string = no highlights)
 * @param containerRef  Ref attached to the DOM node that wraps the report body
 */
export function useReviewHighlighter(
  reviewMdText: string,
  containerRef: React.RefObject<HTMLElement | null>
): void {
  const openAnnotation = useAnnotationStore((s) => s.openAnnotation);
  const setAnnotations = useAnnotationStore((s) => s.setAnnotations);

  // Parse annotations only when reviewMdText changes
  const annotations = useMemo(
    () => parseReviewAnnotations(reviewMdText),
    [reviewMdText]
  );

  // Publish the full list to the store (so other components can read them)
  useEffect(() => {
    setAnnotations(annotations);
  }, [annotations, setAnnotations]);

  // Apply DOM highlights after every render that changes annotations or container
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !annotations.length) return;

    const handleClick = (ann: ReviewAnnotation) => openAnnotation(ann);

    const count = applyHighlightsToDOM(container, annotations, handleClick);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[useReviewHighlighter] applied ${count} highlight(s)`);
    }

    // Cleanup: remove all spans when unmounting or re-running
    return () => {
      container.querySelectorAll('span.highlight-error').forEach((el) => {
        const parent = el.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(el.textContent ?? ''), el);
        parent.normalize();
      });
    };
  }, [annotations, containerRef, openAnnotation]);
}
