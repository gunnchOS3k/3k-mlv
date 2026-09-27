export interface OfflineCacheState {
  shellReady: boolean;
  recentMetadataCached: boolean;
  pinnedBytesAvailable: boolean;
  queuedChanges: number;
  socialDegraded: boolean;
}

export function describeOffline(state: OfflineCacheState): string {
  if (!state.shellReady) return 'Offline shell is not available yet.';
  const parts = ['World layout can load offline.'];
  if (state.recentMetadataCached) parts.push('Own recent metadata is cached.');
  if (state.pinnedBytesAvailable) parts.push('Pinned files are available locally.');
  if (state.queuedChanges > 0) parts.push(`${state.queuedChanges} local change(s) queued.`);
  if (state.socialDegraded) parts.push('Public/social features are deferred until online.');
  parts.push('Not claimed: production conflict resolution or encrypted sync.');
  return parts.join(' ');
}
