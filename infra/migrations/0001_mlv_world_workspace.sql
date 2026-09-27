-- 0001_mlv_world_workspace.sql
-- Non-destructive: adds private-by-default world workspace tables.
-- Does not drop legacy profiles / projects / house_layouts.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'mlv_visibility') then
    create type mlv_visibility as enum ('private', 'shared', 'public');
  end if;
  if not exists (select 1 from pg_type where typname = 'mlv_node_kind') then
    create type mlv_node_kind as enum ('file', 'folder', 'project', 'shortcut', 'creation');
  end if;
  if not exists (select 1 from pg_type where typname = 'mlv_share_permission') then
    create type mlv_share_permission as enum ('view', 'download');
  end if;
end$$;

create table if not exists mlv_nodes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid references mlv_nodes (id) on delete set null,
  kind mlv_node_kind not null default 'file',
  name text not null,
  mime_type text,
  size_bytes bigint,
  sha256 text,
  storage_key text,
  visibility mlv_visibility not null default 'private',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint mlv_nodes_no_self_parent check (parent_id is distinct from id)
);

create table if not exists mlv_share_links (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references mlv_nodes (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,
  permission mlv_share_permission not null default 'view',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists mlv_world_placements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  node_id uuid not null references mlv_nodes (id) on delete cascade,
  room_id text not null default 'home.desk',
  position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  rotation jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  scale jsonb not null default '{"x":1,"y":1,"z":1}'::jsonb,
  presentation_type text not null default 'parcel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mlv_player_instances (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  world_config jsonb not null default '{}'::jsonb,
  home_theme text not null default 'cozy',
  spawn jsonb not null default '{"x":0,"y":1,"z":4}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists mlv_nodes_owner_idx on mlv_nodes (owner_id) where deleted_at is null;
create index if not exists mlv_nodes_parent_idx on mlv_nodes (parent_id) where deleted_at is null;
create index if not exists mlv_nodes_public_idx on mlv_nodes (id) where visibility = 'public' and deleted_at is null;
create index if not exists mlv_share_links_node_idx on mlv_share_links (node_id);
create index if not exists mlv_share_links_hash_idx on mlv_share_links (token_hash);
create index if not exists mlv_placements_owner_idx on mlv_world_placements (owner_id);
create index if not exists mlv_placements_node_idx on mlv_world_placements (node_id);

alter table mlv_nodes enable row level security;
alter table mlv_share_links enable row level security;
alter table mlv_world_placements enable row level security;
alter table mlv_player_instances enable row level security;

-- Owner full access
drop policy if exists mlv_nodes_owner_all on mlv_nodes;
create policy mlv_nodes_owner_all on mlv_nodes
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Anonymous / other users may read PUBLIC only. SHARED is never readable by UUID.
drop policy if exists mlv_nodes_public_select on mlv_nodes;
create policy mlv_nodes_public_select on mlv_nodes
  for select
  using (visibility = 'public' and deleted_at is null);

drop policy if exists mlv_share_links_owner_all on mlv_share_links;
create policy mlv_share_links_owner_all on mlv_share_links
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists mlv_placements_owner_all on mlv_world_placements;
create policy mlv_world_placements_owner_all on mlv_world_placements
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Public placements only when the underlying node is PUBLIC.
drop policy if exists mlv_placements_public_select on mlv_world_placements;
create policy mlv_placements_public_select on mlv_world_placements
  for select
  using (
    exists (
      select 1 from mlv_nodes n
      where n.id = mlv_world_placements.node_id
        and n.visibility = 'public'
        and n.deleted_at is null
    )
  );

drop policy if exists mlv_player_instances_owner_all on mlv_player_instances;
create policy mlv_player_instances_owner_all on mlv_player_instances
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Hash a presented bearer token. Never persist the raw token.
create or replace function mlv_hash_share_token(p_token text)
returns text
language sql
immutable
as $$
  select encode(digest(p_token, 'sha256'), 'hex');
$$;

-- SECURITY DEFINER RPC: valid token opens exactly the intended node.
create or replace function mlv_open_share(p_token text)
returns table (
  id uuid,
  owner_id uuid,
  parent_id uuid,
  kind mlv_node_kind,
  name text,
  mime_type text,
  size_bytes bigint,
  visibility mlv_visibility,
  metadata jsonb,
  permission mlv_share_permission
)
language plpgsql
security definer
set search_path = public
as $$
declare
  hashed text;
begin
  if p_token is null or length(p_token) < 16 then
    return;
  end if;
  hashed := mlv_hash_share_token(p_token);
  return query
    select
      n.id,
      n.owner_id,
      n.parent_id,
      n.kind,
      n.name,
      n.mime_type,
      n.size_bytes,
      n.visibility,
      n.metadata,
      s.permission
    from mlv_share_links s
    join mlv_nodes n on n.id = s.node_id
    where s.token_hash = hashed
      and s.revoked_at is null
      and (s.expires_at is null or s.expires_at > now())
      and n.deleted_at is null
      and n.visibility = 'shared';
end;
$$;

revoke all on function mlv_open_share(text) from public;
grant execute on function mlv_open_share(text) to anon, authenticated;

create or replace function mlv_ensure_player_instance()
returns mlv_player_instances
language plpgsql
security definer
set search_path = public
as $$
declare
  inst mlv_player_instances;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into mlv_player_instances (owner_id)
  values (auth.uid())
  on conflict (owner_id) do update set updated_at = now()
  returning * into inst;
  return inst;
end;
$$;

revoke all on function mlv_ensure_player_instance() from public;
grant execute on function mlv_ensure_player_instance() to authenticated;

-- Storage buckets (private bytes never go in a public CDN).
insert into storage.buckets (id, name, public)
values ('mlv-private', 'mlv-private', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mlv-public', 'mlv-public', true)
on conflict (id) do nothing;

drop policy if exists mlv_private_owner_read on storage.objects;
create policy mlv_private_owner_read on storage.objects
  for select
  using (
    bucket_id = 'mlv-private'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists mlv_private_owner_write on storage.objects;
create policy mlv_private_owner_write on storage.objects
  for insert
  with check (
    bucket_id = 'mlv-private'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists mlv_public_read on storage.objects;
create policy mlv_public_read on storage.objects
  for select
  using (bucket_id = 'mlv-public');

drop policy if exists mlv_public_owner_write on storage.objects;
create policy mlv_public_owner_write on storage.objects
  for insert
  with check (
    bucket_id = 'mlv-public'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
