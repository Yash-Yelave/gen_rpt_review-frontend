// src/components/review/ReviewTopbar.tsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, PencilLine, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useReviewActions } from '@/hooks/useReviewActions';
import { useReviewStore } from '@/store/reviewStore';
import { useUIStore } from '@/store/uiStore';
import { useEditStore } from '@/store/editStore';
import { api } from '@/api/client';
import type { Report } from '@/types';

interface Props {
  report: Report;
}

export const ReviewTopbar: React.FC<Props> = ({ report }) => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const { decision, commentText, commentSection } = useReviewStore();
  const { showToast } = useUIStore();
  const { saveReview } = useReviewActions(report.id);

  // Edit store
  const isDirty = useEditStore((s) => s.isDirty);
  const edits = useEditStore((s) => s.edits);
  const clearAllEdits = useEditStore((s) => s.clearAllEdits);
  const [isSavingEdits, setIsSavingEdits] = React.useState(false);

  // Warn user before navigating away with unsaved edits
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved text edits. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSave = async () => {
    if (decision === 'Needs Revision') {
      if (!commentText.trim()) {
        showToast('Please enter revision instructions before saving.', 'error');
        return;
      }
      await saveReview.mutateAsync({
        decision,
        revisionData: { text: commentText, section: commentSection }
      });
    } else if (decision) {
      await saveReview.mutateAsync({ decision });
    }
    showToast('Review saved successfully', 'success');
  };

  const handleSaveEdits = async () => {
    if (!reportId || !isDirty) return;
    setIsSavingEdits(true);
    try {
      const res = await api.put(`/reports/${reportId}/content`, { edits });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Save failed (HTTP ${res.status})`);
      }
      clearAllEdits();
      showToast('Text edits saved successfully', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save text edits. Please try again.', 'error');
      // Do NOT clear edits on failure — user keeps their work
    } finally {
      setIsSavingEdits(false);
    }
  };

  return (
    <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="h-4 w-px bg-gray-200"></div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 truncate mb-0.5">{report.title}</div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 font-mono">ID: {report.id}</span>
            <span className="text-[11px] text-gray-500 font-mono">{report.version}</span>
            <StatusBadge status={report.status} className="!text-[10px] !px-1.5 !py-0" />
            {report.aiScore > 0 && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 rounded">
                AI Score: {report.aiScore.toFixed(1)}
              </span>
            )}
            {/* Dirty indicator badge in topbar */}
            {isDirty && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                <PencilLine className="w-2.5 h-2.5" />
                Unsaved edits
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Save Edits — only visible when there are pending inline paragraph edits */}
        {isDirty && (
          <button
            id="save-edits-btn"
            onClick={handleSaveEdits}
            disabled={isSavingEdits}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 rounded text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSavingEdits ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <PencilLine className="w-4 h-4" />
                Save Edits
              </>
            )}
          </button>
        )}

        {/* Save Review — existing button, unchanged behaviour */}
        <button
          onClick={handleSave}
          disabled={saveReview.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Save Review
        </button>
      </div>
    </div>
  );
};
