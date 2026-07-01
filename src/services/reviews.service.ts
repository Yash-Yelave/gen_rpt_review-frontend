// src/services/reviews.service.ts
// Replaces the in-memory mockData-backed implementation with
// FastAPI backend calls.
// Public interface is IDENTICAL to the previous mock — same method
// signatures and return types — so all hooks and components are unaffected.
//
// All state transitions POST to /api/v1/reports/:id/status with the relevant
// field patch.  Comment creation for regeneration requests goes through
// commentsService so the comments thread is kept consistent.

import { commentsService } from './comments.service';
import type { Comment } from '@/types';
import { uid } from '@/utils/formatters';
import { api } from '@/api/client';

async function postStatus(
  reportId: string,
  patch: { status?: string; humanStatus?: string; publishReady?: boolean }
): Promise<void> {
  const res = await api.post(`/reports/${reportId}/status`, patch);
  if (!res.ok) throw new Error(`Status update failed (${res.status})`);
}

export const reviewsService = {
  /**
   * saveReview — persists the current editorial decision draft.
   * 'Needs Revision' → sets both status + humanStatus to 'Needs Revision'.
   * Any other decision → marks humanStatus as 'In Progress' (draft saved).
   */
  async saveReview(reportId: string, decision: string): Promise<void> {
    if (decision === 'Needs Revision') {
      await postStatus(reportId, {
        status: 'Needs Revision',
        humanStatus: 'Needs Revision',
      });
    } else {
      await postStatus(reportId, { humanStatus: 'In Progress' });
    }
  },

  /**
   * markDone — approves the report (without immediately publishing).
   */
  async markDone(reportId: string): Promise<void> {
    await postStatus(reportId, {
      status: 'Approved',
      humanStatus: 'Approved',
      publishReady: true,
    });
  },

  /**
   * sendToPublish — triggers the full GateX publish pipeline.
   * Calls publishService.publish which:
   *   1. Tries POST /api/v1/publish/{id} (GateX backend pipeline)
   *   2. Falls back to a direct status update if backend is unavailable
   * Either way, report ends up with status = 'Published'.
   */
  async sendToPublish(reportId: string): Promise<void> {
    const { publishService } = await import('./publish.service');
    await publishService.publish(reportId, 'reviewer', 'v1');
  },

  /**
   * requestRegeneration — submits a revision comment and transitions
   * the report to 'Needs Revision' so the AI pipeline can pick it up.
   */
  async requestRegeneration(
    reportId: string,
    commentData: {
      text: string;
      section: string;
      priority: string;
      reviewer: string;
      version: string;
    }
  ): Promise<void> {
    const comment: Comment = {
      id: uid(),
      reportId,
      version: commentData.version,
      section: commentData.section,
      text: commentData.text,
      priority: commentData.priority,
      reviewer: commentData.reviewer,
      timestamp: new Date().toISOString(),
      status: 'sent to regeneration',
    };

    // Add the comment first, then update status
    await commentsService.addComment(reportId, comment);
    await postStatus(reportId, {
      status: 'Needs Revision',
      humanStatus: 'Needs Revision',
    });
  },

  /**
   * rejectReport — permanently rejects the report.
   */
  async rejectReport(reportId: string): Promise<void> {
    await postStatus(reportId, {
      status: 'Rejected',
      humanStatus: 'Rejected',
    });
  },

  /**
   * unpublishReport — removes a published report from external distribution.
   * Calls the GateX unpublish abstraction layer on the backend.
   * The report is moved to Rejected status (used as the "unpublished" tab for now).
   */
  async unpublishReport(reportId: string): Promise<{ message: string; actionRequired?: string }> {
    const { publishService } = await import('./publish.service');
    return publishService.unpublish(reportId);
  },
};
