export function parseMlvDeepLink(uri: string | null | undefined): {
  uri: string | null | undefined;
  valid: boolean;
  reason: string | null;
  kind: 'home' | 'node' | 'public' | 'share' | null;
  node_id: string | null;
  token_present: boolean;
};
export function buildMlvDeepLink(kind: 'home' | 'node' | 'public' | 'share', value?: string): string;
