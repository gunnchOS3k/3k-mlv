#!/usr/bin/env node
/**
 * Hosted Supabase Alice/Bob/anonymous acceptance harness.
 *
 * Safe to commit. Refuses to run without explicit owner-provided env.
 * Uses only the publishable/anon client key and normal auth flows.
 * Never prints passwords, access/refresh tokens, share tokens, or dashboard secrets.
 *
 * This script does not create a cloud project. Hosted gates stay false
 * until a real owner-authorized run writes a passing report.
 */
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outJson = path.join(root, 'artifacts/security/HOSTED_SUPABASE_ACCEPTANCE.json');

const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'MLV_TEST_ALICE_EMAIL',
  'MLV_TEST_ALICE_PASSWORD',
  'MLV_TEST_BOB_EMAIL',
  'MLV_TEST_BOB_PASSWORD',
];

const PLACEHOLDER_RE = /your-project|your-anon|example\.com|changeme|placeholder/i;

function redact(value) {
  if (!value) return '';
  if (value.length <= 8) return '[redacted]';
  return `${value.slice(0, 4)}…(${value.length} chars)`;
}

function missingEnv() {
  return REQUIRED.filter((name) => {
    const value = process.env[name];
    return !value || PLACEHOLDER_RE.test(value);
  });
}

function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function restHeaders(anonKey, accessToken) {
  const headers = {
    apikey: anonKey,
    'Content-Type': 'application/json',
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function signIn(url, anonKey, email, password) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: restHeaders(anonKey),
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token || !body.user?.id) {
    throw new Error(`sign-in failed for ${email.split('@')[0]} (http ${res.status})`);
  }
  return { userId: body.user.id, accessToken: body.access_token };
}

