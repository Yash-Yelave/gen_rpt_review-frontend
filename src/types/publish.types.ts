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

/**
 * Metadata returned by POST /api/v1/pdf-release/{id}/preview.
 * Used to populate the PdfReleasePreviewModal before confirming publication.
 */
export interface PdfReleasePreview {
  /** Unique ID of the PdfRelease DB record */
  pdfReleaseId: string;
  /** Monotonically increasing PDF version number for this document (1, 2, 3 …) */
  versionNumber: number;
  /** True = freshly generated, False = reused from existing R2 artifact */
  isNew: boolean;
  /** Presigned R2 URL for rendering the PDF (valid 1 hour) */
  previewUrl: string;
  /** File size in bytes */
  fileSizeBytes: number;
  /** ISO 8601 generation timestamp */
  generatedAt: string;
  /** SHA-256 checksum of the HTML used to generate */
  htmlChecksum: string;
  /** Human-readable document version label (e.g. "1.2", "v5") */
  documentVersion: string;
  /** 'generated' | 'reused' */
  status: 'generated' | 'reused';
}


