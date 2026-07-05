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
  if (!res.ok) return { paused: false };
  const body = await res.json();
  return body.data as BulkQueueState;
}

/** Pause or resume the bulk queue scheduler. */
export async function setBulkQueueState(paused: boolean): Promise<BulkQueueState> {
  const res = await api.post('/generation/bulk/queue-state', { paused });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `API error ${res.status}`);
  }
  const body = await res.json();
  return body.data as BulkQueueState;
}
