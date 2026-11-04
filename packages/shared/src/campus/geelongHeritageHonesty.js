/**
 * Fidelity packet HER-04 (Geelong Gallery shell): S-GEELONG-TOUR walkthrough remains
 * uninspected for scale or tracing; metric dimensions unknown; reuse approval not obtained.
 * Playable observations must not invent inspection, measured area, present installation
 * certainty, reuse approval, or cultural approval.
 */

export const GEELONG_HER_04_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-04',
  geelong_tour_source_inspected: false,
  plan_drawing_source_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  present_installation_claim_permitted: false,
  reuse_approval_obtained: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'geelong_drawing_inspected',
    re: /\b(geelong\s*gallery|s-geelong-tour|360\s*virtual\s*tour|gallery\s*tour)\s+(drawing|plan|floor\s*plan|tour|walkthrough|shell|scan)\s+(was\s+)?(inspected|verified|traced|confirmed|fully\s+walked)\b/i,
  },
  {
    kind: 'geelong_drawing_inspected',
    re: /\b(inspected|verified|traced|fully\s+walked)\s+(the\s+)?(embedded\s+)?(geelong\s*gallery|360\s*virtual\s*tour)\s+(tour|walkthrough|drawing|plan|shell|scan)\b/i,
  },
  {
    kind: 'geelong_drawing_inspected',
    re: /\b(embedded\s+walkthrough\s+(was\s+)?(fully\s+)?(inspected|verified|walked))\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b\d+\s*(m²|m2|sq\.?\s*m|square\s*met(er|re)s?)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b(measured|verified|calibrated)\s+(footprint|floor\s*area|area|dimensions?|shell\s*dimensions?)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b(geelong\s*gallery|building\s*shell)\s+(dimensions?|footprint)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'present_installation',
    re: /\b(present\s+2026\s+installation\s+(is\s+)?(established|verified|confirmed|permanent))\b/i,
  },
  {
    kind: 'present_installation',
    re: /\b(permanent\s+2026\s+(gallery\s+)?installation|2026\s+installation\s+verified)\b/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?(building|shell)|completed\s+construction)\b/i,
  },
  {
    kind: 'reuse_approval',
    re: /\b(reuse\s+approval\s+(was\s+)?(obtained|granted|confirmed)|tour\s+reuse\s+approved)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refuseGeelongFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'geelong_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
