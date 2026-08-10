/**
 * Generate and check the committed fieldsSchema manifest (ADR-0016 §6-1).
 *
 *   pnpm schema:manifest
 *   pnpm schema:manifest:check
 *   pnpm schema:manifest:check --base origin/main
 *
 * `--check` proves the committed snapshot matches the live Template libraries.
 * `--base` additionally compares against that git ref and blocks destructive
 * schema changes unless the PR adds a matching SQL + Markdown migration pair.
 */
import './lib/register-css-stub'; // MUST be first — Template modules may import CSS

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { templateMap } from '../src/templates/_generated';
import type { TemplateLibrary } from '../src/templates/types';
import {
  createSchemaManifest,
  findBreakingSchemaChanges,
  findMigrationEvidence,
  serializeSchemaManifest,
  type SchemaLibraries,
  type SchemaManifest,
} from './lib/schema-manifest';

const ROOT = path.join(__dirname, '..');
const MANIFEST_RELATIVE_PATH = 'src/templates/_schema-manifest.json';
const MANIFEST_PATH = path.join(ROOT, MANIFEST_RELATIVE_PATH);

function usage(message?: string): never {
  if (message) console.error(`✖ ${message}\n`);
  console.error('Usage: pnpm schema:manifest [--check] [--base <git-ref>]');
  process.exit(1);
}

function parseManifest(source: string, from: string): SchemaManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    throw new Error(`${from}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
  }
  if (
    typeof parsed !== 'object' || parsed === null ||
    (parsed as { version?: unknown }).version !== 1 ||
    typeof (parsed as { templates?: unknown }).templates !== 'object' ||
    (parsed as { templates?: unknown }).templates === null
  ) {
    throw new Error(`${from}: expected schema manifest version 1`);
  }
  return parsed as SchemaManifest;
}

function git(args: string[]): string {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf-8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed:\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function gitFileAtRef(ref: string, file: string): string | null {
  // Fail loudly for a misspelled/unfetched ref; only a missing file is the
  // expected bootstrap case for the PR that first introduces the manifest.
  git(['rev-parse', '--verify', ref]);
  const result = spawnSync('git', ['show', `${ref}:${file}`], {
    cwd: ROOT,
    encoding: 'utf-8',
  });
  return result.status === 0 ? result.stdout : null;
}

async function loadLibraries(): Promise<SchemaLibraries> {
  const libraries: SchemaLibraries = {};
  for (const templateKey of Object.keys(templateMap).sort()) {
    const templateModule = await templateMap[templateKey]();
    libraries[templateKey] = templateModule.library as TemplateLibrary;
  }
  return libraries;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const baseIndex = args.indexOf('--base');
  const baseRef = baseIndex >= 0 ? args[baseIndex + 1] : undefined;
  if (baseIndex >= 0 && !baseRef) usage('--base requires a git ref');
  if (baseRef && !check) usage('--base is only valid with --check');

  const manifest = createSchemaManifest(await loadLibraries());
  const serialized = serializeSchemaManifest(manifest);

  if (!check) {
    fs.writeFileSync(MANIFEST_PATH, serialized);
    console.log(`✅ Wrote ${MANIFEST_RELATIVE_PATH}`);
    return;
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Missing ${MANIFEST_RELATIVE_PATH}. Run pnpm schema:manifest and commit it.`);
    process.exit(1);
  }
  const committed = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  if (committed !== serialized) {
    console.error(`❌ ${MANIFEST_RELATIVE_PATH} is stale.`);
    console.error('   Run pnpm schema:manifest and commit the result.');
    process.exit(1);
  }
  console.log(`✅ ${MANIFEST_RELATIVE_PATH} matches all live Template schemas.`);

  if (!baseRef) return;

  const baseSource = gitFileAtRef(baseRef, MANIFEST_RELATIVE_PATH);
  if (baseSource === null) {
    console.log(`✅ ${baseRef} has no schema manifest; current snapshot becomes the compatibility baseline.`);
    return;
  }
  const baseManifest = parseManifest(baseSource, `${baseRef}:${MANIFEST_RELATIVE_PATH}`);
  const breaking = findBreakingSchemaChanges(baseManifest, manifest);
  if (breaking.length === 0) {
    console.log(`✅ Schema changes are backward-compatible with ${baseRef}.`);
    return;
  }

  console.error(`\n⛔ ${breaking.length} breaking schema change(s) relative to ${baseRef}:`);
  for (const change of breaking) {
    console.error(`   [${change.code}] ${change.message}`);
  }

  const addedMigrationFiles = git([
    'diff',
    '--name-only',
    '--diff-filter=A',
    `${baseRef}...HEAD`,
    '--',
    'docs/migrations',
  ]).split('\n').filter(Boolean);
  const migrationEvidence = findMigrationEvidence(addedMigrationFiles);
  if (migrationEvidence.length === 0) {
    console.error('\n❌ Breaking changes require a new docs/migrations/<name>.sql + <name>.md pair.');
    process.exit(1);
  }

  console.warn(`\n⚠️  Allowed for review with migration evidence: ${migrationEvidence.join(', ')}`);
  console.warn('   CI verifies the pair exists; reviewers must verify that it migrates every affected value.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
