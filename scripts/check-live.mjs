/** Optional live, unauthenticated availability + headers + SEO smoke audit.
 * Run: npm run check:live
 * No login, cookies, tokens or private content is requested.
 * Timings are HTTP request durations, NOT Lighthouse or Core Web Vitals.
 */
const site = process.argv[2] || 'https://goacadio.com';
let origin;
try {
  const url = new URL(site);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw new Error('Use an HTTPS site origin such as https://goacadio.com');
  origin = url.origin;
} catch (error) { console.error(error.message); process.exit(2); }
const pages = [
  {path:'/',status:200,html:true},
  {path:'/tools',status:200,html:true},
  {path:'/guides',status:200,html:true},
  {path:'/guides/how-to-calculate-gpa',status:200,html:true},
  {path:'/tools/gpa-calculator',status:200,html:true},
  {path:'/help',status:200,html:true},
  {path:'/privacy',status:200,html:true},
  {path:'/robots.txt',status:200,html:false},
  {path:'/guides/goacadio-no-such-guide',status:404,html:true},
];
let failed=0;
for (const page of pages) {
  const start=performance.now();
  try {
    const response=await fetch(origin + page.path, {
      headers:{'Accept':page.html?'text/html':'text/plain'},
      redirect:'manual',
      signal:AbortSignal.timeout(12000),
    });
    const body=await response.text();
    const contentType=response.headers.get('content-type')??'';
    const checks = [response.status===page.status,
      page.html?contentType.includes('text/html'):contentType.includes('text/plain'),
      response.headers.get('x-content-type-options')==='nosniff'];
    if(page.html){
      checks.push(response.headers.get('x-frame-options')==='DENY');
      checks.push(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(body)||/noindex/i.test(body.slice(0,12000)));
      if(page.status===200) checks.push(/rel=["']canonical["']/i.test(body));
    }else if(page.path==='/robots.txt')checks.push(/Disallow:\s*\//.test(body));
    const ok=checks.every(Boolean);
    if(!ok)failed++;
    console.log(`${ok?'PASS':'FAIL'} ${String(response.status).padStart(3)} ${Math.round(performance.now()-start)}ms ${page.path}`);
    if(!ok) console.log('  Checks:',checks.join(', '),'Content-Type:',contentType);
  }catch(error){failed++;console.log(`FAIL --- ${page.path} ${error.name}: ${error.message}`);}
}
console.log(`\n${pages.length-failed}/${pages.length} live checks passed. HTTP duration != LCP/INP/CLS.`);
if(failed)process.exitCode=1;
