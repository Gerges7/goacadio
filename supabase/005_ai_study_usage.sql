-- GoAcadio V2.6: bounded daily AI questions per authenticated account.
-- Apply after 001_v2_core.sql in Supabase SQL Editor as project owner.
-- Re-runnable; does not delete or overwrite existing student data.
BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_daily_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  used smallint NOT NULL DEFAULT 0 CHECK (used BETWEEN 0 AND 5),
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_daily_usage FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.ai_daily_usage TO authenticated;

DROP POLICY IF EXISTS ai_usage_read_own ON public.ai_daily_usage;
CREATE POLICY ai_usage_read_own ON public.ai_daily_usage
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- Each call reserves one slot atomically (no client-supplied user ID or limit).
-- A direct client call can only consume the calling student's own quota.
CREATE OR REPLACE FUNCTION public.reserve_ai_study_request()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid;
  v_used integer;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.ai_daily_usage(user_id, usage_date, used)
  VALUES (v_user, (now() AT TIME ZONE 'UTC')::date, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET used = public.ai_daily_usage.used + 1
  WHERE public.ai_daily_usage.used < 5
  RETURNING used INTO v_used;

  IF v_used IS NULL THEN
    RETURN -1;
  END IF;
  RETURN 5 - v_used;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_ai_study_request() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_ai_study_request() TO authenticated;
COMMIT;

-- Expected: table_name ai_daily_usage, rls_enabled true
SELECT to_regclass('public.ai_daily_usage') AS table_name,
       relrowsecurity AS rls_enabled
FROM pg_class WHERE oid = to_regclass('public.ai_daily_usage');
