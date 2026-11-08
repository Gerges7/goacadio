/** Shared pure prelaunch checks for safe SEO release preparation. No network calls. */
export const SITE='https://goacadio.com';
export const PUBLIC_ROUTES=Object.freeze([
  '/', '/tools', '/tools/gpa-calculator','/tools/focus-timer','/tools/cv-builder',
  '/guides','/help','/contact','/privacy','/services','/universities','/about','/terms',
]);
export const PROTECTED_PREFIXES=Object.freeze([
  '/account','/admin','/auth','/dashboard','/api','/quiz-generator',
  '/quiz-history','/planner','/study-stats','/revision','/ai-study',
]);
export const FORBIDDEN_INDEXING=/\b(?:index\s*,\s*follow|index\s*,\s*nofollow)\b/i;
export function sitemapLocations(xml){
  const urls=[...xml.matchAll(/<loc>\s*(https:\/\/[^\s<]+)\s*<\/loc>/g)].map(m=>m[1]);
  const locTags=(xml.match(/<loc>/g)||[]).length;
  const urlTags=(xml.match(/<url>/g)||[]).length;
  const closeTags=(xml.match(/<\/url>/g)||[]).length;
  if(locTags!==urls.length || urlTags!==urls.length || closeTags!==urls.length)throw new Error('Malformed sitemap <url>/<loc> entry');
  return urls;
}
export function isPrivatePublicPath(path){
  return PROTECTED_PREFIXES.some(prefix=>path===prefix||path.startsWith(prefix+'/'));
}
export function validateLaunchInventory({routesText,sitemapXml,robotsText,seoSource,rootSource,publicFolder,exists}){
  const failures=[]; const require=(condition,msg)=>{if(!condition)failures.push(msg)};
  const pathExists=exists??(()=>false);
  const declared=new Set([...routesText.matchAll(/route\('([^']+)'/g)].map(m=>'/'+m[1]));
  declared.add('/');
  require(/^\s*Allow:\s*\/\s*$/m.test(robotsText)&&!/^\s*Disallow:\s*\/\s*$/m.test(robotsText), 'Public launch robots.txt must allow crawlers');
  require(robotsText.includes('Sitemap: '+SITE+'/sitemap.xml'),'Public launch robots.txt lacks sitemap reference');
  require(/index,\s*follow/.test(seoSource) && !/noindex,\s*follow/.test(seoSource), 'Public SEO helper must be indexable');
  require(/name:\s*'robots',\s*content:\s*'index, follow'/.test(rootSource), 'Root public index is missing');
  require(!declared.has('/roadmap'), 'Do not expose a public roadmap');
  if(publicFolder)require(pathExists(publicFolder+'/sitemap.xml'), 'Public sitemap.xml must be published for review');
  // The validator also checks the content of the published sitemap passed as sitemapXml.
  let urls=[];try{urls=sitemapLocations(sitemapXml);}catch(e){failures.push(String(e.message));}
  const publicPaths=[];
  for(const raw of urls){
    let p;try{const u=new URL(raw);if(u.origin!==SITE||u.search||u.hash||u.username||u.password)throw new Error();p=u.pathname;}
    catch{failures.push(`Invalid sitemap URL: ${raw}`);continue;}
    if(isPrivatePublicPath(p))failures.push(`Private page appears in public sitemap: ${p}`);
    if(p.startsWith('/guides/')){
      require(declared.has('/guides/:slug'), 'Guide slug route missing');
    }else require(declared.has(p), `Sitemap path lacks registered route: ${p}`);
    publicPaths.push(p);
  }
  for(const expected of PUBLIC_ROUTES)require(publicPaths.includes(expected), `Public sitemap missing ${expected}`);
  require(new Set(urls).size===urls.length, 'Sitemap has duplicate URLs');
  require(urls.length>=16, 'Sitemap has fewer public pages than expected');
  return {failures,publicPaths,urls};
}