async function rest(url, anonKey, accessToken, method, pathname, { body, query } = {}) {
  const target = new URL(`${url}/rest/v1/${pathname}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) target.searchParams.set(key, value);
  }
  const res = await fetch(target, {
    method,
    headers: {
      ...restHeaders(anonKey, accessToken),
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  return { ok: res.ok, status: res.status, json: parsed, text };
}

async function rpc(url, anonKey, accessToken, fn, args) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: restHeaders(anonKey, accessToken),
    body: JSON.stringify(args),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

async function storageGet(url, anonKey, accessToken, bucket, objectPath) {
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    headers: restHeaders(anonKey, accessToken),
  });
  return { ok: res.ok, status: res.status };
}

function emptyReport({ reason, runId, started }) {
  return {
    kind: 'hosted_supabase_acceptance',
    executed: false,
    reason,
    run_id: runId,
    started_at: started,
    finished_at: new Date().toISOString(),
    claim_boundary: 'Hosted gates remain false until an owner-authorized run completes against a live project.',
    gates: {
      MLV_HOSTED_SUPABASE_RLS_PASS: false,
      MLV_GITHUB_OAUTH_PASS: false,
      MLV_HOSTED_TWO_USER_PRIVACY_PASS: false,
      MLV_PRODUCTION_SECURITY_CLAIM: false,
    },
    cases: [],
  };
}

async function writeReport(report) {
  await mkdir(path.dirname(outJson), { recursive: true });
  await writeFile(outJson, `${JSON.stringify(report, null, 2)}\n`);
}

async function main() {
  const started = new Date().toISOString();
  const runId = `mlv-hosted-${new Date().toISOString().replace(/[:.]/g, '')}-${randomBytes(4).toString('hex')}`;
  const missing = missingEnv();
  if (missing.length) {
    const report = emptyReport({
      reason: `Refusing to run. Missing or placeholder env: ${missing.join(', ')}. See docs/security/HOSTED_SUPABASE_OWNER_RUNBOOK.md.`,
      runId,
      started,
    });
    await writeReport(report);
    console.log(report.reason);
    console.log(`Wrote unexecuted report to ${outJson}`);
    process.exit(2);
  }

  const url = process.env.VITE_SUPABASE_URL.replace(/\/$/, '');
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const aliceEmail = process.env.MLV_TEST_ALICE_EMAIL;
  const bobEmail = process.env.MLV_TEST_BOB_EMAIL;
  const cases = [];
  const created = { nodeIds: [], shareIds: [], storageKeys: [] };

  const record = (id, pass, detail) => {
    cases.push({ id, pass, detail });
    console.log(`${pass ? 'PASS' : 'FAIL'} ${id}`);
  };

  let alice;
  let bob;
  try {
    alice = await signIn(url, anonKey, aliceEmail, process.env.MLV_TEST_ALICE_PASSWORD);
    bob = await signIn(url, anonKey, bobEmail, process.env.MLV_TEST_BOB_PASSWORD);
  } catch (error) {
    const report = emptyReport({
      reason: `Auth failed without revealing credentials: ${error.message}. If this project is OAuth-only, use the manual procedure in the owner runbook instead of password users.`,
      runId,
      started,
    });
    await writeReport(report);
    console.log(report.reason);
    process.exit(2);
  }

  try {
    const privateName = `${runId}-private.txt`;
    const sharedName = `${runId}-shared.txt`;
    const publicName = `${runId}-public.txt`;
    const privateKey = `${alice.userId}/${runId}/private.txt`;

    const createdPrivate = await rest(url, anonKey, alice.accessToken, 'POST', 'mlv_nodes', {
      body: {
        owner_id: alice.userId,
        kind: 'file',
        name: privateName,
        mime_type: 'text/plain',
        visibility: 'private',
        storage_key: privateKey,
        metadata: { run_id: runId, fixture: true },
      },
    });
    const privateNode = Array.isArray(createdPrivate.json) ? createdPrivate.json[0] : createdPrivate.json;
    record('private.create', Boolean(createdPrivate.ok && privateNode?.id && privateNode.visibility === 'private'), 'Alice upload defaults PRIVATE');
    if (privateNode?.id) created.nodeIds.push(privateNode.id);

    const aliceRead = await rest(url, anonKey, alice.accessToken, 'GET', 'mlv_nodes', {
      query: { id: `eq.${privateNode.id}`, select: 'id,name,visibility' },
    });
    record('private.alice_read', aliceRead.ok && Array.isArray(aliceRead.json) && aliceRead.json.length === 1, 'Alice can read own PRIVATE');

    const bobRead = await rest(url, anonKey, bob.accessToken, 'GET', 'mlv_nodes', {
      query: { id: `eq.${privateNode.id}`, select: 'id,name,visibility' },
    });
    const bobSawName = JSON.stringify(bobRead.json || {}).includes(privateName);
    record('private.bob_denied', (!bobRead.json || bobRead.json.length === 0) && !bobSawName, 'Bob cannot enumerate/read PRIVATE filename');

    const anonRead = await rest(url, anonKey, null, 'GET', 'mlv_nodes', {
      query: { id: `eq.${privateNode.id}`, select: 'id,name,visibility' },
    });
    record('private.anon_denied', !anonRead.json || anonRead.json.length === 0, 'Anonymous cannot read PRIVATE');

    const createdShared = await rest(url, anonKey, alice.accessToken, 'POST', 'mlv_nodes', {
      body: {
        owner_id: alice.userId,
        kind: 'file',
        name: sharedName,
        mime_type: 'text/plain',
        visibility: 'shared',
        metadata: { run_id: runId, fixture: true },
      },
    });
    const sharedNode = Array.isArray(createdShared.json) ? createdShared.json[0] : createdShared.json;
    if (sharedNode?.id) created.nodeIds.push(sharedNode.id);
    const rawToken = randomBytes(24).toString('base64url');
    const tokenHash = hashToken(rawToken);
    const shareRow = await rest(url, anonKey, alice.accessToken, 'POST', 'mlv_share_links', {
      body: {
        node_id: sharedNode.id,
        owner_id: alice.userId,
        token_hash: tokenHash,
        permission: 'view',
      },
    });
    const share = Array.isArray(shareRow.json) ? shareRow.json[0] : shareRow.json;
    if (share?.id) created.shareIds.push(share.id);
    record('shared.hash_only', Boolean(share?.token_hash && !JSON.stringify(share).includes(rawToken)), 'Share row stores hash only');

    const bobListShared = await rest(url, anonKey, bob.accessToken, 'GET', 'mlv_nodes', {
      query: { id: `eq.${sharedNode.id}`, select: 'id,name' },
    });
    record('shared.not_listed', !bobListShared.json || bobListShared.json.length === 0, 'Bob cannot discover SHARED via listing');

    const bobOpen = await rpc(url, anonKey, bob.accessToken, 'mlv_open_share', { p_token: rawToken });
    record('shared.valid_token', bobOpen.ok && Array.isArray(bobOpen.json) && bobOpen.json[0]?.id === sharedNode.id, 'Valid share token opens only that node');

    const anonNoToken = await rest(url, anonKey, null, 'GET', 'mlv_nodes', {
      query: { id: `eq.${sharedNode.id}`, select: 'id' },
    });
    record('shared.anon_no_token', !anonNoToken.json || anonNoToken.json.length === 0, 'Anonymous without token cannot access SHARED');

    await rest(url, anonKey, alice.accessToken, 'PATCH', 'mlv_share_links', {
      query: { id: `eq.${share.id}` },
      body: { revoked_at: new Date().toISOString() },
    });
    const bobRevoked = await rpc(url, anonKey, bob.accessToken, 'mlv_open_share', { p_token: rawToken });
    record('shared.revoked', !bobRevoked.json || bobRevoked.json.length === 0, 'Revoked share denied');

    const expiredToken = randomBytes(24).toString('base64url');
    const expiredShare = await rest(url, anonKey, alice.accessToken, 'POST', 'mlv_share_links', {
      body: {
        node_id: sharedNode.id,
        owner_id: alice.userId,
        token_hash: hashToken(expiredToken),
        permission: 'view',
        expires_at: new Date(Date.now() - 60_000).toISOString(),
      },
    });
    const expired = Array.isArray(expiredShare.json) ? expiredShare.json[0] : expiredShare.json;
    if (expired?.id) created.shareIds.push(expired.id);
    const bobExpired = await rpc(url, anonKey, bob.accessToken, 'mlv_open_share', { p_token: expiredToken });
    record('shared.expired', !bobExpired.json || bobExpired.json.length === 0, 'Expired share denied');

    const createdPublic = await rest(url, anonKey, alice.accessToken, 'POST', 'mlv_nodes', {
      body: {
        owner_id: alice.userId,
        kind: 'file',
        name: publicName,
        mime_type: 'text/plain',
        visibility: 'public',
        metadata: { run_id: runId, fixture: true },
      },
    });
    const publicNode = Array.isArray(createdPublic.json) ? createdPublic.json[0] : createdPublic.json;
    if (publicNode?.id) created.nodeIds.push(publicNode.id);
    record('public.create', Boolean(createdPublic.ok && publicNode?.visibility === 'public'), 'Alice explicitly publishes PUBLIC');

    const anonPublic = await rest(url, anonKey, null, 'GET', 'mlv_nodes', {
      query: { id: `eq.${publicNode.id}`, select: 'id,visibility' },
    });
    record('public.anon_read', Array.isArray(anonPublic.json) && anonPublic.json[0]?.id === publicNode.id, 'Anonymous public open succeeds');

    const anonDiscover = await rest(url, anonKey, null, 'GET', 'mlv_nodes', {
      query: { visibility: 'eq.public', select: 'id,name', name: `eq.${publicName}` },
    });
    record('public.discoverable', Array.isArray(anonDiscover.json) && anonDiscover.json.some((row) => row.id === publicNode.id), 'PUBLIC appears on intended discovery surface');

    await rest(url, anonKey, alice.accessToken, 'PATCH', 'mlv_nodes', {
      query: { id: `eq.${publicNode.id}` },
      body: { visibility: 'private' },
    });
    const anonAfter = await rest(url, anonKey, null, 'GET', 'mlv_nodes', {
      query: { id: `eq.${publicNode.id}`, select: 'id' },
    });
    record('public.unpublish', !anonAfter.json || anonAfter.json.length === 0, 'Unpublish removes anonymous access');

    const storagePut = await fetch(`${url}/storage/v1/object/mlv-private/${privateKey}`, {
      method: 'POST',
      headers: {
        ...restHeaders(anonKey, alice.accessToken),
        'Content-Type': 'text/plain',
        'x-upsert': 'true',
      },
      body: `${runId} private bytes`,
    });
    created.storageKeys.push(privateKey);
    record('storage.alice_write', storagePut.ok, 'Alice private object write');

    const aliceGet = await storageGet(url, anonKey, alice.accessToken, 'mlv-private', privateKey);
    record('storage.alice_read', aliceGet.ok, 'Alice private object read');

    const bobGet = await storageGet(url, anonKey, bob.accessToken, 'mlv-private', privateKey);
    record('storage.bob_denied', !bobGet.ok, 'Bob private object direct access fails');

    const anonGet = await storageGet(url, anonKey, null, 'mlv-private', privateKey);
    record('storage.anon_denied', !anonGet.ok, 'Anonymous private object direct access fails');

    record('bridge.no_token_echo', true, 'Harness never prints share tokens; gunnchOS bridge redaction is proven in device-os tests, not this hosted run');
    record('intent.default_private', privateNode?.visibility === 'private', 'Created artifact remains PRIVATE unless explicitly published');
    record('intent.no_silent_public', publicNode?.visibility === 'private', 'PUBLIC required an explicit write; unpublish returned PRIVATE');
  } finally {
    for (const shareId of created.shareIds) {
      await rest(url, anonKey, alice.accessToken, 'DELETE', 'mlv_share_links', { query: { id: `eq.${shareId}` } });
    }
    for (const nodeId of created.nodeIds) {
      await rest(url, anonKey, alice.accessToken, 'PATCH', 'mlv_nodes', {
        query: { id: `eq.${nodeId}` },
        body: { deleted_at: new Date().toISOString(), metadata: { run_id: runId, fixture: true, cleaned: true } },
      });
    }
    for (const key of created.storageKeys) {
      await fetch(`${url}/storage/v1/object/mlv-private/${key}`, {
        method: 'DELETE',
        headers: restHeaders(anonKey, alice.accessToken),
      });
    }
  }

  const requiredIds = [
    'private.create',
    'private.alice_read',
    'private.bob_denied',
    'private.anon_denied',
    'shared.hash_only',
    'shared.not_listed',
    'shared.valid_token',
    'shared.anon_no_token',
    'shared.revoked',
    'shared.expired',
    'public.create',
    'public.anon_read',
    'public.discoverable',
    'public.unpublish',
    'storage.alice_write',
    'storage.alice_read',
    'storage.bob_denied',
    'storage.anon_denied',
  ];
  const allRequired = requiredIds.every((id) => cases.find((c) => c.id === id)?.pass);
  const report = {
    kind: 'hosted_supabase_acceptance',
    executed: true,
    run_id: runId,
    started_at: started,
    finished_at: new Date().toISOString(),
    project_host: redact(new URL(url).host),
    alice_id_prefix: alice.userId.slice(0, 8),
    bob_id_prefix: bob.userId.slice(0, 8),
    cases,
    passed: cases.filter((c) => c.pass).length,
    failed: cases.filter((c) => !c.pass).length,
    claim_boundary: allRequired
      ? 'Hosted two-user privacy passed for this fixture run. Still not a production-security claim.'
      : 'Hosted run executed but required cases failed. Hosted privacy remains false.',
    gates: {
      MLV_HOSTED_SUPABASE_RLS_PASS: allRequired,
      MLV_GITHUB_OAUTH_PASS: false,
      MLV_HOSTED_TWO_USER_PRIVACY_PASS: allRequired,
      MLV_PRODUCTION_SECURITY_CLAIM: false,
    },
  };
  await writeReport(report);
  console.log(`Hosted acceptance ${allRequired ? 'PASS' : 'FAIL'} (${report.passed}/${cases.length})`);
  console.log(`Sanitized report: ${outJson}`);
  process.exit(allRequired ? 0 : 1);
}

main().catch(async (error) => {
  const started = new Date().toISOString();
  const report = emptyReport({
    reason: `Harness crashed without printing secrets: ${error.message}`,
    runId: 'crash',
    started,
  });
  await writeReport(report);
  console.error(report.reason);
  process.exit(1);
});
