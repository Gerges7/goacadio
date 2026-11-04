-- GoAcadio future Supabase/PostgreSQL schema — NOT applied in the V1 local prototype.
-- Apply only after reviewing access control, migrations, backups and payment/privacy flows.
-- Catalog writes should happen via privileged server operations, never a client service-role key.
create extension if not exists pgcrypto;

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  iso2 char(2) unique not null,
  name_en text not null,
  name_ar text,
  is_active boolean not null default true
);
create table public.universities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id),
  slug text not null unique,
  name_en text not null,
  name_ar text,
  official_website text,
  is_published boolean not null default false
);
create table public.faculties (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name_en text not null,
  name_ar text,
  is_published boolean not null default false
);
create table public.grading_scales (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references public.universities(id),
  name text not null,
  max_points numeric(4,2) not null check (max_points > 0),
  -- e.g. {"A":{"points":4.0}, "B+":{"points":3.3}}
  grades jsonb not null,
  notes text,
  source_url text,
  verified_at timestamptz,
  is_published boolean not null default false
);
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculties(id) on delete cascade,
  grading_scale_id uuid references public.grading_scales(id),
  name_en text not null,
  name_ar text,
  degree_level text not null default 'bachelor',
  is_published boolean not null default false
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  code text,
  title_en text not null,
  title_ar text,
  default_credits numeric(4,1) check(default_credits>0 and default_credits<=30),
  course_level integer check(course_level between 1 and 12),
  source_url text,
  verified_at timestamptz,
  unique(program_id,code)
);
create table public.course_prerequisites (
  course_id uuid not null references public.courses(id) on delete cascade,
  prerequisite_course_id uuid not null references public.courses(id) on delete cascade,
  primary key(course_id, prerequisite_course_id),
  check(course_id<>prerequisite_course_id)
);

-- Auth uses Supabase auth.users; never store plaintext passwords in public tables.
create table public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  country_id uuid references public.countries(id),
  university_id uuid references public.universities(id),
  faculty_id uuid references public.faculties(id),
  program_id uuid references public.programs(id),
  academic_level text,
  preferred_locale text not null default 'ar' check(preferred_locale in ('ar','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.student_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_course_id uuid references public.courses(id),
  custom_name text,
  custom_code text,
  term_label text,
  credits numeric(4,1) check (credits>0 and credits<=30),
  grade_letter text,
  grade_points numeric(4,2) check (grade_points>=0 and grade_points<=10),
  created_at timestamptz not null default now()
);
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes int not null check(duration_minutes between 1 and 240),
  finished_at timestamptz not null default now()
);
create table public.study_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_course_id uuid references public.student_courses(id) on delete set null,
  title text not null,
  private_storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check(size_bytes>0),
  state text not null default 'uploaded' check(state in ('uploaded','processing','ready','failed','deleted')),
  created_at timestamptz not null default now()
);
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid references public.study_materials(id) on delete set null,
  title text not null,
  question_data jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score numeric(5,2),
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null,
  subject text not null,
  description text not null,
  status text not null default 'new' check(status in ('new','quoted','accepted','in_progress','done','cancelled')),
  quoted_amount_egp numeric(12,2) check(quoted_amount_egp>=0),
  created_at timestamptz not null default now()
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check(plan in ('free','plus','pro')),
  provider text,
  provider_subscription_id text unique,
  status text not null default 'inactive',
  period_ends_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  input_tokens int not null default 0 check(input_tokens>=0),
  output_tokens int not null default 0 check(output_tokens>=0),
  estimated_cost_usd numeric(12,6) not null default 0 check(estimated_cost_usd>=0),
  created_at timestamptz not null default now()
);
-- Admin RBAC must be checked on a trusted server; this table is NOT readable from browser clients.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('owner','content_admin','support_agent')),
  created_at timestamptz not null default now()
);
create index on public.universities(country_id);
create index on public.faculties(university_id);
create index on public.programs(faculty_id);
create index on public.courses(program_id);
create index on public.student_courses(user_id);
create index on public.focus_sessions(user_id,finished_at desc);
create index on public.study_materials(user_id);
create index on public.quizzes(user_id);
create index on public.quiz_attempts(user_id);
create index on public.service_requests(user_id);
create index on public.ai_usage(user_id,created_at desc);

-- Read-only public catalog. No anonymous or authenticated INSERT/UPDATE/DELETE policies.
alter table public.countries enable row level security;
alter table public.universities enable row level security;
alter table public.faculties enable row level security;
alter table public.grading_scales enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.course_prerequisites enable row level security;
create policy "public active countries" on public.countries for select using(is_active);
create policy "public verified universities" on public.universities for select using(is_published);
create policy "public verified faculties" on public.faculties for select using(is_published and exists(select 1 from public.universities u where u.id=university_id and u.is_published));
create policy "public verified scales" on public.grading_scales for select using(is_published);
create policy "public verified programs" on public.programs for select using(is_published and exists(select 1 from public.faculties f where f.id=faculty_id and f.is_published));
create policy "public catalog courses" on public.courses for select using(exists(select 1 from public.programs p where p.id=program_id and p.is_published));
create policy "public catalog prerequisites" on public.course_prerequisites for select using(exists(select 1 from public.courses c where c.id=course_id));

-- Row owner isolation. Additional FK-to-owner consistency must be enforced server-side
-- (e.g., user's quiz may not reference another user's study_material).
alter table public.student_profiles enable row level security;
alter table public.student_courses enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.study_materials enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.service_requests enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_usage enable row level security;
alter table public.admin_users enable row level security;
create policy "profile own read" on public.student_profiles for select to authenticated using(user_id=auth.uid());
create policy "profile own insert" on public.student_profiles for insert to authenticated with check(user_id=auth.uid());
create policy "profile own update" on public.student_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "course own read" on public.student_courses for select to authenticated using(user_id=auth.uid());
create policy "course own insert" on public.student_courses for insert to authenticated with check(user_id=auth.uid());
create policy "course own update" on public.student_courses for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "course own delete" on public.student_courses for delete to authenticated using(user_id=auth.uid());
create policy "focus own read" on public.focus_sessions for select to authenticated using(user_id=auth.uid());
create policy "focus own insert" on public.focus_sessions for insert to authenticated with check(user_id=auth.uid());
create policy "material own read" on public.study_materials for select to authenticated using(user_id=auth.uid());
create policy "material own insert" on public.study_materials for insert to authenticated with check(user_id=auth.uid());
create policy "quiz own read" on public.quizzes for select to authenticated using(user_id=auth.uid());
create policy "attempt own read" on public.quiz_attempts for select to authenticated using(user_id=auth.uid());
create policy "service own read" on public.service_requests for select to authenticated using(user_id=auth.uid());
create policy "service own insert" on public.service_requests for insert to authenticated with check(user_id=auth.uid());
create policy "subscription own read" on public.subscriptions for select to authenticated using(user_id=auth.uid());
create policy "ai usage own read" on public.ai_usage for select to authenticated using(user_id=auth.uid());
-- No browser-side write policies for AI quotas, billing, admin users or model-generated content.
-- IMPORTANT: Private Supabase storage bucket policies, API auth, rate limiting, anti-virus
-- scanning, signed upload URLs, RLS regression tests and server-side audit logs still required.
