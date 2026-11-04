-- GoAcadio V2 core database — execute once in a NEW Supabase project.
-- Safe by default: RLS on all exposed tables, no public admin writes.
-- Do not use this script as a destructive migration on an existing database.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  name_en text not null,
  name_ar text not null,
  is_active boolean not null default true
);
create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries(code),
  name_en text not null check (length(name_en) between 2 and 160),
  name_ar text check (length(name_ar) <= 160),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.faculties (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete restrict,
  name_en text not null check (length(name_en) between 2 and 160),
  name_ar text check (length(name_ar) <= 160),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculties(id) on delete restrict,
  name_en text not null check (length(name_en) between 2 and 160),
  name_ar text check (length(name_ar) <= 160),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (length(display_name) <= 100),
  country_code text references public.countries(code),
  university_id uuid references public.universities(id) on delete set null,
  university_other text check (length(university_other) <= 160),
  faculty_id uuid references public.faculties(id) on delete set null,
  faculty_other text check (length(faculty_other) <= 160),
  program_id uuid references public.programs(id) on delete set null,
  program_other text check (length(program_other) <= 160),
  academic_level text check (academic_level in ('1','2','3','4','5','6','7','8')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.student_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  code text check (length(code) <= 32),
  created_at timestamptz not null default now()
);
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null check (service_type in ('Course tutoring','Code review & debugging','Graduation project mentoring','Study plan consultation')),
  subject text not null check (length(subject) between 2 and 160),
  description text not null check (length(description) between 10 and 4000),
  status text not null default 'new' check (status in ('new','quoted','accepted','in_progress','done','cancelled')),
  created_at timestamptz not null default now()
);
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_universities_country on public.universities(country_code);
create index if not exists idx_faculties_university on public.faculties(university_id);
create index if not exists idx_programs_faculty on public.programs(faculty_id);
create index if not exists idx_student_courses_user on public.student_courses(user_id,created_at desc);
create index if not exists idx_service_requests_user on public.service_requests(user_id,created_at desc);
create index if not exists idx_service_requests_status on public.service_requests(status,created_at desc);

-- This function lives in a non-exposed schema and uses a pinned search_path.
-- Run SQL as the Supabase postgres project owner so its privileges bypass RLS.
create or replace function private.is_app_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.app_admins
    where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_app_admin() from public;
revoke all on function private.is_app_admin() from anon;
grant usage on schema private to authenticated;
grant execute on function private.is_app_admin() to authenticated;

alter table public.countries enable row level security;
alter table public.universities enable row level security;
alter table public.faculties enable row level security;
alter table public.programs enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_courses enable row level security;
alter table public.service_requests enable row level security;
alter table public.app_admins enable row level security;

-- Explicitly restrict permissions. RLS policies below further restrict each operation.
revoke all on table public.countries,public.universities,public.faculties,public.programs,
  public.student_profiles,public.student_courses,public.service_requests,public.app_admins from anon, authenticated;
grant select on table public.countries,public.universities,public.faculties,public.programs to anon,authenticated;
grant insert,update on table public.universities,public.faculties,public.programs to authenticated;
grant select,insert,update,delete on table public.student_profiles,public.student_courses to authenticated;
grant select,insert,update on table public.service_requests to authenticated;
grant select on table public.app_admins to authenticated;

-- Catalog SELECT only for published verified entries (admin may also read drafts).
create policy "countries published" on public.countries for select to anon,authenticated using (is_active);
create policy "universities published" on public.universities for select to anon,authenticated using (is_published);
create policy "faculties published" on public.faculties for select to anon,authenticated using (
  is_published and exists(select 1 from public.universities u where u.id=university_id and u.is_published)
);
create policy "programs published" on public.programs for select to anon,authenticated using (
  is_published and exists(select 1 from public.faculties f where f.id=faculty_id and f.is_published)
);
create policy "admins read universities" on public.universities for select to authenticated using ((select private.is_app_admin()));
create policy "admins read faculties" on public.faculties for select to authenticated using ((select private.is_app_admin()));
create policy "admins read programs" on public.programs for select to authenticated using ((select private.is_app_admin()));
create policy "admins add universities" on public.universities for insert to authenticated with check ((select private.is_app_admin()));
create policy "admins edit universities" on public.universities for update to authenticated using ((select private.is_app_admin())) with check ((select private.is_app_admin()));
create policy "admins add faculties" on public.faculties for insert to authenticated with check ((select private.is_app_admin()));
create policy "admins edit faculties" on public.faculties for update to authenticated using ((select private.is_app_admin())) with check ((select private.is_app_admin()));
create policy "admins add programs" on public.programs for insert to authenticated with check ((select private.is_app_admin()));
create policy "admins edit programs" on public.programs for update to authenticated using ((select private.is_app_admin())) with check ((select private.is_app_admin()));

-- User rows: never accessible to other students.
create policy "profile owner read" on public.student_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy "profile owner insert" on public.student_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy "profile owner update" on public.student_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "profile owner delete" on public.student_profiles for delete to authenticated using ((select auth.uid())=user_id);
create policy "courses owner read" on public.student_courses for select to authenticated using ((select auth.uid())=user_id);
create policy "courses owner insert" on public.student_courses for insert to authenticated with check ((select auth.uid())=user_id);
create policy "courses owner update" on public.student_courses for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "courses owner delete" on public.student_courses for delete to authenticated using ((select auth.uid())=user_id);

create policy "requests owner or admin read" on public.service_requests for select to authenticated using (
  (select auth.uid())=user_id or (select private.is_app_admin())
);
create policy "requests owner insert" on public.service_requests for insert to authenticated with check (
  (select auth.uid())=user_id and status='new'
);
create policy "admin update requests" on public.service_requests for update to authenticated
  using ((select private.is_app_admin())) with check ((select private.is_app_admin()));

-- No client can INSERT or UPDATE app_admins. Only the database owner may grant admin rights.
create policy "read own admin membership" on public.app_admins for select to authenticated using ((select auth.uid())=user_id);

-- Seed countries only, not unverified institution information.
insert into public.countries(code,name_en,name_ar,is_active) values
  ('EG','Egypt','مصر',true),('SA','Saudi Arabia','السعودية',true)
on conflict(code) do update set name_en=excluded.name_en,name_ar=excluded.name_ar;

-- AFTER creating your own account, grant yourself admin using Supabase SQL Editor ONLY:
-- insert into public.app_admins(user_id)
-- select id from auth.users where email = 'YOUR_REAL_EMAIL_HERE'
-- on conflict (user_id) do nothing;
-- Never create a website form or anon API to add administrator accounts.
