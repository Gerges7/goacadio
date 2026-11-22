# GoAcadio

**GoAcadio** is a bilingual (Arabic/English) student productivity platform built around a student workspace and a set of free public tools.

Production: [https://goacadio.com](https://goacadio.com)

## Current product

### Public tools
- GPA and CGPA calculator with standard and custom grading systems.
- Focus timer with local tracking and optional sync of completed focus sessions.
- Student CV builder; CV content stays in the browser's local storage.
- University and faculty directory for Egypt and Saudi Arabia.
- Bilingual study guides and help pages.

### Student workspace
- Email/password authentication and Google OAuth when the provider is configured in Supabase.
- Student profile, academic program and course selection.
- Study planner and exam/task tracking.
- AI Study Assistant with server-side authentication and daily usage limits.
- PDF-to-quiz generation for text-based PDFs (client-side text extraction; scanned-PDF OCR is not supported).
- Quiz history, study statistics and revision recommendations.
- Account data export and manual account deletion requests.
- Support/service requests with admin-only status management.

### Admin and data
- Admin-only university/faculty/catalog publishing.
- Supabase Row Level Security policies for user-owned records and administrator actions.
- CV and GPA calculations are local browser tools; authenticated workspace records are stored in Supabase.
- PDF files are processed in the browser; extracted text is sent to the AI endpoint when the student requests generation.

## Current limitations (do not treat these as implemented)
- No flashcards or spaced-repetition review system yet.
- No OCR for scanned PDFs.
- No PWA/offline application shell or push notifications.
- No Google Calendar synchronization.
- No subscription checkout or payment processing.
- University coverage is currently focused on Egypt and Saudi Arabia, not a complete global catalog.
- Interface languages are Arabic and English.
- Account deletion is handled as a request; it is not an instant self-service deletion action.
- AI generation and authenticated persistence require working Supabase configuration and the Cloudflare Workers AI binding.

## Stack

- React Router 7, React, TypeScript and Vite.
- Cloudflare Workers and Workers AI.
- Supabase Auth, Postgres and Row Level Security.

## Environment and security

Set these build-time variables in the deployment environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never expose a Supabase `service_role` key, database password, Cloudflare API token or other server secret through a `VITE_*` variable or committed file. The browser must use only the Supabase publishable/anon key; server-only secrets belong in the hosting environment.

Supabase migrations are stored in `supabase/`. Apply them in order to the intended Supabase project and verify RLS before enabling real student accounts. Google OAuth also requires provider configuration in Supabase.

## Development and tests

```bash
npm install
npm run dev
```

Browser tests use a local Node/Vite adapter so they do not require Cloudflare credentials:

```bash
npx playwright install chromium
npm run test:e2e
```

Full CI checks (release audits, functional tests, Playwright Chromium journeys, TypeScript and production build):

```bash
npm run check:ci
```

Unauthenticated production checks:

```bash
npm run check:live
npm run check:api-guest
```

GitHub Actions runs the quality gate on pushes and pull requests. The separate production smoke workflow checks public pages and guest API security after successful pushes to `main`, and on a six-hour schedule. These checks do not deploy the Worker; production deployment is handled separately by the Cloudflare Workers deployment integration.

## Verified baseline (2026-11-22)

- GitHub quality gate: Run #41 succeeded, including 11 Playwright browser tests, TypeScript and production build.
- Production HTTP smoke: 24/24 route and public asset checks passed.
- Guest API smoke: 4/4 unauthorized/cross-origin checks passed.
- The HTTP smoke verifies the live domain's current responses; it does not prove that every authenticated Supabase flow or every AI inference path has been exercised.
- Live authenticated database/RLS testing still requires a connected Supabase project and a dedicated test account.
