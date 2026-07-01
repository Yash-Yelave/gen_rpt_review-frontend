// src/types/publish.types.ts

export interface PublishRecord {
  reportId: string;
  publishedAt: string;
  publishedBy: string;
  version: string;
  /** External GateX report ID — set when GATEX_ENABLE_PUBLISHING=true */
  externalReportId?: number;
  /** GateX publish pipeline status (e.g. 'external_sync_pending', 'published') */
  publishStatus?: string;
}

