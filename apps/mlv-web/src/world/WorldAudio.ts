export type SoundZone = 'exterior' | 'interior' | 'media' | 'gallery' | 'silent';

export function zoneAmbience(zone: SoundZone): string {
  switch (zone) {
    case 'exterior': return 'soft_wind';
    case 'interior': return 'room_tone';
    case 'media': return 'device_hum';
    case 'gallery': return 'gallery_hush';
    default: return 'none';
  }
}

export function footstepForSurface(surface: string): string {
  if (surface === 'wood') return 'wood_step';
  if (surface === 'stone') return 'stone_step';
  if (surface === 'metal') return 'metal_step';
  return 'soft_step';
}
