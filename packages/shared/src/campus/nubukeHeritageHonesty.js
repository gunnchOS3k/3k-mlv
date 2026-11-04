/**
 * Fidelity packet HER-02 (Nubuke): S-NUBUKE-ARCHITECT and S-NUBUKE-FOUNDATION support qualitative
 * gallery/garden/bungalow topology only; decorative finish and metric topology unknown.
 * Fidelity packet HER-03 (Nubuke): drawings/sources uninspected; metric dimensions unknown.
 * Playable observations must not invent inspected topology match, decorative finish verification,
 * measured area, completed construction, partnership, or cultural approval.
 */

export const NUBUKE_HER_02_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-02',
  architect_foundation_topology_sources_inspected: false,
  decorative_finish_source_matched: false,
  metric_topology_known: false,
  topology_source_inspection_claim_permitted: false,
  decorative_finish_claim_permitted: false,
});

export const NUBUKE_HER_03_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-03',
  plan_drawing_source_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  completed_construction_claim_permitted: false,
  partnership_claim_permitted: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'topology_source_inspected',
    re: /\b(inspected|verified|traced|confirmed|reviewed)\s+(the\s+)?(nubuke\s+)?(architect|foundation)\s+(page|source|description|photos?)\b/i,
  },
  {
    kind: 'topology_source_inspected',
    re: /\b(s-nubuke-architect|s-nubuke-foundation)\s+(source|page|description)s?\s+(was\s+)?(inspected|verified|traced|confirmed)\b/i,
  },
  {
    kind: 'topology_source_inspected',
    re: /\b(raised\s+gallery|gallery|garden|bungalow|almond\s+tree|outdoor\s+(gathering|programming))\s+(layout|relationship|topology|spatial\s+relationship)\s+(was\s+)?(inspected|verified|traced|measured|confirmed)\b/i,
  },
  {
    kind: 'decorative_finish_source_matched',
    re: /\b(decorative\s+finish|materials?|surface\s+finish|facade\s+detailing)\s+(matches?|matched|verified|confirmed|source-?matched)\b/i,
  },
  {
    kind: 'decorative_finish_source_matched',
    re: /\b(verified|confirmed)\s+(decorative|material|finish)\s+(against|from|with)\s+(architect|foundation|source)\b/i,
  },
  {
    kind: 'metric_topology_known',
    re: /\b(gallery|garden|bungalow|topology|spatial\s+relationship)\s+(dimensions?|spacing|layout)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'measured_area',
    re: /\b\d+\s*(m²|m2|sq\.?\s*m|square\s*met(er|re)s?)\b/i,
  },
  {
    kind: 'measured_area',
    re: /\b(measured|verified|calibrated)\s+(footprint|floor\s*area|area|dimensions?)\b/i,
  },
  {
    kind: 'measured_area',
    re: /\bfootprint\s+(is|was|measures?)\s+\d+/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?building|completed\s+construction)\b/i,
  },
  {
    kind: 'partnership',
    re: /\b(official\s+partnership|formal\s+partnership|partnered\s+with\s+(nubuke|waike|7gc)|waike\s+partnership)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
  {
    kind: 'measured_area',
    re: /\b(drawings?\s+(confirm|verify|prove)|traced\s+(from|the)\s+(plan|drawing))\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refuseNubukeFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'nubuke_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
