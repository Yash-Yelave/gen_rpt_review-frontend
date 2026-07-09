// src/components/report/ImageReplaceModal.tsx
import React, { useRef, useState } from 'react';
import { Upload, Loader2, Check, X, AlertCircle } from 'lucide-react';

interface Props {
  reportId: string;
  imageKey: string;
  currentUrl: string;
  onClose: () => void;
  onReplaced: (newUrl: string) => void;
}

export const ImageReplaceModal: React.FC<Props> = ({
  reportId,
  imageKey,
  currentUrl,
  onClose,
  onReplaced,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selected file must be an image (PNG, JPG, or JPEG).');
      setStatus('error');
      return;
    }
    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size must be smaller than 10MB.');
      setStatus('error');
      return;
    }

    setSelectedFile(file);
    setNewImagePreview(URL.createObjectURL(file));
    setStatus('idle');
    setErrorMsg('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const { imagesService } = await import('@/services/images.service');
      const result = await imagesService.replaceImage(reportId, imageKey, selectedFile);
      onReplaced(result.url);
      setStatus('success');
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to replace image.');
      setStatus('error');
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Replace Exhibit Visual"
    >
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Replace Exhibit Visual</h2>
            <p className="text-xs text-gray-500 mt-0.5">Exhibit Key: <span className="font-mono text-blue-600">{imageKey}</span></p>
          </div>
          <button
            onClick={onClose}
            disabled={status === 'loading'}
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          {status === 'error' && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-lg text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-green-800">Exhibit Visual Replaced Successfully!</p>
              <p className="text-xs text-green-600">The report viewer and subsequent PDF releases are updated.</p>
            </div>
          )}

          {status !== 'success' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Current Image */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Current Image</span>
                <div className="aspect-[4/3] border border-gray-100 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-inner">
                  <img
                    src={currentUrl}
                    alt="Current Exhibit"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Right Column: Upload/Preview Area */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {selectedFile ? 'New Image Preview' : 'Select New Image'}
                </span>
                
                {selectedFile ? (
                  <div className="relative aspect-[4/3] border border-blue-200 bg-blue-50/10 rounded-lg overflow-hidden flex items-center justify-center p-2 group">
                    <img
                      src={newImagePreview}
                      alt="New Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setNewImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity shadow"
                      title="Clear Selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Selected file info card inside overlay on hover */}
                    <div className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-gray-100 px-3 py-2 text-[11px] text-gray-500 flex justify-between items-center">
                      <span className="font-semibold text-gray-700 truncate max-w-[130px]">{selectedFile.name}</span>
                      <span className="font-mono text-gray-400">{formatSize(selectedFile.size)}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-400 text-gray-400 hover:bg-gray-50/50'
                    }`}
                  >
                    <Upload className={`w-8 h-8 mb-2 transition-transform duration-200 ${isDragOver ? 'scale-110 text-blue-600' : 'text-gray-300'}`} />
                    <span className="text-xs font-semibold text-gray-700 hover:text-blue-700">Drag & Drop Image</span>
                    <span className="text-[10px] text-gray-400 mt-1">or click to browse from device</span>
                    <span className="text-[9px] text-gray-400 mt-2 font-mono">PNG, JPG, JPEG up to 10MB</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  hidden
                  onChange={handleFileSelect}
                />
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={onClose}
              disabled={status === 'loading'}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || status === 'loading'}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Replacing Image…
                </>
              ) : (
                'Upload & Replace'
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
