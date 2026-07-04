// functions/api/reports/[id]/content.ts
// PUT /api/reports/:id/content — persists inline text edits back to report.md in R2.
//
// Called by ReviewTopbar "Save Edits" when the reviewer has made inline contentEditable
// changes in the report viewer. The frontend sends:
//   { edits: { "section-heading-slug-pN": "new paragraph text", ... } }
//
// Strategy:
//   1. Read manifest.json to find the report.md R2 key
//   2. Download the current report.md from R2
//   3. Parse it into sections (same logic as [id].ts onRequestGet)
//   4. For each edit, match by section heading slug + 1-based paragraph index
//   5. Replace the matching paragraph text in-place
//   6. Reconstruct the full Markdown and write it back to R2
//
// The report.md key from the manifest is used as the write target so we
// always update the exact same file that the GET endpoint reads — guaranteeing
// consistency across page refreshes.

import { getManifest, jsonOk, jsonError, Env, S3Bucket } from '../../../_shared/r2';

// ── Markdown parser (mirrors [id].ts parseMarkdownToSections) ────────────────
interface Section {
  heading: string;
  body: string;
  isDisclaimer?: boolean;
  /** Raw heading line from source Markdown, e.g. "## Key Highlights" */
  rawHeadingLine: string;
}

function parseMarkdownToSectionsWithRaw(md: string): Section[] {
  const lines = md.split('\n');
  const sections: Section[] = [];
  let currentHeading = 'Report Content';
  let currentRawHeading = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.match(/^#+\s/)) {
      if (currentBody.length > 0 || currentRawHeading) {
        sections.push({
          heading: currentHeading,
          body: currentBody.join('\n').trim(),
          rawHeadingLine: currentRawHeading,
        });
      }
      currentHeading = line.replace(/^#+\s/, '').trim();
      currentRawHeading = line;
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading || currentBody.length > 0) {
    sections.push({
      heading: currentHeading,
      body: currentBody.join('\n').trim(),
      rawHeadingLine: currentRawHeading,
    });
  }
  return sections;
}

/** Convert a section heading to the slug used as paragraphId prefix.
 *  Must match the frontend paragraphId() util exactly:
 *    heading.toLowerCase().replace(/[^\w]+/g, '-')
 */
function headingSlug(heading: string): string {
  return heading.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
}

/** Reconstruct full Markdown from parsed sections */
function sectionsToMarkdown(sections: Section[]): string {
  return sections
    .map((s) => {
      const headingLine = s.rawHeadingLine || `## ${s.heading}`;
      return `${headingLine}\n\n${s.body}`;
    })
    .join('\n\n');
}

// ── Request body ─────────────────────────────────────────────────────────────
interface ContentEditBody {
  edits: Record<string, string>; // { "key-highlights-p2": "new text" }
}

// ── Handler ──────────────────────────────────────────────────────────────────
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = context.params['id'] as string;
  if (!id) return jsonError('Missing report id', 400);

  let body: ContentEditBody;
  try {
    body = await context.request.json<ContentEditBody>();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  if (!body.edits || Object.keys(body.edits).length === 0) {
    return jsonOk({ applied: [], skipped: [], message: 'No edits to apply' });
  }

  try {
    const bucket = new S3Bucket(context.env);

    // ── Step 1: get manifest to find the report.md key ───────────────────
    const manifest = await getManifest(bucket, id) as any;
    if (!manifest) return jsonError(`Report ${id} not found`, 404);

    const reportMdKey: string | undefined = manifest?.files?.report_md;
    if (!reportMdKey) {
      return jsonError(
        `manifest.files.report_md not set for report ${id} — cannot locate report.md`,
        422
      );
    }

    // ── Step 2: download current report.md ───────────────────────────────
    const mdObj = await bucket.get(reportMdKey);
    if (!mdObj) return jsonError(`report.md not found at ${reportMdKey}`, 404);
    const originalMd = await mdObj.text();

    // ── Step 3: parse into sections ──────────────────────────────────────
    const sections = parseMarkdownToSectionsWithRaw(originalMd);

    const applied: string[] = [];
    const skipped: string[] = [];

    // ── Step 4: apply each edit ──────────────────────────────────────────
    for (const [paraId, newText] of Object.entries(body.edits)) {
      // paragraphId format: "<section-slug>-p<N>"
      const m = paraId.match(/^(.+)-p(\d+)$/);
      if (!m) { skipped.push(paraId); continue; }

      const targetSlug = m[1];
      const targetIdx = parseInt(m[2], 10); // 1-based

      let found = false;
      for (const section of sections) {
        if (headingSlug(section.heading) !== targetSlug) continue;

        // Split body into paragraphs — same logic as ReportRenderer.tsx
        const rawParas = section.body
          .split('\n\n')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        let paraCounter = 0;
        const newParas = [...rawParas];

        for (let i = 0; i < rawParas.length; i++) {
          const lines = rawParas[i].split('\n');
          const isList = lines.some(
            (l) => l.trim().startsWith('- ') || /^\d+\./.test(l.trim())
          );
          if (isList) continue; // lists don't get paragraph IDs

          paraCounter++;
          if (paraCounter === targetIdx) {
            newParas[i] = newText.trim();
            found = true;
            break;
          }
        }

        if (found) {
          section.body = newParas.join('\n\n');
          applied.push(paraId);
          break;
        }
      }

      if (!found) skipped.push(paraId);
    }

    if (applied.length === 0) {
      return jsonOk({ applied, skipped, message: 'No matching paragraphs found' });
    }

    // ── Step 5: reconstruct Markdown and write back to R2 ────────────────
    const updatedMd = sectionsToMarkdown(sections);
    await bucket.put(reportMdKey, updatedMd, {
      httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
    });

    return jsonOk({
      applied,
      skipped,
      message: `Applied ${applied.length} edit(s) to ${reportMdKey}`,
    });

  } catch (err: any) {
    console.error(`[PUT /api/reports/${id}/content] Error:`, err);
    return jsonError(`Failed to save edits: ${err?.message || err}`);
  }
};
