// functions/api/reports/index.ts
// GET /api/reports — returns the catalog.json array from R2.
// Each entry contains summary fields only (id, title, status, scores, etc.)
// so that list pages and the dashboard sidebar can render without loading
// heavy reportContent or aiReview data.

import { getCatalog, jsonOk, jsonError, Env, S3Bucket } from '../../_shared/r2';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const bucket = new S3Bucket(context.env);
    const catalogData = await getCatalog(bucket);
    
    const mapStatus = (s: string) => {
      const map: Record<string, string> = {
        'generated': 'Generated',
        'ai_reviewed': 'AI Reviewed',
        'in_review': 'Needs Human Review',
        'needs_revision': 'Needs Revision',
        'approved': 'Approved',
        'published': 'Published',
        'rejected': 'Rejected'
      };
      return map[s] || s;
    };

    // Map the new R2 JSON format to the frontend's Report format
    const mappedCatalog = catalogData.map(item => ({
      id: item.report_id,
      title: item.title,
      version: item.latest_version || 'v1',
      status: mapStatus(item.status),
      humanStatus: item.review_status,
      aiScore: item.ai_score,
      aiGrade: 'N/A', // Assuming grade is no longer provided
      commentCount: 0, // Set to 0 in catalog list, filled in on specific report load
      lastUpdated: item.created_at,
      publishReady: item.status === 'published',
      aiReview: null,
      reportContent: { brand: '', label: '', date: '', sections: [] },
      comments: []
    }));

    return jsonOk(mappedCatalog);
  } catch (err: any) {
    console.error('[GET /api/reports] Error:', err);
    return jsonError(`Failed to load catalog: ${err?.message || err}`);
  }
};
