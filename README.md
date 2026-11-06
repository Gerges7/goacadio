# GoAcadio V2 — Cloudflare Workers + Supabase

A bilingual university student portal with public tools and optional authenticated accounts.

## Implemented
- Public home, GPA/CGPA calculator, Focus Timer, CV Builder, services and university directory.
- No public development plan. `/roadmap` is removed and has no route.
- Student registration/sign-in with email/password and Google OAuth (once configured).
- Authenticated student profile and courses stored in Supabase; browser-local GPA/CV/focus remain local.
- One-click import of legacy V1 local browser courses (with user action).
- Real preliminary academic support inquiries, with student-only and admin-only access.
- Admin-only catalog publishing (universities/faculties/programs) and request status updates.
- SQL Row Level Security for student rows and admin-only catalog writes.
- Safe disconnected mode: without Supabase build variables, free tools and local dashboard still work.

## Not implemented / not ready for a public launch
- Online payment, PDF uploads, AI assistant, auto-generated quizzes, verified university GPA policies.
- Full account deletion workflow, legal privacy policy review, anti-abuse rate limits and support contact channel.
- Production SEO and AdSense: public indexing is deliberately disabled by `robots.txt` and the root meta tag.

## Setup
Read `docs/DEPLOY_V2.md` and execute `supabase/001_v2_core.sql` in a **new** Supabase project before enabling sign-ups. Promotion to admin is done only using a one-time SQL query in Supabase SQL Editor; it cannot be performed by a website user.

This is a code delivery. The Cloudflare build and the actual Supabase integration must be tested after deployment. Never put a Supabase `service_role` / secret key into `VITE_*` variables or GitHub.

## V2.1 course catalog

For upgrading an existing V2 production project, follow `docs/DEPLOY_V2_1.md`, including running `supabase/002_program_course_catalog.sql` before deploying the updated UI. Course curricula are not prepopulated without a verified official source.
