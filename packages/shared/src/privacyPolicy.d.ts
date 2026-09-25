export const VISIBILITY: { PRIVATE: 'private'; SHARED: 'shared'; PUBLIC: 'public' };
export const NODE_KIND: { FILE: 'file'; FOLDER: 'folder'; PROJECT: 'project'; SHORTCUT: 'shortcut'; CREATION: 'creation' };
export const DEFAULT_VISIBILITY: 'private';

export function hashShareToken(token: string, cryptoImpl?: Crypto): Promise<string>;
export function hashShareTokenSync(token: string, nodeCrypto: { createHash: (alg: string) => { update: (v: string, enc: string) => { digest: (enc: string) => string } } }): string;
export function canReadNode(args: { actor: { id: string } | null; node: any; shareContext?: any }): boolean;
export function canMutateNode(args: { actor: { id: string } | null; node: any }): boolean;
export function canSeePlacement(args: { actor: { id: string } | null; node: any; shareContext?: any }): boolean;
export function publicDiscoveryFilter<T extends { visibility: string; deleted_at?: string | null }>(nodes: T[]): T[];
export function visitorVisibleNodes<T>(args: { actor: { id: string } | null; nodes: T[]; shareContext?: any }): T[];
export function createPrivateNode(args: { ownerId: string; name: string; mimeType?: string; extra?: any }): any;
export function confirmPublish(node: any, args: { confirmed: boolean }): { ok: boolean; reason?: string; node: any };
export function makePrivate(node: any): { node: any; revokeShareLinks: boolean; removePublicPath: boolean };
export function presentationForMime(mime?: string, name?: string): string;
