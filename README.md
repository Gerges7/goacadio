# GoAcadio V1 — Cloudflare Workers Starter

An early, **non-production** demo migrated from the original Next.js starter to **React Router (framework mode) + Cloudflare Workers**.

## Implemented
- Responsive Arabic/English landing page, tools and university/service/pricing/roadmap/privacy pages.
- Browser-only GPA & CGPA calculator; 4.0-scale *illustrative*, not a verified MTI grading policy.
- Browser-only focus timer and printable CV builder.
- Browser-only student dashboard (custom institution, courses and progress).
- SSR for public routes. Domain `goacadio.com` is managed on Cloudflare DNS, but **do not point production domain until preview deployment has passed the tests below**.

## Not implemented / disabled
No real authentication, database, uploaded PDFs, AI model, admin panel backend, payment, Google AdSense or GA4. All user entries remain in localStorage. `/admin` is informational only, not a real admin console.

## Deploy from GitHub (easiest)
1. Create a new repository `goacadio` on GitHub. Unzip this package and upload its **contents**, not the folder, via Add file → Upload files on `main`. Ensure `package.json`, `wrangler.json` and `workers/` are in repository root.
2. In Cloudflare dashboard go to **Workers & Pages → Create application → GitHub**. Connect repository `goacadio`.
3. Worker project name: **`goacadio`** (must match `wrangler.json`). Production branch: `main`.
4. Build command: `npm run build`. Deploy command: `npx wrangler deploy`. Root path: `/`.
5. Test the generated `*.workers.dev` URL first: home, switching EN/AR, GPA computation, focus timer, CV print and local dashboard.
6. Once deployment works, open Worker → **Settings → Domains & Routes → Add Custom Domain** and enter `goacadio.com`. Add `www.goacadio.com` optionally as a redirect or second custom domain. Cloudflare handles HTTPS.
7. Verify `goacadio.com` HTTPS and pages. Only then decide when to remove `noindex` in `app/root.tsx` and Disallow in `public/robots.txt`, after polishing legal and SEO content.

## Local development
Node.js >=20.19 is recommended (Node 22 also works):
```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## Cloudflare costs
Free plan may be usable for this small prototype. Actual cost depends on requests and other services. Do not activate AI or PDF parsing until limits, rate limiting, privacy and billing controls are implemented.

## Security / privacy before public launch
- No real sign-in; dashboard data persists only within browser device.
- No server-side data collection or file upload in this demo.
- Do not request actual student IDs or passwords yet.
- Current `robots.txt` and meta robots set **noindex** for prototype.
- Replace prototype privacy content with a proper policy before analytics, AdSense and signups.

## Source migration notes
- All previous user-facing `.tsx` tool components were migrated from Next.js App Router to React Router routes.
- `next/link` → `Link` from `react-router` (`to` prop), `usePathname` → `useLocation`.
- The GPA, focus, CV and dashboard logic remains client-side and preserves the prior data keys.
- `docs/` includes the original product blueprint/schema; it is planning material, **not** an applied database migration.

## Verification status
Static TypeScript/TSX syntax parsing and route/file checks were performed. The packaging environment cannot fetch npm dependencies, so **`npm run build` and live Cloudflare deployment were not run here**. If the first Cloudflare build reports issues, review its logs before binding the custom domain.
