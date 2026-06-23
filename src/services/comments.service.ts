// src/services/comments.service.ts
// Replaces the in-memory mockData-backed implementation with
// Cloudflare Pages Function API calls backed by R2 storage.
// Public interface is IDENTICAL to the previous mock.

import type { Comment } from '@/types';

export const commentsService = {
  /**
   * GET /api/reports/:id/comments
   * Returns the live Comment[] thread for the report.
   * Returns [] gracefully if the report has no comments file.
   */
  async getByReportId(reportId: string): Promise<Comment[]> {
    try {
      const res = await fetch(`/api/reports/${reportId}/comments`);
      if (!res.ok) return [];
      return res.json() as Promise<Comment[]>;
    } catch {
      return [];
    }
  },

  /**
   * POST /api/reports/:id/comments  (body = full Comment object)
   * Appends the comment to the thread in R2 and returns the updated array.
   */
  async addComment(reportId: string, comment: Comment): Promise<Comment[]> {
    const res = await fetch(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error(`Failed to add comment (${res.status})`);
    return res.json() as Promise<Comment[]>;
  },

  /**
   * POST /api/reports/:id/comments  { _action: 'resolve', commentId }
   * Transitions the target comment to 'resolved' status in R2.
   */
  async resolveComment(reportId: string, commentId: string): Promise<Comment[]> {
    const res = await fetch(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'resolve', commentId }),
    });
    if (!res.ok) throw new Error(`Failed to resolve comment (${res.status})`);
    return res.json() as Promise<Comment[]>;
  },
};
