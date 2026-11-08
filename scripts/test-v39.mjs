/** V3.9 cross-platform source/import integrity checks. No production access or credentials. */
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join, resolve, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(path)=>readFileSync(resolve(root,path),'utf8');
const pkg=JSON.parse(read('package.json'));
const files=[];
for(const folder of ['app','workers'])walk(resolve(root,folder));
for(const file of ['vite.config.ts','react-router.config.ts'])files.push(resolve(root,file));
function walk(dir){
  for(const entry of readdirSync(dir)){
    const path=join(dir,entry);
    if(statSync(path).isDirectory())walk(path);
    else if(/\.tsx?$/.test(path))files.push(path);
  }
}
let inspectedImports=0;
for(const file of files){
  const tsx=file.endsWith('.tsx');
  const syntax=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.ES2022,true,tsx?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const fatal=syntax.parseDiagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error);
  assert.equal(fatal.length,0,`Syntax errors: ${file} (${fatal.map(d=>d.messageText).join('; ')})`);
  for(const node of syntax.statements){
    if(!ts.isImportDeclaration(node)||!ts.isStringLiteral(node.moduleSpecifier))continue;
    const name=node.moduleSpecifier.text;
    if(name.startsWith('.')||name.startsWith('@/')){
      const raw=name.startsWith('@/')?resolve(root,'app',name.slice(2)):resolve(dirname(file),name);
      const noQuery=raw.replace(/\?.*$/, '');
      const candidates=[noQuery,noQuery+'.ts',noQuery+'.tsx',noQuery+'.js',noQuery+'.mjs',resolve(noQuery,'index.ts'),resolve(noQuery,'index.tsx')];
      assert.ok(candidates.some(existsSync),`Missing local import in ${file}: ${name}`);
      inspectedImports++;
    }
  }
}
const workflow=read('.github/workflows/quality-gate.yml');
assert.match(workflow,/on:\s*\n\s*push:/);
assert.match(workflow,/contents: read/);
assert.match(workflow,/npm run check:ci/);
assert.doesNotMatch(workflow,/wrangler deploy|CLOUDFLARE_API_TOKEN|supabase_service_role|\$\{\{\s*secrets\./i);
for(const script of ['test:contact','test:v39','check:ci','typecheck'])assert.ok(pkg.scripts[script],`Missing ${script}`);
assert.match(pkg.scripts.typecheck,/react-router typegen.*tsc --noEmit/);
assert.match(pkg.scripts['check:ci'],/npm run build/);
const contact=read('scripts/test-public-contact.mjs');
assert.match(contact,/transpileModule/);
assert.doesNotMatch(contact,/import\(pathToFileURL/);
assert.match(read('public/robots.txt'),/Allow: \/\s*$/m);
assert.match(read('app/lib/seo.ts'),/index, follow/);
assert.equal(existsSync(resolve(root,'public/sitemap.xml')),true);
console.log(`PASS ${files.length} TypeScript/TSX source files parsed`);
console.log(`PASS ${inspectedImports} local static imports resolve to source files`);
console.log('PASS GitHub Actions is read-only, runs the actual build, and contains no deploy step');
console.log('PASS public indexing and published sitemap controls retained');
console.log('PASS contact tests are portable across supported Node versions');
