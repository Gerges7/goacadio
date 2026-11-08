/** GoAcadio V3.8 zero-dependency, non-network release safety tests. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {SITE,PUBLIC_ROUTES,validateLaunchInventory,sitemapLocations,isPrivatePublicPath} from './launch-inventory.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const fixtures=()=>({
  routesText:read('app/routes.ts'),sitemapXml:read('docs/sitemap-public-template.xml'),
  robotsText:read('public/robots.txt'),seoSource:read('app/lib/seo.ts'),rootSource:read('app/root.tsx'),
  publicFolder:resolve(root,'public'),exists:existsSync,
});
const base=fixtures();
let passed=0;
function test(label,fn){try{fn();console.log('PASS '+label);passed++;}catch(e){console.error('FAIL '+label);throw e;}}
function rejects(changes,match){const errors=validateLaunchInventory({...base,...changes}).failures.join('; ');assert.match(errors,match);}
test('Current public review inventory is valid',()=>assert.deepEqual(validateLaunchInventory(base).failures,[]));
test('Current public sitemap holds exactly 16 unique URLs',()=>{const a=sitemapLocations(base.sitemapXml);assert.equal(a.length,16);assert.equal(new Set(a).size,16);});
test('Public sitemap has all essential public paths',()=>{const paths=validateLaunchInventory(base).publicPaths;for(const p of PUBLIC_ROUTES)assert.ok(paths.includes(p),p);});
test('Sitemap excludes protected routes',()=>{for(const p of validateLaunchInventory(base).publicPaths)assert.ok(!isPrivatePublicPath(p),p);});
test('Site has no public Roadmap',()=>assert.ok(!base.routesText.includes("route('roadmap'")));
test('Fails when public crawler permission is removed',()=>rejects({robotsText:'User-agent: *\nDisallow: /\n'},/robots.txt/));
test('Fails when public indexability is missing',()=>rejects({seoSource:'export const other="yes";'},/SEO helper/));
test('Fails when root indexability is missing',()=>rejects({rootSource:'export const meta=()=>[];'},/Root public/));
test('Fails when sitemap is removed after public launch',()=>rejects({exists:p=>false},/must be published/));
test('Fails when a private page enters public sitemap',()=>rejects({sitemapXml:base.sitemapXml.replace('</urlset>',`<url><loc>${SITE}/account</loc></url></urlset>`)},/Private page/));
test('Fails when duplicate URL is in sitemap',()=>rejects({sitemapXml:base.sitemapXml.replace('</urlset>',`<url><loc>${SITE}/about</loc></url></urlset>`)},/duplicate/));
test('Fails when nonexistent static public URL appears',()=>rejects({sitemapXml:base.sitemapXml.replace('</urlset>',`<url><loc>${SITE}/fake-course</loc></url></urlset>`)},/lacks registered route/));
test('Fails when unrelated domain enters sitemap',()=>rejects({sitemapXml:base.sitemapXml.replace(SITE+'/about','https://untrusted.example/about')},/Invalid sitemap URL/));
test('Fails for malformed sitemap entries',()=>rejects({sitemapXml:base.sitemapXml.replace('<loc>','<location>')},/Malformed sitemap/));
test('Detects private URL prefixes accurately',()=>{assert.ok(isPrivatePublicPath('/account'));assert.ok(isPrivatePublicPath('/api/ai-study'));assert.ok(!isPrivatePublicPath('/about'));});
test('Candidate robots remains under docs and permits reading noindex rules',()=>{const s=read('docs/seo-release-candidate/robots.txt');assert.match(s,/Allow:\s*\//);assert.match(s,/Sitemap: https:\/\/goacadio.com\/sitemap.xml/);assert.doesNotMatch(s,/Disallow:\s*\//);});
test('Candidate sitemap does not include private URLs',()=>{const s=read('docs/seo-release-candidate/sitemap.xml');assert.deepEqual(sitemapLocations(s),sitemapLocations(base.sitemapXml));});
test('Production robots.txt permits public crawler access',()=>assert.match(base.robotsText,/Allow:\s*\/\s*$/m));
test('Production public folder has sitemap',()=>assert.equal(existsSync(resolve(root,'public/sitemap.xml')),true));
test('Private HTML/API noindex stays in worker security middleware',()=>{const s=read('workers/security.ts');assert.match(s,/X-Robots-Tag/);assert.match(s,/noindex, nofollow/);assert.match(s,/Cache-Control/);assert.match(s,/no-store/);});
test('Sign-up links to published service information transparently',()=>{const s=read('app/routes/auth.tsx');assert.match(s,/effectiveMode === 'signup'/);assert.match(s,/to="\/terms"/);assert.match(s,/to="\/privacy"/);assert.match(s,/current terms and privacy information/);});
test('Auth page avoids misleading forced agreement to unapproved terms',()=>{const s=read('app/routes/auth.tsx');assert.doesNotMatch(s,/I agree to final legal terms|أوافق على الشروط النهائية/);});
test('Link audit passes against current routes',()=>{const result=spawnSync(process.execPath,['scripts/audit-site-links.mjs','--json'],{cwd:root,encoding:'utf8'});assert.equal(result.status,0,result.stderr+result.stdout);const data=JSON.parse(result.stdout);assert.ok(data.ok);assert.ok(data.staticLinksChecked>=100);});
test('Candidate preparer is explicitly internal-only',()=>{const s=read('scripts/prepare-launch-candidate.mjs');assert.match(s,/docs\/seo-release-candidate/);assert.doesNotMatch(s,/writeFileSync\(resolve\(root,'public/);});
test('Package scripts expose all new audits',()=>{const x=JSON.parse(read('package.json')).scripts;for(const n of ['audit:links','prepare:seo-candidate','test:v38'])assert.ok(x[n]);});
test('Existing core user routes are preserved',()=>{for(const p of ['dashboard','planner','quiz-history','revision','ai-study'])assert.ok(base.routesText.includes(`route('${p}'`));});
console.log(`\n${passed}/${passed} V3.8 release safety tests passed.`);
