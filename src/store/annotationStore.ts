// src/store/annotationStore.ts
//
// Zustand store that holds the currently-active review annotation shown in
// the sidebar panel.  Components dispatch `openAnnotation` when the user
// clicks a highlighted quote in the report, and read `activeAnnotation` to
// render the sidebar.

import { create } from 'zustand';
import type { ReviewAnnotation } from '@/utils/reviewHighlighter';

interface AnnotationState {
  /** The annotation whose details are shown in the sidebar, or null if closed */
  activeAnnotation: ReviewAnnotation | null;
  /** All annotations parsed from the current review.md */
  annotations: ReviewAnnotation[];

  /** Open the sidebar with this annotation's explanation */
  openAnnotation: (annotation: ReviewAnnotation) => void;
  /** Close / dismiss the sidebar panel */
  closeAnnotation: () => void;
  /** Replace the full set of annotations (called after parsing review.md) */
  setAnnotations: (annotations: ReviewAnnotation[]) => void;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  activeAnnotation: null,
  annotations: [],

  openAnnotation: (annotation) => set({ activeAnnotation: annotation }),
  closeAnnotation: () => set({ activeAnnotation: null }),
  setAnnotations: (annotations) => set({ annotations }),
}));
