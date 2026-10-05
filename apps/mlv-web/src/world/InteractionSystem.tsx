import type { WorldInteractable } from './types';
import { launchAnimeAggressors, launchResearch, launchWaike } from './CapabilityHandoff';
import type { ReturnContext } from './types';

export type InteractionHandlers = {
  onPublicFile?: (dest: string) => void;
  onPrivateFile?: (dest: string) => void;
  onGallery?: (dest: string) => void;
  onNetworkTwin?: (dest: string) => void;
  onRoom?: (dest: string) => void;
  onNavigate?: (sceneId: string) => void;
  onSeat?: (id: string) => void;
  onDoor?: (id: string) => void;
  onLogoff?: () => void | Promise<void>;
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
    case 'WAIKE_LEARNER': {
      const res = launchWaike(item.destination || '', returnCtx);
      handlers.onStatus?.(res.ok
        ? `WAIKE handoff opened ${res.target || 'the requested surface'} via ${res.method}; return context saved.`
        : `WAIKE handoff failed: ${res.reason}`);
      break;
    }
    case 'RESEARCH_HANDOFF': {
      const res = launchResearch(item.destination || '', returnCtx);
      handlers.onStatus?.(res.ok
        ? `Research handoff opened ${res.target || 'the requested project'} via ${res.method}; simulation labels and return context preserved.`
        : `Research handoff failed: ${res.reason}`);
      break;
    }
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
      if (item.targetScene) handlers.onNavigate?.(item.targetScene);
      else handlers.onRoom?.(item.destination || item.id);
      break;
    case 'SEAT':
      handlers.onSeat?.(item.id);
      break;
    case 'DOOR':
      if (item.targetScene) handlers.onNavigate?.(item.targetScene);
      else handlers.onDoor?.(item.id);
      break;
    case 'LOGOFF':
      void handlers.onLogoff?.();
      break;
    default:
      break;
  }
}
