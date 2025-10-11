-- Enable RLS
alter table auth.users enable row level security;

-- profiles: one row per user
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text,
  bio text,
  links jsonb default '{}'::jsonb, -- { github, linkedin, youtube, website }
  created_at timestamptz default now()
);

-- avatar config shared across games
create table avatar_config (
  user_id uuid primary key references profiles(id) on delete cascade,
  body jsonb not null,  -- { size, color, hairStyle, outfit, vfx }
  updated_at timestamptz default now()
);

-- project cards that appear on your house walls
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles(id) on delete cascade,
  title text not null,
  blurb text,
  tags text[],
  demo_url text,        -- embed if possible; fallback new tab
  repo_url text,
  video_url text,
  cover_url text,
  order_idx int default 0,
  created_at timestamptz default now()
);

-- house layouts for customization
create table house_layouts (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles(id) on delete cascade,
  layout jsonb not null, -- { walls, furniture, decorations }
  updated_at timestamptz default now()
);

-- RLS Policies
-- Users can read all profiles
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Avatar config policies
create policy "Public avatar configs are viewable by everyone" on avatar_config
  for select using (true);

create policy "Users can update own avatar config" on avatar_config
  for update using (auth.uid() = user_id);

create policy "Users can insert own avatar config" on avatar_config
  for insert with check (auth.uid() = user_id);

-- Project policies
create policy "Public projects are viewable by everyone" on projects
  for select using (true);

create policy "Users can manage own projects" on projects
  for all using (auth.uid() = owner);

-- House layout policies
create policy "Public house layouts are viewable by everyone" on house_layouts
  for select using (true);

create policy "Users can manage own house layout" on house_layouts
  for all using (auth.uid() = owner);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
