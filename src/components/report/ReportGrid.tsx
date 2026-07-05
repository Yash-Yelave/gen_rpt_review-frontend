// src/components/report/ReportGrid.tsx
import React from 'react';
import { ReportCard } from './ReportCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useFilteredReports } from '@/hooks/useReports';
import { FileSearch } from 'lucide-react';

interface Props {
  statuses: string[];
  emptyTitle: string;
  emptyText?: string;
  sortBy?: 'latest' | 'oldest';
}

export const ReportGrid: React.FC<Props> = ({ statuses, emptyTitle, emptyText, sortBy = 'latest' }) => {
  const reports = useFilteredReports(statuses);

  const sortedReports = React.useMemo(() => {
    return [...reports].sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [reports, sortBy]);

  if (sortedReports.length === 0) {
    return (
      <EmptyState
        icon={<FileSearch className="w-full h-full" />}
        title={emptyTitle}
        text={emptyText}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sortedReports.map((r) => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  );
};
