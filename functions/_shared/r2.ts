// functions/_shared/r2.ts
// Shared R2 utility functions reused by multiple Pages Functions.

export interface Env {
  REPORTS_BUCKET: R2Bucket;
}

export interface CatalogEntry {
  id: string;
  title: string;
  version: string;
  status: string;
  humanStatus: string;
  aiScore: number;
  aiGrade: string;
  commentCount: number;
  lastUpdated: string;
  publishReady: boolean;
  // Stub fields — not populated in the catalog for performance
  aiReview: null;
  reportContent: { brand: string; label: string; date: string; sections: [] };
  comments: [];
}

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonError(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getCatalog(bucket: R2Bucket): Promise<any[]> {
  try {
    const obj = await bucket.get('catalog/catalog.json');
    if (!obj) return [];
    return obj.json<any[]>();
  } catch {
    return [];
  }
}

export async function updateCatalogEntry(
  bucket: R2Bucket,
  id: string,
  updates: Partial<CatalogEntry>
): Promise<void> {
  // We cannot easily update the external catalog if it's managed by another system,
  // but if we are still allowing status updates from the frontend:
  const catalog = await getCatalog(bucket);
  const idx = catalog.findIndex((e) => e.report_id === id);
  if (idx === -1) return;
  catalog[idx] = { ...catalog[idx], ...updates };
  await bucket.put('catalog/catalog.json', JSON.stringify(catalog), {
    httpMetadata: { contentType: 'application/json' },
  });
}

export async function getManifest(bucket: R2Bucket, id: string): Promise<Record<string, unknown> | null> {
  try {
    const obj = await bucket.get(`reports/${id}/manifest.json`);
    if (!obj) return null;
    return obj.json<Record<string, unknown>>();
  } catch {
    return null;
  }
}

export async function putManifest(
  bucket: R2Bucket,
  id: string,
  manifest: Record<string, unknown>
): Promise<void> {
  await bucket.put(`reports/${id}/manifest.json`, JSON.stringify(manifest), {
    httpMetadata: { contentType: 'application/json' },
  });
}

export async function getComments(bucket: R2Bucket, id: string): Promise<unknown[]> {
  try {
    const obj = await bucket.get(`reports/${id}/comments.json`);
    if (!obj) return [];
    return obj.json<unknown[]>();
  } catch {
    return [];
  }
}

export async function putComments(
  bucket: R2Bucket,
  id: string,
  comments: unknown[]
): Promise<void> {
  await bucket.put(`reports/${id}/comments.json`, JSON.stringify(comments), {
    httpMetadata: { contentType: 'application/json' },
  });
}
