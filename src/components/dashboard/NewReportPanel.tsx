// src/components/dashboard/NewReportPanel.tsx
import React, { useState } from 'react';
import { Plus, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '@/api/client';

export const NewReportPanel: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !industry) return;

    setStatus('generating');
    try {
      await api.post('/generation/jobs', {
        topic,
        industry,
      });
      setStatus('success');
      setTopic('');
      setIndustry('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900 tracking-tight">New Report Generation</h2>
      </div>
      
      <div className="p-5">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Report Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Q3 Financial Performance"
              className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              disabled={status === 'generating'}
              required
            />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Industry / Sector <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology"
              className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              disabled={status === 'generating'}
              required
            />
          </div>

          <div className="w-full md:w-auto shrink-0">
            <button
              type="submit"
              disabled={status === 'generating' || !topic || !industry}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm h-[38px]"
            >
              {status === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Queued
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>

        {status === 'error' && (
          <div className="mt-3 text-xs text-red-600 font-medium">
            Failed to queue report generation. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};
