import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserHostAdapter, createGunnchOsHostAdapter, listHostAdapters } from '../../packages/shared/src/host/adapters.js';
import { assertCoreWorldHostNeutral, createHostCapabilityContract } from '../../packages/shared/src/host/capabilityContract.js';
import { evaluateHardwareQuartetDigitalGates, listRequiredDigitalProfiles } from '../../packages/shared/src/hardwareQuartet/profiles.js';

test('host capability contract is host-neutral', () => {
  const c = createHostCapabilityContract({ local_storage: true, input: true }, 'browser_pwa');
  assert.equal(c.gunnchos_hard_dependency, false);
  assert.equal(c.capabilities.local_storage, true);
  assert.ok(c.core_world_routes.includes('campus'));
});

test('browser and gunnchOS adapters exist', () => {
  const b = createBrowserHostAdapter();
  const g = createGunnchOsHostAdapter({ docked: true });
  assert.equal(b.host_id, 'browser_pwa');
  assert.equal(g.deepest_first_party, true);
  assert.equal(listHostAdapters().length, 6);
});

test('core world sample has no gunnchOS hard import', () => {
  const r = assertCoreWorldHostNeutral("export const x = 1;\n");
  assert.equal(r.MLV_CORE_WORLD_NO_GUNNCHOS_HARD_DEPENDENCY_PASS, true);
});

test('hardware quartet required digital profiles present', () => {
  const ids = listRequiredDigitalProfiles();
  assert.ok(ids.includes('student_14_5.SHARED_LAB'));
  const g = evaluateHardwareQuartetDigitalGates();
  assert.equal(g.missing.length, 0);
  assert.equal(g.RINGS_SPATIAL_PERIPHERAL_DIGITAL_CONTRACT_PASS, true);
});
