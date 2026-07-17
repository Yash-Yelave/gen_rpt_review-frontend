// src/pages/Knowledge/DocumentsList.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { knowledgeApiService } from '@/services/knowledgeApi';
import type { KnowledgeCollection, KnowledgeDocument, DocumentVersion } from '@/types/knowledge.types';
import { 
  FileText, 
  Loader2, 
  RefreshCw, 
  ArrowLeft, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { formatDate, formatBytes } from '@/utils/formatters';

export const DocumentsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selectedColId, setSelectedColId] = useState(searchParams.get('collection_id') || '');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  
  // Modals / Actions states
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [activeDoc, setActiveDoc] = useState<KnowledgeDocument | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [rollbackSubmitting, setRollbackSubmitting] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');
  
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCollections = async () => {
    try {
      const data = await knowledgeApiService.listCollections();
      setCollections(data);
      if (data.length > 0 && !selectedColId) {
        setSelectedColId(data[0].id);
        setSearchParams({ collection_id: data[0].id });
      }
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!selectedColId) return;
    setLoading(true);
    try {
      const data = await knowledgeApiService.listDocuments(selectedColId);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedColId) {
      fetchDocuments();
    }
  }, [selectedColId]);

  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedColId(val);
    setSearchParams({ collection_id: val });
  };

  const handleReindex = async (id: string) => {
    try {
      await knowledgeApiService.reindexDocument(id);
      alert('Document queued for re-indexing.');
      fetchDocuments();
    } catch (err) {
      console.error('Failed to reindex', err);
      alert('Failed to queue re-indexing.');
    }
  };

  const openRollbackModal = async (doc: KnowledgeDocument) => {
    setActiveDoc(doc);
    setShowRollbackModal(true);
    setVersionsLoading(true);
    try {
      const data = await knowledgeApiService.getDocumentVersions(doc.id);
      setVersions(data);
    } catch (err) {
      console.error('Failed to load document versions', err);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleRollback = async (targetVersion: number) => {
    if (!activeDoc) return;
    setRollbackSubmitting(true);
    try {
      await knowledgeApiService.rollbackDocument(activeDoc.id, targetVersion, rollbackReason);
      setShowRollbackModal(false);
      setRollbackReason('');
      fetchDocuments();
      alert('Document rolled back and re-queued for processing.');
    } catch (err) {
      console.error('Failed rollback', err);
      alert('Failed to rollback document version.');
    } finally {
      setRollbackSubmitting(false);
    }
  };

  const openArchiveModal = (doc: KnowledgeDocument) => {
    setActiveDoc(doc);
    setShowArchiveModal(true);
  };

  const handleArchive = async () => {
    if (!activeDoc) return;
    setArchiveSubmitting(true);
    try {
      await knowledgeApiService.archiveDocument(activeDoc.id, archiveReason);
      setShowArchiveModal(false);
      setArchiveReason('');
      fetchDocuments();
    } catch (err) {
      console.error('Failed to archive', err);
      alert('Failed to archive document.');
    } finally {
      setArchiveSubmitting(false);
    }
  };

  // Filtered documents list
  const filteredDocs = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Documents</h1>
            <p className="text-sm text-gray-500">Manage, version, and index files in your knowledge collections</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedColId && (
            <button
              onClick={() => navigate(`/knowledge/upload?collection_id=${selectedColId}`)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          )}
        </div>
      </div>

      {/* Select collection and Search bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Selected Collection
          </label>
          {collectionsLoading ? (
            <div className="flex items-center text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading collections...
            </div>
          ) : (
            <select
              value={selectedColId}
              onChange={handleCollectionChange}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {collections.map(col => (
                <option key={col.id} value={col.id}>{col.name} ({col.status})</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Search Files
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter files by name..."
              className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No documents found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? 'Try adjusting your search filter.' : 'Upload a document to this collection to start.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Filename</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Version</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Validation</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Size</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Created At</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 truncate max-w-xs md:max-w-sm" title={doc.file_name}>
                      {doc.file_name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 uppercase">{doc.extension}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">v{doc.version}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.processing_status === 'completed' ? 'bg-green-50 text-green-700' :
                      doc.processing_status === 'failed' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {doc.processing_status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {doc.processing_status === 'failed' && <XCircle className="w-3 h-3" />}
                      {doc.processing_status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span className="capitalize">{doc.processing_status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      doc.validation_status === 'validated' ? 'bg-emerald-50 text-emerald-700' :
                      doc.validation_status === 'failed' ? 'bg-rose-50 text-rose-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {doc.validation_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatBytes(doc.size)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(doc.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleReindex(doc.id)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                        title="Reindex"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openRollbackModal(doc)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-gray-100 rounded transition-colors"
                        title="Rollback"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openArchiveModal(doc)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Archive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rollback Version Modal */}
      {showRollbackModal && activeDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Rollback Document Version</h2>
              <p className="text-xs text-gray-500 mt-1 truncate">File: {activeDoc.file_name}</p>
            </div>
            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              {versionsLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : versions.length <= 1 ? (
                <div className="text-center py-6 text-sm text-gray-500">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  No previous versions exist to rollback to.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Select target version:
                  </label>
                  {versions
                    .filter(v => v.version !== activeDoc.version)
                    .map((v) => (
                      <div 
                        key={v.id} 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => handleRollback(v.version)}
                      >
                        <div>
                          <div className="font-semibold text-sm text-gray-900">Version {v.version}</div>
                          <div className="text-xs text-gray-500">{formatDate(v.created_at)}</div>
                        </div>
                        <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          Rollback
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Reason Modal */}
      {showArchiveModal && activeDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Archive Document</h2>
              <p className="text-xs text-gray-500 mt-1 truncate">File: {activeDoc.file_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Reason for archiving (optional)
                </label>
                <textarea
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder="e.g. Content is outdated, duplicated, or superseded"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={archiveSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {archiveSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Archive Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
