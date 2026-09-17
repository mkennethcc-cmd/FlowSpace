-- ═══════════════════════════════════════════════════════════════════════════
--  Freely · base tables — ONLY for a brand-new, empty Supabase project
--
--  Your live project already has all of this; you never need to run it there.
--  It exists so the app can be rebuilt from nothing — a staging copy for testing
--  a big change (like adding an authenticator), or disaster recovery.
--
--  New project, in order:
--    1. this file            (base tables, their security rules, the attachments bucket)
--    2. supabase/setup.sql   (everything added since: sharing, teams, messages…)
--    3. supabase/verify-collab.sql, once two accounts exist (proves the rules hold)
--
--  Column types were read from the live project on 2026-09-17, not guessed.
--  Every statement is "if not exists" or guarded, so an accidental run on a
--  project that already has these tables changes nothing.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users on delete cascade,
  title          text not null,
  done           boolean default false,
  priority       text default 'medium',
  tag            text,
  due            date,
  starred        boolean default false,
  notes          text default '',
  color          text,
  subtasks       jsonb default '[]'::jsonb,
  recurring      text,
  quadrant       text,
  remind_at      text,
  time_end       text,
  attachments    jsonb default '[]'::jsonb,
  position       double precision,
  myday_date     text,
  assigned_to    text,
  assign_private boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  title      text not null default 'Untitled',
  body       text default '',
  pinned     boolean default false,
  color      text,
  drawing    text,
  task_id    text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.canvas_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  text       text not null default '',
  x          double precision default 0,
  y          double precision default 0,
  color      text,
  created_at timestamptz default now()
);

create table if not exists public.habits (
  id         bigint primary key,
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null,
  icon       text,
  color      text,
  cadence    integer default 7,
  log        jsonb default '[]'::jsonb,
  days       jsonb,
  prio       integer,
  position   double precision,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null,
  color      text not null,
  icon       text,
  created_at timestamptz default now()
  -- one row per list name per person: the unique index comes from setup.sql
);

create table if not exists public.gamification (
  user_id     uuid primary key references auth.users on delete cascade,
  xp          integer default 0,
  streak      integer default 0,
  last_active text,
  awarded     jsonb default '[]'::jsonb,
  prefs       jsonb,
  updated_at  timestamptz default now()
);

create table if not exists public.folder_shares (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users on delete cascade,
  folder            text not null,
  shared_with_email text not null,
  can_delete        boolean default false,
  can_edit          boolean default true,
  created_at        timestamptz default now(),
  unique (owner_id, folder, shared_with_email)
);

create index if not exists tasks_user_id_idx        on public.tasks (user_id);
create index if not exists notes_user_id_idx        on public.notes (user_id);
create index if not exists canvas_notes_user_id_idx on public.canvas_notes (user_id);
create index if not exists habits_user_id_idx       on public.habits (user_id);
create index if not exists folder_shares_email_idx  on public.folder_shares (lower(shared_with_email));

-- Security rules. Each block runs only if that table has NO rules yet — a fresh
-- project — so it can never replace rules a live project already relies on.
alter table public.tasks         enable row level security;
alter table public.gamification  enable row level security;
alter table public.folder_shares enable row level security;
-- notes, canvas_notes, habits and categories get their "own rows" rule from setup.sql.

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks') then
    create policy "tasks: own" on public.tasks for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
    -- people you shared a list with can see its tasks…
    create policy "tasks: shared lists read" on public.tasks for select to authenticated
      using (exists (select 1 from public.folder_shares fs
                     where fs.owner_id = tasks.user_id and fs.folder = tasks.tag
                       and lower(fs.shared_with_email) = lower(auth.jwt() ->> 'email')));
    -- …and delete in it when the share allows it
    create policy "tasks: shared lists delete" on public.tasks for delete to authenticated
      using (exists (select 1 from public.folder_shares fs
                     where fs.owner_id = tasks.user_id and fs.folder = tasks.tag and fs.can_delete
                       and lower(fs.shared_with_email) = lower(auth.jwt() ->> 'email')));
    -- (editing and adding in a shared list, and assignment, come from setup.sql)
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'gamification') then
    create policy "gamification: own" on public.gamification for all to authenticated
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'folder_shares') then
    create policy "shares: owner manages" on public.folder_shares for all to authenticated
      using (owner_id = auth.uid()) with check (owner_id = auth.uid());
    create policy "shares: invitee sees" on public.folder_shares for select to authenticated
      using (lower(shared_with_email) = lower(auth.jwt() ->> 'email'));
    create policy "shares: invitee leaves" on public.folder_shares for delete to authenticated
      using (lower(shared_with_email) = lower(auth.jwt() ->> 'email'));
  end if;
end $$;

-- Attachments bucket: public, so a shared task's photos load for collaborators.
-- Uploads go under <your user id>/…, and only you can add or remove files there.
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', true)
  on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
                 and policyname like 'attachments:%') then
    create policy "attachments: upload own" on storage.objects for insert to authenticated
      with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
    create policy "attachments: delete own" on storage.objects for delete to authenticated
      using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;

-- Live updates for the tables the app listens to (setup.sql adds the messaging ones).
do $$
declare t text;
begin
  foreach t in array array['tasks', 'folder_shares'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
