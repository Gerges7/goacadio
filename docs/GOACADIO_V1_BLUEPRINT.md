# GoAcadio — V1 Product Blueprint
**Date:** 4 November 2026  
**Positioning:** Your University Life, All in One Place  
**Initial market:** Egypt → computer science faculties → other faculties → Saudi Arabia → global  
**Access model:** hybrid public tools + optional private student workspace + paid services (later)  
**This document distinguishes implemented prototype features from future production features.**

## 1. Product thesis
A university-specific student workspace, not a generic collection of calculators. Public, searchable tools provide acquisition; a personalized student hub supports retention; verified academic help and AI features can monetize responsibly. A course should eventually connect grades, timetable, PDFs, quizzes, focus sessions and learning progress.

### Target users
1. **Visitor:** wants to calculate GPA, focus, or create a CV without signup.
2. **Student:** wants to save an academic profile, courses, GPA, materials and progress.
3. **Expert/tutor:** provides legitimate educational explanation, reviews and mentoring (future).
4. **Content admin:** manages institution catalogs, grading scales and moderation (future).
5. **Owner/admin:** handles services, analytics, subscriptions and compliance (future).

### North star
Students with ≥2 meaningful study actions in a 7-day period. Supporting metrics: visitor-to-account conversion, WAU, 7-day retention, GPA use, focus completions, PDF-to-quiz conversions (later), premium activation, service leads, per-student AI unit economics, organic traffic and Page RPM.

## 2. Hybrid acquisition architecture
**Public routes**: `/`, `/tools`, `/tools/gpa-calculator`, `/tools/focus-timer`, `/tools/cv-builder`, `/universities`, `/services`, `/pricing`, editorial resources (later).
**Private routes**: `/dashboard`, `/dashboard/courses`, `/dashboard/study-materials`, `/dashboard/quizzes`, `/dashboard/settings` (most not implemented yet).
**Admin**: a server-authorized `/admin` console with role-based access; the V1 `/admin` page is an informational placeholder only.

**Guest-to-member conversion moments:** save GPA across devices; save student courses; organize PDFs; export study history; enroll in mentoring. Do not block basic calculators.

## 3. V1 screen map and user journeys
### Homepage
- Bilingual header with tools, universities, help, pricing, language toggle and student hub CTA.
- Hero: value proposition, free-tool CTA, dashboard CTA.
- Six tool cards with explicit Available or Planned status.
- Illustrated dashboard **clearly presented as illustrative sample data**.
- Simple three-step how-it-works flow and final CTA.
- Privacy and roadmap links; responsive mobile navigation.

### GPA / CGPA
- Student enters per-course credit hours and letter grade.
- Weighted GPA = sum(credits × points) / sum(credits).
- Optional prior completed credits and prior CGPA: new CGPA = (prior credits × prior CGPA + current weighted points) / (prior credits + current credits).
- General illustrative 4.0 scale. Faculty/program-specific scales require *documented official verification* before being advertised as accurate.
- Exclude missing/invalid credit rows; warn on retakes and local rules; save latest result locally.
- Future: per-university scales, retake handling, minimum GPA simulator, target graduation GPA, export/share.

### Focus Mode
- 25-minute focus, 5-minute short break and 15-minute long break.
- Start/pause/reset; countdown anchored to wall clock while browser tab stays open.
- Completed 25-minute sessions and daily minutes stored on device.
- Future: focus session link to course, optional notifications, weekly streaks and accounts.

### CV Builder
- Basic single-column format; name, role, contact, summary, education, experience, projects, skills.
- Live preview and browser Print / Save as PDF.
- Data local-only; users should not enter sensitive data on shared devices.
- Future: ATS-oriented templates, editable sections, LinkedIn import with consent, export DOCX.

### Student Hub
- Local form: optional name, country, university, faculty, program, academic level.
- Manual course additions/removal and a quick summary of local GPA/focus progress.
- **Important:** this is *not* real account creation, verification, or synchronization. There is no remote database in the prototype.
- Future: secure email/Google signup; consent; account export/delete; material uploads, tasks, quizzes and study planner.

