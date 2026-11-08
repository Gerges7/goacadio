/** V4.1 AdSense site verification and public-only search indexing checks. No network, accounts or AI. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PUBLIC_PATHS,SITE,TEST_CASES,inspectResponse} from './live-audit-core.mjs';
import {validateLaunchInventory,sitemapLocations,PROTECTED_PREFIXES} from './launch-inventory.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=x=>readFileSync(resolve(root,x),'utf8');
let passed=0;
function test(label,fn){fn();passed++;console.log('PASS '+label);}
const html=(url,robots='index, follow')=>`<html><head><meta name="robots" content="${robots}"/><meta name="google-adsense-account" content="ca-pub-1551519098591089"/><link rel="canonical" href="${url}"/><meta property="og:url" content="${url}"/></head><body></body></html>`;
const headers=()=>new Headers({'content-type':'text/html','x-content-type-options':'nosniff','x-frame-options':'DENY'});
const inv=()=>validateLaunchInventory({routesText:read('app/routes.ts'),sitemapXml:read('public/sitemap.xml'),robotsText:read('public/robots.txt'),seoSource:read('app/lib/seo.ts'),rootSource:read('app/root.tsx'),publicFolder:resolve(root,'public'),exists:existsSync});
test('AdSense ownership meta tag is in common HTML head',()=>assert.match(read('app/root.tsx'),/<meta name="google-adsense-account" content="ca-pub-1551519098591089"/));
test('No AdSense ad-serving script is loaded before review',()=>assert.doesNotMatch(read('app/root.tsx')+read('app/lib/seo.ts'),/adsbygoogle\.js|googlesyndication\.com/));
test('ads.txt uses exactly the correct pub ID, seller and certification ID',()=>assert.equal(read('public/ads.txt').trim(),'google.com, pub-1551519098591089, DIRECT, f08c47fec0942fa0'));
test('Public support email is the exact user-approved address',()=>assert.match(read('app/lib/contact.ts'),/OFFICIAL_SUPPORT_EMAIL = 'gergesmorad17@gmail.com'/));
test('Contact page SSR loader exposes the approved public address',()=>assert.match(read('app/routes/contact.tsx'),/return \{supportEmail: OFFICIAL_SUPPORT_EMAIL\}/));
test('Review launch inventory passes',()=>assert.deepEqual(inv().failures,[]));
test('Sitemap contains all 16 indexed public routes and no duplicates',()=>{const x=sitemapLocations(read('public/sitemap.xml'));assert.equal(x.length,16);assert.deepEqual(x.map(x=>new URL(x).pathname).sort(),[...PUBLIC_PATHS].sort());});
test('No account/auth/API pages appear in sitemap',()=>{for(const url of sitemapLocations(read('public/sitemap.xml'))){const p=new URL(url).pathname;assert.ok(!PROTECTED_PREFIXES.some(prefix=>p===prefix||p.startsWith(prefix+'/')),p);}});
test('All 10 private routes are noindex and excluded from public SEO helper',()=>{
  const sec=read('workers/security.ts');
  assert.match(sec,/X-Robots-Tag/);assert.match(sec,/noindex, nofollow/);assert.match(sec,/private, no-store/);
  for(const slug of ['account','admin','auth','dashboard','planner','study-stats','ai-study','quiz-generator','quiz-history','revision']){
    const source=read(`app/routes/${slug}.tsx`);
    assert.match(source,/noindex, nofollow/,slug);
    assert.ok(!source.includes('publicSeoMeta'),slug);
  }
});
test('Public pages are indexable only via publicSeoMeta helper',()=>assert.match(read('app/lib/seo.ts'),/name: 'robots', content: 'index, follow'/));
test('robots.txt allows crawlers and advertises sitemap',()=>{const s=read('public/robots.txt');assert.match(s,/^Allow: \/$/m);assert.doesNotMatch(s,/^Disallow: \/$/m);assert.match(s,/Sitemap: https:\/\/goacadio\.com\/sitemap\.xml/);});
test('Valid indexable public sample passes HTTP checks',()=>{const t=TEST_CASES.find(t=>t.path==='/about');assert.deepEqual(inspectResponse(t,200,headers(),html(SITE+'/about')),[]);});
test('Public noindex is rejected by live audit',()=>{const t=TEST_CASES.find(t=>t.path==='/about');assert.match(inspectResponse(t,200,headers(),html(SITE+'/about','noindex, follow')).join('; '),/noindex|index/);});
test('Missing AdSense meta is rejected by live audit',()=>{const t=TEST_CASES.find(t=>t.path==='/about');assert.match(inspectResponse(t,200,headers(),html(SITE+'/about').replace('google-adsense-account','missing')).join('; '),/AdSense/);});
test('Missing private protection is rejected by live audit',()=>{const t=TEST_CASES.find(t=>t.path==='/dashboard');assert.ok(inspectResponse(t,200,headers(),html(SITE+'/dashboard','noindex, nofollow')).some(s=>/no-store|X-Robots/.test(s)));});
test('Protected private sample passes live checks with noindex and cache guards',()=>{const t=TEST_CASES.find(t=>t.path==='/dashboard');const h=headers();h.set('Cache-Control','private, no-store, max-age=0');h.set('X-Robots-Tag','noindex, nofollow');assert.deepEqual(inspectResponse(t,200,h,html(SITE+'/dashboard','noindex, nofollow')),[]);});
test('Sitemap and ads.txt live response guards both pass',()=>{for(const kind of ['ads','sitemap']){const t=TEST_CASES.find(t=>t.category===kind);assert.ok(t);assert.deepEqual(inspectResponse(t,200,new Headers(),read(kind==='ads'?'public/ads.txt':'public/sitemap.xml')),[]);}});
test('Privacy accurately describes verification vs future ad serving',()=>{const x=read('app/routes/privacy.tsx');assert.match(x,/AdSense/);assert.match(x,/no(t| ) (load|activate)/i);});
test('No API secrets added to public metadata',()=>{const x=read('app/root.tsx');assert.doesNotMatch(x,/SUPABASE_SERVICE_ROLE|CLOUDFLARE_API_TOKEN|PRIVATE_KEY/);});
console.log(`\n${passed}/${passed} V4.1 public launch & AdSense safety tests passed.`);
