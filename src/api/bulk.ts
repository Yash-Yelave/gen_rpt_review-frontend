// src/api/bulk.ts
// API helpers for the Bulk Generate tab

import { api } from './client';

export interface BulkJobItem {
  topic: string;
  industry?: string;
}

export interface BulkJob {
  job_id: string;
  topic: string;
  industry: string;
  slug: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string | null;
  completedAt: string | null;
  errors: string | null;
}

export interface BulkSubmitResult {
  dispatched: number;
  queued: number;
  errors: Array<{ topic: string; error: string }>;
  jobs: Array<{
    job_id: string;
    slug: string;
    topic: string;
    industry: string | null;
    status: string;
  }>;
}

export interface BulkQueueState {
  paused: boolean;
  limit: number;
}

/** Submit a batch of report generation jobs parsed from the CSV. */
export async function submitBulkJobs(items: BulkJobItem[], limit?: number): Promise<BulkSubmitResult> {
  const res = await api.post('/generation/bulk', { jobs: items, limit });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `API error ${res.status}`);
  }
  const body = await res.json();
  return body.data as BulkSubmitResult;
}

/** Poll the backend for live status of all bulk jobs. */
export async function getBulkQueue(): Promise<BulkJob[]> {
  const res = await api.get('/generation/bulk/queue');
  if (!res.ok) return [];
  const body = await res.json();
  return (body.data || []) as BulkJob[];
}

/** Get the persistent bulk queue state (paused/running). */
export async function getBulkQueueState(): Promise<BulkQueueState> {
  const res = await api.get('/generation/bulk/queue-state');
  if (!res.ok) return { paused: false, limit: 20 };
  const body = await res.json();
  return body.data as BulkQueueState;
}

/** Pause or resume the bulk queue scheduler, or update the threshold limit. */
export async function setBulkQueueState(paused?: boolean, limit?: number): Promise<BulkQueueState> {
  const res = await api.post('/generation/bulk/queue-state', { paused, limit });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `API error ${res.status}`);
  }
  const body = await res.json();
  return body.data as BulkQueueState;
}

/** Clear all pending/queued bulk jobs in the database. */
export async function clearBulkQueue(): Promise<{ cleared_count: number }> {
  const res = await api.post('/generation/bulk/clear-queue');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `API error ${res.status}`);
  }
  const body = await res.json();
  return body.data as { cleared_count: number };
}