### Expert Help
- Explains available *future* academic services and provides a copyable draft inquiry; no false submissions or payments.
- Service menu: course tutoring, code review/debugging, graduation project mentoring, learning-plan consultation.
- Academic integrity: guidance, review and explanation only. No impersonation or submission of graded assignments on a student's behalf.
- Future secure order lifecycle: new → quoted → accepted → in-progress → done/cancelled; customer communication, refunds, scheduling and payment receipts.

### Pricing
- Free tools live; Plus and paid services labeled **planned**.
- No hard-coded subscription commitments until cost and willingness-to-pay validation.

## 4. Design system
- Brand: GoAcadio; approachable but professional.
- Palette: deep navy `#141f38`; indigo `#5952dc`; mint `#0cad95`; background `#f8f9fd`; border `#e7eaf2`.
- Font: Cairo for Arabic, DM Sans for English. Currently fetched from Google Fonts; self-host or account for external requests in privacy notice before production.
- Direction: RTL Arabic and LTR English. Accessible labels, visible focus states, readable contrast and 44px touch targets where possible.
- Responsive breakpoints ~1020, 800 and 550 px.
- Components: primary/outline buttons, tool cards, panels, tags, field labels, empty states, warnings.

## 5. Architecture & hosting
**Prototype now:** Next.js App Router + React + TypeScript + CSS; no API, accounts, payments, AI, or live external database. Saves to browser localStorage. All project files can be uploaded to GitHub and imported into Vercel.
**Recommended production:** Next.js + PostgreSQL/Supabase Auth + private Storage + server-based AI orchestration with usage quota + billing provider + analytics with consent as applicable.
**Catalog tenancy:** country → university → faculty → program → course; grading scale attached to each relevant university/program, with source URL and verified date. Student-owned data refers to authenticated user ID.
**Admin:** trusted server checks and least-privilege RBAC (owner, content admin, support agent). Never put Supabase service role keys in client code. RLS for student records and private object storage.
**AI:** files uploaded directly to private object storage; size/type checks, malware scan, extraction, chunking, vector retrieval, source citations; model call exclusively server-side; token tracking, per-user quotas, prompt injection safeguards and safe retention/deletion.
**Payments:** use provider hosted checkout or secure APIs, signed webhook validation, ledger/idempotency and receipts. Never trust client-side "paid" states.

## 6. Suggested data model
The full draft DDL is in `docs/DATABASE_SCHEMA.sql` (not deployed). Primary entities:
- `countries`, `universities`, `faculties`, `programs`, `grading_scales`, `courses`, `course_prerequisites`
- `student_profiles`, `student_courses`, `focus_sessions`
- `study_materials`, `quizzes`, `quiz_attempts`, `ai_usage`
- `service_requests`, `subscriptions`, `admin_users`

Data provenance fields (`source_url`, `verified_at`, `is_published`) are essential. Catalog data may differ by campus, program, academic year and regulation version. Production schema should version curricula and retake policy before publishing official GPA claims. Separate public catalog permissions from private user permissions. SQL is a planning draft, not a production-certified migration; verify FK owner consistency and storage policies in dedicated security tests.

## 7. Business model
1. **AdSense:** potential future revenue on valuable public pages, after eligibility/policy approval and appropriate commercial hosting. No ads in the current prototype.
2. **Plus:** controlled monthly AI and advanced learning features only once per-request cost is measured and limits enforced.
3. **Expert Help:** tutoring and mentoring requests priced by scope, starting with transparent manual quotation; educator integrity policy required.

Unit-economics formula: contribution margin = subscription receipts − AI/API cost − hosting/storage − payment fees − support/refund expenses. Validate with real usage rather than assuming any particular conversion rate, traffic or RPM.

## 8. SEO & internationalization
- Index substantial public tools and original help articles **only after launch**; noindex and robots disallow are set for the prototype deliberately.
- Production: remove noindex, generate production sitemap, canonical tags, localized `hreflang` routes, original explanations with meaningful tool functionality, FAQ structured data where eligible.
- Avoid programmatically generating thousands of thin university pages. Start with verified high-quality Egyptian university pages.
- Public calculators usable without login; private dashboards and personally generated content never index.
- English/Arabic content needs native copyediting rather than machine-only translation.

