// functions/api/reports/index.ts
// GET /api/reports — returns the catalog.json array from R2.
// Each entry contains summary fields only (id, title, status, scores, etc.)
// so that list pages and the dashboard sidebar can render without loading
// heavy reportContent or aiReview data.

import { getCatalog, jsonOk, jsonError, Env, S3Bucket } from '../../_shared/r2';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const bucket = new S3Bucket(context.env);
    const catalog = await getCatalog(bucket);
    return jsonOk(catalog);
  } catch (err: any) {
    console.error('[GET /api/reports] Error:', err);
    return jsonError(`Failed to load catalog: ${err?.message || err}`);
  }
};
