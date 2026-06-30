// src/services/comments.service.ts
// Replaces the in-memory mockData-backed implementation with
// FastAPI backend calls.
// Public interface is IDENTICAL to the previous mock.

import type { Comment } from '@/types';
import { api } from '@/api/client';

export const commentsService = {
  /**
   * GET /api/v1/reports/:id/comments
   * Returns the live Comment[] thread for the report.
   * Returns [] gracefully if the report has no comments file.
   */
  async getByReportId(reportId: string): Promise<Comment[]> {
    try {
      const res = await api.get(`/reports/${reportId}/comments`);
      if (!res.ok) return [];
      return res.json() as Promise<Comment[]>;
    } catch {
      return [];
    }
  },

  /**
   * POST /api/v1/reports/:id/comments  (body = full Comment object)
   * Appends the comment to the thread and returns the updated array.
   */
  async addComment(reportId: string, comment: Comment): Promise<Comment[]> {
    const res = await api.post(`/reports/${reportId}/comments`, comment);
    if (!res.ok) throw new Error(`Failed to add comment (${res.status})`);
    return res.json() as Promise<Comment[]>;
  },

  /**
   * POST /api/v1/reports/:id/comments  { _action: 'resolve', commentId }
   * Transitions the target comment to 'resolved' status.
   */
  async resolveComment(reportId: string, commentId: string): Promise<Comment[]> {
    const res = await api.post(`/reports/${reportId}/comments`, { _action: 'resolve', commentId });
    if (!res.ok) throw new Error(`Failed to resolve comment (${res.status})`);
    return res.json() as Promise<Comment[]>;
  },
};
