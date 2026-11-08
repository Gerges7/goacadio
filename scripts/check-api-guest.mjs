/**
 * Opt-in, LIVE, unauthenticated API security smoke test.
 * Sends four tiny requests WITHOUT any credentials, data files, AI prompts, or tokens.
 * Each request is deliberately rejected by the app BEFORE reaching Supabase/Workers AI.
 * Run after Cloudflare deployment: npm run check:api-guest
 */
import {SITE,validateOrigin} from './live-audit-core.mjs';
const args=process.argv.slice(2);
const json=args.includes('--json');
const rest=args.filter(a=>a!=='--json');
if(rest.length>1){console.error('Usage: node scripts/check-api-guest.mjs [https://goacadio.com] [--json]');process.exit(2);}
let origin;
try{origin=validateOrigin(rest[0]??SITE);}catch(error){console.error(error.message);process.exit(2);}

const cases=[
  {path:'/api/ai-study',kind:'guest',status:401,error:'SIGN_IN_REQUIRED'},
  {path:'/api/generate-quiz',kind:'guest',status:401,error:'SIGN_IN_REQUIRED'},
  {path:'/api/ai-study',kind:'cross-origin',status:403,error:'FORBIDDEN_ORIGIN'},
  {path:'/api/generate-quiz',kind:'cross-origin',status:403,error:'FORBIDDEN_ORIGIN'},
];
const results=[];
for(const entry of cases){
  const start=performance.now();
  try{
    const response=await fetch(origin+entry.path,{
      method:'POST',redirect:'manual',credentials:'omit',
      headers:{'Content-Type':'application/json',Accept:'application/json',
        ...(entry.kind==='cross-origin'?{Origin:'https://origin-check.invalid'}:{})},
      body:'{}',signal:AbortSignal.timeout(12000),
    });
    // Reject unexpectedly large responses without printing the contents (possible personal data).
    const body=await response.text();
    let parsed;
    try{parsed=body.length<2048?JSON.parse(body):null;}catch{parsed=null;}
    const failures=[];
    if(response.status!==entry.status)failures.push(`Expected HTTP ${entry.status}, got ${response.status}`);
    if(parsed?.error!==entry.error)failures.push(`Expected error ${entry.error}`);
    if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))failures.push('Not a JSON response');
    if(!response.headers.get('cache-control')?.toLowerCase().includes('no-store'))failures.push('Cache-Control no-store missing');
    if(response.headers.get('x-content-type-options')!=='nosniff')failures.push('X-Content-Type-Options nosniff missing');
    if(!response.headers.get('x-robots-tag')?.toLowerCase().includes('noindex'))failures.push('API noindex missing');
    results.push({path:entry.path,case:entry.kind,status:response.status,ok:failures.length===0,
      durationMs:Math.round(performance.now()-start),failures});
  }catch(error){
    results.push({path:entry.path,case:entry.kind,status:null,ok:false,
      durationMs:Math.round(performance.now()-start),failures:[error?.name??'NetworkError']});
  }
}
const passed=results.filter(x=>x.ok).length;
const report={origin,checkedAt:new Date().toISOString(),mode:'guest-api-security',passed,total:results.length,
  failed:results.length-passed,note:'Only unauthenticated rejection paths. No AI inference, account creation, data writes or login testing.',results};
if(json)console.log(JSON.stringify(report,null,2));
else {
  for(const r of results){console.log(`${r.ok?'PASS':'FAIL'} ${r.status??'---'} ${r.path} (${r.case})`);
    for(const failure of r.failures)console.log('  - '+failure);}
  console.log(`\n${passed}/${results.length} guest API smoke tests passed.`);
}
if(passed!==results.length)process.exitCode=1;
