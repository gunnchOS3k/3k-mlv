import type { WorldInteractable } from './types';
import { launchAnimeAggressors } from './CapabilityHandoff';
import type { ReturnContext } from './types';

export type InteractionHandlers = {
  onWaike?: (dest: string) => void;
  onPublicFile?: (dest: string) => void;
  onPrivateFile?: (dest: string) => void;
  onGallery?: (dest: string) => void;
  onNetworkTwin?: (dest: string) => void;
  onRoom?: (dest: string) => void;
  onSeat?: (id: string) => void;
  onDoor?: (id: string) => void;
  onStatus?: (msg: string) => void;
};

export function runInteraction(
  item: WorldInteractable,
  returnCtx: ReturnContext,
  handlers: InteractionHandlers = {},
): void {
  switch (item.capability) {
    case 'APP_LAUNCH': {
      const res = launchAnimeAggressors(returnCtx);
      handlers.onStatus?.(
        res.ok
          ? `Anime handoff via ${res.method}. Return context saved at ${returnCtx.anchor}.`
          : `Anime handoff failed: ${res.reason}`,
      );
      if (res.ok && res.method === 'fallback_prompt') {
        handlers.onStatus?.(`Open Anime Aggressors (${'com.gunnchos.animeaggressors'}) then return to restore dock.`);
      }
      break;
    }
    case 'WAIKE_LEARNER':
      handlers.onWaike?.(item.destination || item.id);
      break;
    case 'PUBLIC_FILE':
      handlers.onPublicFile?.(item.destination || item.id);
      break;
    case 'PRIVATE_FILE':
      handlers.onPrivateFile?.(item.destination || item.id);
      break;
    case 'GALLERY_EXHIBIT':
      handlers.onGallery?.(item.destination || item.id);
      break;
    case 'NETWORK_TWIN':
      handlers.onNetworkTwin?.(item.destination || item.id);
      break;
    case 'ROOM_TRANSITION':
      handlers.onRoom?.(item.destination || item.id);
      break;
    case 'SEAT':
      handlers.onSeat?.(item.id);
      break;
    case 'DOOR':
      handlers.onDoor?.(item.id);
      break;
    default:
      break;
  }
}
