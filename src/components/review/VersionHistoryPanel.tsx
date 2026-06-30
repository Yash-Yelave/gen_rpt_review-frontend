// src/components/review/VersionHistoryPanel.tsx
import React, { useState } from 'react';
import type { Report } from '@/types';
import { History, GitCommit, RotateCcw, Eye } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface Props {
  report: Report;
}

// Mock versions for demonstration
const MOCK_VERSIONS = [
  { id: 'v2', date: new Date().toISOString(), author: 'AI Editor', changes: 'Expanded Q3 financials' },
  { id: 'v1', date: new Date(Date.now() - 86400000).toISOString(), author: 'System', changes: 'Initial generation' },
];

export const VersionHistoryPanel: React.FC<Props> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50/80 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Version History</h3>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
          Current: {report.version || 'v1.0'}
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-4">
            {MOCK_VERSIONS.map((v, i) => (
              <div key={v.id} className="relative pl-6">
                {/* Timeline line */}
                {i !== MOCK_VERSIONS.length - 1 && (
                  <div className="absolute left-2.5 top-5 bottom-[-20px] w-px bg-gray-200" />
                )}
                
                {/* Timeline node */}
                <div className="absolute left-1 top-1.5 w-3 h-3 rounded-full bg-blue-100 border-2 border-blue-600" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {v.id}
                      <span className="text-xs text-gray-500 font-normal">by {v.author}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{formatDate(v.date)}</div>
                    <div className="text-sm text-gray-700 mt-1 flex items-center gap-1.5">
                      <GitCommit className="w-3 h-3 text-gray-400" />
                      {v.changes}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Version">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {i !== 0 && (
                      <button className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Restore this version">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
