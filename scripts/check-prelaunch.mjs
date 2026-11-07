/** Local release checks without dependencies or network access.
 * These are structural checks only: they do not replace a live security audit.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root,path),'utf8');
const results = [];
const check = (label, ok) => results.push({label, ok:Boolean(ok)});
const worker=read('workers/app.ts');
const security=read('workers/security.ts');
const rootUi=read('app/root.tsx');
const robots=read('public/robots.txt');
const routes=read('app/routes.ts');
const sitemap=read('docs/sitemap-public-template.xml');
const seo=read('app/lib/seo.ts');
check('Prelaunch robots.txt still blocks crawler', /^Disallow:\s*\/\s*$/m.test(robots));
check('Prelaunch noindex still on HTML', /name:\s*'robots',\s*content:\s*'noindex, follow'/.test(rootUi));
check('Public page SEO helper still noindex', /noindex, follow/.test(seo));
check('No published sitemap.xml', !existsSync(resolve(root,'public/sitemap.xml')));
check('Worker wraps SSR responses with security layer', worker.includes('secureResponse(request, response)'));
check('Security middleware protects API paths', /pathname\.startsWith\('\/api\/'\)/.test(security));
check('No-store private and API responses', security.includes("'Cache-Control', 'private, no-store, max-age=0'"));
check('Private HTML and APIs have X-Robots-Tag', security.includes("'X-Robots-Tag', 'noindex, nofollow'"));
check('Content-type sniffing prevention', security.includes("'X-Content-Type-Options', 'nosniff'"));
check('Clickjacking protection for HTML', security.includes("'X-Frame-Options', 'DENY'") && security.includes('frame-ancestors'));
check('Referrer policy defined', security.includes('Referrer-Policy'));
check('Response body and headers preserved', security.includes('new Response(response.body') && security.includes('new Headers(response.headers)'));
check('Localized error page without server error details', rootUi.includes('function ErrorBoundary') && rootUi.includes('مركز المساعدة') && !rootUi.includes('error.message'));
check('No private routes in public sitemap', !/(?:\/admin|\/dashboard|\/auth|\/account|\/api\/|\/quiz-history|\/revision|\/planner|\/ai-study)/.test(sitemap));
check('Sitemap has useful public URLs', (sitemap.match(/<url><loc>/g)||[]).length>=12);
check('Site still has no public roadmap route', !/route\(['"]roadmap/.test(routes));
for(const r of results) console.log(`${r.ok?'PASS':'FAIL'}  ${r.label}`);
const failures=results.filter(r=>!r.ok);
console.log(`\n${results.length-failures.length}/${results.length} prelaunch checks passed.`);
if(failures.length)process.exitCode=1;
