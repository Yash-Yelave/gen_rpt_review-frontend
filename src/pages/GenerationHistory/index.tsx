// src/pages/GenerationHistory/index.tsx
import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { History, Loader2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface GenerationJob {
  id: string;
  topic: string;
  industry: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  reportId?: string;
}

export const GenerationHistory: React.FC = () => {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/generation/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (error) {
        console.error('Failed to fetch generation jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Generation History</h1>
          <p className="text-sm text-gray-500">Track and manage report generation jobs</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="text-sm text-gray-500 mt-1">Generate a report from the dashboard to see it here.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Topic</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Industry</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{job.topic}</td>
                  <td className="px-6 py-4 text-gray-500">{job.industry}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      job.status === 'completed' ? 'bg-green-50 text-green-700' :
                      job.status === 'failed' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {job.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {job.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                      {(job.status === 'pending' || job.status === 'generating') && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span className="capitalize">{job.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(job.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    {job.reportId && (
                      <a href={`/review/${job.reportId}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        View Report
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
