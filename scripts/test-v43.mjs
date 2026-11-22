/** GoAcadio V4.3: editorial-quality and index inventory checks. No network. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {PUBLIC_PATHS,TEST_CASES,inspectResponse,SITE} from './live-audit-core.mjs';
import {sitemapLocations,validateLaunchInventory} from './launch-inventory.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
let passed=0;function test(label,fn){fn();passed++;console.log('PASS '+label);}
const content=read('app/lib/study-guides.ts');
const guideSlugs=[...content.matchAll(/\bslug:\s*'([a-z0-9-]+)'/g)].map(x=>x[1]);
const expected=['how-to-calculate-gpa','pomodoro-study-timer','student-cv-guide','seven-day-exam-revision-plan','lecture-to-practice-questions'];
test('Five unique editorial guides',()=>assert.deepEqual(guideSlugs,expected));
const transpiled=ts.transpileModule(content,{fileName:'study-guides.ts',compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022},reportDiagnostics:true});
test('Guide source compiles',()=>assert.equal((transpiled.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0));
const {studyGuides}=await import('data:text/javascript;base64,'+Buffer.from(transpiled.outputText).toString('base64'));
test('Every guide has practical content in both languages',()=>{
  for(const g of studyGuides){
    assert.ok(g.sections.length>=4,g.slug);
    assert.ok(g.faqs.length>=2,g.slug);
    for(const lang of ['ar','en']){
      assert.ok(g.title[lang].length>=12,g.slug);
      assert.ok(g.intro[lang].length>=35,g.slug);
      const full=[g.intro[lang],...g.sections.flatMap(x=>x.paragraphs.map(y=>y[lang])),...g.faqs.map(x=>x.answer[lang])].join(' ');
      assert.ok(full.length >= (g.slug === 'seven-day-exam-revision-plan' || g.slug === 'lecture-to-practice-questions' ? 1600 : 550),`${g.slug} has insufficient ${lang} detail`);
    }
  }
});
test('Exam guide includes specific seven-day example and error correction',()=>{const x=studyGuides.find(g=>g.slug==='seven-day-exam-revision-plan');assert.equal(x.sections.length,5);assert.match(x.sections.map(y=>y.paragraphs.map(z=>z.en).join(' ')).join(' '),/Day 7:/);assert.ok(x.faqs.length>=3);});
test('Quiz guide includes worked MCQ, true-false and privacy limits',()=>{const x=studyGuides.find(g=>g.slug==='lecture-to-practice-questions');const text=x.sections.flatMap(y=>y.paragraphs.map(z=>z.en)).join(' ');assert.match(text,/binary search/i);assert.match(text,/true or false/i);assert.match(text,/extracted or pasted text is sent to the AI service/);});
test('New guides are public and have published URLs',()=>{const urls=sitemapLocations(read('public/sitemap.xml')).map(u=>new URL(u).pathname);for(const slug of expected)assert.ok(urls.includes('/guides/'+slug));assert.equal(urls.length,16);assert.deepEqual([...urls].sort(),[...PUBLIC_PATHS].sort());});
test('Utility directory and inquiry pages removed from index sitemap',()=>{const urls=sitemapLocations(read('public/sitemap.xml'));assert.ok(!urls.some(x=>/\/(universities|services)$/.test(x)));for(const p of ['universities','services']){const src=read('app/routes/'+p+'.tsx');assert.match(src,/noindex, follow/);assert.doesNotMatch(src,/publicSeoMeta/);}});
test('Utility pages remain noindex and personalized services HTML is no-store',()=>{const s=read('workers/security.ts');assert.match(s,/pathname === '\/services'/);assert.match(s,/pathname === '\/universities'/);assert.match(s,/pathname === '\/services'[\s\S]*private, no-store/);assert.match(s,/X-Robots-Tag/);assert.match(s,/if \(isPrivate\)/);});
test('Live audit checks utility noindex and guide URLs',()=>{for(const path of ['/services','/universities'])assert.ok(TEST_CASES.some(x=>x.path===path&&x.category==='utility'));for(const slug of expected)assert.ok(TEST_CASES.some(x=>x.path==='/guides/'+slug&&x.category==='public'));});
test('Utility pages fail audit if indexable',()=>{const t=TEST_CASES.find(x=>x.path==='/services');const h=new Headers({'content-type':'text/html','x-content-type-options':'nosniff','x-frame-options':'DENY','strict-transport-security':'max-age=31536000'});const bad=`<html><head><meta name="robots" content="index, follow"><meta name="google-adsense-account" content="ca-pub-1551519098591089"></head></html>`;assert.ok(inspectResponse(t,200,h,bad).some(x=>/noindex/i.test(x)));h.set('x-robots-tag','noindex, follow');const good=bad.replace('index, follow','noindex, follow');assert.deepEqual(inspectResponse(t,200,h,good),[]);});
test('Launch inventory still rejects private, missing and duplicate entries',()=>{const inventory=validateLaunchInventory({routesText:read('app/routes.ts'),sitemapXml:read('public/sitemap.xml'),robotsText:read('public/robots.txt'),seoSource:read('app/lib/seo.ts'),rootSource:read('app/root.tsx'),exists:()=>true,publicFolder:'/public'});assert.deepEqual(inventory.failures,[]);});
test('Public tools contain worked guidance and internal links',()=>{const s=read('app/routes/tools.tsx');assert.match(s,/three practical examples/);assert.match(s,/seven-day-exam-revision-plan/);assert.match(read('app/routes/guides.tsx'),/guide-method-heading/);});
test('No automatic ad-serving script enabled',()=>assert.doesNotMatch(read('app/root.tsx'),/adsbygoogle\.js|pagead2\.googlesyndication\.com/));
console.log(`\n${passed}/${passed} V4.3 editorial and indexing checks passed.`);
