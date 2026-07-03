import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReport } from '@/hooks/useReports';
import { useReviewStore } from '@/store/reviewStore';
import { ReviewTopbar } from '@/components/review/ReviewTopbar';
import { ReportPreview } from '@/components/report/ReportPreview';
import { HumanReviewCard } from '@/components/review/HumanReviewCard';
import { VersionHistoryPanel } from '@/components/review/VersionHistoryPanel';
import { CommentThread } from '@/components/comments/CommentThread';
import { EmptyState } from '@/components/common/EmptyState';
import { FileWarning, Play, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { reportsService } from '@/services/reports.service';
import { QUERY_KEYS } from '@/utils/constants';

const AssignmentCard: React.FC<{ report: any }> = ({ report }) => {
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => ({
    email: s.reviewerEmail,
    name: s.reviewerName,
  }));

  const claimMutation = useMutation({
    mutationFn: () => reportsService.claimReport(report.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.report(report.id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reports });
    },
  });

  const assigned = report.assignedTo;
  const isAssignedToMe = assigned && assigned.email === currentUser.email;

  if (!assigned) {
    return (
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-800">Unassigned Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              No reviewer is currently assigned to this report. Claim it to start editing or signing off.
            </p>
            <button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-all disabled:bg-blue-600/50"
            >
              {claimMutation.isPending ? (
                'Assigning...'
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Start Working
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAssignedToMe) {
    return (
      <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-50 text-green-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Assigned to You</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              You claimed this report. You can edit blocks, run AI suggestions, and submit the final review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Claimed by Another Reviewer</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-semibold text-gray-800">{assigned.full_name}</span> is currently working on this report.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ReportReview: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useReport(reportId ?? '');

  // Fetch review.md text at runtime from R2 via the Pages Function.
  // Falls back to '' while loading or on error so highlights gracefully absent.
  const { data: reviewMdText = '' } = useQuery<string>({
    queryKey: ['review-md', reportId],
    queryFn: async () => {
      if (!reportId) return '';
      const res = await fetch(`/api/v1/reports/${reportId}/review`);
      if (!res.ok) return '';
      return res.text();
    },
    enabled: !!reportId,
    staleTime: 60_000,
  });

  const resetForm = useReviewStore((s: any) => s.reset);
  const setDecision = useReviewStore((s: any) => s.setDecision);

  // Sync form with report's current humanStatus if it matches a valid decision
  useEffect(() => {
    if (report?.humanStatus && ['Approved', 'Needs Revision', 'Rejected'].includes(report.humanStatus)) {
      setDecision(report.humanStatus);
    } else {
      resetForm();
    }
  }, [report?.humanStatus, setDecision, resetForm]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading report…</div>;

  if (!report) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <EmptyState
          icon={<FileWarning className="w-full h-full text-red-400" />}
          title="Report Not Found"
          text={`Could not find report with ID ${reportId}`}
        />
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-body">
      <ReviewTopbar report={report} />

      <div className="review-body-grid">
        {/* Left: Document Preview with tabs (Report / AI Review) */}
        <div className="overflow-hidden flex flex-col h-full">
          <ReportPreview report={report} reviewMdText={reviewMdText} />
        </div>

        {/* Right: Human Review + Comments only */}
        <div className="overflow-y-auto bg-gray-50 border-l border-gray-200">
          <div className="p-4 flex flex-col gap-4">
            <AssignmentCard report={report} />
            <VersionHistoryPanel report={report} />
            <HumanReviewCard report={report} />
            <CommentThread report={report} />
          </div>
        </div>
      </div>
    </div>
  );
};
