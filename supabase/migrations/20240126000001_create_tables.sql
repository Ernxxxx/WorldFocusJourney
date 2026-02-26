-- World Focus Journey - Database Schema
-- Phase 1: Create Tables

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- locations (都市/ノード)
create table locations (
  id text primary key,
  country_code text default 'JP',
  name text not null,
  x float not null,
  y float not null,
  is_start boolean default false
);

-- paths (ルート)
create table paths (
  id uuid primary key default gen_random_uuid(),
  from_location_id text references locations(id) on delete cascade,
  to_location_id text references locations(id) on delete cascade,
  distance_km float not null
);

-- user_progress (ユーザー進捗)
create table user_progress (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_location_id text references locations(id),
  current_path_id uuid references paths(id),
  progress_km float default 0,
  updated_at timestamptz default now()
);

-- sessions (集中セッション)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,
  distance_earned_km float,
  status text check (status in ('SUCCESS', 'CANCELED', 'IN_PROGRESS')),
  created_at timestamptz default now()
);

-- インデックス
create index idx_sessions_user_id on sessions(user_id);
create index idx_user_progress_user_id on user_progress(user_id);
