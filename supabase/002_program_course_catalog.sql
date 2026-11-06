-- GoAcadio V2.1: Academic course catalog (non-destructive migration).
-- Run AFTER 001_v2_core.sql in Supabase SQL Editor, before deploying V2.1 UI.
-- No university, program, or subject facts are seeded by this migration.

begin;

create table if not exists public.program_courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  code text not null check (length(trim(code)) between 1 and 32),
  name_en text not null check (length(trim(name_en)) between 2 and 160),
  name_ar text check (name_ar is null or length(trim(name_ar)) between 2 and 160),
  credit_hours numeric(4,1) check (credit_hours between 0.5 and 12),
  academic_level integer check (academic_level between 1 and 8),
  semester text check (semester in ('fall','spring','summer','both')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(program_id, code)
);

create index if not exists idx_program_courses_program on public.program_courses(program_id,academic_level,code);

alter table public.student_courses
  add column if not exists catalog_course_id uuid references public.program_courses(id) on delete set null;
create unique index if not exists idx_student_courses_catalog_unique
  on public.student_courses(user_id,catalog_course_id)
  where catalog_course_id is not null;

alter table public.program_courses enable row level security;
revoke all on table public.program_courses from public, anon, authenticated;
grant select on table public.program_courses to anon, authenticated;
grant insert, update on table public.program_courses to authenticated;

-- Visitors/students only see courses from fully published program hierarchies.
-- The EXISTS clauses also respect RLS on the parent tables.
drop policy if exists "published program courses" on public.program_courses;
create policy "published program courses" on public.program_courses
for select to anon, authenticated using (
  is_published and exists (
    select 1 from public.programs p
      join public.faculties f on f.id = p.faculty_id
      join public.universities u on u.id = f.university_id
    where p.id = program_id
      and p.is_published and f.is_published and u.is_published
  )
);
drop policy if exists "admins view program courses" on public.program_courses;
create policy "admins view program courses" on public.program_courses
for select to authenticated using ((select private.is_app_admin()));
drop policy if exists "admins add program courses" on public.program_courses;
create policy "admins add program courses" on public.program_courses
for insert to authenticated with check ((select private.is_app_admin()));
drop policy if exists "admins edit program courses" on public.program_courses;
create policy "admins edit program courses" on public.program_courses
for update to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

-- Existing manual student courses remain valid. If a student uses a catalog ID,
-- require that the course be publicly published AND belong to their saved program.
-- Rebuild BOTH policies so a client cannot bypass the check by updating an existing row.
drop policy if exists "courses owner insert" on public.student_courses;
create policy "courses owner insert" on public.student_courses
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (
    catalog_course_id is null or exists (
      select 1 from public.program_courses pc
      join public.student_profiles sp on sp.program_id = pc.program_id
      where pc.id = catalog_course_id
        and pc.is_published
        and sp.user_id = (select auth.uid())
    )
  )
);
drop policy if exists "courses owner update" on public.student_courses;
create policy "courses owner update" on public.student_courses
for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    catalog_course_id is null or exists (
      select 1 from public.program_courses pc
      join public.student_profiles sp on sp.program_id = pc.program_id
      where pc.id = catalog_course_id
        and pc.is_published
        and sp.user_id = (select auth.uid())
    )
  )
);

commit;
