/**
 * Fidelity packet HER-01 (Gary reference / IUNW Arts and Sciences): S-IU-TOUR and
 * S-IU-PRIMARY sources uninspected for room graph, capture date, and metric anchors;
 * metric dimensions unknown. Playable observations must not invent inspection,
 * measured area, completed construction, partnership, WAIKE occupancy at IUNW, or
 * cultural approval.
 */

export const GARY_REF_HER_01_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-01',
  iu_tour_source_inspected: false,
  iu_primary_source_inspected: false,
  matterport_measurements_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  completed_construction_claim_permitted: false,
  partnership_claim_permitted: false,
  waike_occupancy_claim_permitted: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'iu_source_inspected',
    re: /\b(iunw|iu\s*northwest|arts\s+and\s+sciences\s+building|s-iu-tour|s-iu-primary|matterport)\s+(walkthrough|tour|measurements?|room\s*graph|source|scan)\s+(was\s+)?(inspected|verified|traced|confirmed|resolved)\b/i,
  },
  {
    kind: 'iu_source_inspected',
    re: /\b(inspected|verified|traced|reviewed)\s+(the\s+)?(iunw|iu\s*northwest|matterport)\s+(walkthrough|tour|measurements?|room\s*graph|source|scan)\b/i,
  },
  {
    kind: 'iu_source_inspected',
    re: /\b(room\s*graph|capture\s*date)\s+(was\s+)?(recovered|verified|confirmed|inspected)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b\d+\s*(m²|m2|sq\.?\s*m|square\s*met(er|re)s?)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b(measured|verified|calibrated)\s+(footprint|floor\s*area|area|dimensions?)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b(iunw|iu\s*northwest|arts\s+and\s+sciences)\s+(dimensions?|footprint)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?building|completed\s+construction)\b/i,
  },
  {
    kind: 'partnership',
    re: /\b(official\s+partnership|formal\s+partnership|partnered\s+with\s+(iu\s*northwest|iunw|indiana\s+university|7gc)|iunw\s+partnership)\b/i,
  },
  {
    kind: 'waike_occupancy',
    re: /\b(waike\s+(occupies|operates|runs|has\s+a\s+(facility|campus)\s+at)\s+(iu\s*northwest|iunw)|waike\s+campus\s+at\s+iu|iunw\s+is\s+a\s+waike\s+(facility|campus)|waike\s+facility\s+at\s+iu\s*northwest)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
  {
    kind: 'iu_source_inspected',
    re: /\b(traced\s+(from|the)\s+(matterport|iunw|iu)\s+(tour|walkthrough|scan)|matterport\s+measurements?\s+(confirm|verify|prove))\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refuseGaryReferenceFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'gary_reference_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
