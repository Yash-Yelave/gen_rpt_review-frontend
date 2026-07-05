// src/pages/BulkGenerate/index.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Layers,
  Loader2,
  Pause,
  Play,
  PlayCircle,
  RefreshCw,
  TriangleAlert,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import type { BulkJob, BulkJobItem } from '@/api/bulk';
import { getBulkQueue, submitBulkJobs, getBulkQueueState, setBulkQueueState, cancelAllBulkJobs } from '@/api/bulk';

// ─── CSV parsing ─────────────────────────────────────────────────────────────

interface ParsedRow {
  topic: string;
  industry: string;
  _error?: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rawHeader = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const headerLower = rawHeader.map((h) => h.toLowerCase());

  // Accept "title" or "topic" for the topic column
  const topicIdx = headerLower.findIndex((h) => h === 'title' || h === 'topic');
  // Accept "industry / sector", "industry", "sector" for the industry column
  const industryIdx = headerLower.findIndex((h) =>
    h.includes('industry') || h.includes('sector')
  );

  if (topicIdx === -1) {
    return [{ topic: '', industry: '', _error: 'CSV must have a "title" or "topic" column.' }];
  }

  return lines.slice(1).map((line) => {
    // Simple CSV split — handles quoted commas
    const cols = line.match(/(?:"[^"]*"|[^,])+/g)?.map((c) =>
      c.trim().replace(/^["']|["']$/g, '')
    ) ?? line.split(',').map((c) => c.trim());

    const topic = (cols[topicIdx] ?? '').trim();
    const industry = industryIdx >= 0 ? (cols[industryIdx] ?? '').trim() : '';
    const error = !topic ? 'Empty title — row will be skipped.' : undefined;
    return { topic, industry, _error: error };
  });
}



// ─── Main page ────────────────────────────────────────────────────────────────

const MAX_BULK = 20;

export const BulkGenerate: React.FC = () => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [queue, setQueue] = useState<BulkJob[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [limit, setLimit] = useState(20);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Queue polling ──────────────────────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    try {
      const [data, state] = await Promise.all([
        getBulkQueue(),
        getBulkQueueState()
      ]);
      setQueue(data);
      setIsPaused(state.paused);
      setLimit(state.limit || 20);
    } catch (err) {
      console.error('Failed to fetch queue data:', err);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Poll every 5 s while any job is in-flight
  useEffect(() => {
    const hasInFlight = queue.some(
      (j) => j.status === 'pending' || j.status === 'running'
    );
    if (hasInFlight) {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchQueue, 5000);
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [queue, fetchQueue]);

  // ── CSV file handling ──────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setSubmitError('Please upload a .csv file.');
      return;
    }
    setFileName(file.name);
    setSubmitError(null);
    setSubmitResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      setRows(parseCSV(text));
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const validRows = rows.filter((r) => r.topic && !r._error);
  const canSubmit = validRows.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitResult(null);

    const items: BulkJobItem[] = validRows.map((r) => ({
      topic: r.topic,
      industry: r.industry || undefined,
    }));

    try {
      const result = await submitBulkJobs(items, limit);
      const msg = `✅ Successfully submitted batch. Dispatched: ${result.dispatched} job(s), Queued: ${result.queued} job(s).${
        result.errors.length > 0 ? ` ${result.errors.length} error(s).` : ''
      }`;
      setSubmitResult(msg);
      setRows([]);
      setFileName('');
      await fetchQueue();
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQueuePause = async () => {
    try {
      setQueueLoading(true);
      const state = await setBulkQueueState(!isPaused, limit);
      setIsPaused(state.paused);
      setLimit(state.limit);
      await fetchQueue();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update queue state.');
    } finally {
      setQueueLoading(false);
    }
  };


  const handleCancelAll = async () => {
    if (!window.confirm('WARNING: This will cancel all active workflow runs on GitHub and fail all queued/pending database jobs. Are you sure you want to stop everything?')) {
      return;
    }
    try {
      setQueueLoading(true);
      const res = await cancelAllBulkJobs();
      setSubmitResult(`Successfully cancelled all ${res.cleared_jobs} database jobs and stopped ${res.cancelled_github_runs} active GitHub Action workflows.`);
      await fetchQueue();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to cancel workflows.');
    } finally {
      setQueueLoading(false);
    }
  };

  const getQueueStatusBadge = (status: string) => {
    if (status === 'pending') {
      if (isPaused) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider text-[10px]">
            Paused
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gray-50 text-gray-600 border border-gray-200 uppercase tracking-wider text-[10px]">
          Pending
        </span>
      );
    }
    if (status === 'running') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200 animate-pulse uppercase tracking-wider text-[10px]">
          Running
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider text-[10px]">
          Completed
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider text-[10px]">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gray-50 text-gray-500 border border-gray-200 uppercase tracking-wider text-[10px]">
        {status}
      </span>
    );
  };

  // ── Queue stats ────────────────────────────────────────────────────────────
  const stats = {
    total: queue.length,
    pending: queue.filter((j) => j.status === 'pending').length,
    running: queue.filter((j) => j.status === 'running').length,
    completed: queue.filter((j) => j.status === 'completed').length,
    failed: queue.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bulk Generate</h1>
          <p className="text-sm text-gray-500">
            Upload a CSV to queue up to {MAX_BULK} concurrent report generations.
          </p>
        </div>
      </div>

      {/* ─── CSV Upload ─── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Step 1 — Upload CSV</span>
          <span className="text-xs text-gray-400 ml-1">
            Required columns: <code className="bg-gray-100 px-1 rounded">title</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">Industry / Sector</code>
          </span>
        </div>

        <div className="p-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors p-10 flex flex-col items-center gap-3
              ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
          >
            <UploadCloud className={`w-10 h-10 ${dragging ? 'text-indigo-500' : 'text-gray-300'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {fileName ? fileName : 'Drop your CSV file here or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                .csv files only · Max {MAX_BULK} rows dispatched concurrently
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 mb-2"
              >
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Preview ({rows.length} rows · {validRows.length} valid
                {validRows.length > limit ? `, first ${limit} will be dispatched` : ''})
              </button>

              {showPreview && (
                <div className="border border-gray-200 rounded-lg overflow-auto max-h-64">
                  <table className="min-w-full text-xs divide-y divide-gray-100">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 w-8">#</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Title / Topic</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Industry / Sector</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {rows.map((row, i) => (
                        <tr key={i} className={row._error ? 'bg-red-50' : i >= limit ? 'opacity-40' : ''}>
                          <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-2 font-medium text-gray-800 max-w-xs truncate">
                            {row.topic || <span className="text-red-400 italic">empty</span>}
                          </td>
                          <td className="px-4 py-2 text-gray-500">{row.industry || '—'}</td>
                          <td className="px-4 py-2">
                            {row._error ? (
                              <span className="text-red-500 flex items-center gap-1">
                                <TriangleAlert className="w-3.5 h-3.5" />
                                {row._error}
                              </span>
                            ) : i >= limit ? (
                              <span className="text-gray-400">Overflow — skipped</span>
                            ) : (
                              <span className="text-green-600 font-medium">✓ Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Threshold Limit Selector */}
          {rows.length > 0 && (
            <div className="mt-6 mb-4 p-4 bg-gray-50 border border-gray-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block">
                  Generation Threshold Limit
                </label>
                <span className="text-xs text-gray-400">
                  Select maximum reports to generate in this batch (capped at 20)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max={MAX_BULK}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
                  className="w-40 accent-indigo-600"
                />
                <span className="bg-white border border-gray-200 rounded px-2.5 py-1 text-sm font-bold text-gray-700 min-w-[36px] text-center">
                  {limit}
                </span>
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${canSubmit
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {submitting
                ? 'Dispatching…'
                : `Start Generation (${validRows.length} job${validRows.length !== 1 ? 's' : ''})`}
            </button>

            {fileName && (
              <button
                onClick={() => { setRows([]); setFileName(''); setSubmitResult(null); setSubmitError(null); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {submitResult && (
            <div className="mt-3 flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {submitResult}
            </div>
          )}
          {submitError && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {submitError}
            </div>
          )}
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Jobs', value: stats.total, cls: 'text-gray-700' },
          { label: 'Running', value: stats.running, cls: 'text-blue-600 font-bold' },
          { label: 'Queued (Pending)', value: stats.pending, cls: 'text-amber-600 font-bold' },
          { label: 'Completed', value: stats.completed, cls: 'text-green-600 font-bold' },
          { label: 'Failed', value: stats.failed, cls: 'text-red-600' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
            <div className={`text-2xl font-bold ${cls}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ─── Queue table ─── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              Step 2 — Generation Queue
            </span>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider
              ${isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-green-50 text-green-700 border-green-200'}`}
            >
              {isPaused ? '⏸️ Pending Jobs Paused' : '🟢 Pending Jobs Active'}
            </span>
            {(stats.pending > 0 || stats.running > 0) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Live · polling every 5s
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleQueuePause}
              disabled={queueLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all border
                ${isPaused
                  ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'}
                ${queueLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? 'Resume Pending Jobs' : 'Pause Pending Jobs'}
            </button>
            {(stats.pending > 0 || stats.running > 0) && (
              <button
                onClick={handleCancelAll}
                disabled={queueLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all border bg-red-600 hover:bg-red-700 text-white border-red-700 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel All Workflows
              </button>
            )}
            <button
              onClick={fetchQueue}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {queueLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Layers className="w-10 h-10 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">No bulk jobs yet.</p>
            <p className="text-xs text-gray-400">Upload a CSV above to start generating reports.</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 w-8">#</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Title / Topic</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Industry</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Started</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {queue.map((job, i) => (
                  <tr key={job.job_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 max-w-xs">
                      <span className="line-clamp-2">{job.topic}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{job.industry || '—'}</td>
                    <td className="px-5 py-3.5">
                      {getQueueStatusBadge(job.status)}
                      {job.errors && job.status === 'failed' && (
                        <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={job.errors}>
                          {job.errors}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {job.startedAt
                        ? new Date(job.startedAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {job.status === 'completed' && (
                        <a
                          href={`/review/${job.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          View Report →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
