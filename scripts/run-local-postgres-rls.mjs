#!/usr/bin/env node
/**
 * Real local PostgreSQL RLS proof using PGlite (WASM Postgres).
 * Not hosted Supabase. Not a claim of production security.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outJson = path.join(root, 'artifacts/security/LOCAL_SUPABASE_RLS_PROOF.json');
const outMd = path.join(root, 'docs/testing/LOCAL_SUPABASE_RLS_PROOF.md');

const ALICE = '11111111-1111-4111-8111-111111111111';
const BOB = '22222222-2222-4222-8222-222222222222';
const PRIVATE_ID = 'aaaaaaa1-1111-4111-8111-111111111111';
const SHARED_ID = 'aaaaaaa2-2222-4222-8222-222222222222';
const PUBLIC_ID = 'aaaaaaa3-3333-4333-8333-333333333333';
const PLACE_ID = 'bbbbbbb1-1111-4111-8111-111111111111';

function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

async function loadPglite() {
  try {
    return await import('@electric-sql/pglite');
  } catch (error) {
    return { error };
  }
}

function asRoleSql(userId) {
  // Superuser bypasses RLS. Local proof must use non-superuser roles.
  // Session GUCs (is_local=false) so the JWT claim survives SET ROLE / next query.
  if (!userId) {
    return `
      reset role;
      select set_config('request.jwt.claim.sub', '', false);
      set role anon;
    `;
  }
  return `
    reset role;
    select set_config('request.jwt.claim.sub', '${userId}', false);
    set role authenticated;
  `;
}

async function asSuperuser(db) {
  await db.exec(`reset role`);
}

const GRANT_APP_ROLES = `
  grant usage on schema public to anon, authenticated;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema storage to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
  grant select on all tables in schema public to anon;
  grant usage, select on all sequences in schema public to authenticated, anon;
  grant select, insert, update, delete on storage.objects to authenticated;
  grant select on storage.objects to anon;
  grant select on storage.buckets to anon, authenticated;
  grant execute on function mlv_open_share(text) to anon, authenticated;
  grant execute on function mlv_hash_share_token(text) to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`;

async function main() {
  const started = new Date().toISOString();
  const cases = [];
  const blockers = [
    'Docker is not installed on this host.',
    'Supabase CLI is not installed.',
    'Hosted/local supabase start was not available.',
    'Homebrew PostgreSQL is not installed.',
  ];

  const mod = await loadPglite();
  if (mod.error) {
    const proof = {
      proven: false,
      engine: null,
      started,
      finished: new Date().toISOString(),
      blockers: [...blockers, `PGlite import failed: ${mod.error.message}`],
      cases,
      claim: 'RLS is not proven. In-memory harness remains the only passing isolation evidence.',
    };
    await persist(proof);
    console.error(JSON.stringify(proof, null, 2));
    process.exit(2);
  }

  const { PGlite } = mod;
  const db = new PGlite();

  const stub = await readFile(path.join(root, 'scripts/sql/pglite_auth_storage_stub.sql'), 'utf8');
  const legacy = await readFile(path.join(root, 'infra/supabase.sql'), 'utf8');
  const mig1 = await readFile(path.join(root, 'infra/migrations/0001_mlv_world_workspace.sql'), 'utf8');
  const mig2 = await readFile(path.join(root, 'infra/migrations/0002_tighten_legacy_public_reads.sql'), 'utf8');

  // PGlite has sha256() but may lack pgcrypto.digest; normalize hash helper after apply.
  const mig3 = await readFile(path.join(root, 'infra/migrations/0003_force_row_level_security.sql'), 'utf8');
  try {
    await db.exec(stub);
  } catch (error) {
    const msg = String(error.message || error);
    if (!msg.includes('role')) throw error;
    await db.exec(stub.replace(/do \$\$[\s\S]*?end\$\$;/m, ''));
  }
  await db.exec(legacy);
  const mig1Adapted = mig1
    .replace(/create extension if not exists pgcrypto;/g, '')
    .replaceAll("digest(p_token, 'sha256')", "sha256(convert_to(p_token, 'UTF8'))");
  await db.exec(mig1Adapted);
  await db.exec(mig2);
  await db.exec(mig3);
  await db.exec(GRANT_APP_ROLES);
  await db.exec(`
    alter table mlv_nodes force row level security;
    alter table mlv_share_links force row level security;
    alter table mlv_world_placements force row level security;
    alter table mlv_player_instances force row level security;
    alter table storage.objects force row level security;
    alter table if exists projects force row level security;
    alter table if exists house_layouts force row level security;
  `);

  await db.exec(`
    insert into auth.users (id, raw_user_meta_data) values
      ('${ALICE}', '{"user_name":"alice","full_name":"Alice"}'),
      ('${BOB}', '{"user_name":"bob","full_name":"Bob"}');
    update profiles set handle = 'alice' where id = '${ALICE}';
    update profiles set handle = 'bob' where id = '${BOB}';
  `);

  const rawToken = 'mlv-share-token-local-rls-proof-24';
  const tokenHash = hashToken(rawToken);
  const expiredToken = 'mlv-share-token-expired-proof-24';
  const expiredHash = hashToken(expiredToken);

  await asSuperuser(db);
  await db.exec(`
    insert into mlv_player_instances (owner_id) values ('${ALICE}');
    insert into mlv_nodes (id, owner_id, kind, name, mime_type, visibility)
      values
        ('${PRIVATE_ID}', '${ALICE}', 'file', 'private-notes.md', 'text/markdown', 'private'),
        ('${SHARED_ID}', '${ALICE}', 'file', 'shared-photo.png', 'image/png', 'shared'),
        ('${PUBLIC_ID}', '${ALICE}', 'file', 'public-report.pdf', 'application/pdf', 'public');
    insert into mlv_world_placements (id, owner_id, node_id, room_id, presentation_type)
      values ('${PLACE_ID}', '${ALICE}', '${PRIVATE_ID}', 'home.desk', 'parcel');
    insert into mlv_share_links (node_id, owner_id, token_hash, permission)
      values ('${SHARED_ID}', '${ALICE}', '${tokenHash}', 'view');
    insert into mlv_share_links (node_id, owner_id, token_hash, permission, expires_at)
      values ('${SHARED_ID}', '${ALICE}', '${expiredHash}', 'view', now() - interval '1 hour');
    insert into storage.objects (bucket_id, name, owner)
      values ('mlv-private', '${ALICE}/private-notes.md', '${ALICE}');
  `);

  async function countAs(userId, sql) {
    await db.exec(asRoleSql(userId));
    const { rows } = await db.query(sql);
    return Number(rows[0]?.n ?? 0);
  }

  async function record(name, fn) {
    try {
      const ok = await fn();
      cases.push({ name, ok, detail: ok ? 'pass' : 'assertion failed' });
      return ok;
    } catch (error) {
      cases.push({ name, ok: false, detail: String(error.message || error) });
      return false;
    }
  }

  await record('alice_reads_private_node', async () => {
    const n = await countAs(ALICE, `select count(*)::int as n from mlv_nodes where id = '${PRIVATE_ID}'`);
    return n === 1;
  });
  await record('bob_cannot_select_private_node', async () => {
    const n = await countAs(BOB, `select count(*)::int as n from mlv_nodes where id = '${PRIVATE_ID}'`);
    return n === 0;
  });
  await record('anonymous_cannot_select_private_node', async () => {
    const n = await countAs(null, `select count(*)::int as n from mlv_nodes where id = '${PRIVATE_ID}'`);
    return n === 0;
  });
  await record('bob_cannot_infer_private_filename_or_count', async () => {
    const names = await (async () => {
      await db.exec(asRoleSql(BOB));
      const { rows } = await db.query(`select name from mlv_nodes where owner_id = '${ALICE}'`);
      return rows.map((r) => r.name);
    })();
    return !names.includes('private-notes.md') && !names.includes('shared-photo.png');
  });
  await record('shared_uuid_alone_does_not_grant_access', async () => {
    const n = await countAs(null, `select count(*)::int as n from mlv_nodes where id = '${SHARED_ID}'`);
    return n === 0;
  });
  await record('valid_share_token_opens_only_intended_node', async () => {
    await db.exec(asRoleSql(null));
    const { rows } = await db.query(`select id, name from mlv_open_share($1)`, [rawToken]);
    return rows.length === 1 && rows[0].id === SHARED_ID && rows[0].name === 'shared-photo.png';
  });
  await record('revoked_token_fails', async () => {
    await db.exec(asRoleSql(ALICE));
    await db.exec(`update mlv_share_links set revoked_at = now() where token_hash = '${tokenHash}'`);
    await db.exec(asRoleSql(null));
    const { rows } = await db.query(`select id from mlv_open_share($1)`, [rawToken]);
    return rows.length === 0;
  });
  await record('expired_token_fails', async () => {
    await db.exec(asRoleSql(null));
    const { rows } = await db.query(`select id from mlv_open_share($1)`, [expiredToken]);
    return rows.length === 0;
  });
  await record('anonymous_reads_public_node', async () => {
    const n = await countAs(null, `select count(*)::int as n from mlv_nodes where id = '${PUBLIC_ID}'`);
    return n === 1;
  });
  await record('unpublish_removes_public_access', async () => {
    await db.exec(asRoleSql(ALICE));
    await db.exec(`update mlv_nodes set visibility = 'private' where id = '${PUBLIC_ID}'`);
    const n = await countAs(null, `select count(*)::int as n from mlv_nodes where id = '${PUBLIC_ID}'`);
    return n === 0;
  });
  await record('bob_cannot_update_or_delete_alice_node', async () => {
    await db.exec(asRoleSql(BOB));
    await db.exec(`update mlv_nodes set name = 'hacked' where id = '${PRIVATE_ID}'`);
    await db.exec(`delete from mlv_nodes where id = '${PRIVATE_ID}'`);
    await db.exec(asRoleSql(ALICE));
    const { rows } = await db.query(`select name, deleted_at from mlv_nodes where id = '${PRIVATE_ID}'`);
    return rows[0]?.name === 'private-notes.md' && rows[0]?.deleted_at == null;
  });
  await record('private_placement_does_not_leak', async () => {
    const n = await countAs(BOB, `select count(*)::int as n from mlv_world_placements where id = '${PLACE_ID}'`);
    const names = await (async () => {
      await db.exec(asRoleSql(BOB));
      const { rows } = await db.query(`select node_id from mlv_world_placements`);
      return rows;
    })();
    return n === 0 && names.length === 0;
  });
  await record('alice_can_read_own_private_storage_object', async () => {
    const n = await countAs(ALICE, `select count(*)::int as n from storage.objects where name = '${ALICE}/private-notes.md'`);
    return n === 1;
  });
  await record('bob_cannot_read_alice_private_storage_object', async () => {
    const n = await countAs(BOB, `select count(*)::int as n from storage.objects where name = '${ALICE}/private-notes.md'`);
    return n === 0;
  });

  const proven = cases.every((c) => c.ok);
  const proof = {
    proven,
    engine: 'pglite-postgres-rls',
    engine_note: 'PGlite is in-process PostgreSQL. Docker/Supabase CLI were unavailable; this is local real-SQL RLS, not hosted Supabase.',
    started,
    finished: new Date().toISOString(),
    blockers_avoided_by_fallback: blockers,
    hosted_supabase_still_required: true,
    cases,
    passed: cases.filter((c) => c.ok).length,
    failed: cases.filter((c) => !c.ok).length,
    claim: proven
      ? 'Local PostgreSQL RLS isolation proven via PGlite. Not hosted/production security.'
      : 'Local PostgreSQL RLS proof failed. Do not claim RLS proven.',
  };
  await persist(proof);
  console.log(JSON.stringify(proof, null, 2));
  process.exit(proven ? 0 : 1);
}

async function persist(proof) {
  await mkdir(path.dirname(outJson), { recursive: true });
  await mkdir(path.dirname(outMd), { recursive: true });
  await writeFile(outJson, `${JSON.stringify(proof, null, 2)}\n`);
  const lines = [
    '# Local PostgreSQL RLS proof',
    '',
    `Proven: **${proof.proven ? 'YES (local PGlite Postgres)' : 'NO'}**`,
    '',
    proof.claim,
    '',
    '## Host availability',
    '',
    '- Docker: unavailable',
    '- Supabase CLI: unavailable',
    '- Homebrew PostgreSQL: unavailable',
    '- Fallback engine: PGlite (real PostgreSQL, in-process)',
    '',
    'This is **not** hosted Supabase validation. Owner still must authorize a hosted project, apply migrations, and configure GitHub OAuth.',
    '',
    '## Cases',
    '',
    ...(proof.cases || []).map((c) => `- ${c.ok ? 'PASS' : 'FAIL'} \`${c.name}\` — ${c.detail}`),
    '',
  ];
  await writeFile(outMd, `${lines.join('\n')}\n`);
}

main().catch(async (error) => {
  const proof = {
    proven: false,
    engine: 'pglite-postgres-rls',
    finished: new Date().toISOString(),
    blockers: [String(error.stack || error)],
    cases: [],
    claim: 'Local RLS runner crashed. RLS is not proven.',
  };
  await persist(proof);
  console.error(error);
  process.exit(1);
});
