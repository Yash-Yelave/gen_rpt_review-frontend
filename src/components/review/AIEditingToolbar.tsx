// src/components/review/AIEditingToolbar.tsx
import React, { useState } from 'react';
import { Sparkles, Maximize2, RotateCw, Loader2, Check } from 'lucide-react';
import { api } from '@/api/client';

interface Props {
  paragraphId: string;
  currentText: string;
}

export const AIEditingToolbar: React.FC<Props> = ({ paragraphId, currentText }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleAction = async (action: string) => {
    setStatus('loading');
    try {
      // Send the editing request to the FastAPI backend
      await api.post('/reports/edit', {
        action,
        paragraphId,
        text: currentText,
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(`AI ${action} failed:`, err);
      setStatus('idle');
    }
  };

  if (status === 'loading') {
    return (
      <div className="absolute -top-10 left-0 bg-white border border-gray-200 shadow-lg rounded-lg p-2 flex items-center gap-2 text-sm text-gray-500 z-10 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        Processing...
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="absolute -top-10 left-0 bg-green-50 border border-green-200 shadow-lg rounded-lg p-2 flex items-center gap-2 text-sm text-green-700 z-10">
        <Check className="w-4 h-4" />
        Edit queued
      </div>
    );
  }

  return (
    <div className="absolute -top-10 left-0 bg-white border border-gray-200 shadow-lg rounded-lg flex items-center divide-x divide-gray-100 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={() => handleAction('rewrite')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
        title="Rewrite text"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Rewrite
      </button>
      <button 
        onClick={() => handleAction('expand')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
        title="Expand text"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        Expand
      </button>
      <button 
        onClick={() => handleAction('regenerate')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors"
        title="Regenerate this segment completely"
      >
        <RotateCw className="w-3.5 h-3.5" />
        Regenerate
      </button>
    </div>
  );
};
