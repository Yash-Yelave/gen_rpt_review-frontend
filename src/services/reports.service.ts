// src/services/reports.service.ts
// Replaces the in-memory mockData-backed implementation with
// Cloudflare Pages Function API calls backed by R2 storage.
// Public interface is IDENTICAL to the previous mock — same method
// signatures and return types — so all hooks and components are unaffected.

import type { Report } from '@/types';

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok && res.status !== 404) {
    throw new Error(`API error ${res.status}: ${url}`);
  }
  return res;
}

export const reportsService = {
  /**
   * GET /api/reports → returns the catalog (summary Report[] from R2).
   * List pages, dashboard counts, and sidebar badges all read from here.
   */
  async getAll(): Promise<Report[]> {
    const res = await apiFetch('/api/reports');
    return res.json() as Promise<Report[]>;
  },

  /**
   * GET /api/reports/:id → returns the full Report (manifest + comments).
   * Used by the review workspace when opening a specific report.
   */
  async getById(id: string): Promise<Report | null> {
    const res = await apiFetch(`/api/reports/${id}`);
    if (res.status === 404) return null;
    return res.json() as Promise<Report | null>;
  },

  /**
   * POST /api/reports/:id/status { status }
   * Updates the system status field in R2 (manifest + catalog).
   */
  async updateStatus(id: string, status: string): Promise<Report> {
    const res = await apiFetch(`/api/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json() as Promise<Report>;
  },

  /**
   * POST /api/reports/:id/status { humanStatus }
   * Updates the human editorial status field in R2.
   */
  async updateHumanStatus(id: string, humanStatus: string): Promise<Report> {
    const res = await apiFetch(`/api/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ humanStatus }),
    });
    return res.json() as Promise<Report>;
  },

  /**
   * POST /api/reports/:id/status { publishReady }
   * Flags the report as ready for the publishing pipeline.
   */
  async setPublishReady(id: string, ready: boolean): Promise<Report> {
    const res = await apiFetch(`/api/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishReady: ready }),
    });
    return res.json() as Promise<Report>;
  },
};
