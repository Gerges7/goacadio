# GoAcadio V3.5 — Public contact & account-deletion operational guide

## 1. Deploy the update

Upload the files in `GoAcadio_V3_5_Public_Contact_Deletion_Workflow_Update.zip` on GitHub main using identical paths. Existing student tools and tables remain untouched. No new SQL migrations or API secrets are required.

## 2. Set a genuine public support mailbox (REQUIRED for guest email)

1. Create and verify an email address owned by GoAcadio; **do not** use a made-up mailbox, personal password, or exposed API key.
2. Cloudflare Dashboard → Workers & Pages → `goacadio` → Settings → Variables and Secrets.
3. Add a **plain text environment variable** (not a secret) with name `PUBLIC_SUPPORT_EMAIL` and your REAL inbox address, e.g. an address under a domain you control. Do not literally copy a placeholder.
4. Redeploy the worker and open `https://goacadio.com/contact`.
5. The form creates a `mailto:` link locally; the user MUST send from an email client. It DOES NOT submit, queue, or store messages in GoAcadio/Supabase.
6. Test signed-out desktop and mobile, Arabic/English, email app setup, and the fallback when no mail app is registered. Confirm inbound delivery and that somebody monitors the mailbox.
7. Without the configured value, the page deliberately shows a setup notice and account-request fallback, NOT a fake address.

Cloudflare environment binding `PUBLIC_SUPPORT_EMAIL` is public contact metadata; it must never contain a private or privileged address/key. Setup through the dashboard must affect the production deployment as intended.

## 3. How to handle an account deletion request safely

**No destructive operation is exposed to ordinary site users or the admin UI.**

1. Administrator signs into `/admin`, finds the `account_deletion` request in Account & Privacy Requests, and records the request ID and Supabase user UUID in a restricted internal work log (avoid screenshots/public channels).
2. Verify account ownership through the **authenticated in-app request** AND the user entry in Supabase Authentication. If identity is disputed, seek an independent verification step through a verified channel. Never ask for passwords or one-time codes.
3. Check whether retention or legal obligations apply. Offer the user a copy of their data first if requested. Review the `account-data-export` feature and any service-provider logs, exports, or backups outside normal application tables.
4. In **Supabase Dashboard → Authentication → Users**, locate the **exact UUID**, verify email and identity, and use the provider's account-delete control with explicit manual approval. Confirm the destructive action only for the correct verified account. Do **not** rely on changing the in-app request status to delete an account.
5. Verify related `public.student_profiles`, `student_courses`, `study_items`, `focus_sessions`, `quiz_attempts`, `ai_daily_usage`, and request records for that UUID are gone where cascade policies apply. Verify storage objects/backups/log retention separately; do not claim immediate removal from all infrastructure or backups.
6. Some user records and signed-in request rows have `ON DELETE CASCADE`, so the request record itself may be deleted. Record the non-sensitive completion outcome in a restricted administrative log **before** deleting if necessary for compliance; follow a reviewed retention policy.
7. Mark `resolved` only AFTER actual fulfillment, where the request record remains. The V3.5 admin UI now requires an explicit confirmation before marking a deletion request resolved.

Before wide launch, appoint someone who monitors public contact, add an operator runbook with response expectations, and get privacy/legal review. These steps are operational guidance, not a final legal policy.

## 4. Smoke tests

- `/contact` renders for signed-out visitors without errors.
- With `PUBLIC_SUPPORT_EMAIL` absent/invalid, no mailbox is exposed; form is not falsely functional.
- With a real configured address, the link starts `mailto:` and encodes the subject/body. Verify actual delivery manually.
- `/help` and footer contain Contact links; `/privacy` describes guest contact and email handling.
- `/admin` still requires admin role; resolving a deletion request requires a confirmation, while no deletion runs automatically.
- `/account` export/download, quiz generator, login, dashboard, and student planner remain unaffected.
- `public/robots.txt` and page noindex are unchanged. NO public roadmap.
