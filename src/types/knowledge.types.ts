// src/types/knowledge.types.ts

export interface KnowledgeCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string; // active, archived
  owner_id: string;
  visibility: string; // private, shared, public
  created_at: string;
  updated_at: string;
  document_count?: number;
  total_size_bytes?: number;
}

export interface KnowledgeDocument {
  id: string;
  collection_id: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
  extension: string;
  checksum: string;
  storage_path: string;
  version: number;
  size: number;
  language: string | null;
  page_count: number | null;
  processing_status: string; // pending, processing, completed, failed
  upload_status: string; // pending, uploaded, failed
  validation_status: string; // pending, validated, failed
  created_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  checksum: string;
  storage_path: string;
  size: number;
  created_at: string;
  created_by: string | null;
  description: string | null;
}

export interface QueueJob {
  id: string;
  document_id: string;
  status: string; // pending, processing, completed, failed
  current_stage: string;
  completed_stages: string[];
  duration_sec: number;
  error_message: string | null;
  logs: string | null;
  created_at: string;
  updated_at: string;
  document_name?: string;
}

export interface KnowledgeAnalytics {
  document_count: number;
  chunk_count: number;
  processing_count: number;
  retrieval_count: number;
  usage_metrics: {
    total_size_bytes?: number;
    avg_quality_score?: number;
    error_count?: number;
    reused_citations?: number;
    [key: string]: any;
  };
}
