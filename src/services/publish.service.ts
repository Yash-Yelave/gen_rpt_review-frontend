// src/services/publish.service.ts
// Replaces the in-memory mockData-backed implementation with
// Cloudflare Pages Function API calls backed by R2 storage.
// Public interface is IDENTICAL to the previous mock.

import type { PublishRecord } from '@/types';

export const publishService = {
  /**
   * Publishes a report by setting status = 'Published' and publishReady = true.
   * Returns a PublishRecord for the publish log.
   */
  async publish(
    reportId: string,
    publishedBy: string,
    version: string
  ): Promise<PublishRecord> {
    const res = await fetch(`/api/reports/${reportId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Published',
        publishReady: true,
      }),
    });
    if (!res.ok) {
      throw new Error(`Publish failed (${res.status})`);
    }

    const record: PublishRecord = {
      reportId,
      publishedAt: new Date().toISOString(),
      publishedBy,
      version,
    };
    return record;
  },

  /**
   * Returns the publish log.
   * Currently returns an empty array — publish history is not yet
   * persisted to R2.  A future iteration can store publish-log.json.
   */
  async getPublishLog(): Promise<PublishRecord[]> {
    return [];
  },
};
