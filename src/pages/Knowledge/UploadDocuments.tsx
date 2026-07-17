// src/pages/Knowledge/UploadDocuments.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { knowledgeApiService } from '@/services/knowledgeApi';
import type { KnowledgeCollection } from '@/types/knowledge.types';
import { 
  UploadCloud, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertTriangle,
  Database,
  ArrowRight
} from 'lucide-react';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  error?: string;
  docId?: string;
}

export const UploadDocuments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selectedColId, setSelectedColId] = useState(searchParams.get('collection_id') || '');
  const [loading, setLoading] = useState(true);
  
  const [duplicateStrategy, setDuplicateStrategy] = useState('skip'); // skip or new_version
  const [fileList, setFileList] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchCols = async () => {
      try {
        const data = await knowledgeApiService.listCollections();
        setCollections(data);
        if (data.length > 0 && !selectedColId) {
          setSelectedColId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCols();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const allowedExtensions = ['.pdf', '.md', '.docx', '.txt', '.html'];
    const newFiles: FileUploadState[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        alert(`Unsupported file type: ${file.name}. Only PDF, Markdown, Word, Text, and HTML are allowed.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Max allowed size is 50MB.`);
        continue;
      }
      newFiles.push({
        file,
        progress: 0,
        status: 'pending'
      });
    }

    setFileList(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const uploadSingleFile = (index: number) => {
    const item = fileList[index];
    if (!item || item.status === 'uploading' || item.status === 'success') return;

    // Update status to uploading
    setFileList(prev => {
      const copy = [...prev];
      copy[index].status = 'uploading';
      copy[index].progress = 0;
      return copy;
    });

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', item.file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setFileList(prev => {
          const copy = [...prev];
          if (copy[index]) copy[index].progress = pct;
          return copy;
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText);
          setFileList(prev => {
            const copy = [...prev];
            if (copy[index]) {
              copy[index].status = 'success';
              copy[index].progress = 100;
              copy[index].docId = body.data?.document_id;
            }
            return copy;
          });
        } catch {
          setFileList(prev => {
            const copy = [...prev];
            if (copy[index]) copy[index].status = 'success';
            return copy;
          });
        }
      } else {
        let msg = 'Upload failed';
        try {
          const errBody = JSON.parse(xhr.responseText);
          msg = errBody.detail || errBody.message || msg;
        } catch {}
        setFileList(prev => {
          const copy = [...prev];
          if (copy[index]) {
            copy[index].status = 'failed';
            copy[index].error = msg;
          }
          return copy;
        });
      }
    });

    xhr.addEventListener('error', () => {
      setFileList(prev => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index].status = 'failed';
          copy[index].error = 'Network error';
        }
        return copy;
      });
    });

    const token = useAuthStore.getState().token;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    xhr.open('POST', `${baseUrl}/knowledge/documents/upload?collection_id=${selectedColId}&duplicate_strategy=${duplicateStrategy}`);
    if (token) {
      xhr.setRequestHeader('Authorization', token);
    }
    xhr.send(formData);
  };

  const startUploads = () => {
    if (!selectedColId) {
      alert('Please select a collection first.');
      return;
    }
    fileList.forEach((_, index) => {
      uploadSingleFile(index);
    });
  };

  const clearQueue = () => {
    setFileList([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Upload Documents</h1>
          <p className="text-sm text-gray-500">Add original knowledge documents to your collection for retrieval & validation</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Collection & Strategy Selectors */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Target Collection
            </label>
            {loading ? (
              <div className="flex items-center text-gray-500 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              <select
                value={selectedColId}
                onChange={(e) => setSelectedColId(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {collections.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Duplicate Detection Strategy
            </label>
            <select
              value={duplicateStrategy}
              onChange={(e) => setDuplicateStrategy(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="skip">Skip (Avoid Duplicates)</option>
              <option value="new_version">Create New Version</option>
            </select>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Drag & Drop Files Here</h3>
          <p className="text-xs text-gray-400 mb-4">Supported formats: PDF, Markdown, DOCX, TXT, HTML (Max 50MB)</p>
          <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm transition-colors">
            Browse Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.md,.docx,.txt,.html"
            />
          </label>
        </div>

        {/* Files Queue */}
        {fileList.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Upload Queue ({fileList.length} files)</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearQueue}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 border border-gray-300 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Clear Queue
                </button>
                <button
                  onClick={startUploads}
                  className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-sm"
                >
                  Start Uploads
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 p-4 space-y-4">
              {fileList.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 py-1">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate" title={item.file.name}>
                        {item.file.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatBytes(item.file.size)}
                      </div>
                      {/* Progress Bar */}
                      {item.status === 'uploading' && (
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.status === 'failed' && (
                        <div className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {item.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {item.status === 'pending' && (
                      <span className="text-xs text-gray-400 font-semibold px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full">
                        Queued
                      </span>
                    )}
                    {item.status === 'uploading' && (
                      <span className="text-xs text-blue-600 font-semibold px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {item.progress}%
                      </span>
                    )}
                    {item.status === 'success' && (
                      <span className="text-xs text-green-700 font-semibold px-2.5 py-1 bg-green-50 border border-green-100 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-xs text-red-700 font-semibold px-2.5 py-1 bg-red-50 border border-red-100 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
