// src/pages/Knowledge/CollectionsList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeApiService } from '@/services/knowledgeApi';
import type { KnowledgeCollection } from '@/types/knowledge.types';
import { 
  Database, 
  Loader2, 
  Plus, 
  Folder, 
  Archive, 
  Eye,
  Trash2,
  Lock,
  Globe,
  Users
} from 'lucide-react';
import { formatBytes } from '@/utils/formatters';

export const CollectionsList: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColSlug, setNewColSlug] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColVisibility, setNewColVisibility] = useState('private');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await knowledgeApiService.listCollections();
      // Fetch stats for each collection
      const enriched = await Promise.all(
        data.map(async (c) => {
          try {
            const stats = await knowledgeApiService.getCollectionStats(c.id);
            return {
              ...c,
              document_count: stats.document_count || 0,
              total_size_bytes: stats.total_size_bytes || 0,
            };
          } catch {
            return c;
          }
        })
      );
      setCollections(enriched);
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleNameChange = (val: string) => {
    setNewColName(val);
    // Auto slugify
    setNewColSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim() || !newColSlug.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await knowledgeApiService.createCollection({
        name: newColName,
        slug: newColSlug,
        description: newColDesc,
        visibility: newColVisibility
      });
      setShowCreateModal(false);
      setNewColName('');
      setNewColSlug('');
      setNewColDesc('');
      setNewColVisibility('private');
      fetchCollections();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create collection. Name or Slug may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'archived') {
        await knowledgeApiService.restoreCollection(id);
      } else {
        await knowledgeApiService.archiveCollection(id);
      }
      fetchCollections();
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this collection? This action is irreversible.')) return;
    try {
      await knowledgeApiService.deleteCollection(id);
      fetchCollections();
    } catch (err) {
      console.error('Failed to delete collection', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Knowledge Collections</h1>
            <p className="text-sm text-gray-500">Manage reusable domains and directories for AI knowledge</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Folder className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No collections found</h3>
            <p className="text-sm text-gray-500 mt-1">Create a collection to get started uploading documents.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Visibility</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Documents</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Size</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{col.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{col.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      {col.visibility === 'private' && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                      {col.visibility === 'shared' && <Users className="w-3.5 h-3.5 text-blue-500" />}
                      {col.visibility === 'public' && <Globe className="w-3.5 h-3.5 text-green-500" />}
                      <span className="capitalize">{col.visibility}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {col.document_count ?? 0}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatBytes(col.total_size_bytes || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      col.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {col.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/knowledge/documents?collection_id=${col.id}`)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                        title="View Documents"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(col.id, col.status)}
                        className={`p-1.5 rounded transition-colors ${
                          col.status === 'archived'
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-orange-500 hover:bg-orange-50'
                        }`}
                        title={col.status === 'archived' ? 'Restore' : 'Archive'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
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

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create Knowledge Collection</h2>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newColName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Health Economics"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={newColSlug}
                    onChange={(e) => setNewColSlug(e.target.value)}
                    placeholder="health-economics"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    placeholder="Brief description of the collection's knowledge scope..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Visibility
                  </label>
                  <select
                    value={newColVisibility}
                    onChange={(e) => setNewColVisibility(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="private">Private (Only You)</option>
                    <option value="shared">Shared (Team Members)</option>
                    <option value="public">Public (Everyone)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
