#!/usr/bin/env node
// scripts/seed-r2.ts
// One-off seeding script: reads MOCK_REPORTS from src/services/mockData.ts
// and writes the correct R2 file layout to the wrangler local R2 directory
// OR uploads to a production bucket via wrangler CLI.
//
// Usage (local dev — populates .wrangler/state/v3/r2 for wrangler pages dev):
//   npx tsx scripts/seed-r2.ts --local
//
// Usage (production — uses wrangler r2 object put):
//   npx tsx scripts/seed-r2.ts --remote --bucket gen-rpt-reports
//
// Prerequisites:
//   npm install --save-dev tsx
//   wrangler login  (for --remote)

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// ---------------------------------------------------------------------------
// Import mock data — this is the single source of truth during seeding
// ---------------------------------------------------------------------------
// We avoid a dynamic import here to keep the script runnable with tsx directly.
// The path is relative to the project root (where this script is executed from).
import { MOCK_REPORTS } from '../src/services/mockData';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const isLocal = args.includes('--local') || !isRemote;
const bucketArg = args[args.indexOf('--bucket') + 1] ?? 'gen-rpt-reports';

// ---------------------------------------------------------------------------
// R2 file layout builders
// ---------------------------------------------------------------------------

/**
 * Build the catalog.json array — lightweight summary used by GET /api/reports.
 * Does NOT include reportContent or aiReview (those are in manifest.json).
 */
function buildCatalog() {
  return MOCK_REPORTS.map((r) => ({
    id: r.id,
    title: r.title,
    version: r.version,
    status: r.status,
    humanStatus: r.humanStatus,
    aiScore: r.aiScore,
    aiGrade: r.aiGrade,
    commentCount: r.commentCount,
    lastUpdated: r.lastUpdated,
    publishReady: r.publishReady,
    // These stub fields satisfy the TypeScript Report interface on list pages
    aiReview: null,
    reportContent: { brand: '', label: '', date: '', sections: [] },
    comments: [],
  }));
}

/**
 * Build the manifest.json for a single report.
 * Contains everything EXCEPT comments (those live in comments.json).
 */
function buildManifest(report: (typeof MOCK_REPORTS)[0]) {
  const { comments: _ignored, ...manifest } = report;
  return { ...manifest, commentCount: report.comments.length };
}

// ---------------------------------------------------------------------------
// Local seeding — write to .wrangler/state/v3/r2/ directory structure
// ---------------------------------------------------------------------------

function seedLocal() {
  // wrangler stores local R2 objects under .wrangler/state/v3/r2/<bucket>/
  // Each key is stored as a file at the same relative path.
  const baseDir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'r2', bucketArg, 'key');
  console.log(`\n📁  Writing to local R2 state: ${baseDir}\n`);

  const files: Array<{ key: string; content: string }> = [];

  // catalog.json
  files.push({ key: 'catalog.json', content: JSON.stringify(buildCatalog(), null, 2) });

  for (const report of MOCK_REPORTS) {
    // manifest.json
    files.push({
      key: `reports/${report.id}/manifest.json`,
      content: JSON.stringify(buildManifest(report), null, 2),
    });

    // comments.json
    files.push({
      key: `reports/${report.id}/comments.json`,
      content: JSON.stringify(report.comments, null, 2),
    });
  }

  for (const { key, content } of files) {
    const filePath = path.join(baseDir, key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅  ${key}`);
  }

  console.log(`\n✨  Local R2 seeded with ${files.length} files.`);
  console.log(
    '\nStart local dev with:\n  npx wrangler pages dev dist --compatibility-date=2024-09-23\n'
  );
}

// ---------------------------------------------------------------------------
// Remote seeding — upload each file via wrangler CLI
// ---------------------------------------------------------------------------

function putRemote(key: string, content: string) {
  // Write to a temp file so wrangler can read it
  const tmp = path.join(os.tmpdir(), `seed-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(tmp, content, 'utf-8');
  try {
    execSync(
      `npx wrangler r2 object put "${bucketArg}/${key}" --file "${tmp}" --content-type application/json`,
      { stdio: 'pipe' }
    );
    console.log(`  ✅  ${key}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

function seedRemote() {
  console.log(`\n☁️   Uploading to Cloudflare R2 bucket: ${bucketArg}\n`);

  putRemote('catalog.json', JSON.stringify(buildCatalog(), null, 2));

  for (const report of MOCK_REPORTS) {
    putRemote(
      `reports/${report.id}/manifest.json`,
      JSON.stringify(buildManifest(report), null, 2)
    );
    putRemote(
      `reports/${report.id}/comments.json`,
      JSON.stringify(report.comments, null, 2)
    );
  }

  console.log(`\n✨  Remote R2 bucket "${bucketArg}" seeded successfully.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (isLocal) {
  seedLocal();
} else {
  seedRemote();
}
