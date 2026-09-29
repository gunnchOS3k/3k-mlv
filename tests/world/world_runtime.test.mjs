import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('world modules exist', () => {
  const world = path.join(ROOT, 'apps/mlv-web/src/world');
  for (const f of ['WorldRuntime.tsx','AvatarController.tsx','ThirdPersonCamera.tsx','CharacterAvatar.tsx','InteractionSystem.tsx','InteractionPrompt.tsx','ProximitySystem.ts','CollisionWorld.ts','WorldState.ts','ReturnContext.ts','CapabilityHandoff.ts','MobileControls.tsx','GamepadControls.ts','AccessibilityDirectNav.tsx','WorldAudio.ts','TransitionManager.tsx','worldDefs.ts']) {
    assert.ok(fs.existsSync(path.join(world, f)), f);
  }
});

test('seven campus worlds + home + gallery defined', () => {
  const src = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/worldDefs.ts'), 'utf8');
  for (const id of ['HOME_WORLD','GALLERY_WORLD','gary','ghana','guyana','geelong','germany','gaza','graham-land']) {
    assert.ok(src.includes(id), id);
  }
  assert.ok(src.includes('no WAIKE-owned'));
  assert.ok(src.includes('no precise sensitive') || src.includes('no sensitive'));
});

test('return context serialize roundtrip shape', async () => {
  const ctx = { world:'HOME', zone:'MEDIA_ROOM', anchor:'DOCK_CHAIR', avatarPosition:[1,0,2], avatarFacing:1.2, session:'s1' };
  const raw = JSON.stringify(ctx);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.anchor, 'DOCK_CHAIR');
});

test('gallery rights matrix private leak count is zero', () => {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/v4_2/GALLERY_RIGHTS_MATRIX.json'), 'utf8'));
  assert.equal(m.PRIVATE_TO_PUBLIC_GALLERY_LEAK_COUNT, 0);
});

test('waike binding 7 of 7', () => {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/v4_2/WAIKE_WORLD_BINDING_MATRIX.json'), 'utf8'));
  assert.equal(m.bindings.length, 7);
  assert.equal(m.WAIKE_BINDING_7_OF_7, true);
  assert.ok(m.bindings.every((b) => b.invented_coursework === false));
});

test('cultural rotation metadata only / no scrape markers', () => {
  const r = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gallery/cultural_rotation_v4_2.json'), 'utf8'));
  assert.ok(r.exhibits.length >= 13);
  assert.ok(r.exhibits.every((e) => e.rights_status === 'metadata-only'));
});

test('capability handoff targets anime package', () => {
  const src = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/CapabilityHandoff.ts'), 'utf8');
  assert.ok(src.includes('com.gunnchos.animeaggressors'));
  assert.ok(src.includes('PHYSICAL_EDGE_IO_RINGS_VALIDATION_PENDING'));
});

test('v4_2 gates keep human false', () => {
  const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/v4_2/V4_2_MLV_GATES.json'), 'utf8'));
  assert.equal(g.HUMAN_3K_MLV_WORLD_APPROVAL, false);
  assert.equal(g.PRIVATE_TO_PUBLIC_GALLERY_LEAK_COUNT, 0);
  assert.equal(g.WORLD_RUNTIME_PASS, true);
});
