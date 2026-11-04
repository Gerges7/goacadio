# GoAcadio V2: GitHub / Cloudflare / Supabase installation

**Start from the existing `Gerges7/goacadio` repo on `main`.** V2 retains React Router and the existing Cloudflare Worker named `goacadio`.

## A. Deploy the code safely
1. Keep a copy of the working V1 ZIP as a rollback.
2. Extract the V2 ZIP. Upload **the contents** to your GitHub repository's root using `Add file -> Upload files`, replacing matching paths. `package.json`, `wrangler.json` and `app/routes.ts` must be at root.
3. GitHub's Upload files does **not** remove old files. Explicitly delete the following old V1 files from GitHub: `app/routes/roadmap.tsx`, `app/routes/pricing.tsx`, `docs/GOACADIO_V1_BLUEPRINT.md`, `docs/DATABASE_SCHEMA.sql`, `docs/HOMEPAGE_VISUAL_PREVIEW.html`, `docs/DEPLOY_CHECKLIST.md`. Even if leftover pages would not be routed, old docs remain visible in a public GitHub repo.
4. Cloudflare Workers Builds should use `npm run build` and `npx wrangler deploy`. Production branch: `main`. The domain remains `goacadio.com` (don't re-register it).
5. On first deploy, *without Supabase variables*, verify the home, all free tools and local Dashboard, plus `/roadmap` returning 404. This verifies frontend changes without opening real sign-ups.

## B. Supabase
1. Create a **new Supabase project**. In SQL Editor run the full contents of `supabase/001_v2_core.sql` **once**. It creates tables, policies and seeds Egypt + Saudi Arabia as countries; institutions start unpublished and are added by an administrator after verification.
2. In Authentication > Providers, enable Email and configure Google OAuth **only if you wish to use Google sign-in**. For Google, follow Supabase's official guide to create Google OAuth credentials; do not paste them into GitHub.
3. In Authentication > URL Configuration, set **Site URL** to `https://goacadio.com`; allow redirect URLs `https://goacadio.com/dashboard` and `https://goacadio.com/auth` (add `http://localhost:5173/**` for dev only). Email confirmation must be enabled for public sign-ups. Test sign-up, confirmation and password reset.
4. Find `Project URL` and the **publishable (or legacy anon) key** in Supabase Project Settings -> API Keys. Never use the service role key.
5. In Cloudflare -> Workers & Pages -> `goacadio` -> Settings -> **Build** -> **Build variables and secrets** add exactly:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = publishable key
   They are embedded into client JS at build time and are **not secrets**. They are different from runtime Worker Variables & Secrets. Trigger a **new build** after adding them. Do not commit populated `.env` files.
6. Register with your intended admin account at `https://goacadio.com/auth` and confirm the email.
7. In Supabase SQL Editor, promote that existing account manually, replacing with your actual email:
```sql
insert into public.app_admins(user_id)
select id from auth.users where email = 'YOUR_REAL_EMAIL_HERE'
on conflict(user_id) do nothing;
```
8. Visit `https://goacadio.com/admin` while signed in. An ordinary student must receive the 403 screen and not see other users' data. Admin should see catalog and inquiries.
9. Publish only accurate institution records from Admin; no official grading rules are claimed or assumed.

## C. Mandatory launch gates (do not skip)
- Test that Student A cannot view/edit Student B's courses, profile or service requests by changing client-side IDs or sending direct API requests.
- Test guest cannot create catalog entries or call any privileged endpoint. App admins are granted **only via SQL Editor**.
- Add abuse/rate limiting, CAPTCHA or equivalent for sign-up and service requests. The prototype has no full spam prevention.
- Add a functioning support contact, finalized privacy/terms and account erasure request workflow before collecting student information from the general public.
- After those gates and page/content review, change `public/robots.txt` from `Disallow: /` to `Allow: /`, **remove** the root `noindex` meta tag, and enable search indexing for public pages only. Private routes `/auth`, `/dashboard`, `/admin` must keep `noindex, nofollow` and should not be linked in a sitemap.
- Check Google Search Console and AdSense policy requirements before monetization.

## D. Current limitations
- Only profile and `student_courses` are synced. GPA calculations, CV drafts, focus timer stats are still on the current device.
- Support request submit is an inquiry; no payment, delivery or confirmed booking.
- The site uses browser-based Supabase Auth + database RLS. Server-rendered initial HTML includes **no personal records**. Secure authorization is enforced by PostgreSQL RLS, not the UI check alone.
- A public GitHub repository exposes source and docs. Never commit owner-only planning files, private drafts, passwords or API secrets.
