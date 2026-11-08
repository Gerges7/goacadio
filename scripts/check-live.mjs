/**
 * GoAcadio V4.1 launch-ready smoke test, public routes only + logged-out private pages.
 * Usage: npm run check:live [-- https://goacadio.com]  or  npm run check:live -- --json
 * Produces no authenticated requests; HTTP duration is NOT a Core Web Vital.
 */
import {SITE,TEST_CASES,inspectResponse,validateOrigin} from './live-audit-core.mjs';
const args=process.argv.slice(2);
const json=args.includes('--json');
const rest=args.filter(x=>x!=='--json');
if(rest.length>1){console.error('Usage: node scripts/check-live.mjs [https://site.example] [--json]');process.exit(2);}
let origin;
try {origin=validateOrigin(rest[0]??SITE);} catch(error){console.error(error.message);process.exit(2);}
const results=[];
for(const test of TEST_CASES){
  const start=performance.now();
  try{
    const response=await fetch(origin+test.path,{
      headers:{Accept:test.category==='robots'?'text/plain':'text/html'},
      redirect:'manual',credentials:'omit',signal:AbortSignal.timeout(12000),
    });
    const body=await response.text();
    const failures=inspectResponse(test,response.status,response.headers,body,origin);
    results.push({path:test.path,category:test.category,status:response.status,ok:failures.length===0,
      durationMs:Math.round(performance.now()-start),failures});
  }catch(error){
    results.push({path:test.path,category:test.category,status:null,ok:false,
      durationMs:Math.round(performance.now()-start),failures:[`${error.name}: ${error.message}`]});
  }
}
const passed=results.filter(x=>x.ok).length;
const report={origin,checkedAt:new Date().toISOString(),mode:'adsense-site-review',total:results.length,
  passed,failed:results.length-passed,note:'Unauthenticated HTTP smoke checks only; not a full build, privacy, load or security audit.',results};
if(json)console.log(JSON.stringify(report,null,2));
else{
  for(const item of results){
    console.log(`${item.ok?'PASS':'FAIL'} ${String(item.status??'---').padStart(3)} ${String(item.durationMs).padStart(5)}ms ${item.path}`);
    for(const failure of item.failures)console.log('  - '+failure);
  }
  console.log(`\n${passed}/${results.length} public launch live checks passed. Timings are network durations, not LCP/INP/CLS.`);
}
if(passed!==results.length)process.exitCode=1;
