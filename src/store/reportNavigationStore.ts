// src/store/reportNavigationStore.ts
// Controls active tab (Report / AI Review) and paragraph highlight state.
// Used by ReportPreview (tab switching) and the AI Review pane (navigateTo).
import { create } from 'zustand';

export type ReportTab = 'report' | 'ai-review';

interface ReportNavState {
  activeTab: ReportTab;
  highlightedId: string | null;

  setActiveTab: (tab: ReportTab) => void;
  /** Switch to the Report tab and mark a paragraph for highlight scroll */
  navigateTo: (paragraphId: string) => void;
  clearHighlight: () => void;
}

export const useReportNavStore = create<ReportNavState>((set) => ({
  activeTab: 'report',
  highlightedId: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  navigateTo: (paragraphId) => {
    set({ activeTab: 'report', highlightedId: paragraphId });
  },

  clearHighlight: () => set({ highlightedId: null }),
}));
