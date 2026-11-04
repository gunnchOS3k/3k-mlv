/**
 * Fidelity packet HER-11 (Port Lockroy / polar heritage): S-UKAHT, S-UKAHT-PORT,
 * and B-GRAHAM sources uninspected for scale or tracing; metric dimensions unknown.
 * Playable observations must not invent inspection, measured area, completed construction,
 * partnership, or cultural approval.
 */

export const POLAR_HER_11_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-11',
  ukaht_source_inspected: false,
  port_lockroy_source_inspected: false,
  plan_drawing_source_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  completed_construction_claim_permitted: false,
  partnership_claim_permitted: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'polar_drawing_inspected',
    re: /\b(port\s*lockroy|ukaht|s-ukaht|polar\s*heritage|graham\s*land)\s+(drawing|plan|floor\s*plan|tour|model|source|scan)\s+(was\s+)?(inspected|verified|traced|confirmed|resolved)\b/i,
  },
  {
    kind: 'polar_drawing_inspected',
    re: /\b(inspected|verified|traced|reviewed)\s+(the\s+)?(port\s*lockroy|ukaht|interactive\s*model|virtual\s*visit)\s+(drawing|plan|tour|model|source|scan)\b/i,
  },
  {
    kind: 'polar_drawing_inspected',
    re: /\b(ukaht\.org|ukht\.org)\b.*\b(accessible|resolved|verified|inspected)\b/i,
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
    re: /\b(port\s*lockroy|ukaht|polar\s*heritage)\s+(dimensions?|footprint)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?building|completed\s+construction)\b/i,
  },
  {
    kind: 'partnership',
    re: /\b(official\s+partnership|formal\s+partnership|partnered\s+with\s+(ukaht|port\s*lockroy|7gc)|ukaht\s+partnership|port\s*lockroy\s+partnership)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained|field\s+authorization\s+obtained)\b/i,
  },
  {
    kind: 'polar_drawing_inspected',
    re: /\b(full\s+interactive\s+model\s+(was\s+)?(inspected|verified)|traced\s+(from|the)\s+(port\s*lockroy|ukaht)\s+(plan|drawing|tour|model))\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refusePolarFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'polar_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
