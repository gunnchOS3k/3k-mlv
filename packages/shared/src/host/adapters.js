import { createHostCapabilityContract, HOST_CAPABILITY_KEYS } from './capabilityContract.js';

/** Browser/PWA host adapter — digital baseline. */
export function createBrowserHostAdapter() {
  const hasWindow = typeof window !== 'undefined';
  const hasLocalStorage = (() => {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  })();
  return {
    host_id: 'browser_pwa',
    adapter: 'BrowserHostAdapter',
    contract: createHostCapabilityContract(
      {
        filesystem: false,
        notifications: hasWindow && typeof Notification !== 'undefined',
        input: true,
        external_display: false,
        audio: hasWindow && typeof Audio !== 'undefined',
        local_storage: hasLocalStorage,
        deep_links: true,
        window_state: hasWindow,
        secure_identity_handoff: false,
        device_dock_state: false,
      },
      'browser_pwa',
    ),
  };
}

/** gunnchOS deepest first-party adapter (digital contract only). */
export function createGunnchOsHostAdapter(opts = {}) {
  return {
    host_id: 'gunnchos',
    adapter: 'GunnchOsHostAdapter',
    deepest_first_party: true,
    contract: createHostCapabilityContract(
      {
        filesystem: true,
        notifications: true,
        input: true,
        external_display: Boolean(opts.external_display),
        audio: true,
        local_storage: true,
        deep_links: true,
        window_state: true,
        secure_identity_handoff: true,
        device_dock_state: Boolean(opts.docked),
      },
      'gunnchos',
    ),
  };
}

/** Stub adapters for candidate hosts — NOT_TESTED until exercised. */
export function createStubHostAdapter(hostId) {
  const caps = Object.fromEntries(HOST_CAPABILITY_KEYS.map((k) => [k, false]));
  caps.local_storage = true;
  caps.input = true;
  return {
    host_id: hostId,
    adapter: `StubHostAdapter(${hostId})`,
    contract: createHostCapabilityContract(caps, hostId),
    status: 'NOT_TESTED',
  };
}

export function listHostAdapters() {
  return [
    createGunnchOsHostAdapter(),
    createBrowserHostAdapter(),
    createStubHostAdapter('windows'),
    createStubHostAdapter('linux'),
    createStubHostAdapter('android'),
    createStubHostAdapter('macos'),
  ];
}
