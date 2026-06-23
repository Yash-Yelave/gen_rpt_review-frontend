// functions/api/reports/[id]/report.ts
// GET /api/reports/:id/report — streams raw report.md text from R2.
// This endpoint serves the raw markdown source of the report document.
// Currently unused by the React UI (which reads reportContent from manifest.json),
// but provided for future integrations and direct document access.

interface Env {
  REPORTS_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) {
    return new Response('', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  try {
    const obj = await context.env.REPORTS_BUCKET.get(`reports/${id}/report.md`);

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
