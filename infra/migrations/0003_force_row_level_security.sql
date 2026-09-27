-- 0003_force_row_level_security.sql
-- Table owners and superuser API roles must not silently bypass workspace RLS.

alter table mlv_nodes force row level security;
alter table mlv_share_links force row level security;
alter table mlv_world_placements force row level security;
alter table mlv_player_instances force row level security;

do $$
begin
  if to_regclass('storage.objects') is not null then
    execute 'alter table storage.objects enable row level security';
    execute 'alter table storage.objects force row level security';
  end if;
end$$;
