-- GoAcadio V3.0: authenticated support, data access and account deletion requests.
-- Apply after 001_v2_core.sql in Supabase SQL Editor as project owner.
-- Safe for existing data. No student data is removed, and a request does NOT delete an account.
BEGIN;

CREATE TABLE IF NOT EXISTS public.account_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('support', 'data_export', 'account_deletion')),
  details text NOT NULL DEFAULT '' CHECK (char_length(details) <= 1000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_requests_user_created
  ON public.account_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_requests_status_created
  ON public.account_requests(status, created_at DESC);
-- One unresolved request of each category per user; prevents accidental duplicate requests.
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_requests_one_active
  ON public.account_requests(user_id, category)
  WHERE status IN ('new', 'in_review');

ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.account_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.account_requests TO authenticated;
-- Only these two fields are client-settable. Ownership, timestamp and status come from defaults.
GRANT INSERT (category, details) ON TABLE public.account_requests TO authenticated;
-- Administrators can change status; RLS below blocks this operation for regular students.
GRANT UPDATE (status) ON TABLE public.account_requests TO authenticated;

DROP POLICY IF EXISTS account_requests_read_own_or_admin ON public.account_requests;
CREATE POLICY account_requests_read_own_or_admin ON public.account_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_app_admin()));

DROP POLICY IF EXISTS account_requests_insert_own ON public.account_requests;
CREATE POLICY account_requests_insert_own ON public.account_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND status = 'new');

DROP POLICY IF EXISTS account_requests_admin_update ON public.account_requests;
CREATE POLICY account_requests_admin_update ON public.account_requests
  FOR UPDATE TO authenticated
  USING ((SELECT private.is_app_admin()))
  WITH CHECK ((SELECT private.is_app_admin()));

COMMIT;

-- Verify table exists with RLS; also check that policy definitions were created.
SELECT to_regclass('public.account_requests') AS table_name,
       c.relrowsecurity AS rls_enabled,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public'
        AND p.tablename = 'account_requests') AS policy_count
FROM pg_class c WHERE c.oid = to_regclass('public.account_requests');
