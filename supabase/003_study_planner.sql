-- GoAcadio V2.4: private study planner (tasks and exams).
-- Run as Supabase SQL Editor project owner. Safe to re-run; no existing rows are deleted.
begin;

create table if not exists public.study_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.student_courses(id) on delete set null,
  kind text not null default 'task' check (kind in ('task','exam')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  notes text check (char_length(notes) <= 1000),
  due_date date,
  due_time time without time zone,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_item_exam_has_date check (kind <> 'exam' or due_date is not null),
  constraint study_item_time_has_date check (due_time is null or due_date is not null)
);

create index if not exists idx_study_items_user_due
  on public.study_items (user_id, due_date, created_at desc);
create index if not exists idx_study_items_user_active
  on public.study_items (user_id, is_done, kind);

alter table public.study_items enable row level security;
revoke all on table public.study_items from anon, authenticated;
grant select, insert, update, delete on table public.study_items to authenticated;

-- Both INSERT and UPDATE must prove that an optional course belongs to the same student.
-- FK alone is not enough for ownership verification.
drop policy if exists "study_items_read_own" on public.study_items;
create policy "study_items_read_own" on public.study_items for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "study_items_insert_own" on public.study_items;
create policy "study_items_insert_own" on public.study_items for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (course_id is null or exists (
      select 1 from public.student_courses c
      where c.id = course_id and c.user_id = (select auth.uid())
    ))
  );

drop policy if exists "study_items_update_own" on public.study_items;
create policy "study_items_update_own" on public.study_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (course_id is null or exists (
      select 1 from public.student_courses c
      where c.id = course_id and c.user_id = (select auth.uid())
    ))
  );

drop policy if exists "study_items_delete_own" on public.study_items;
create policy "study_items_delete_own" on public.study_items for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;

-- Verification (expected: one row, RLS=true)
select to_regclass('public.study_items') as table_name,
  relrowsecurity as rls_enabled
from pg_class
where oid=to_regclass('public.study_items');
