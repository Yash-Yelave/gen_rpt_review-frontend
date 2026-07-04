// src/store/editStore.ts
// Tracks inline paragraph edits made directly in the report document viewer.
//
// State rules (strictly enforced):
//   - setEdit only marks a paragraph dirty when newText !== originalText
//   - clearEdit removes the entry; if no entries remain, isDirty becomes false
//   - isDirty is derived from edits map size — never set manually
//   - clearAllEdits is called ONLY after a confirmed successful API save
//
// The store is intentionally NOT persisted to localStorage:
//   - Edits are session-local, lost on refresh (user is warned via beforeunload)
//   - PDF/publish is guarded: publish is blocked while isDirty === true

import { create } from 'zustand';

export interface EditState {
  /** Map of paragraphId → edited text (only contains truly changed paragraphs) */
  edits: Record<string, string>;
  /** True when at least one paragraph has an unsaved edit */
  isDirty: boolean;

  /**
   * Record an edit for a paragraph.
   * If newText === originalText the entry is removed (idempotent clean state).
   */
  setEdit: (id: string, newText: string, originalText: string) => void;

  /**
   * Remove a single edit entry (e.g. user pressed Escape to restore original).
   */
  clearEdit: (id: string) => void;

  /**
   * Clear all edits after a successful save to the backend.
   */
  clearAllEdits: () => void;
}

export const useEditStore = create<EditState>((set) => ({
  edits: {},
  isDirty: false,

  setEdit: (id, newText, originalText) => {
    set((state) => {
      const nextEdits = { ...state.edits };

      if (newText.trim() === originalText.trim()) {
        // Text is back to original — remove from dirty map
        delete nextEdits[id];
      } else {
        nextEdits[id] = newText;
      }

      return {
        edits: nextEdits,
        isDirty: Object.keys(nextEdits).length > 0,
      };
    });
  },

  clearEdit: (id) => {
    set((state) => {
      const nextEdits = { ...state.edits };
      delete nextEdits[id];
      return {
        edits: nextEdits,
        isDirty: Object.keys(nextEdits).length > 0,
      };
    });
  },

  clearAllEdits: () => {
    set({ edits: {}, isDirty: false });
  },
}));
