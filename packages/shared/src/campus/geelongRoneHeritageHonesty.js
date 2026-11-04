/**
 * Fidelity packet HER-05 (Geelong RONE 2021 exhibition layer): embedded tour not walked;
 * metric accuracy unverified; art/dressing/soundtrack permissions unresolved; cultural review
 * not obtained. Playable observations must not invent inspection, measured dimensions,
 * permanent 2026 installation, rights approval, or cultural approval.
 */

export const GEELONG_HER_05_HONESTY = Object.freeze({
  packet_requirement_id: 'HER-05',
  geelong_rone_source_inspected: false,
  embedded_tour_walked: false,
  metric_dimensions_known: false,
  permanent_2026_installation_claim_permitted: false,
  art_dressing_audio_rights_obtained: false,
  cultural_approval_claim_permitted: false,
});

const FORBIDDEN_PATTERNS = Object.freeze([
  {
    kind: 'rone_source_inspected',
    re: /\b(rone|s-geelong-rone)\s+(exhibition|installation|layer|dressing|art)\s+(was\s+)?(inspected|verified|measured|confirmed|walked)\b/i,
  },
  {
    kind: 'rone_source_inspected',
    re: /\b(inspected|verified|measured|walked)\s+(the\s+)?(geelong\s+)?rone\s+(exhibition|installation|layer|dressing|art)\b/i,
  },
  {
    kind: 'embedded_tour_walked',
    re: /\b(embedded\s+(tour|walkthrough)\s+(was\s+)?(fully\s+)?(walked|inspected|verified))\b/i,
  },
  {
    kind: 'embedded_tour_walked',
    re: /\b(fully\s+walked|walked\s+through)\s+(the\s+)?(embedded\s+)?(geelong\s+)?(tour|walkthrough|rone)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b\d+\s*(m²|m2|sq\.?\s*m|square\s*met(er|re)s?)\b/i,
  },
  {
    kind: 'metric_dimensions_known',
    re: /\b(measured|verified|calibrated)\s+(exhibition|installation|rone|dressing)\s+(dimensions?|footprint|area)\b/i,
  },
  {
    kind: 'permanent_2026_installation',
    re: /\b(rone\s+(is\s+)?(a\s+)?permanent\s+2026\s+installation|permanent\s+2026\s+rone|rone\s+(still\s+)?(present|installed)\s+(in\s+)?2026)\b/i,
  },
  {
    kind: 'permanent_2026_installation',
    re: /\b(permanent\s+2026\s+installation\s+(is\s+)?(established|verified|confirmed))\b/i,
  },
  {
    kind: 'art_dressing_audio_rights',
    re: /\b(art(work)?|dressing|soundtrack|audio)\s+(rights?\s+)?(were\s+)?(obtained|granted|approved|cleared|resolved)\b/i,
  },
  {
    kind: 'art_dressing_audio_rights',
    re: /\b(rone\s+)?(art|dressing|soundtrack|audio)\s+(and\s+)?(dressing|soundtrack|audio\s+)?rights?\s+(obtained|approved|cleared)\b/i,
  },
  {
    kind: 'cultural_approval',
    re: /\b(cultural(ly)?\s+approved|cultural\s+review\s+approved|local\s+cultural\s+(sign-?off|approval)|community\s+approval\s+obtained)\b/i,
  },
]);

/** @returns {{ ok: true } | { ok: false, reason: string, forbidden_kind: string }} */
export function refuseGeelongRoneFalseHeritageClaims(text) {
  const sample = String(text || '').trim();
  for (const { kind, re } of FORBIDDEN_PATTERNS) {
    if (re.test(sample)) {
      return { ok: false, reason: 'geelong_rone_heritage_honesty_required', forbidden_kind: kind };
    }
  }
  return { ok: true };
}
