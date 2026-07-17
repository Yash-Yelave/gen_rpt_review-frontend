// src/services/knowledgeApi.ts
import { api, apiClient } from '@/api/client';
import type { 
  KnowledgeCollection, 
  KnowledgeDocument, 
  DocumentVersion,
  QueueJob
} from '@/types/knowledge.types';

export const knowledgeApiService = {
  // Collections CRUD
  async listCollections(): Promise<KnowledgeCollection[]> {
    const res = await api.get('/knowledge/collections');
    const body = await res.json();
    return (body.data || []) as KnowledgeCollection[];
  },

  async getCollection(id: string): Promise<KnowledgeCollection> {
    const res = await api.get(`/knowledge/collections/${id}`);
    const body = await res.json();
    return body.data as KnowledgeCollection;
  },

  async createCollection(payload: { name: string; slug: string; description?: string; visibility?: string }): Promise<KnowledgeCollection> {
    const res = await api.post('/knowledge/collections', payload);
    const body = await res.json();
    return body.data as KnowledgeCollection;
  },

  async updateCollection(id: string, payload: { description?: string; visibility?: string }): Promise<KnowledgeCollection> {
    const res = await api.put(`/knowledge/collections/${id}`, payload); // backend uses PATCH/PUT
    const body = await res.json();
    return body.data as KnowledgeCollection;
  },

  async deleteCollection(id: string): Promise<void> {
    await api.delete(`/knowledge/collections/${id}`);
  },

  async archiveCollection(id: string): Promise<KnowledgeCollection> {
    const res = await api.post(`/knowledge/collections/${id}/archive`);
    const body = await res.json();
    return body.data as KnowledgeCollection;
  },

  async restoreCollection(id: string): Promise<KnowledgeCollection> {
    const res = await api.post(`/knowledge/collections/${id}/restore`);
    const body = await res.json();
    return body.data as KnowledgeCollection;
  },

  async getCollectionStats(id: string): Promise<any> {
    const res = await api.get(`/knowledge/collections/${id}/stats`);
    const body = await res.json();
    return body.data;
  },

  // Documents
  async listDocuments(collectionId: string): Promise<KnowledgeDocument[]> {
    const res = await api.get(`/knowledge/documents/collection/${collectionId}`);
    const body = await res.json();
    return (body.data || []) as KnowledgeDocument[];
  },

  async getDocument(id: string): Promise<KnowledgeDocument> {
    const res = await api.get(`/knowledge/documents/${id}`);
    const body = await res.json();
    return body.data as KnowledgeDocument;
  },

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    const res = await api.get(`/knowledge/documents/${id}/versions`);
    const body = await res.json();
    return (body.data || []) as DocumentVersion[];
  },

  async uploadDocument(collectionId: string, file: File, duplicateStrategy = 'skip'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient(
      `/knowledge/documents/upload?collection_id=${collectionId}&duplicate_strategy=${duplicateStrategy}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const body = await res.json();
    return body.data;
  },

  async replaceDocumentVersion(documentId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient(`/knowledge/documents/${documentId}/version`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json();
    return body.data;
  },

  async archiveDocument(documentId: string, reason?: string): Promise<void> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    await api.delete(`/knowledge/documents/${documentId}${query}`);
  },

  async reindexDocument(documentId: string, priority = 1): Promise<any> {
    const res = await api.post(`/knowledge/lifecycle/documents/${documentId}/reindex`, { priority });
    const body = await res.json();
    return body.data;
  },

  async rollbackDocument(documentId: string, targetVersion: number, reason?: string): Promise<any> {
    const res = await api.post(`/knowledge/lifecycle/documents/${documentId}/rollback`, {
      target_version: targetVersion,
      reason
    });
    const body = await res.json();
    return body.data;
  },

  // Queue
  async getQueueStatus(): Promise<QueueJob[]> {
    const res = await api.get('/knowledge/queue/status');
    const body = await res.json();
    return (body.data || []) as QueueJob[];
  },

  // Analytics
  async getGlobalAnalytics(): Promise<any> {
    const res = await api.get('/knowledge/analytics');
    const body = await res.json();
    return body.data;
  },

  async getIntelligenceAnalytics(): Promise<any> {
    const res = await api.get('/knowledge/intelligence/analytics');
    const body = await res.json();
    return body.data;
  },

  async getKnowledgeQuality(): Promise<any> {
    const res = await api.get('/knowledge/intelligence/quality');
    const body = await res.json();
    return body.data;
  },

  async getRetrievalPerformance(): Promise<any> {
    const res = await api.get('/knowledge/intelligence/retrieval-performance');
    const body = await res.json();
    return body.data;
  }
};
