// src/services/publish.service.ts
// Handles publishing and unpublishing via the GateX backend endpoints.
// The publish flow calls POST /api/v1/publish/{id} which orchestrates:
//   1. Eligibility check
//   2. PDF + cover image upload via GateX presigned URLs
//   3. Metadata submission to GateX bulk API
//   4. External ID storage in Supabase
//   5. Status update to 'Published'
//
// When GATEX_ENABLE_PUBLISHING=false on the backend (default/dev mode),
// the endpoint falls back to a status-only update via the R2 Cloudflare function
// so the frontend publish flow ALWAYS works regardless of GateX configuration.

import type { PublishRecord } from '@/types';
import { api } from '@/api/client';

/**
 * Attempts to publish via the GateX backend pipeline.
 * Falls back to a direct status update if the backend publish endpoint is unavailable.
 */
async function publishViaBackend(reportId: string): Promise<{ ok: boolean; externalReportId?: number; publishStatus?: string }> {
  try {
    const res = await api.post(`/publish/${reportId}`);
    if (res.ok) {
      const body = await res.json();
      return {
        ok: true,
        externalReportId: body?.data?.external_report_id,
        publishStatus: body?.data?.publish_status,
      };
    }
    // Backend returned an error — log and fall through to fallback
    console.warn(`[publishService] Backend publish endpoint returned ${res.status}. Falling back to status update.`);
    return { ok: false };
  } catch (err) {
    console.warn('[publishService] Backend publish endpoint unreachable:', err);
    return { ok: false };
  }
}

/**
 * Fallback: marks the report as Published via the R2 Cloudflare status endpoint.
 * This is used when the backend GateX pipeline is disabled or unavailable.
 */
async function publishViaStatusFallback(reportId: string): Promise<void> {
  const res = await api.post(`/reports/${reportId}/status`, {
    status: 'Published',
    humanStatus: 'Published',
    publishReady: true,
  });
  if (!res.ok) {
    throw new Error(`Publish status update failed (${res.status})`);
  }
}

export const publishService = {
  /**
   * Publishes a report.
   * 1. Tries the GateX backend pipeline (POST /api/v1/publish/{id}).
   * 2. If that fails or is disabled, falls back to a direct R2 status update.
   * Either way, the report ends up with status = 'Published' in the system.
   */
  async publish(
    reportId: string,
    publishedBy: string,
    version: string
  ): Promise<PublishRecord> {
    const backendResult = await publishViaBackend(reportId);

    if (!backendResult.ok) {
      // Fallback path: update status directly via Cloudflare R2 function
      await publishViaStatusFallback(reportId);
    }

    const record: PublishRecord = {
      reportId,
      publishedAt: new Date().toISOString(),
      publishedBy,
      version,
      externalReportId: backendResult.externalReportId,
      publishStatus: backendResult.publishStatus ?? 'published',
    };
    return record;
  },

  /**
   * Unpublishes a report.
   * 1. Calls POST /api/v1/unpublish/{id} on the backend (GateX abstraction layer).
   * 2. Falls back to setting status = 'Rejected' via R2 status update if backend is down.
   * The report ends up in the Rejected tab (used as unpublished tab for now).
   */
  async unpublish(reportId: string): Promise<{ message: string; actionRequired?: string }> {
    try {
      const res = await api.post(`/unpublish/${reportId}`);
      if (res.ok) {
        const body = await res.json();
        return {
          message: body?.data?.message ?? 'Report unpublished.',
          actionRequired: body?.data?.action_required,
        };
      }
      console.warn(`[publishService] Backend unpublish returned ${res.status}. Using fallback.`);
    } catch (err) {
      console.warn('[publishService] Backend unpublish unreachable:', err);
    }

    // Fallback: set status to Rejected so it appears in Rejected tab
    const res = await api.post(`/reports/${reportId}/status`, {
      status: 'Rejected',
      humanStatus: 'Rejected',
      publishReady: false,
    });
    if (!res.ok) {
      throw new Error(`Unpublish status update failed (${res.status})`);
    }
    return { message: 'Report moved to Rejected (unpublished). No external GateX API call was made.' };
  },

  /**
   * Gets the current publish status from the backend.
   */
  async getPublishStatus(reportId: string): Promise<{
    publishStatus: string;
    externalReportId?: number;
    publishedAt?: string;
  } | null> {
    try {
      const res = await api.get(`/publish/${reportId}/status`);
      if (res.ok) {
        const body = await res.json();
        return {
          publishStatus: body?.data?.publish_status ?? 'unknown',
          externalReportId: body?.data?.external_report_id,
          publishedAt: body?.data?.published_at,
        };
      }
    } catch {
      // Status check is optional — swallow errors
    }
    return null;
  },

  /**
   * Returns the publish log.
   * Fetches from the backend history endpoint, falls back to empty array.
   */
  async getPublishLog(): Promise<PublishRecord[]> {
    try {
      const res = await api.get('/publish/history');
      if (res.ok) {
        const body = await res.json();
        return (body?.data ?? []).map((r: any) => ({
          reportId: r.document_id,
          publishedAt: r.published_at ?? r.created_at,
          publishedBy: r.published_by ?? 'system',
          version: 'v1',
          externalReportId: r.external_report_id,
          publishStatus: r.publish_status,
        }));
      }
    } catch {
      // Fall through to empty
    }
    return [];
  },
};
