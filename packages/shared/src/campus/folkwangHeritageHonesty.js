/**
 * Fidelity packet HER-09 (Museum Folkwang): S-FOLKWANG drawing/source uninspected;
 * metric dimensions unknown. Playable observations must not invent inspection, measured area,
 * completed construction, partnership, or cultural approval.
 */

export const FOLKWANG_HER_09_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-09',
  folkwang_drawing_source_inspected: false,
  plan_drawing_source_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  completed_construction_claim_permitted: false,
  partnership_claim_permitted: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'folkwang_drawing_inspected',
    re: /\b(folkwang|museum\s*folkwang|s-folkwang)\s+(drawing|plan|ground\s*plan|source)\s+(was\s+)?(inspected|verified|traced|confirmed|resolved)\b/i,
  },
  {
    kind: 'folkwang_drawing_inspected',
    re: /\b(inspected|verified|traced|reviewed)\s+(the\s+)?(folkwang|museum\s*folkwang)\s+(drawing|plan|ground\s*plan|source)\b/i,
  },
  {
    kind: 'folkwang_drawing_inspected',
    re: /\bmuseum-folkwang\.de\b.*\b(accessible|resolved|verified|inspected)\b/i,
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
    re: /\b(folkwang|museum\s*folkwang)\s+(dimensions?|footprint|courtyard\s*area)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?building|completed\s+construction)\b/i,
  },
  {
    kind: 'partnership',
    re: /\b(official\s+partnership|formal\s+partnership|partnered\s+with\s+(folkwang|museum\s*folkwang|chipperfield|7gc)|folkwang\s+museum\s+partnership)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
  {
    kind: 'folkwang_drawing_inspected',
    re: /\b(drawings?\s+(confirm|verify|prove)|traced\s+(from|the)\s+(folkwang|museum\s*folkwang)\s+(plan|drawing))\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refuseFolkwangFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'folkwang_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
