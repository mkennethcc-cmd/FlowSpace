-- ============================================================
-- FlowSpace — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. TABLES ───────────────────────────────────────────────────

create table public.tasks (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null,
  done          boolean default false,
  priority      text default 'medium' check (priority in ('low','medium','high')),
  tag           text default 'work',
  due           date,
  starred       boolean default false,
  notes         text default '',
  color         text,
  subtasks      jsonb default '[]'::jsonb,
  recurring     text,
  position      integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table public.matrix_notes (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  quadrant      text not null check (quadrant in ('q1','q2','q3','q4')),
  text          text not null,
  color         text default '#3b82f6',
  created_at    timestamptz default now()
);

create table public.canvas_notes (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  text          text not null,
  x             float default 0,
  y             float default 0,
  color         text default '#3b82f6',
  created_at    timestamptz default now()
);

create table public.notes (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  title         text not null default 'Untitled',
  body          text default '',
  pinned        boolean default false,
  color         text default '#3b82f6',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table public.categories (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  color         text not null,
  created_at    timestamptz default now(),
  unique(user_id, name)
);

-- 2. ROW LEVEL SECURITY ───────────────────────────────────────
-- Each user can only see and edit their own data

alter table public.tasks         enable row level security;
alter table public.matrix_notes  enable row level security;
alter table public.canvas_notes  enable row level security;
alter table public.notes         enable row level security;
alter table public.categories    enable row level security;

create policy "own tasks"        on public.tasks        for all using (auth.uid() = user_id);
create policy "own matrix_notes" on public.matrix_notes for all using (auth.uid() = user_id);
create policy "own canvas_notes" on public.canvas_notes for all using (auth.uid() = user_id);
create policy "own notes"        on public.notes        for all using (auth.uid() = user_id);
create policy "own categories"   on public.categories   for all using (auth.uid() = user_id);

-- 3. AUTO-UPDATE updated_at ───────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function update_updated_at();

-- 4. REALTIME ─────────────────────────────────────────────────
-- Enables live cross-device sync

alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.matrix_notes;
alter publication supabase_realtime add table public.canvas_notes;
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.categories;

-- 5. PERFORMANCE INDEXES ──────────────────────────────────────

create index tasks_user_id_idx        on public.tasks(user_id);
create index tasks_due_idx            on public.tasks(due);
create index matrix_notes_user_id_idx on public.matrix_notes(user_id);
create index canvas_notes_user_id_idx on public.canvas_notes(user_id);
create index notes_user_id_idx        on public.notes(user_id);
create index categories_user_id_idx   on public.categories(user_id);
