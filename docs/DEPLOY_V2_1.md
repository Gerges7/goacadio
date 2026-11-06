# GoAcadio V2.1 — Program course catalog

This release is a **non-destructive** upgrade from V2, not a replacement for the existing database. It does **not** contain any confirmed university curriculum data.

## Order of operations

1. Back up your current GitHub `main` and Supabase database. Confirm V2 student sign-in and `/admin` work.
2. Supabase Dashboard > SQL Editor: run `supabase/002_program_course_catalog.sql` exactly once (safe to rerun for policies/table). Do **not** rerun `001_v2_core.sql` in the production database.
3. Update the existing GitHub repo by uploading *the contents* of the V2.1 ZIP to `main`, replacing matching files; don't add a second nested folder. Cloudflare's existing GitHub deployment should run automatically.
4. Watch the build logs and check the `workers.dev` preview if you have a separate preview deployment. The schema migration must be applied **before** the new UI is deployed.
5. Sign in with a Supabase-admin account and visit `/admin`: choose **Courses**, pick a program, add a course with its verified code/name/credit hours/level/semester, keep draft until confirmed, then publish it. Use **Edit** for corrections; changing parent relationships is intentionally blocked while editing.
6. Sign in as a normal student, save that program in `/dashboard`, and verify its published courses appear in the catalog picker; add one and confirm it persists after sign-out/in. Confirm another student's account cannot view or alter this student's course list.

## What changed

- Admin now has **Courses** alongside universities, faculties, and programs.
- The student dashboard offers catalog course selection after **saving** a published program, while still allowing manual entry when there is no catalog entry.
- `program_courses` has RLS and admin-only editing. `student_courses.catalog_course_id` links optional selections to verified course rows. Student ownership and program checks remain server-enforced.
- No SEO-visible roadmap or development plan is added.

## Notes

- Source code files and migrations **must not** contain your Supabase secret/service-role key or an actual admin email. Only Vite `VITE_SUPABASE_URL` (base URL) and `VITE_SUPABASE_PUBLISHABLE_KEY` belong in Cloudflare build environment.
- V2.1 does not calculate GPA using a university-specific grade system. That needs verified grading rules for each program.
- There is no automated database migration rollback: take a database backup before any production SQL change.
- The ZIP is syntactically checked, but was not `npm build` tested in this environment because the npm registry is unreachable. A Cloudflare build + browser + RLS test is required before opening the feature to all students.
