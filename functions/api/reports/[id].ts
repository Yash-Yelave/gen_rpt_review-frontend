// functions/api/reports/[id].ts
// GET /api/reports/:id — returns the full Report object.
// Merges manifest.json (which holds all report data except comments)
// with comments.json (the live comment thread) into a single response
// matching the Report TypeScript interface consumed by useReport(id).

import { getManifest, getComments, jsonOk, jsonError, Env, S3Bucket } from '../../_shared/r2';

function parseMarkdownToSections(md: string) {
  const lines = md.split('\n');
  const sections: { heading: string; body: string; isDisclaimer?: boolean }[] = [];
  let currentHeading = 'Report Content';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.match(/^#+\s/)) {
      if (currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = line.replace(/^#+\s/, '').trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading || currentBody.length > 0) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
  }
  return sections;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) return jsonError('Missing report id', 400);

  try {
    const bucket = new S3Bucket(context.env);
    const manifest = await getManifest(bucket, id) as any;

    if (!manifest || !manifest.files) {
      return jsonOk(null, 404);
    }

    // Fetch report.md, review.json, and comments in parallel
    const [reportMdObj, reviewJsonObj, comments] = await Promise.all([
      manifest.files.report_md ? bucket.get(manifest.files.report_md) : null,
      manifest.files.review_json ? bucket.get(manifest.files.review_json) : null,
      getComments(bucket, id),
    ]);

    const reportMdStr = reportMdObj ? await reportMdObj.text() : '';
    const reviewJsonData: any = reviewJsonObj ? await reviewJsonObj.json() : null;

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

    // Assemble final report
    const report = {
      id: manifest.report_id || id,
      title: manifest.title || '',
      version: 'v1',
      status: mapStatus(manifest.current_status || 'ai_reviewed'),
      humanStatus: manifest.review_status || 'pending',
      aiScore: reviewJsonData?.scores?.overall_score || reviewJsonData?.overall_score || 0,
      aiGrade: reviewJsonData?.scores?.grade || reviewJsonData?.grade || 'N/A',
      commentCount: comments.length,
      lastUpdated: manifest.updated_at || new Date().toISOString(),
      publishReady: false,
      aiReview: reviewJsonData ? {
        scores: {
          overall_score: reviewJsonData.scores?.overall_score || reviewJsonData.overall_score || 0,
          grade: reviewJsonData.scores?.grade || reviewJsonData.grade || 'N/A',
          components: reviewJsonData.scores?.components || reviewJsonData.components || {}
        },
        recommendations: reviewJsonData.recommendations || {
          strengths: reviewJsonData.strengths || [],
          weaknesses: reviewJsonData.weaknesses || [],
          priority_improvements: reviewJsonData.priority_improvements || [],
          executive_readiness: reviewJsonData.executive_readiness || {}
        },
        dataGaps: reviewJsonData.dataGaps || [],
        writingFlaws: reviewJsonData.writingFlaws || [],
        strategicGaps: reviewJsonData.strategicGaps || [],
        gccGaps: reviewJsonData.gccGaps || []
      } : null,
      reportContent: {
        brand: 'GateX',
        label: 'Intelligence Report',
        date: new Date().toLocaleDateString(),
        sections: parseMarkdownToSections(reportMdStr),
      },
      comments,
    };

    return jsonOk(report);
  } catch (err: any) {
    console.error(`[GET /api/reports/${id}] Error:`, err);
    return jsonError(`Failed to load report: ${err?.message || err}`);
  }
};
