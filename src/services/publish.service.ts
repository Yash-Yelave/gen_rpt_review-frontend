// src/services/publish.service.ts
// Replaces the in-memory mockData-backed implementation with
// FastAPI backend calls.
// Public interface is IDENTICAL to the previous mock.

import type { PublishRecord } from '@/types';
import { api } from '@/api/client';

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
    const res = await api.post(`/reports/${reportId}/status`, {
      status: 'Published',
      publishReady: true,
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
   * Currently returns an empty array. A future iteration can fetch publish history.
   */
  async getPublishLog(): Promise<PublishRecord[]> {
    return [];
  },
};
