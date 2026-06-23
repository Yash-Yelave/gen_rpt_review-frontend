// functions/_shared/r2.ts
// Shared R2 utility functions reused by multiple Pages Functions.
// Handles catalog reads/writes so every endpoint stays consistent.

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

// ---------------------------------------------------------------------------
// JSON response helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Catalog helpers
// ---------------------------------------------------------------------------

/**
 * Read catalog.json from R2. Returns [] if missing or on error.
 */
export async function getCatalog(bucket: R2Bucket): Promise<CatalogEntry[]> {
  try {
    const obj = await bucket.get('catalog.json');
    if (!obj) return [];
    return obj.json<CatalogEntry[]>();
  } catch {
    return [];
  }
}

/**
 * Patch specific fields on a single catalog entry and write back.
 * No-ops silently if the entry ID is not found.
 */
export async function updateCatalogEntry(
  bucket: R2Bucket,
  id: string,
  updates: Partial<CatalogEntry>
): Promise<void> {
  const catalog = await getCatalog(bucket);
  const idx = catalog.findIndex((e) => e.id === id);
  if (idx === -1) return;
  catalog[idx] = { ...catalog[idx], ...updates };
  await bucket.put('catalog.json', JSON.stringify(catalog), {
    httpMetadata: { contentType: 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Manifest helpers
// ---------------------------------------------------------------------------

/**
 * Read the full manifest for a report. Returns null if not found.
 */
export async function getManifest(bucket: R2Bucket, id: string): Promise<Record<string, unknown> | null> {
  try {
    const obj = await bucket.get(`reports/${id}/manifest.json`);
    if (!obj) return null;
    return obj.json<Record<string, unknown>>();
  } catch {
    return null;
  }
}

/**
 * Write the manifest back to R2.
 */
export async function putManifest(
  bucket: R2Bucket,
  id: string,
  manifest: Record<string, unknown>
): Promise<void> {
  await bucket.put(`reports/${id}/manifest.json`, JSON.stringify(manifest), {
    httpMetadata: { contentType: 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Comment helpers
// ---------------------------------------------------------------------------

/**
 * Read the comments array for a report. Returns [] if missing.
 */
export async function getComments(bucket: R2Bucket, id: string): Promise<unknown[]> {
  try {
    const obj = await bucket.get(`reports/${id}/comments.json`);
    if (!obj) return [];
    return obj.json<unknown[]>();
  } catch {
    return [];
  }
}

/**
 * Write the comments array back to R2.
 */
export async function putComments(
  bucket: R2Bucket,
  id: string,
  comments: unknown[]
): Promise<void> {
  await bucket.put(`reports/${id}/comments.json`, JSON.stringify(comments), {
    httpMetadata: { contentType: 'application/json' },
  });
}
