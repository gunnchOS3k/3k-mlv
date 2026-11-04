/**
 * Fidelity packet HER-10 (Palestinian Museum heritage): S-PALESTINE-MUSEUM and
 * S-PALESTINE-ARCHIVE sources uninspected; metric dimensions unknown. Playable
 * observations must not invent inspection, measured area, completed construction,
 * partnership, or cultural approval.
 */

export const PALESTINIAN_HER_10_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-10',
  palestinian_museum_source_inspected: false,
  archive_source_inspected: false,
  plan_drawing_source_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  completed_construction_claim_permitted: false,
  partnership_claim_permitted: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'palestinian_drawing_inspected',
    re: /\b(palestinian\s*museum|s-palestine-museum|s-palestine-archive|palarchive)\s+(drawing|plan|floor\s*plan|archive|source|item)\s+(was\s+)?(inspected|verified|traced|confirmed|resolved)\b/i,
  },
  {
    kind: 'palestinian_drawing_inspected',
    re: /\b(inspected|verified|traced|reviewed)\s+(the\s+)?(palestinian\s*museum|palarchive|archive)\s+(drawing|plan|floor\s*plan|source|item)\b/i,
  },
  {
    kind: 'palestinian_drawing_inspected',
    re: /\b(palmuseum\.org|palarchive\.org)\b.*\b(accessible|resolved|verified|inspected)\b/i,
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
    re: /\b(palestinian\s*museum|birzeit)\s+(dimensions?|footprint)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?building|completed\s+construction)\b/i,
  },
  {
    kind: 'partnership',
    re: /\b(official\s+partnership|formal\s+partnership|partnered\s+with\s+(palestinian\s*museum|palarchive|7gc)|palestinian\s*museum\s+partnership)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
  {
    kind: 'palestinian_drawing_inspected',
    re: /\b(drawings?\s+(confirm|verify|prove)|traced\s+(from|the)\s+(palestinian\s*museum|palarchive)\s+(plan|drawing|archive))\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refusePalestinianFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'palestinian_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
