/** V4.2: launch trust and AdSense disclosure safety gates. Offline, no personal data. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const files={terms:read('app/routes/terms.tsx'),privacy:read('app/routes/privacy.tsx'),
  about:read('app/routes/about.tsx'),help:read('app/routes/help.tsx'),auth:read('app/routes/auth.tsx'),
  contact:read('app/routes/contact.tsx'),contactLib:read('app/lib/contact.ts'),root:read('app/root.tsx'),
  ads:read('public/ads.txt'),robots:read('public/robots.txt'),sitemap:read('public/sitemap.xml'),
  security:read('workers/security.ts')};
const publisher='ca-pub-1551519098591089';
const email='gergesmorad17@gmail.com';
let passed=0;function check(name,fn){fn();passed++;console.log('PASS '+name);}
check('Current terms are published, not labeled a prelaunch draft',()=>{
  assert.match(files.terms,/Current terms of use/);
  assert.doesNotMatch(files.terms,/Pre-launch informational draft|Draft last updated|legal review and approval/);
  assert.match(files.terms,/rights granted by applicable law/);
});
check('Terms state effective date',()=>assert.match(files.terms,/Effective: 8 November 2026/));
check('Contact email is consistently disclosed',()=>{
  for(const p of ['terms','privacy','about','contactLib'])assert.ok(files[p].includes(email),p);
  assert.match(files.contact,/OFFICIAL_SUPPORT_EMAIL/);
});
check('Guest support is no longer described as unconfigured',()=>{
  for(const p of ['about','help','privacy','auth'])assert.doesNotMatch(files[p],/Guest email contact requires a support mailbox|pending legal review|after the site owner configures a verified public mailbox|once it is configured by the site owner/);
});
check('Privacy documents the actual processors',()=>{
  for(const term of ['Supabase','Cloudflare','localStorage','PDF'])assert.ok(files.privacy.includes(term),term);
});
check('Privacy discloses Google identifiers and cookies',()=>{
  for(const term of ['Google','cookies','IP addresses','partner-sites'])assert.ok(files.privacy.includes(term),term);
});
check('Privacy discloses manual deletion, no instant promise',()=>assert.match(files.privacy,/do not promise immediate deletion/));
check('Privacy advertises consent controls before ads',()=>assert.match(files.privacy,/certified consent platform where required/));
check('Privacy is not branded as a draft',()=>assert.doesNotMatch(files.privacy,/not a finalized legal privacy policy|operational privacy summary/));
check('Signup links to current public terms and privacy',()=>{
  assert.match(files.auth,/to="\/terms"/); assert.match(files.auth,/to="\/privacy"/);
  assert.match(files.auth,/current terms and privacy information/);
});
check('Official AdSense meta tag remains unchanged',()=>assert.ok(files.root.includes(`name="google-adsense-account" content="${publisher}"`)));
check('Correct ads.txt publisher entry and account relation',()=>assert.equal(files.ads.trim(),`google.com, ${publisher.slice(3)}, DIRECT, f08c47fec0942fa0`));
check('Ad-serving JavaScript still absent pending approval',()=>{
  for(const p of ['root','terms','privacy'])assert.doesNotMatch(files[p],/adsbygoogle\.js|pagead2\.googlesyndication\.com/);
});
check('Public sitemap and crawl allowance still present',()=>{
  assert.match(files.robots,/^Allow: \/$/m);
  assert.match(files.sitemap,/<loc>https:\/\/goacadio\.com\/privacy<\/loc>/);
  assert.doesNotMatch(files.sitemap,/<loc>https:\/\/goacadio\.com\/(?:account|dashboard|auth|admin)/);
});
check('Private pages remain noindex via middleware',()=>{
  assert.match(files.security,/X-Robots-Tag/);
  assert.match(files.security,/private, no-store/);
});
console.log(`\n${passed}/${passed} V4.2 AdSense trust checks passed.`);
