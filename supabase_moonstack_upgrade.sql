-- Moonstack feature upgrade migration
-- Run this in Supabase SQL Editor after your base schema exists.

-- Profiles: account settings tied to Supabase Auth users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text default '',
  linkedin_url text default '',
  gmail text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists full_name text default '',
  add column if not exists linkedin_url text default '',
  add column if not exists gmail text default '',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.profiles enable row level security;

drop policy if exists "profiles owner read" on public.profiles;
drop policy if exists "profiles owner write" on public.profiles;
create policy "profiles owner read" on public.profiles for select using (auth.uid() = id);
create policy "profiles owner write" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, gmail)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    gmail = excluded.gmail,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

-- Tasks: date-wise calendar planning.
alter table public.tasks
  add column if not exists due_date date,
  add column if not exists tag text default 'Learning';

-- Projects: richer project workspace.
alter table public.projects
  add column if not exists demo_url text,
  add column if not exists architecture text default '',
  add column if not exists features text default '',
  add column if not exists readme text default '',
  add column if not exists notes text default '';

-- Notes: topic/file organization and richer editor metadata.
alter table public.notes
  add column if not exists folder text default 'General',
  add column if not exists tags text[] default '{}',
  add column if not exists pinned boolean default false,
  add column if not exists updated_at timestamptz default now();

-- DSA tracker: flexible problem sheets and solution notes.
alter table public.dsa_problems
  add column if not exists problem_url text,
  add column if not exists solution text default '',
  add column if not exists notes text default '';

-- Health monitor.
create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  mood text not null default 'Focused',
  sleep_hours numeric default 0,
  water_glasses integer default 0,
  activities text default '',
  notes text default '',
  created_at timestamptz default now(),
  unique (user_id, log_date)
);

-- Optional future backend integration for roadmap.sh / GitHub / DSA imports.
create table if not exists public.roadmap_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_url text not null,
  goal text default 'AI Engineer',
  plan_days integer default 30,
  generated_plan jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- App state snapshot for the rebuilt Next.js client.
-- This gives Moonstack real Supabase persistence immediately while feature tables mature.
create table if not exists public.moonstack_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.health_logs enable row level security;
alter table public.roadmap_sources enable row level security;
alter table public.moonstack_state enable row level security;

drop policy if exists "health owner read" on public.health_logs;
drop policy if exists "health owner write" on public.health_logs;
create policy "health owner read" on public.health_logs for select using (auth.uid() = user_id);
create policy "health owner write" on public.health_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "roadmap owner read" on public.roadmap_sources;
drop policy if exists "roadmap owner write" on public.roadmap_sources;
create policy "roadmap owner read" on public.roadmap_sources for select using (auth.uid() = user_id);
create policy "roadmap owner write" on public.roadmap_sources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moonstack state owner read" on public.moonstack_state;
drop policy if exists "moonstack state owner write" on public.moonstack_state;
create policy "moonstack state owner read" on public.moonstack_state for select using (auth.uid() = user_id);
create policy "moonstack state owner write" on public.moonstack_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
