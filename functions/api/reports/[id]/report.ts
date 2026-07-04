// functions/api/reports/[id]/report.ts
// GET /api/reports/:id/report — streams raw report.md text from R2.
// This endpoint serves the raw markdown source of the report document.
// Currently unused by the React UI (which reads reportContent from manifest.json),
// but provided for future integrations and direct document access.

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
    const reportMdKey = manifest?.files?.report_md || `reports/${realId}/current/report.md`;
    const obj = await bucket.get(reportMdKey);

    if (!obj) {
      return new Response('', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response(obj.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error(`[GET /api/reports/${id}/report] Error:`, err);
    return new Response('', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};
