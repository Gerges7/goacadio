/** Tests of the actual TypeScript export module with an in-memory Supabase stand-in. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=readFileSync(resolve(root,'app/lib/account-data-export.client.ts'),'utf8');
const result=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(result.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const {prepareAccountExport,downloadAccountExport,DataExportError,EXPORT_SECTIONS}=await import(`data:text/javascript;base64,${Buffer.from(result.outputText).toString('base64')}`);
const uid='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
function mock(rowsByTable={},options={}){
  const audit=[];
  let authCalls=0;
  const client={
    auth:{async getUser(){authCalls++;return {data:{user:options.switchUser&&authCalls===2?{id:other}:{id:uid,email:'student@example.test',created_at:'2026-11-07T00:00:00Z'}},error:null};}},
    from(table){
      const context={table,fields:'',filter:'',order:[],from:0,to:0};
      const builder={
        select(columns){context.fields=columns;return builder;},
        eq(field,value){assert.equal(field,'user_id');context.filter=value;return builder;},
        order(col){context.order.push(col);return builder;},
        async range(from,to){context.from=from;context.to=to;audit.push({...context,order:[...context.order]});
          if(options.failTable===table)return {data:null,error:{code:'TEST_ERROR'}};
          const filtered=(rowsByTable[table]??[]).filter(x=>x.user_id===context.filter);
          const slice=filtered.sort((a,b)=>String(a[context.order[0]]??'').localeCompare(String(b[context.order[0]]??''))).slice(from,to+1);
          return {data:slice.map(row=>Object.fromEntries(context.fields.split(',').filter(k=>k in row).map(k=>[k,row[k]]))),error:null};
        },
      };return builder;
    },
  };return {client,audit};
}
let tests=0;
async function check(name,run){await run();tests++;console.log('PASS',name);}
await check('Only the authenticated user is included; never another user',async()=>{
  const {client,audit}=mock({student_courses:[{id:'a',user_id:uid,name:'Algorithms',created_at:'2026-11-07'}, {id:'b',user_id:other,name:'Secret',created_at:'2026-11-07'}]});
  const doc=await prepareAccountExport(client,uid);
  assert.equal(doc.collections.student_courses.length,1);
  assert.equal(doc.collections.student_courses[0].name,'Algorithms');
  assert.equal(doc.account.id,uid);
  assert.equal(doc.account.email,'student@example.test');
  assert.ok(!JSON.stringify(doc).includes('Secret'));
  assert.equal(Object.keys(doc.collections).length,EXPORT_SECTIONS.length);
  assert.ok(audit.every(x=>x.filter===uid));
  assert.ok(!('access_token' in doc.account));
});
await check('Pagination reads beyond the default 1000-row limit',async()=>{
  const data=Array.from({length:1050},(_,i)=>({id:String(i).padStart(5,'0'),user_id:uid,name:'Course '+i,created_at:'2026-11-07'}));
  const {client,audit}=mock({student_courses:data});
  const doc=await prepareAccountExport(client,uid);
  assert.equal(doc.collections.student_courses.length,1050);
  assert.equal(audit.filter(x=>x.table==='student_courses').length,6);
});
await check('Exactly one full page triggers a safe empty-page read',async()=>{
  const {client,audit}=mock({quiz_attempts:Array.from({length:200},(_,i)=>({id:String(i),user_id:uid,created_at:'2026-11-07'}))});
  const doc=await prepareAccountExport(client,uid);
  assert.equal(doc.collections.quiz_attempts.length,200);
  assert.equal(audit.filter(x=>x.table==='quiz_attempts').length,2);
});
await check('No data is returned on failed collection read',async()=>{
  const {client}=mock({}, {failTable:'focus_sessions'});
  await assert.rejects(prepareAccountExport(client,uid),e=>e instanceof DataExportError&&e.code==='READ_FAILED'&&e.section==='focus_sessions');
});
await check('No data is returned if session changed during export',async()=>{
  const {client}=mock({}, {switchUser:true});
  await assert.rejects(prepareAccountExport(client,uid),e=>e.code==='SIGN_IN_REQUIRED');
});
await check('No data is returned if the initial user does not match',async()=>{
  const {client}=mock();
  await assert.rejects(prepareAccountExport(client,other),e=>e.code==='SIGN_IN_REQUIRED');
});
await check('Reject oversized exports rather than silently truncating',async()=>{
  const {client}=mock({study_items:Array.from({length:10001},(_,i)=>({id:String(i).padStart(5,'0'),user_id:uid,created_at:'2026-11-07'}))});
  await assert.rejects(prepareAccountExport(client,uid),e=>e.code==='TOO_MANY_ROWS'&&e.section==='study_items');
});
await check('Progress callback is called and payload includes explicit scope caveats',async()=>{
  const visited=[];
  const {client}=mock();
  const doc=await prepareAccountExport(client,uid,(name,n)=>visited.push({name,n}));
  assert.equal(visited.length,EXPORT_SECTIONS.length);
  assert.ok(doc.limitations.some(x=>x.includes('not a full legal')));
});
await check('Download creates only a local JSON Blob and cleans up object URL',async()=>{
  const {client}=mock();const snapshot=await prepareAccountExport(client,uid);
  const beforeDocument=globalThis.document;
  const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
  const originalTimer=globalThis.setTimeout;
  let savedBlob,link,removed=false,revoked=false;
  try {
    URL.createObjectURL=blob=>{savedBlob=blob;return 'blob:local-test';};
    URL.revokeObjectURL=linkUrl=>{assert.equal(linkUrl,'blob:local-test');revoked=true;};
    globalThis.setTimeout=callback=>{callback();return 1;};
    globalThis.document={
      createElement(tag){assert.equal(tag,'a');link={style:{},click(){this.clicked=true;},remove(){removed=true;}};return link;},
      body:{appendChild(anchor){assert.equal(anchor,link);}},
    };
    downloadAccountExport(snapshot);
    assert.equal(link.clicked,true);
    assert.equal(link.href,'blob:local-test');
    assert.match(link.download,/^goacadio-account-data-\d{4}-\d{2}-\d{2}\.json$/);
    assert.equal(JSON.parse(await savedBlob.text()).account.id,uid);
    assert.equal(removed,true);assert.equal(revoked,true);
  }finally{
    globalThis.document=beforeDocument;URL.createObjectURL=originalCreate;
    URL.revokeObjectURL=originalRevoke;globalThis.setTimeout=originalTimer;
  }
});
await check('If download creation fails, it reports a controlled error',async()=>{
  const {client}=mock();const snapshot=await prepareAccountExport(client,uid);
  const old=URL.createObjectURL;
  try {URL.createObjectURL=()=>{throw new Error('blocked');};
    assert.throws(()=>downloadAccountExport(snapshot),e=>e.code==='DOWNLOAD_FAILED');
  }finally{URL.createObjectURL=old;}
});
console.log(`All ${tests} data export runtime tests passed.`);
