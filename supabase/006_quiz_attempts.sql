-- GoAcadio V2.8: optional storage of quiz score summaries only.
-- Run in Supabase SQL Editor as the database owner, after migrations 001-005.
-- Safe to rerun; does not delete or replace student data.
BEGIN;

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_attempt_id uuid NOT NULL,
  course_id uuid REFERENCES public.student_courses(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 140),
  question_count smallint NOT NULL CHECK (question_count BETWEEN 1 AND 8),
  correct_count smallint NOT NULL CHECK (correct_count >= 0 AND correct_count <= question_count),
  quiz_format text NOT NULL CHECK (quiz_format IN ('mcq','tf','mixed')),
  source_type text NOT NULL CHECK (source_type IN ('pdf','text')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_attempts_unique_client_attempt UNIQUE(user_id, client_attempt_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_recent
  ON public.quiz_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_course_recent
  ON public.quiz_attempts (user_id, course_id, created_at DESC);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.quiz_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.quiz_attempts TO authenticated;

DROP POLICY IF EXISTS "quiz_attempts_select_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (course_id IS NULL OR EXISTS (
      SELECT 1 FROM public.student_courses sc
      WHERE sc.id = course_id AND sc.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "quiz_attempts_delete_own" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_delete_own" ON public.quiz_attempts
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

COMMIT;

-- Verification: expect quiz_attempts | true
SELECT to_regclass('public.quiz_attempts') AS table_name,
       relrowsecurity AS rls_enabled
FROM pg_class WHERE oid = to_regclass('public.quiz_attempts');
