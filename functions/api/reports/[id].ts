// functions/api/reports/[id].ts
// GET /api/reports/:id — returns the full Report object.
// Merges manifest.json (which holds all report data except comments)
// with comments.json (the live comment thread) into a single response
// matching the Report TypeScript interface consumed by useReport(id).

import { getManifest, getComments, jsonOk, jsonError } from '../../../_shared/r2';

interface Env {
  REPORTS_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) return jsonError('Missing report id', 400);

  try {
    // Fetch manifest and comments in parallel for speed
    const [manifest, comments] = await Promise.all([
      getManifest(context.env.REPORTS_BUCKET, id),
      getComments(context.env.REPORTS_BUCKET, id),
    ]);

    if (!manifest) {
      return jsonOk(null, 404);
    }

    // Merge comments into the report object — matches the Report interface shape
    const report = {
      ...manifest,
      comments,
      commentCount: comments.length,
    };

    return jsonOk(report);
  } catch (err) {
    console.error(`[GET /api/reports/${id}] Error:`, err);
    return jsonError('Failed to load report');
  }
};
