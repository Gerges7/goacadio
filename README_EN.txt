GoAcadio V3.9.1 - Fix the failed GitHub Actions TypeScript checks
============================================================
Based on GitHub Actions run #42509351241 (Nov 8, 2026), job 128818819874.

The workflow ran correctly: checkout, Node setup, npm install, and all custom
prelaunch tests succeeded. The failure came from `npm run typecheck`.

The log showed 114 TypeScript diagnostics:
- 107 generated React Router route-import errors. React Router requires
  compilerOptions.rootDirs = [".", "./.react-router/types"] in tsconfig.json.
- 7 source errors corrected in six application files:
  Supabase PromiseLike.then().catch() (3), data-export cast (1),
  PDF.js declaration compatibility (2), AI chat role widening (1).

UPLOAD TO GITHUB MAIN:
  1. Extract this ZIP.
  2. Upload ONLY the seven files below, preserving their directories.
  3. Commit directly to main. GitHub Actions runs automatically on push.
  4. Open https://github.com/Gerges7/goacadio/actions
     and check the NEWEST workflow run.
  5. If typecheck is green but Build fails, share the new run URL/logs.

FILES:
  tsconfig.json
  app/components/focus-summary.tsx
  app/components/quiz-summary.tsx
  app/routes/account.tsx
  app/lib/account-data-export.client.ts
  app/lib/pdf-text.client.ts
  app/routes/ai-study.tsx

No SQL, no secret variables, no Cloudflare configuration changes.
This patch has been syntax-checked and matches the exact diagnostics,
but full typecheck/build must be verified by the new GitHub Actions run.
