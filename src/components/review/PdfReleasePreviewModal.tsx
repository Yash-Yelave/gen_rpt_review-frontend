// src/components/review/PdfReleasePreviewModal.tsx
// ---------------------------------------------------------------------------
// PDF Release Preview Modal
// ---------------------------------------------------------------------------
// Intercepts the Publish flow to show a versioned PDF preview before
// the user confirms publication. This modal is rendered as a fixed overlay
// on the current page — no new routes, no page navigation.
//
// Props:
//   report       — the current Report object (for title / version display)
//   preview      — PdfReleasePreview metadata returned by the backend
//   onPublish    — async callback that calls the EXISTING publish pipeline
//   onCancel     — callback that closes the modal (PDF stays in R2)
//   isPublishing — true while the existing publish pipeline is in flight
// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  RefreshCw,
  X,
  Send,
  Loader2,
  ShieldCheck,
  Info,
  Clock,
  HardDrive,
  Hash,
} from 'lucide-react';
import type { PdfReleasePreview } from '@/types';
import type { Report } from '@/types';

interface Props {
  report: Report;
  preview: PdfReleasePreview;
  onPublish: () => Promise<void>;
  onCancel: () => void;
  isPublishing: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export const PdfReleasePreviewModal: React.FC<Props> = ({
  report,
  preview,
  onPublish,
  onCancel,
  isPublishing,
}) => {
  const [pdfLoadError, setPdfLoadError] = useState(false);

  const handlePublish = async () => {
    await onPublish();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="PDF Release Preview"
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col"
        style={{ width: 'min(92vw, 1100px)', maxHeight: '92vh' }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">PDF Release Preview</h2>
                {/* Generated vs Reused badge */}
                {preview.isNew ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold">
                    <RefreshCw className="w-2.5 h-2.5" /> Newly Generated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Reused · No Changes
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{report.title}</p>
            </div>
          </div>
          <button
            id="pdf-preview-modal-close"
            onClick={onCancel}
            disabled={isPublishing}
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body: PDF viewer + metadata sidebar ──────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left: PDF iframe */}
          <div className="flex-1 bg-gray-50 border-r border-gray-100 flex flex-col min-w-0">
            {preview.previewUrl && !pdfLoadError ? (
              <iframe
                id="pdf-preview-frame"
                src={preview.previewUrl}
                title="PDF Preview"
                className="flex-1 w-full border-none"
                style={{ minHeight: '0' }}
                onError={() => setPdfLoadError(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                {pdfLoadError ? (
                  <>
                    <p className="text-sm font-medium text-gray-600">Could not embed PDF preview</p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      The presigned URL may have expired or your browser blocked inline PDF rendering.
                    </p>
                    <a
                      href={preview.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      Open PDF in new tab ↗
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">No preview URL available</p>
                    <p className="text-xs text-gray-400">
                      PDF was generated but the preview URL could not be loaded.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Metadata sidebar */}
          <div className="w-64 flex-shrink-0 overflow-y-auto bg-white p-5 flex flex-col gap-5">

            {/* Publication readiness */}
            <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-800">Ready to publish</p>
                <p className="text-[10px] text-green-700 mt-0.5 leading-relaxed">
                  This PDF is the exact release candidate that will be sent to GateX.
                </p>
              </div>
            </div>

            {/* PDF Version */}
            <MetaRow icon={<FileText className="w-3.5 h-3.5" />} label="PDF Version">
              <span className="font-mono text-blue-700 font-semibold">v{preview.versionNumber}</span>
            </MetaRow>

            {/* Document Version */}
            <MetaRow icon={<Info className="w-3.5 h-3.5" />} label="Document Version">
              <span className="font-mono">{preview.documentVersion}</span>
            </MetaRow>

            {/* Generated at */}
            <MetaRow icon={<Clock className="w-3.5 h-3.5" />} label="Generated">
              <span className="text-[10px] leading-relaxed">{formatDate(preview.generatedAt)}</span>
            </MetaRow>

            {/* File size */}
            <MetaRow icon={<HardDrive className="w-3.5 h-3.5" />} label="File Size">
              <span>{formatBytes(preview.fileSizeBytes)}</span>
            </MetaRow>

            {/* Checksum */}
            <MetaRow icon={<Hash className="w-3.5 h-3.5" />} label="HTML Checksum">
              <span
                className="font-mono text-[9px] text-gray-500 break-all"
                title={preview.htmlChecksum}
              >
                {preview.htmlChecksum.slice(0, 16)}…
              </span>
            </MetaRow>

            {/* Sync Status */}
            <MetaRow icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Sync Status">
              <span className="text-green-700 font-medium">Synchronized</span>
            </MetaRow>

            {/* Info note */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-500 leading-relaxed">
              <strong className="text-gray-700">Cancel</strong> will close this preview without publishing.
              The PDF will remain stored in R2 and reused on the next publish attempt if the content has not changed.
            </div>
          </div>
        </div>

        {/* ── Footer: two actions only ──────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          {/* Cancel */}
          <button
            id="pdf-preview-cancel-btn"
            onClick={onCancel}
            disabled={isPublishing}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            Cancel
          </button>

          {/* Publish — calls existing pipeline */}
          <button
            id="pdf-preview-publish-btn"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish to GateX
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Small helper for sidebar metadata rows
// ---------------------------------------------------------------------------
const MetaRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
      <span className="text-gray-400">{icon}</span>
      {label}
    </div>
    <div className="text-xs text-gray-700 pl-5">{children}</div>
  </div>
);
