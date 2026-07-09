// src/components/report/ImageReplaceOverlay.tsx
// Renders a hover-activated "Replace Image" overlay on each image card
// in the Report Exhibits gallery. Follows the same UX pattern as AIEditingToolbar:
//   - Hidden by default, appears on group-hover
//   - Shows a loading spinner while uploading
//   - Shows a success tick on completion
//
// On success it calls onReplaced(newUrl) so ReportPreview can update
// the <img> src locally without a full page reload.

import React, { useRef, useState } from 'react';
import { Upload, Loader2, Check, AlertCircle } from 'lucide-react';

interface ImageReplaceOverlayProps {
  reportId: string;
  imageKey: string;
  onReplaced: (newUrl: string) => void;
}

export const ImageReplaceOverlay: React.FC<ImageReplaceOverlayProps> = ({
  reportId,
  imageKey,
  onReplaced,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      const { imagesService } = await import('@/services/images.service');
      const result = await imagesService.replaceImage(reportId, imageKey, file);
      onReplaced(result.url);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Upload failed');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      // Reset the input so the same file can be chosen again if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Hidden native file input — PNG/JPG only */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={handleFileChange}
      />

      {/* Overlay — only visible on group-hover via Tailwind */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg">
        {status === 'idle' && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold rounded-md shadow-md transition-colors"
            title="Replace this image"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Replace Image
          </button>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/90 text-gray-700 text-xs font-medium rounded-md shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Uploading…
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50/95 text-green-700 text-xs font-semibold rounded-md shadow-md border border-green-200">
            <Check className="w-4 h-4" />
            Image replaced!
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50/95 text-red-700 text-xs font-semibold rounded-md shadow-md border border-red-200 max-w-[180px] text-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </div>
        )}
      </div>
    </>
  );
};
