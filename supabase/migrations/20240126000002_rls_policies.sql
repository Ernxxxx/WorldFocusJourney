-- World Focus Journey - RLS Policies
-- Phase 1: Row Level Security

-- RLS有効化
alter table profiles enable row level security;
alter table locations enable row level security;
alter table paths enable row level security;
alter table user_progress enable row level security;
alter table sessions enable row level security;

-- profiles: 本人のみ
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- locations: 全ユーザー read-only
create policy "Anyone can view locations"
  on locations for select
  to authenticated
  using (true);

-- paths: 全ユーザー read-only
create policy "Anyone can view paths"
  on paths for select
  to authenticated
  using (true);

-- user_progress: 本人のみ
create policy "Users can view own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_progress for update
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

-- sessions: 本人のみ
create policy "Users can view own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on sessions for update
  using (auth.uid() = user_id);
