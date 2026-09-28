import { validateOptimizationResult, syntheticLoopLabel } from './contracts.js';
import { OBJECTIVE_FIELDS } from './pins.js';
import { descriptiveGrouping, recommendationFromAlternative } from './planning.js';

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
