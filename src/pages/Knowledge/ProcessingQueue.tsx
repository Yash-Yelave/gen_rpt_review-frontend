// src/pages/Knowledge/ProcessingQueue.tsx
import React, { useEffect, useState } from 'react';
import { knowledgeApiService } from '@/services/knowledgeApi';
import type { QueueJob } from '@/types/knowledge.types';
import { 
  Cpu, 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  Clock, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export const ProcessingQueue: React.FC = () => {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<QueueJob | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await knowledgeApiService.getQueueStatus();
      
      // Resolve document name if not present in job by querying document endpoint or mapping
      const enrichedJobs = await Promise.all(
        data.map(async (job) => {
          try {
            const doc = await knowledgeApiService.getDocument(job.document_id);
            return {
              ...job,
              document_name: doc.file_name
            };
          } catch {
            return {
              ...job,
              document_name: 'Unknown Document'
            };
          }
        })
      );
      setJobs(enrichedJobs);
    } catch (err) {
      console.error('Failed to fetch processing queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh queue status every 10 seconds
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const openLogsModal = (job: QueueJob) => {
    setActiveJob(job);
    setShowLogsModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Processing Queue</h1>
            <p className="text-sm text-gray-500">Monitor active document digestion pipelines, extraction, and vectorization workers</p>
          </div>
        </div>
        <button
          onClick={fetchQueue}
          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">All caught up</h3>
            <p className="text-sm text-gray-500 mt-1">No pending or active jobs in the pipeline queue.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Document</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Stage</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Duration</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Date Queued</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-900">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {job.document_name}
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-mono">Job: {job.id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-700 capitalize">{job.current_stage || 'Queued'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {job.completed_stages?.length || 0} stages completed
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'completed' ? 'bg-green-50 text-green-700' :
                      job.status === 'failed' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {job.status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                      {job.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                      {job.status === 'processing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {job.status === 'pending' && <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                      <span className="capitalize">{job.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {job.duration_sec ? `${job.duration_sec}s` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(job.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openLogsModal(job)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 hover:bg-gray-100 rounded text-xs font-semibold transition-all text-gray-700"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      View Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Logs Modal */}
      {showLogsModal && activeJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-500" />
                Pipeline Execution Logs
              </h2>
              <p className="text-xs text-gray-500 mt-1">Job ID: {activeJob.id} | Document: {activeJob.document_name}</p>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-xs flex-1 min-h-[300px] leading-relaxed select-all">
              {activeJob.logs ? (
                <pre className="whitespace-pre-wrap">{activeJob.logs}</pre>
              ) : (
                <div className="text-gray-500 italic text-center py-12">
                  No execution logs available for this job stage.
                </div>
              )}
              {activeJob.error_message && (
                <div className="mt-4 p-3 bg-red-950/50 border border-red-900 text-red-400 rounded-lg whitespace-pre-wrap">
                  <span className="font-bold">Error Triggered:</span> {activeJob.error_message}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
