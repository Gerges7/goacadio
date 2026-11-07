/** Pure checks for prelaunch, unauthenticated HTTP smoke testing. No personal data. */
export const SITE = 'https://goacadio.com';
export const PUBLIC_PATHS = Object.freeze([
  '/', '/tools', '/tools/gpa-calculator', '/tools/focus-timer', '/tools/cv-builder',
  '/guides', '/guides/how-to-calculate-gpa', '/guides/pomodoro-study-timer',
  '/guides/student-cv-guide', '/help', '/contact', '/privacy', '/services', '/universities',
  '/about', '/terms',
]);
export const TEST_CASES = Object.freeze([
  ...PUBLIC_PATHS.map(path => ({path, category:'public', expectedStatus:200})),
  {path:'/account',category:'private',expectedStatus:200},
  {path:'/dashboard',category:'private',expectedStatus:200},
  {path:'/guides/goacadio-guide-not-found-1234',category:'missing',expectedStatus:404},
  {path:'/robots.txt',category:'robots',expectedStatus:200},
  {path:'/sitemap.xml',category:'sitemap-unpublished',expectedStatus:404},
]);

function htmlTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(m => m[0]);
}
function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : null;
}
function metaValue(html, name, key='name') {
  return htmlTags(html,'meta').filter(tag => attribute(tag,key)?.toLowerCase() === name.toLowerCase())
    .map(tag => attribute(tag,'content')).filter(Boolean);
}
function canonicalUrls(html) {
  return htmlTags(html,'link').filter(tag=>attribute(tag,'rel')?.toLowerCase().split(/\s+/).includes('canonical'))
    .map(tag=>attribute(tag,'href'));
}
function failIf(checks, predicate, label) {
  if (!predicate) checks.push(label);
}

export function inspectResponse(test, status, headers, body, origin=SITE) {
  const failures=[];
  failIf(failures,status===test.expectedStatus,`Expected HTTP ${test.expectedStatus}; got ${status}`);
  if(test.category==='robots') {
    failIf(failures, /(^|\n)\s*User-agent:\s*\*\s*(\n|$)/i.test(body),'Robots wildcard user-agent missing');
    failIf(failures, /(^|\n)\s*Disallow:\s*\/\s*(\n|$)/i.test(body),'Prelaunch robots.txt must disallow all');
    return failures;
  }
  if(test.category==='sitemap-unpublished') return failures;
  const ct=headers.get('content-type')??'';
  failIf(failures,ct.toLowerCase().includes('text/html'),'Missing text/html Content-Type');
  failIf(failures,headers.get('x-content-type-options')?.toLowerCase()==='nosniff','Missing nosniff header');
  failIf(failures,headers.get('x-frame-options')?.toUpperCase()==='DENY','Missing clickjacking header');
  const robots = metaValue(body,'robots');
  failIf(failures, robots.some(v=>/(^|[\s,])noindex([\s,]|$)/i.test(v)), 'Missing prelaunch meta noindex');
  if(test.category==='public') {
    const expected = origin + test.path;
    const urls=canonicalUrls(body);
    failIf(failures,urls.length===1,`Expected exactly one canonical, got ${urls.length}`);
    failIf(failures,urls.length===1 && urls[0]===expected,`Canonical must equal ${expected}`);
    const og = metaValue(body,'og:url','property');
    failIf(failures,og.length===1 && og[0]===expected,'Open Graph URL missing or inconsistent');
  }
  if(test.category==='private') {
    failIf(failures,(headers.get('cache-control')??'').toLowerCase().includes('no-store'),'Private page missing Cache-Control no-store');
    failIf(failures,(headers.get('x-robots-tag')??'').toLowerCase().includes('noindex'),'Private page missing X-Robots-Tag noindex');
  }
  return failures;
}

/** Reject userinfo, fragments, paths or http. This audit never requests off-origin assets. */
export function validateOrigin(raw) {
  const u = new URL(raw);
  if(u.protocol!=='https:' || u.username || u.password || u.pathname!=='/' || u.search || u.hash)
    throw new Error('Provide an HTTPS origin only, e.g. https://goacadio.com');
  return u.origin;
}
