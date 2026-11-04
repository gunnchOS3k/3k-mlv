/**
 * Fidelity packet HER-08 (Germany / Zollverein KMS): S-RUHR-KMS drawing/source uninspected;
 * metric dimensions unknown. Playable observations must not invent inspection, measured area,
 * completed construction, partnership, or cultural approval.
 */

export const KMS_HER_08_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-08',
  kms_drawing_source_inspected: false,
  plan_drawing_source_inspected: false,
  metric_dimensions_known: false,
  measured_area_claim_permitted: false,
  completed_construction_claim_permitted: false,
  partnership_claim_permitted: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'kms_drawing_inspected',
    re: /\b(kms|ruhr\s*museum|s-ruhr-kms)\s+(drawing|plan|interactive|source)\s+(was\s+)?(inspected|verified|traced|confirmed|resolved)\b/i,
  },
  {
    kind: 'kms_drawing_inspected',
    re: /\b(inspected|verified|traced|reviewed)\s+(the\s+)?(kms|ruhr\s*museum)\s+(drawing|plan|interactive|source)\b/i,
  },
  {
    kind: 'kms_drawing_inspected',
    re: /\bkms\.ruhrmuseum\.de\b.*\b(accessible|resolved|verified|inspected)\b/i,
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
    re: /\b(zollverein|kms|ruhr)\s+(dimensions?|footprint)\s+(are\s+)?(known|verified|measured)\b/i,
  },
  {
    kind: 'completed_construction',
    re: /\b(construction\s+complete|fully\s+built|as-?built|finished\s+(physical\s+)?building|completed\s+construction)\b/i,
  },
  {
    kind: 'partnership',
    re: /\b(official\s+partnership|formal\s+partnership|partnered\s+with\s+(zollverein|ruhr|kms|7gc)|ruhr\s+museum\s+partnership)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
  {
    kind: 'kms_drawing_inspected',
    re: /\b(drawings?\s+(confirm|verify|prove)|traced\s+(from|the)\s+(kms|ruhr)\s+(plan|drawing))\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refuseKmsFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'kms_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
