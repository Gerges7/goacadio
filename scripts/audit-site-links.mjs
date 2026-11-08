/** Read-only internal-link, route, public-sitemap and launch-indexing audit.
 * Run: npm run audit:links
 * Inspects literal internal URLs; dynamic links are checked against route patterns
 * only where explicitly represented in the shared guide registry.
 */
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {resolve, dirname, relative, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateLaunchInventory} from './launch-inventory.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const routesText=read('app/routes.ts');
const routeEntries=[...routesText.matchAll(/route\('([^']+)',\s*'([^']+)'\)/g)].map(m=>({path:'/'+m[1],file:m[2]}));
const routePaths=new Set(['/',...routeEntries.map(r=>r.path)]);
const errors=[];const warnings=[];
function addError(message){errors.push(message)}
function scan(directory){
  let files=[];
  for(const item of readdirSync(directory)){
    const path=join(directory,item);const s=statSync(path);
    if(s.isDirectory())files.push(...scan(path));
    else if(s.isFile()&&/\.tsx?$/.test(item))files.push(path);
  }
  return files;
}

for(const {path,file} of routeEntries){
  if(!existsSync(resolve(root,'app',file)))addError(`Registered route ${path} has missing source app/${file}`);
}
if(new Set(routeEntries.map(r=>r.path)).size!==routeEntries.length)addError('Duplicate route definitions found');
if(!existsSync(resolve(root,'app/routes/home.tsx')))addError('Missing index route source');
const patternPaths=routeEntries.filter(r=>r.path.includes('/:'));
function routeExists(urlPath){
  if(routePaths.has(urlPath))return true;
  return patternPaths.some(route=>{
    const escaped=route.path.split('/').map(part=>part.startsWith(':')?'[^/]+':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('/');
    return new RegExp(`^${escaped}$`).test(urlPath);
  });
}
function isValidLiteral(raw){
  if(!raw.startsWith('/')||raw.startsWith('//'))return true;
  try{
    const url=new URL(raw,'https://goacadio.com');
    if(url.origin!=='https://goacadio.com')return false;
    return routeExists(url.pathname.replace(/\/$/,'')||'/') || (url.pathname.startsWith('/') && !url.pathname.includes('..') && existsSync(resolve(root,'public',url.pathname.slice(1))));
  }catch{return false;}
}
let inspected=0;
const found=[];
for(const file of scan(resolve(root,'app'))){
  const content=readFileSync(file,'utf8');
  // JSX <Link to="/route"/> or <a href="/route"/> and static objects { href:'/route' }.
  // Avoid intercepting CSS attributes, JS template literals and documentation strings.
  const re=/\b(?:to|href|url)\s*[:=]\s*(['"])(\/[^'"\s{}]*)\1/g;
  for(const m of content.matchAll(re)){
    if(m[2].startsWith('//'))continue;
    const v=m[2]; inspected++;found.push(v);
    if(!isValidLiteral(v))addError(`${relative(root,file)}: broken literal internal link ${v}`);
  }
}
const launch=validateLaunchInventory({
  routesText,
  sitemapXml:read('public/sitemap.xml'),
  robotsText:read('public/robots.txt'),
  seoSource:read('app/lib/seo.ts'),
  rootSource:read('app/root.tsx'),
  publicFolder:resolve(root,'public'), exists:existsSync,
});
errors.push(...launch.failures);
if(inspected===0)addError('No internal links found: inspection regex may be broken');
if(!found.includes('/privacy')||!found.includes('/terms')||!found.includes('/contact'))addError('Missing expected transparency links');
if(!routePaths.has('/about')||!routePaths.has('/terms'))addError('Public About/Terms routes are missing');
if(!/route\('guides\/:slug'/.test(routesText))addError('Guide slug route missing');
const report={ok:errors.length===0,routeCount:routePaths.size,staticLinksChecked:inspected,publicSitemapPages:launch.publicPaths.length,failures:errors,warnings};
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else{
  console.log(`Routes: ${report.routeCount} | Static links: ${report.staticLinksChecked} | Public sitemap URLs: ${report.publicSitemapPages}`);
  for(const e of errors)console.error('FAIL:',e);
  if(report.ok)console.log('PASS: Static route links, public sitemap and review indexing controls are consistent.');
  console.log('Note: variable/computed links and external domains require manual/browser QA.');
}
if(errors.length)process.exitCode=1;
