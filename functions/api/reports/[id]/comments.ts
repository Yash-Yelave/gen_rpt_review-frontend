// functions/api/reports/[id]/comments.ts
// GET  /api/reports/:id/comments — returns the Comment[] array.
// POST /api/reports/:id/comments — adds a new comment OR resolves an existing one.
//
// POST body shapes:
//   Add comment:    { id, reportId, version, section, text, priority, reviewer, timestamp, status }
//   Resolve:        { _action: 'resolve', commentId: string }

import {
  getManifest,
  putManifest,
  getComments,
  putComments,
  updateCatalogEntry,
  jsonOk,
  jsonError,
} from '../../../_shared/r2';

interface Env {
  REPORTS_BUCKET: R2Bucket;
}

// ---------------------------------------------------------------------------
// GET — return current comments array
// ---------------------------------------------------------------------------

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) return jsonError('Missing report id', 400);

  try {
    const comments = await getComments(context.env.REPORTS_BUCKET, id);
    return jsonOk(comments);
  } catch (err) {
    console.error(`[GET /api/reports/${id}/comments] Error:`, err);
    return jsonOk([]); // Graceful fallback — return empty thread, not an error
  }
};

// ---------------------------------------------------------------------------
// POST — add a comment or resolve one
// ---------------------------------------------------------------------------

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) return jsonError('Missing report id', 400);

  let body: Record<string, unknown>;
  try {
    body = await context.request.json<Record<string, unknown>>();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  try {
    const bucket = context.env.REPORTS_BUCKET;
    let comments = (await getComments(bucket, id)) as Record<string, unknown>[];

    if (body['_action'] === 'resolve') {
      // Mark an existing comment as resolved
      const commentId = body['commentId'] as string;
      if (!commentId) return jsonError('Missing commentId', 400);
      comments = comments.map((c) =>
        c['id'] === commentId ? { ...c, status: 'resolved' } : c
      );
    } else {
      // Add a new comment (body IS the comment object)
      // Strip any internal action key just in case
      const { _action: _ignored, ...comment } = body;
      comments = [...comments, comment];
    }

    // Persist updated comments
    await putComments(bucket, id, comments);

    // Sync commentCount in manifest and catalog
    const manifest = await getManifest(bucket, id);
    if (manifest) {
      const updatedManifest = {
        ...manifest,
        commentCount: comments.length,
        lastUpdated: new Date().toISOString(),
      };
      await putManifest(bucket, id, updatedManifest);
      await updateCatalogEntry(bucket, id, {
        commentCount: comments.length,
        lastUpdated: updatedManifest['lastUpdated'] as string,
      });
    }

    return jsonOk(comments);
  } catch (err) {
    console.error(`[POST /api/reports/${id}/comments] Error:`, err);
    return jsonError('Failed to update comments');
  }
};
