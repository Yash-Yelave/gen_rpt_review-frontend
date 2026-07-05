// src/pages/AIReviewed/index.tsx
import React, { useState } from 'react';
import { ReportGrid } from '@/components/report/ReportGrid';
import { ReportStatus } from '@/types';

export const AIReviewedList: React.FC = () => {
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Reviewed</h1>
          <p className="text-sm text-gray-500 mt-1">Reports that have been AI-reviewed and are awaiting human review</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-gray-700 shadow-sm"
          >
            <option value="latest">Latest Updated</option>
            <option value="oldest">Oldest Updated</option>
          </select>
        </div>
      </div>
      <ReportGrid
        statuses={[ReportStatus.NeedsHumanReview, ReportStatus.AIReviewed, ReportStatus.Generated]}
        emptyTitle="No reports awaiting review"
        emptyText="All AI-reviewed reports have been assigned a human decision."
        sortBy={sortBy}
      />
    </div>
  );
};
