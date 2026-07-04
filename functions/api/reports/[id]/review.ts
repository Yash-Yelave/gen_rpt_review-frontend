// functions/api/reports/[id]/review.ts
// GET /api/reports/:id/review — streams raw review.md text from R2.
// Returns an empty string (not an error) if no review.md exists,
// so the UI degrades gracefully (no highlights, no annotation sidebar).

import { Env, S3Bucket, getRealReportId, getManifest } from '../../../_shared/r2';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) {
    return new Response('', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  try {
    const bucket = new S3Bucket(context.env);
    const realId = await getRealReportId(bucket, id);
    const manifest = await getManifest(bucket, realId) as any;
    const reviewJsonKey = manifest?.files?.review_json || `reports/${realId}/reviews/review.json`;
    const obj = await bucket.get(reviewJsonKey);

    if (!obj) {
      // Graceful degradation — no review file means no highlights
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Stream directly from R2 for efficiency
    return new Response(obj.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error(`[GET /api/reports/${id}/review] Error:`, err);
    // Return empty string on error — UI still works, just without highlights
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};
