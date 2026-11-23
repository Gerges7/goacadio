-- GoAcadio Focus Mode: support configurable study sessions (1–180 minutes).
-- Apply after 004_focus_sessions.sql. This is non-destructive and preserves
-- existing session records, row-level security and all ownership policies.
-- Existing "minutes = 25" constraint was verified on the live project.
BEGIN;
ALTER TABLE public.focus_sessions
  DROP CONSTRAINT IF EXISTS focus_sessions_minutes_check;
ALTER TABLE public.focus_sessions
  ADD CONSTRAINT focus_sessions_minutes_check
  CHECK (minutes BETWEEN 1 AND 180);
COMMIT;

-- Verify:
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid='public.focus_sessions'::regclass
  AND conname='focus_sessions_minutes_check';
