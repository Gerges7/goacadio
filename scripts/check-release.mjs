/** GoAcadio V3.2 prelaunch smoke checks. No dependencies, no network calls. */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(base, path), 'utf8');
const checks = [];
function check(title, pass) { checks.push([title, Boolean(pass)]); }

const root = read('app/root.tsx');
const chrome = read('app/components/chrome.tsx');
const css = read('app/styles.css');
const routes = read('app/routes.ts');
const robots = read('public/robots.txt');
const seo = read('app/lib/seo.ts');

check('Prelaunch crawler block retained', /^Disallow:\s*\/\s*$/m.test(robots));
check('Prelaunch page noindex retained', /name:\s*'robots',\s*content:\s*'noindex, follow'/.test(root));
check('Public SEO metadata retains noindex', /noindex, follow/.test(seo));
check('Only one local CSS bundle referenced', /import stylesHref/.test(root) && !/stylesV30Href|stylesV31Href/.test(root));
check('Legacy mobile and guide styles merged', css.includes('V3.0 account center') && css.includes('V3.1 — original bilingual'));
check('No blocking font CSS @import', !/^\s*@import\s+url\(['"]https:\/\/fonts\.googleapis\.com/m.test(css));
check('Font stylesheet discoverable from document head', /preconnect'.*fonts\.gstatic\.com/.test(root) && /family=Cairo/.test(root));
check('Skip link points to main content', chrome.includes('href="#main-content"') && chrome.includes('id="main-content"'));
check('Mobile menu accessible and closable with Escape', chrome.includes('aria-expanded={expanded}') && chrome.includes('aria-controls="site-primary-nav"') && chrome.includes("event.key !== 'Escape'"));
check('Reduced-motion preferences respected', css.includes('prefers-reduced-motion:reduce'));
check('Private admin route stays excluded from public navigation', routes.includes("route('admin'") && !chrome.includes("href: '/admin'"));
check('Internal development roadmap not exposed by a route', !/route\(['"]roadmap/.test(routes));
check('Account and privacy routes retained', routes.includes("route('account'") && routes.includes("route('privacy'"));
check('Important study routes retained', ['quiz-generator', 'quiz-history', 'revision', 'planner', 'ai-study'].every(r => routes.includes(`route('${r}'`)));
check('No new database migration in this release', !existsSync(resolve(base,'supabase/008_performance.sql')));

const failures = checks.filter(([,ok])=>!ok);
for (const [name,ok] of checks) process.stdout.write(`${ok?'PASS':'FAIL'}  ${name}\n`);
process.stdout.write(`\n${checks.length - failures.length}/${checks.length} checks passed.\n`);
if (failures.length) process.exitCode = 1;
