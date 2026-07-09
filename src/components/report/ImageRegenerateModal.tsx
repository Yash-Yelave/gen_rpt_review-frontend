import React, { useState } from 'react';
import { Loader2, Check, X, Wand2, AlertCircle } from 'lucide-react';
import { imagesService } from '../../services/images.service';

interface Props {
  reportId: string;
  imageKey: string;
  currentUrl: string;
  onClose: () => void;
  onReplaced: (newUrl: string) => void;
}

export const ImageRegenerateModal: React.FC<Props> = ({
  reportId,
  imageKey,
  currentUrl,
  onClose,
  onReplaced,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a briefing for the AI to generate an image.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const data = await imagesService.regenerateImage(reportId, imageKey, prompt);
      setSuccess(true);
      onReplaced(data.url);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Regenerate Exhibit Visual</h2>
              <p className="text-xs text-gray-500 font-medium">Use AI to generate a new replacement image</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading || success}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
          
          {/* Current Image */}
          <div className="flex-1 flex flex-col gap-3">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Current Target
              <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{imageKey}</span>
            </span>
            <div className="relative aspect-[4/3] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
              <img 
                src={currentUrl} 
                alt="Current" 
                className="max-w-full max-h-full object-contain opacity-80"
              />
            </div>
          </div>

          {/* AI Briefing */}
          <div className="flex-1 flex flex-col gap-3">
            <span className="text-sm font-semibold text-gray-700">Image Generation Briefing</span>
            <div className="relative aspect-[4/3] flex flex-col">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isUploading || success}
                placeholder="Describe the image you want the AI to generate..."
                className="flex-1 w-full p-4 text-sm bg-gray-50 border border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          
        </div>

        {/* Error State */}
        {error && (
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading || success}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleRegenerate}
            disabled={!prompt.trim() || isUploading || success}
            className={`
              flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all
              ${success ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating AI Image...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                Regenerated & Replaced!
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate & Replace
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
