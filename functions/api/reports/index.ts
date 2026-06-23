// functions/api/reports/index.ts
// GET /api/reports — returns the catalog.json array from R2.
// Each entry contains summary fields only (id, title, status, scores, etc.)
// so that list pages and the dashboard sidebar can render without loading
// heavy reportContent or aiReview data.

import { getCatalog, jsonOk, jsonError } from '../../_shared/r2';

interface Env {
  REPORTS_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const catalog = await getCatalog(context.env.REPORTS_BUCKET);
    return jsonOk(catalog);
  } catch (err) {
    console.error('[GET /api/reports] Error:', err);
    return jsonError('Failed to load catalog');
  }
};
