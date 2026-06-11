
create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  igdb_id bigint unique,
  name text not null,
  slug text,
  cover_url text,
  first_release_date date,
  summary text,
  genres jsonb default '[]'::jsonb,
  platforms jsonb default '[]'::jsonb,
  developers jsonb default '[]'::jsonb,
  publishers jsonb default '[]'::jsonb,
  raw_igdb jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  status text not null default 'Backlog',
  platform_owned text,
  rating numeric(3,1),
  hours_played integer not null default 0,
  start_date date,
  finish_date date,
  notes text,
  mood text,
  completion_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, game_id)
);

create table if not exists public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  user_game_id uuid not null references public.user_games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  played_on date not null default current_date,
  duration_minutes integer,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_games_updated_at on public.games;
create trigger set_games_updated_at before update on public.games
for each row execute function public.set_updated_at();

drop trigger if exists set_user_games_updated_at on public.user_games;
create trigger set_user_games_updated_at before update on public.user_games
for each row execute function public.set_updated_at();

alter table public.games enable row level security;
alter table public.user_games enable row level security;
alter table public.play_sessions enable row level security;

drop policy if exists "Signed in users can read games" on public.games;
create policy "Signed in users can read games" on public.games
for select to authenticated using (true);

drop policy if exists "Signed in users can insert games" on public.games;
create policy "Signed in users can insert games" on public.games
for insert to authenticated with check (true);

drop policy if exists "Signed in users can update games" on public.games;
create policy "Signed in users can update games" on public.games
for update to authenticated using (true) with check (true);

drop policy if exists "Users can read own user_games" on public.user_games;
create policy "Users can read own user_games" on public.user_games
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert own user_games" on public.user_games;
create policy "Users can insert own user_games" on public.user_games
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update own user_games" on public.user_games;
create policy "Users can update own user_games" on public.user_games
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own user_games" on public.user_games;
create policy "Users can delete own user_games" on public.user_games
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can read own play_sessions" on public.play_sessions;
create policy "Users can read own play_sessions" on public.play_sessions
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert own play_sessions" on public.play_sessions;
create policy "Users can insert own play_sessions" on public.play_sessions
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update own play_sessions" on public.play_sessions;
create policy "Users can update own play_sessions" on public.play_sessions
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own play_sessions" on public.play_sessions;
create policy "Users can delete own play_sessions" on public.play_sessions
for delete to authenticated using (auth.uid() = user_id);

create or replace view public.user_game_library with (security_invoker=true) as
select
  ug.id, ug.user_id, ug.game_id, ug.status, ug.platform_owned, ug.rating,
  ug.hours_played, ug.start_date, ug.finish_date, ug.notes, ug.mood,
  ug.completion_type, ug.created_at, ug.updated_at,
  g.igdb_id, g.name, g.slug, g.cover_url, g.first_release_date,
  g.summary, g.genres, g.platforms
from public.user_games ug
join public.games g on g.id = ug.game_id;
