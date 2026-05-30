-- Graphology — Initial Schema
-- Arcana project (jpwmfztcprbwkpbkyiqm) — namespaced as graphology_*
-- Run via: supabase db push

-- ── Enable UUID extension ──────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── graphology_profiles ───────────────────────────────────────────────────────
create table if not exists public.graphology_profiles (
  id                uuid        primary key references auth.users(id) on delete cascade,
  subscription_tier text        not null default 'free',
  analyses_used     integer     not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.graphology_profiles enable row level security;

create policy "graphology: users can view own profile"
  on public.graphology_profiles for select
  using (auth.uid() = id);

create policy "graphology: users can update own profile"
  on public.graphology_profiles for update
  using (auth.uid() = id);

create policy "graphology: users can insert own profile"
  on public.graphology_profiles for insert
  with check (auth.uid() = id);

-- ── graphology_analyses ───────────────────────────────────────────────────────
create table if not exists public.graphology_analyses (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references public.graphology_profiles(id) on delete cascade,
  image_url           text,
  -- Structural handwriting analysis fields
  baseline            jsonb,       -- angle, consistency, direction
  slant               jsonb,       -- degree, direction, consistency
  pressure            jsonb,       -- weight, consistency, zones
  letter_size         jsonb,       -- height, width, zone ratios
  spacing             jsonb,       -- between letters, between words, between lines
  notable_traits      jsonb,       -- array of standout trait objects
  personality_profile text,        -- synthesized narrative paragraph
  created_at          timestamptz not null default now()
);

create index if not exists graphology_analyses_user_id_idx   on public.graphology_analyses(user_id);
create index if not exists graphology_analyses_created_at_idx on public.graphology_analyses(created_at desc);

alter table public.graphology_analyses enable row level security;

create policy "graphology: users can view own analyses"
  on public.graphology_analyses for select
  using (auth.uid() = user_id);

create policy "graphology: users can insert own analyses"
  on public.graphology_analyses for insert
  with check (auth.uid() = user_id);

create policy "graphology: users can update own analyses"
  on public.graphology_analyses for update
  using (auth.uid() = user_id);

-- Service role bypass (for edge function inserts)
create policy "graphology: service role full access"
  on public.graphology_analyses for all
  using (auth.role() = 'service_role');

-- ── Auto-create graphology_profiles on auth.users insert ─────────────────────
create or replace function public.handle_new_graphology_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.graphology_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_graphology on auth.users;

create trigger on_auth_user_created_graphology
  after insert on auth.users
  for each row execute procedure public.handle_new_graphology_user();

-- ── Increment analyses counter ────────────────────────────────────────────────
create or replace function public.increment_graphology_analyses_used(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.graphology_profiles
  set analyses_used = analyses_used + 1
  where id = p_user_id;
end;
$$;
