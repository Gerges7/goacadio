-- GoAcadio V2.5 — user-owned focus sessions.
-- Run ONE TIME in Supabase SQL Editor (postgres/project owner), after 001.
-- Idempotent migration; does not remove existing student data.
begin;

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_session_id uuid not null,
  course_id uuid references public.student_courses(id) on delete set null,
  minutes smallint not null check (minutes = 25),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, client_session_id)
);

create index if not exists idx_focus_sessions_owner_time
  on public.focus_sessions(user_id, completed_at desc);

alter table public.focus_sessions enable row level security;
revoke all on table public.focus_sessions from anon, authenticated;
grant select, insert, delete on table public.focus_sessions to authenticated;

drop policy if exists "focus_sessions_owner_select" on public.focus_sessions;
create policy "focus_sessions_owner_select" on public.focus_sessions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "focus_sessions_owner_insert" on public.focus_sessions;
create policy "focus_sessions_owner_insert" on public.focus_sessions
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and completed_at <= now() + interval '5 minutes'
    and completed_at >= now() - interval '30 days'
    and (
      course_id is null or exists(
        select 1 from public.student_courses sc
        where sc.id = course_id and sc.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "focus_sessions_owner_delete" on public.focus_sessions;
create policy "focus_sessions_owner_delete" on public.focus_sessions
  for delete to authenticated using (user_id = (select auth.uid()));

commit;

select to_regclass('public.focus_sessions') as table_name,
       relrowsecurity as rls_enabled
from pg_class where oid=to_regclass('public.focus_sessions');
