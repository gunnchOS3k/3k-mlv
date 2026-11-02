export type MlvDeepLinkKind =
  | 'commons'
  | 'home'
  | 'transit'
  | 'node'
  | 'public'
  | 'share'
  | 'campus'
  | 'gallery'
  | 'atlas'
  | 'academic'
  | 'library'
  | 'study'
  | 'lecture'
  | 'media'
  | 'scene'
  | 'research';

export function parseMlvDeepLink(uri: string | null | undefined): {
  uri: string | null | undefined;
  valid: boolean;
  reason: string | null;
  kind: MlvDeepLinkKind | null;
  node_id: string | null;
  campus_slug: string | null;
  campus_rest: string[];
  scene_id: string | null;
  research_id: string | null;
  /** Present only for an accepted share route. Never display or log this value. */
  share_token: string | null;
  token_present: boolean;
};
export function buildMlvDeepLink(kind: MlvDeepLinkKind, value?: string): string;
