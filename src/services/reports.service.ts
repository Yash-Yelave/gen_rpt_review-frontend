// src/services/reports.service.ts
// Replaces the in-memory mockData-backed implementation with
// FastAPI backend calls.
// Public interface is IDENTICAL to the previous mock — same method
// signatures and return types — so all hooks and components are unaffected.

import type { Report } from '@/types';
import { api } from '@/api/client';

export const reportsService = {
  /**
   * GET /api/v1/reports → returns the catalog (summary Report[]).
   * List pages, dashboard counts, and sidebar badges all read from here.
   */
  async getAll(): Promise<Report[]> {
    const res = await api.get('/reports');
    const body = await res.json();
    return (body.data || []) as Report[];
  },

  /**
   * GET /api/v1/reports/:id → returns the full Report (manifest + comments).
   * Used by the review workspace when opening a specific report.
   */
  async getById(id: string): Promise<Report | null> {
    const res = await api.get(`/reports/${id}`);
    if (res.status === 404) return null;
    const body = await res.json();
    return body.data as Report | null;
  },

  /**
   * POST /api/v1/reports/:id/status { status }
   * Updates the system status field.
   */
  async updateStatus(id: string, status: string): Promise<Report> {
    const res = await api.post(`/reports/${id}/status`, { status });
    const body = await res.json();
    return body.data as Report;
  },

  /**
   * POST /api/v1/reports/:id/status { humanStatus }
   * Updates the human editorial status field.
   */
  async updateHumanStatus(id: string, humanStatus: string): Promise<Report> {
    const res = await api.post(`/reports/${id}/status`, { humanStatus });
    const body = await res.json();
    return body.data as Report;
  },

  /**
   * POST /api/v1/reports/:id/status { publishReady }
   * Flags the report as ready for the publishing pipeline.
   */
  async setPublishReady(id: string, ready: boolean): Promise<Report> {
    const res = await api.post(`/reports/${id}/status`, { publishReady: ready });
    const body = await res.json();
    return body.data as Report;
  },
};
