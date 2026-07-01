// src/components/report/ReportCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/services/reviews.service';
import { QUERY_KEYS } from '@/utils/constants';
import { useUIStore } from '@/store/uiStore';
import { Globe, GlobeLock, Loader2 } from 'lucide-react';
import type { Report } from '@/types';
import { ReportStatus } from '@/types';

interface Props {
  report: Report;
}

export const ReportCard = React.memo(({ report: r }: Props) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useUIStore();
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

  const isPublished = r.status === ReportStatus.Published || r.status === 'Published';

  const unpublish = useMutation({
    mutationFn: () => reviewsService.unpublishReport(r.id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.report(r.id) });
      setShowUnpublishConfirm(false);
      showToast(
        result.actionRequired
          ? `Unpublished. Action required: ${result.actionRequired}`
          : 'Report unpublished and moved to Rejected.',
        'success'
      );
    },
    onError: (err: Error) => {
      showToast(`Unpublish failed: ${err.message}`, 'error');
    },
  });

  const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Don't navigate if clicking a button inside the card
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/review/${r.id}`);
  };

  return (
    <>
      {/* Unpublish Confirmation Modal */}
      {showUnpublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <GlobeLock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Unpublish Report</div>
                <div className="text-xs text-gray-500">This will move the report to Rejected</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-5">
              Are you sure you want to unpublish{' '}
              <span className="font-semibold">"{r.title}"</span>?
              <span className="block mt-2 text-xs text-gray-500">
                Note: Since GateX doesn't have an official unpublish API, you may need to manually
                remove it from the MENA Compass admin panel.
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnpublishConfirm(false)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => unpublish.mutate()}
                disabled={unpublish.isPending}
                className="flex-1 px-3 py-2 bg-orange-600 text-white rounded text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {unpublish.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Unpublishing…</>
                ) : (
                  'Unpublish'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(e); }}
        aria-label={`Open report: ${r.title}`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-snug">{r.title}</div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">{r.id} · {r.version}</div>
          </div>
          <StatusBadge status={r.status} />
        </div>
        <div className="flex gap-2 flex-wrap mb-3">
          {r.aiScore > 0 && (
            <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              AI {r.aiScore.toFixed(1)}
            </span>
          )}
          {r.commentCount > 0 && (
            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {r.commentCount} comment{r.commentCount > 1 ? 's' : ''}
            </span>
          )}
          {isPublished && (
            <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              <Globe className="w-3 h-3" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {r.aiScore > 0 ? (
            <span className="text-xs font-bold text-blue-700">AI Score: {r.aiScore.toFixed(1)}</span>
          ) : (
            <span className="text-xs text-gray-400">Not scored</span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{formatDate(r.lastUpdated)}</span>
            {/* Unpublish button shown only on Published cards */}
            {isPublished && (
              <button
                id={`unpublish-btn-${r.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUnpublishConfirm(true);
                }}
                title="Unpublish this report"
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 border border-orange-200 rounded hover:bg-orange-50 transition-colors"
              >
                <GlobeLock className="w-3 h-3" />
                Unpublish
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
ReportCard.displayName = 'ReportCard';
