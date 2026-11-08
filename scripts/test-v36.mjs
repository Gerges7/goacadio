/** Self-contained V3.6 checks. No network calls or student accounts. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {SITE, PUBLIC_PATHS, TEST_CASES, inspectResponse, validateOrigin} from './live-audit-core.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>readFileSync(resolve(root,p),'utf8');
let passed=0;
const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};

const helper=read('app/lib/structured-data.ts');
const {outputText,diagnostics}=ts.transpileModule(helper,{
  compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022},reportDiagnostics:true,
});
assert.equal(diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0);
const {guideStructuredData,safeJsonLd}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
const fixture={slug:'how-to-calculate-gpa',title:{ar:'احسب المعدل',en:'Calculate GPA'},description:{ar:'شرح المعدل',en:'A grade guide'}};

test('Structured data contains only grounded Article and BreadcrumbList types',()=>{
  const data=guideStructuredData(fixture,'en');
  assert.equal(data['@graph'][0]['@type'],'Article');
  assert.equal(data['@graph'][1]['@type'],'BreadcrumbList');
  assert.equal(data['@graph'][0].headline,fixture.title.en);
  assert.equal(data['@graph'][0].description,fixture.description.en);
  assert.equal(data['@graph'][0].inLanguage,'en');
  assert.equal(data['@graph'][1].itemListElement[2].item,'https://goacadio.com/guides/how-to-calculate-gpa');
  assert.equal(JSON.stringify(data).includes('aggregateRating'),false);
  assert.equal(JSON.stringify(data).includes('datePublished'),false);
});
test('Arabic guide schema uses actual Arabic visible titles',()=>{
  const data=guideStructuredData(fixture,'ar');
  assert.equal(data['@graph'][0].headline,fixture.title.ar);
  assert.equal(data['@graph'][1].itemListElement[0].name,'الرئيسية');
});
test('Reject unsafe and malformed slugs',()=>{
  assert.throws(()=>guideStructuredData({...fixture,slug:'../../private'},'ar'));
  assert.throws(()=>guideStructuredData({...fixture,slug:'TEST'},'en'));
});
test('JSON-LD script breaking text is safely escaped without data loss',()=>{
  const attack={name:'</script><script>alert(1)</script>&test',para:'\u2028\u2029'};
  const serialized=safeJsonLd(attack);
  assert.equal(serialized.includes('<'),false);
  assert.equal(serialized.includes('>'),false);
  assert.equal(serialized.includes('&'),false);
  assert.deepEqual(JSON.parse(serialized),attack);
  assert.match(serialized,/\\u003c/);
});
function html(url){return `<html><head><meta name="google-adsense-account" content="ca-pub-1551519098591089"/><meta name="robots" content="index, follow"/><link rel="canonical" href="${url}"/><meta property="og:url" content="${url}" /></head><body></body></html>`;}
const headers=()=>new Headers({'content-type':'text/html; charset=utf-8','x-content-type-options':'nosniff','x-frame-options':'DENY'});
const pub=TEST_CASES.find(x=>x.path==='/guides/how-to-calculate-gpa');

test('Valid public launch page passes canonical and index checks',()=>{
  assert.deepEqual(inspectResponse(pub,200,headers(),html(SITE+pub.path)),[]);
});
test('Canonical pointing to another page fails',()=>{
  assert.match(inspectResponse(pub,200,headers(),html(SITE+'/wrong')).join(' '),/Canonical/);
});
test('Missing canonical fails',()=>{
  assert.match(inspectResponse(pub,200,headers(),'<meta name="robots" content="index"/>').join(' '),/canonical/);
});
test('Public noindex fails',()=>{
  assert.match(inspectResponse(pub,200,headers(),html(SITE+pub.path).replace('index, follow','noindex, follow')).join(' '),/noindex/);
});
test('Missing security headers fails',()=>{
  assert.match(inspectResponse(pub,200,new Headers({'content-type':'text/html'}),html(SITE+pub.path)).join(' '),/nosniff/);
});
test('Private pages require both no-store and X-Robots-Tag',()=>{
  const privateTest=TEST_CASES.find(x=>x.path==='/dashboard');
  const h=headers();
  assert.match(inspectResponse(privateTest,200,h,html(SITE)).join(' '),/no-store/);
  h.set('Cache-Control','private, no-store, max-age=0');
  h.set('X-Robots-Tag','noindex, nofollow');
  assert.deepEqual(inspectResponse(privateTest,200,h,html(SITE).replace('index, follow','noindex, nofollow')),[]);
});
test('Robots static assets are checked without demanding Worker headers',()=>{
  const r=TEST_CASES.find(x=>x.category==='robots');
  assert.deepEqual(inspectResponse(r,200,new Headers(),'User-agent: *\nAllow: /\nSitemap: https://goacadio.com/sitemap.xml\n'),[]);
  assert.match(inspectResponse(r,200,new Headers(),'User-agent: *\nDisallow: /\n').join(' '),/Allow|block/i);
});
test('Published sitemap is required for review',()=>{
  const s=TEST_CASES.find(x=>x.category==='sitemap');
  assert.deepEqual(inspectResponse(s,200,new Headers(),read('public/sitemap.xml')),[]);
  assert.ok(inspectResponse(s,404,new Headers(),'<urlset/>').length>0);
});
test('Origin is strictly HTTPS and pathless',()=>{
  assert.equal(validateOrigin('https://goacadio.com/'),SITE);
  for(const bad of ['http://goacadio.com','https://evil.com/path','https://u:p@goacadio.com','https://goacadio.com/?x=1'])
    assert.throws(()=>validateOrigin(bad));
});
test('Live audit includes every published guide and basic public route',()=>{
  const guideSource=read('app/lib/study-guides.ts');
  const slugs=[...guideSource.matchAll(/\bslug:\s*'([a-z0-9-]+)'/g)].map(m=>m[1]);
  assert.equal(slugs.length,3);
  for(const slug of slugs) assert.ok(PUBLIC_PATHS.includes('/guides/'+slug));
  assert.equal(new Set(PUBLIC_PATHS).size,PUBLIC_PATHS.length);
  assert.ok(PUBLIC_PATHS.includes('/contact'));
});
test('Private paths never enter public audit list or sitemap',()=>{
  assert.equal(PUBLIC_PATHS.some(x=>/^\/(account|dashboard|admin|auth|api|planner|quiz)/.test(x)),false);
  assert.match(read('public/robots.txt'),/Allow: \/\s*$/m);
  assert.equal(read('docs/sitemap-public-template.xml').includes('/account'),false);
  assert.equal(read('app/lib/seo.ts').includes('index, follow'),true);
});
test('Guide UI exposes visible breadcrumbs and safe JSON-LD',()=>{
  const route=read('app/routes/guide.tsx');
  assert.ok(route.includes('guideStructuredData(guide, lang)'));
  assert.ok(route.includes('safeJsonLd('));
  assert.ok(route.includes('type="application/ld+json"'));
  assert.ok(route.includes('aria-current="page"'));
});
console.log(`\n${passed} V3.6 tests passed; no external network requests.`);
