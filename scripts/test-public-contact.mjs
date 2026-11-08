import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
// Node 20/22 does not consistently support importing .ts directly.
// Transpile our actual module in memory, so tests work on every supported Node version.
const source = readFileSync(join(root, 'app/lib/contact.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  fileName:'contact.ts',
  reportDiagnostics:true,
  compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022},
});
assert.equal(compiled.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
const { publicSupportEmail, composeContactMailto } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64')
);
let checks=0;const check=(fn)=>{fn();checks++;};
check(()=>assert.equal(publicSupportEmail(' help@goacadio.com '),'help@goacadio.com'));
check(()=>assert.equal(publicSupportEmail('team@sub.example.co.uk'),'team@sub.example.co.uk'));
for(const bad of [null,undefined,99,'','not-an-email','foo@example','foo@localhost','wrong@domain.com\nBcc:bad@evil.com','attacker@example.com?subject=x','evil@..com','foo @example.com','foo@example.com\r\n'])check(()=>assert.equal(publicSupportEmail(bad),null));
check(()=>assert.equal(composeContactMailto('help@goacadio.com','technical','test','1234567890'), 'mailto:help@goacadio.com?subject=GoAcadio%20%E2%80%94%20Technical%20support%3A%20test&body=Category%3A%20Technical%20support%0ASubject%3A%20test%0A%0A1234567890%0A%0A---%0ASent%20by%20the%20visitor%20from%20the%20GoAcadio%20contact%20page.'));
check(()=>assert.equal(composeContactMailto('oops','technical','test','1234567890'),null));
check(()=>assert.equal(composeContactMailto('help@goacadio.com','technical','t','1234567890'),null));
check(()=>assert.equal(composeContactMailto('help@goacadio.com','technical','test','short'),null));
check(()=>assert.equal(composeContactMailto('help@goacadio.com','general','test','a'.repeat(901)),null));
check(()=>assert.ok(composeContactMailto('help@goacadio.com','privacy','test','Message body\r\nBcc:bad@evil.com').includes('%0D%0A')));
check(()=>assert.ok(!composeContactMailto('help@goacadio.com','privacy','test','Message body\r\nBcc:bad@evil.com').includes('\r\n')));
const route=readFileSync(join(root,'app/routes/contact.tsx'),'utf-8');
check(()=>assert.ok(route.includes('OFFICIAL_SUPPORT_EMAIL')));
check(()=>assert.ok(route.includes('return {supportEmail: OFFICIAL_SUPPORT_EMAIL}')));
check(()=>assert.ok(route.includes("role=\"status\"")));
check(()=>assert.ok(route.includes("mailto ? <a")));
const routes=readFileSync(join(root,'app/routes.ts'),'utf-8');
check(()=>assert.ok(routes.includes("route('contact', './routes/contact.tsx')")));
const nav=readFileSync(join(root,'app/components/chrome.tsx'),'utf-8');
check(()=>assert.ok(nav.includes('<Link to="/contact">')));
const help=readFileSync(join(root,'app/routes/help.tsx'),'utf-8');
check(()=>assert.ok(help.includes('to="/contact"')));
const privacy=readFileSync(join(root,'app/routes/privacy.tsx'),'utf-8');
check(()=>assert.ok(privacy.includes('href="/contact"')));
const admin=readFileSync(join(root,'app/components/account-requests-admin.tsx'),'utf-8');
check(()=>assert.ok(admin.includes("status==='resolved'&&request?.category==='account_deletion'")));
const robots=readFileSync(join(root,'public/robots.txt'),'utf8');
check(()=>assert.match(robots,/Allow: \/\s*$/m));
check(()=>assert.ok(!routes.includes("route('roadmap'")));
console.log(`${checks} public contact and pre-launch checks passed`);
