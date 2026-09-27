import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMPUS_CATALOG } from '../campus/catalog.js';
import { validateOptimizationResult, syntheticLoopLabel } from './contracts.js';
import { OBJECTIVE_FIELDS } from './pins.js';
import { descriptiveGrouping, recommendationFromAlternative } from './planning.js';

export const FIXTURE_SITES = ['gary', 'ghana', 'guyana', 'geelong', 'germany', 'gaza', 'graham_land'];

function defaultFixtureDir() {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '../../../../data/network_twin/fixtures/closed_loop_v2');
}

export function consumeOptimizationDocument(doc, site = 'unknown') {
  const check = validateOptimizationResult(doc);
  const opaqueScore = Object.keys(doc || {}).some((key) => /ai_score|magic_score|opaque_score/i.test(key))
    && !(doc?.alternatives);
  return {
    ok: check.ok && !opaqueScore,
    reason: check.reason,
    document: doc,
    label: syntheticLoopLabel(),
    groupings: (doc?.alternatives || []).map(descriptiveGrouping),
    recommendations: (doc?.alternatives || []).map((alt) => recommendationFromAlternative(alt, site)),
    objective_fields_present: OBJECTIVE_FIELDS.every((field) => typeof doc?.objectives?.[field] === 'number'),
  };
}

export function loadPinnedOptimization(site, fixtureDir = defaultFixtureDir()) {
  const path = join(fixtureDir, `${site}.optimization.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function consumeOptimizationFixture(site, fixtureDir = defaultFixtureDir()) {
  return consumeOptimizationDocument(loadPinnedOptimization(site, fixtureDir), site);
}

export function consumeAllOptimizationFixtures(fixtureDir = defaultFixtureDir()) {
  const results = FIXTURE_SITES.map((site) => ({ site, ...consumeOptimizationFixture(site, fixtureDir) }));
  const pass = results.filter((item) => item.ok && item.objective_fields_present).length;
  return {
    OPTIMIZATION_FIXTURE_CONSUMER_PASS: `${pass}/7`,
    campuses: CAMPUS_CATALOG.map((c) => c.slug),
    results,
  };
}
