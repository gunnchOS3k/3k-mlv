export type MlvDeepLinkKind =
  | 'home'
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
  | 'media';

export function parseMlvDeepLink(uri: string | null | undefined): {
  uri: string | null | undefined;
  valid: boolean;
  reason: string | null;
  kind: MlvDeepLinkKind | null;
  node_id: string | null;
  campus_slug: string | null;
  campus_rest: string[];
  token_present: boolean;
};
export function buildMlvDeepLink(kind: MlvDeepLinkKind, value?: string): string;