## 9. Security, privacy, and education ethics
- V1 saves data in localStorage; use it only on trusted devices. No encrypted account backup and no privacy promises beyond the prototype implementation.
- Before account rollout: privacy policy and terms reflecting actual data flows; consent and deletion/export rights; row-level security, CSRF/session defenses, secure auth redirects, rate limits, audit logs, abuse reporting, upload scanning, backups and recovery drills.
- Student age can vary. Review age-appropriate access and ad rules where needed.
- Before international launch: legal review of relevant Egyptian, Saudi and international privacy and consumer rules.
- Future services must preserve academic integrity; no ghostwriting for assessment submission.

## 10. Milestones, acceptance and launch gates
**P0 — Prototype (included in the ZIP)**
- [x] Responsive public site with language toggle.
- [x] GPA/CGPA calculator with weighted math and local persistence.
- [x] Focus timer with reset/pause and local daily totals.
- [x] CV form, preview, browser print to PDF.
- [x] Student profile/courses stored locally.
- [x] Services/pricing/roadmap/admin information pages.
- [x] Search-engine indexing deliberately disabled.
- [ ] Verified `npm run build` after package installation (the artifact environment could not fetch npm packages).
- [ ] Manual QA in Chrome, Android, Safari, Firefox.

**P1 — Production foundation**
- [ ] Create GitHub repo, connect appropriate Vercel plan.
- [ ] Add Supabase Auth, email verification/reset, profile CRUD, RLS tests.
- [ ] Validate curriculum catalog with official sources, add policy versioning.
- [ ] Production legal pages, data export/deletion, monitoring, analytics and domain.
- [ ] Authenticated dashboard, onboarding and persisted grading rules.

**P2 — Learning and revenue**
- [ ] Privately upload PDFs; extraction, AI citations, test accuracy/quality and quotas.
- [ ] Source-grounded AI Study Assistant, quiz generation and attempt history.
- [ ] Paid expert order system and payment provider; refund policy and service scope.
- [ ] Pricing A/B tests with AI cost constraints.
- [ ] Original editorial content, SEO launch and AdSense review.

**P3 — Market expansion**
- [ ] Pilot with a small group of CS students at MTI; measure retention and feedback.
- [ ] Additional Egyptian university catalogs; then other faculties.
- [ ] Saudi university grading schemas, payments/legal localization; then internationalization.

### Acceptance tests
- Sem GPA: two 3-credit courses A(4.0), B(3.0) → 3.50.
- CGPA: prior 60 credits at 3.00 + new 6 credits at 3.50 → 3.04545... (display 3.05).
- Empty and invalid credit hours must not create NaN/Infinity.
- Focus: pause freezes, reset restores chosen duration, completed focus updates daily totals once.
- CV: fill fields, preview updates, print output hides editing UI and header.
- Dashboard: save profile/course, refresh and verify persistence; clear profile removes it.
- Mobile: no horizontal scrolling, navigation can open/close, readable inputs.
- Privacy: no signup required for public tools; no fake paid order completion; no indexing of prototype.

## 11. Launch and hosting caveats
Vercel Hobby is for personal, non-commercial use. GoAcadio's planned paid help or AdSense is commercial usage and requires Vercel Pro/Enterprise or a different commercially permitted hosting arrangement. See https://vercel.com/docs/limits/fair-use-guidelines . AdSense requires site eligibility/approval and original content: https://support.google.com/adsense/answer/9724 . Domain `goacadio.com` availability/ownership must be checked by the owner; it has not been registered or connected by this artifact.

## 12. Decisions needed AFTER working prototype review
- Which first 3–5 Egyptian universities beyond MTI, and their verified grading/curriculum sources?
- Should account creation be optional until the student wants cloud sync? (Recommended: yes.)
- Which single AI task gives the highest student value at an affordable cost: grounded explanations or PDF quizzes? (Test both with pilots.)
- Which payment provider to use once requests demonstrate willingness to pay?
