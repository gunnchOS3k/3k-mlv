-- 0002_tighten_legacy_public_reads.sql
-- Replace USING (true) on workspace content. Profiles remain public identity.

drop policy if exists "Public projects are viewable by everyone" on projects;
drop policy if exists "Public house layouts are viewable by everyone" on house_layouts;

drop policy if exists projects_owner_select on projects;
create policy projects_owner_select on projects
  for select
  using (auth.uid() = owner);

drop policy if exists house_layouts_owner_select on house_layouts;
create policy house_layouts_owner_select on house_layouts
  for select
  using (auth.uid() = owner);

-- Keep owner-manage policies if they already exist.
drop policy if exists "Users can manage own projects" on projects;
create policy "Users can manage own projects" on projects
  for all
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

drop policy if exists "Users can manage own house layout" on house_layouts;
create policy "Users can manage own house layout" on house_layouts
  for all
  using (auth.uid() = owner)
  with check (auth.uid() = owner);
