/**
 * V4.0: execute the REAL production-domain functions with deterministic fixtures.
 * No browser, Supabase connection, credentials, uploaded PDFs or AI quota needed.
 * TypeScript is transpiled in memory and imported from data URLs (no source copies).
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const cache=new Map();
function sourceModule(path) {
  if(cache.has(path)) return cache.get(path);
  const filename=resolve(root,path);
  const source=readFileSync(filename,'utf8');
  const result=ts.transpileModule(source,{
    fileName:filename,
    compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,importsNotUsedAsValues:ts.ImportsNotUsedAsValues.Remove},
    reportDiagnostics:true,
  });
  const errors=(result.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  assert.equal(errors.length,0,`TypeScript syntax diagnostics in ${path}: ${errors.map(x=>ts.flattenDiagnosticMessageText(x.messageText,' ')).join('; ')}`);
  let js=result.outputText;
  js=js.replace(/\bfrom\s+(['"])([^'"]+)\1/g,(_whole,_quote,spec)=>{
    const aliases={
      '@/lib/ai-study':'app/lib/ai-study.ts',
      '@/lib/quiz':'app/lib/quiz.ts',
      './ai-study':'app/lib/ai-study.ts',
    };
    const dep=aliases[spec];
    if(!dep)throw new Error(`Unexpected runtime import '${spec}' in ${path}`);
    return `from '${sourceModule(dep)}'`;
  });
  const uri='data:text/javascript;base64,'+Buffer.from(js,'utf8').toString('base64');
  cache.set(path,uri);
  return uri;
}
async function actual(path) {return import(sourceModule(path));}
const grading=await actual('app/lib/grading.ts');
const quiz=await actual('app/lib/quiz.ts');
const focus=await actual('app/lib/focus.ts');
const planner=await actual('app/lib/planner.ts');
const history=await actual('app/lib/quiz-history.ts');
const revision=await actual('app/lib/revision.ts');
const ai=await actual('app/lib/ai-study.ts');
const aiAction=await actual('app/routes/api.ai-study.ts');
const quizAction=await actual('app/routes/api.generate-quiz.ts');

let count=0;
async function check(label,run){
  try{await run();count++;console.log(`PASS ${String(count).padStart(2)} ${label}`);}
  catch(error){console.error(`FAIL ${label}`);throw error;}
}

await check('GPA standard grading system',()=>{
  assert.equal(grading.getGrades('four-point-standard')[0].points,4);
  assert.equal(grading.getGrades('four-point-standard').find(g=>g.grade==='B+').points,3.3);
  assert.equal(grading.getGrades('custom',[{grade:'P',points:5}])[0].points,5);
});
await check('Percentage grade boundaries are inclusive',()=>{
  for(const [n,g] of [[0,'F'],[49.99,'F'],[50,'D'],[59.99,'D'],[60,'D+'],[94.99,'A'],[95,'A+'],[100,'A+']])
    assert.equal(grading.gradeFromPercentage(n)?.grade,g,`${n}%`);
});
await check('Invalid percentages are rejected',()=>{
  for(const n of [-1,100.01,NaN,Infinity,-Infinity])assert.equal(grading.gradeFromPercentage(n),null);
});
await check('GPA overall classification transitions',()=>{
  for(const [gpa,label] of [[1.59,'Very weak'],[1.6,'Weak'],[2,'Pass'],[2.4,'Good'],[3,'Very good'],[3.6,'Excellent'],[4,'Excellent']])
    assert.equal(grading.overallGradeForFourPointAPlus(gpa)?.en,label);
});
await check('Out-of-range overall GPA is rejected',()=>{
  for(const n of [-.1,4.01,NaN,Infinity])assert.equal(grading.overallGradeForFourPointAPlus(n),null);
});
await check('AI mode whitelist and quota constant',()=>{
  assert.equal(ai.DAILY_QUESTIONS,5);
  for(const mode of ['explain','practice','summarize'])assert.equal(ai.isStudyMode(mode),true);
  for(const mode of ['delete','',null,{},0])assert.equal(ai.isStudyMode(mode),false);
});
await check('Chat history discards invalid roles and truncates unsafe length',()=>{
  const x=ai.cleanHistory([{role:'system',content:'untrusted'}, {role:'user',content:'A'.repeat(1000)}, {role:'assistant',content:' OK '},null]);
  assert.equal(x.length,2);assert.equal(x[0].content.length,600);assert.equal(x[1].content,'OK');
});
await check('Extract AI text from chat-completions and older response format',()=>{
  assert.equal(ai.extractAiAnswer({choices:[{message:{content:' Hello  '}}]}),'Hello');
  assert.equal(ai.extractAiAnswer({response:' Fine  '}),'Fine');
  assert.equal(ai.extractAiAnswer({response:undefined}),'');
});
const sample={title:'Unit 1',questions:[
  {kind:'mcq',question:'What is 2+2?',options:['1','2','4','5'],answerIndex:2,explanation:'Two plus two equals four.'},
  {kind:'tf',question:'Is the sky blue?',options:['True','False'],answerIndex:0,explanation:'Often blue in daytime.'},
  {kind:'mcq',question:'Which is a prime?',options:['4','6','7','8'],answerIndex:2,explanation:'Seven is prime.'},
  {kind:'tf',question:'Is 1 greater than 5?',options:['True','False'],answerIndex:1,explanation:'One is smaller than five.'},
]};
await check('Valid mixed quiz parses from a JSON object',()=>{
  const result=quiz.parseQuizOutput(sample,4,'mixed');
  assert.equal(result?.questions.length,4);assert.equal(result?.title,'Unit 1');
});
await check('Valid quiz parses from fenced AI response',()=>{
  const result=quiz.parseQuizOutput({response:'```json\n'+JSON.stringify(sample)+'\n```'},4,'mixed');
  assert.equal(result?.questions.length,4);
});
await check('Quiz rejects duplicate questions',()=>{
  const bad=structuredClone(sample);bad.questions[1].question=bad.questions[0].question.toUpperCase();
  const out=quiz.parseQuizOutput(bad,4,'mixed');
  assert.equal(out?.questions.length,3);
  assert.equal(new Set(out.questions.map(q=>q.question.toLowerCase())).size,3);
});
await check('Quiz rejects duplicate answer options',()=>{
  const bad=structuredClone(sample);bad.questions[0].options=['1','1','4','5'];
  const out=quiz.parseQuizOutput(bad,4,'mixed');
  assert.equal(out?.questions.length,3);
  assert.ok(out.questions.every(q=>new Set(q.options.map(s=>s.toLowerCase())).size===q.options.length));
});
await check('Quiz rejects answer indices outside options',()=>{
  const bad=structuredClone(sample);bad.questions[0].answerIndex=8;
  const out=quiz.parseQuizOutput(bad,4,'mixed');
  assert.equal(out?.questions.length,3);
  assert.ok(out.questions.every(q=>q.answerIndex>=0&&q.answerIndex<q.options.length));
});
await check('Quiz enforces mixed question types',()=>{
  const bad=structuredClone(sample);bad.questions=bad.questions.filter(q=>q.kind==='mcq');
  assert.equal(quiz.parseQuizOutput(bad,4,'mixed'),null);
});
await check('Quiz grading counts correct, incorrect and unanswered',()=>{
  const selections={0:2,1:1,3:1};
  assert.deepEqual(quiz.gradeQuiz(sample.questions,selections),{correct:2,answered:3,total:4});
});
await check('Quiz format, size and language inputs are whitelisted',()=>{
  assert.equal(quiz.isQuizSize(4),true);assert.equal(quiz.isQuizSize(5),false);
  assert.equal(quiz.isQuizFormat('mixed'),true);assert.equal(quiz.isQuizFormat('invalid'),false);
  assert.equal(quiz.isQuizLanguage('ar'),true);assert.equal(quiz.isQuizLanguage('fr'),false);
});
await check('Focus sessions aggregate only valid sessions in last seven local days',()=>{
  const now=new Date(2026,10,8,12,0,0);
  const sessions=[
    {id:'a',minutes:25,completed_at:new Date(2026,10,8,12).toISOString(),course_id:null},
    {id:'b',minutes:50,completed_at:new Date(2026,10,7,12).toISOString(),course_id:null},
    {id:'c',minutes:8,completed_at:new Date(2026,10,1,12).toISOString(),course_id:null},
    {id:'d',minutes:241,completed_at:new Date(2026,10,8,12).toISOString(),course_id:null},
    {id:'e',minutes:-1,completed_at:new Date(2026,10,8,12).toISOString(),course_id:null},
  ];
  const x=focus.summarizeFocus(sessions,7,now);
  assert.equal(x.totalMinutes,75);assert.equal(x.totalSessions,2);
  assert.equal(x.activeDays,2);assert.equal(x.todayMinutes,25);
  assert.equal(x.chart.length,7);
});
await check('Date-based planner handles a month boundary',()=>{
  assert.equal(planner.dayDiff('2026-12-01','2026-11-30'),1);
  assert.equal(planner.dayDiff('2026-11-29','2026-11-30'),-1);
  assert.equal(planner.dayDiff('bad','2026-11-30'),0);
});
await check('Planner stats exclude completed items and distinguish overdue/exams',()=>{
  const make=(kind,date,is_done=false)=>({id:date+kind,user_id:'u',course_id:null,kind,title:'test',notes:null,due_date:date,due_time:null,priority:'normal',is_done,created_at:'2026-11-01T12:00:00Z'});
  const items=[make('task','2026-11-07'),make('task','2026-11-08'),make('exam','2026-11-12'),make('task','2026-11-15'),make('task','2026-11-08',true)];
  assert.deepEqual(planner.plannerStats(items,'2026-11-08'),{totalOpen:4,overdue:1,nextWeek:3,exams:1});
});
await check('Quiz history calculates weighted accuracy across attempts',()=>{
  const attempts=[{id:'1',course_id:'A',title:'Q1',question_count:4,correct_count:1,quiz_format:'mcq',source_type:'text',created_at:'2026-11-08T12:00:00Z'},
    {id:'2',course_id:'A',title:'Q2',question_count:6,correct_count:3,quiz_format:'tf',source_type:'pdf',created_at:'2026-11-07T12:00:00Z'}];
  const x=history.summarizeQuizAttempts(attempts,new Date('2026-11-08T14:00:00Z'));
  assert.equal(x.totalAttempts,2);assert.equal(x.totalQuestions,10);assert.equal(x.accuracy,40);
  assert.equal(x.needsReview.length,1);assert.equal(x.needsReview[0].courseId,'A');
});
await check('Revision review requires enough quiz evidence',()=>{
  assert.equal(revision.revisionLevel(undefined),'no-data');
  assert.equal(revision.revisionLevel({attempts:1,questions:5,accuracy:20}),'insufficient');
  assert.equal(revision.revisionLevel({attempts:2,questions:8,accuracy:69}),'review');
  assert.equal(revision.revisionLevel({attempts:2,questions:8,accuracy:70}),'on-track');
});
await check('Revision ordering prioritizes courses needing review',()=>{
  const courses=[{id:'a',name:'Algorithms',code:null},{id:'b',name:'Biology',code:null},{id:'c',name:'Calculus',code:null}];
  const perf=[{courseId:'a',attempts:2,questions:10,correct:4,accuracy:40},{courseId:'b',attempts:2,questions:10,correct:8,accuracy:80}];
  const advice=revision.buildRevisionAdvice(courses,perf);
  assert.deepEqual(advice.map(x=>x.course.id),['a','c','b']);
});
await check('Revision task templates are language-aware and bounded',()=>{
  assert.match(revision.revisionTaskTitle('Algorithms',true),/^مراجعة:/);
  assert.ok(revision.revisionTaskTitle('x'.repeat(200),false).length<=160);
  assert.match(revision.revisionTaskNotes(25,false),/25-minute/);
});

async function callApi(action,path,options){
  const request=new Request('https://goacadio.com'+path,options);
  return action({request,context:{},params:{}});
}
await check('AI Study API denies guest POST before any inference call',async()=>{
  const r=await callApi(aiAction.action,'/api/ai-study',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.equal(r.status,401);assert.equal((await r.json()).error,'SIGN_IN_REQUIRED');
  assert.match(r.headers.get('cache-control')??'',/no-store/);
});
await check('Quiz API denies guest POST before any inference call',async()=>{
  const r=await callApi(quizAction.action,'/api/generate-quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.equal(r.status,401);assert.equal((await r.json()).error,'SIGN_IN_REQUIRED');
  assert.match(r.headers.get('cache-control')??'',/no-store/);
});
await check('Both AI APIs block cross-site origins before authentication',async()=>{
  for(const [handler,path] of [[aiAction.action,'/api/ai-study'],[quizAction.action,'/api/generate-quiz']]){
    const r=await callApi(handler,path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://fake.invalid'},body:'{}'});
    assert.equal(r.status,403);assert.equal((await r.json()).error,'FORBIDDEN_ORIGIN');
  }
});
await check('Both API actions reject unsupported HTTP methods',async()=>{
  for(const [handler,path] of [[aiAction.action,'/api/ai-study'],[quizAction.action,'/api/generate-quiz']]){
    const r=await callApi(handler,path,{method:'GET'});
    assert.equal(r.status,405);assert.equal((await r.json()).error,'METHOD_NOT_ALLOWED');
  }
});
await check('Quiz API rejects guest requests with non-JSON type',async()=>{
  const r=await callApi(quizAction.action,'/api/generate-quiz',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'});
  assert.equal(r.status,415);assert.equal((await r.json()).error,'INVALID_REQUEST');
});
console.log(`\n${count}/${count} functional QA tests passed (real modules, mock inputs, zero network writes).`);
