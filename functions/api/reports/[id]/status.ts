// functions/api/reports/[id]/status.ts
// POST /api/reports/:id/status — updates report status fields in R2.
//
// Accepted body fields (all optional, merged with current manifest):
//   status:       string  — system status (e.g. 'Approved', 'Needs Revision', 'Rejected', 'Published')
//   humanStatus:  string  — editorial status (e.g. 'In Progress', 'Approved', 'Needs Revision')
//   publishReady: boolean — whether the report is queued for publication
//
// Updates are written to:
//   1. reports/:id/manifest.json  (full report record)
//   2. catalog.json               (lightweight summary array)
//
// Returns the updated full Report object (manifest merged with current comments).

import {
  getManifest,
  putManifest,
  getComments,
  Env,
} from '../../../_shared/r2';

interface StatusUpdateBody {
  status?: string;
  humanStatus?: string;
  publishReady?: boolean;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) return jsonError('Missing report id', 400);

  let body: StatusUpdateBody;
  try {
    body = await context.request.json<StatusUpdateBody>();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { status, humanStatus, publishReady } = body;

  // Require at least one field to change
  if (status === undefined && humanStatus === undefined && publishReady === undefined) {
    return jsonError('No status fields provided', 400);
  }

  try {
    const bucket = context.env.REPORTS_BUCKET;
    const manifest = await getManifest(bucket, id);

    if (!manifest) {
      return jsonError(`Report ${id} not found`, 404);
    }

    // Build the update patch — only include provided fields
    const patch: Record<string, unknown> = {
      lastUpdated: new Date().toISOString(),
    };
    if (status !== undefined) patch['status'] = status;
    if (humanStatus !== undefined) patch['humanStatus'] = humanStatus;
    if (publishReady !== undefined) patch['publishReady'] = publishReady;

    const updatedManifest = { ...manifest, ...patch };

    // Persist manifest
    await putManifest(bucket, id, updatedManifest);

    // Sync the lightweight catalog entry
    await updateCatalogEntry(bucket, id, {
      ...(status !== undefined && { status }),
      ...(humanStatus !== undefined && { humanStatus }),
      ...(publishReady !== undefined && { publishReady }),
      lastUpdated: patch['lastUpdated'] as string,
    });

    // Return the full merged Report (manifest + live comments)
    const comments = await getComments(bucket, id);
    const report = { ...updatedManifest, comments, commentCount: comments.length };

    return jsonOk(report);
  } catch (err) {
    console.error(`[POST /api/reports/${id}/status] Error:`, err);
    return jsonError('Failed to update status');
  }
};
