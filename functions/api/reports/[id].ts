// functions/api/reports/[id].ts
// GET /api/reports/:id — returns the full Report object.
// Merges manifest.json (which holds all report data except comments)
// with comments.json (the live comment thread) into a single response
// matching the Report TypeScript interface consumed by useReport(id).

import { getManifest, getComments, getRealReportId, jsonOk, jsonError, Env, S3Bucket } from '../../_shared/r2';

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
    const realId = await getRealReportId(bucket, id);
    const manifest = await getManifest(bucket, realId) as any;

    if (!manifest || !manifest.files) {
      return jsonOk(null, 404);
    }

    // Fetch report.md, review.json, and comments in parallel
    const [reportMdObj, reviewJsonObj, comments] = await Promise.all([
      manifest.files.report_md ? bucket.get(manifest.files.report_md) : null,
      manifest.files.review_json ? bucket.get(manifest.files.review_json) : null,
      getComments(bucket, realId),
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

    // Helper to safely extract string arrays
    const extractStrings = (arr: any): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.map(item => typeof item === 'string' ? item : item?.finding || item?.point || JSON.stringify(item));
    };

    const recs = reviewJsonData?.recommendations || {};
    const scoresData = reviewJsonData?.scores || reviewJsonData || {};

    const aiReviewObj = reviewJsonData ? {
      scores: {
        overall_score: scoresData.overall_score || 0,
        grade: scoresData.grade || 'N/A',
        components: scoresData.components || {}
      },
      recommendations: {
        strengths: extractStrings(recs.strengths || reviewJsonData?.strengths),
        weaknesses: extractStrings(recs.weaknesses || reviewJsonData?.weaknesses),
        priority_improvements: (recs.priority_improvements || recs.improvement_tasks || reviewJsonData?.priority_improvements || []).map((imp: any) => ({
          issue: imp.issue || imp.finding || 'Unknown issue',
          impact: imp.impact || imp.expected_impact || 'Needs review',
          suggested_fix: imp.suggested_fix || imp.fix || imp.suggestion || 'Review manually',
          priority_level: imp.priority_level || imp.priority || imp.severity || 'Medium'
        })),
        executive_readiness: recs.executive_readiness || recs.executive_communication || reviewJsonData?.executive_readiness || {
          board_members: false, ministers: false, ceos: false, sovereign_wealth_funds: false, senior_executives: false, justification: ''
        }
      },
      dataGaps: extractStrings(reviewJsonData?.dataGaps || recs.data_gaps),
      writingFlaws: extractStrings(reviewJsonData?.writingFlaws || recs.writing_flaws),
      strategicGaps: extractStrings(reviewJsonData?.strategicGaps || recs.strategic_gaps),
      gccGaps: extractStrings(reviewJsonData?.gccGaps || recs.gcc_gaps)
    } : null;

    // Assemble final report
    const report = {
      id: manifest.report_id || id,
      title: manifest.title || '',
      version: 'v1',
      status: mapStatus(manifest.current_status || 'ai_reviewed'),
      humanStatus: manifest.review_status || 'pending',
      aiScore: aiReviewObj?.scores?.overall_score || 0,
      aiGrade: aiReviewObj?.scores?.grade || 'N/A',
      commentCount: comments.length,
      lastUpdated: manifest.updated_at || new Date().toISOString(),
      publishReady: false,
      aiReview: aiReviewObj,
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
