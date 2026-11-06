import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { DAILY_QUESTIONS, MAX_NOTES_CHARS, MAX_PROMPT_CHARS, type ChatMessage, type StudyMode } from '@/lib/ai-study';

export const meta:MetaFunction=()=>[
  {title:'AI Study Assistant | GoAcadio'},
  {name:'description',content:'Ask study questions, review concepts, and make practice questions with GoAcadio AI Study Assistant.'},
  {name:'robots',content:'noindex, nofollow'},
];

type Course = {id:string;name:string;code:string|null};
const MESSAGES:Record<string,{ar:string;en:string}>={
  SIGN_IN_REQUIRED:{ar:'الجلسة انتهت، سجّل دخول مرة تانية.',en:'Session expired. Please sign in again.'},
  DAILY_LIMIT_REACHED:{ar:'خلصت أسئلتك الخمسة لليوم. جرّب بكرة (بتوقيت UTC).',en:'Your five daily questions are used. Try tomorrow (UTC).'},
  AI_NOT_CONFIGURED:{ar:'المساعد لسه محتاج تفعيل AI Binding في Cloudflare.',en:'AI binding has not been configured in Cloudflare.'},
  SUPABASE_NOT_CONFIGURED:{ar:'إعدادات الاتصال غير مكتملة.',en:'Server connection is not configured.'},
  QUOTA_NOT_READY:{ar:'نظام الحصص مش متجهّز. شغّل Migration 005 في Supabase.',en:'Quota database is not ready. Apply Migration 005.'},
  QUOTA_UNAVAILABLE:{ar:'تعذّر الاتصال بنظام الحصص، حاول لاحقًا.',en:'Quota service unavailable. Please try again.'},
  AI_UNAVAILABLE:{ar:'تعذّر توليد الإجابة حاليًا. قد تُحتسب المحاولة من الحد اليومي.',en:'AI service unavailable. This attempt may count against the daily limit.'},
  AI_EMPTY_RESPONSE:{ar:'ما وصلش رد صالح من النموذج. قد تُحتسب المحاولة.',en:'The model returned an empty response. This attempt may count.'},
  COURSE_NOT_FOUND:{ar:'المادة مش موجودة في حسابك، اختر مادة تانية.',en:'Course not found in your account.'},
};

export default function AiStudy(){
  const {text,lang}=useLocale();
  const {user,configured,loading:authLoading}=useAuth();
  const [courses,setCourses]=useState<Course[]>([]);
  const [courseId,setCourseId]=useState('');
  const [mode,setMode]=useState<StudyMode>('explain');
  const [prompt,setPrompt]=useState('');
  const [notes,setNotes]=useState('');
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [busy,setBusy]=useState(false);
  const [remaining,setRemaining]=useState<number|null>(null);
  const [error,setError]=useState('');
  const bottom=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    const client=getSupabase();if(!user||!client){setCourses([]);return;}
    let live=true;
    void client.from('student_courses').select('id,name,code').eq('user_id',user.id).order('name').limit(100).then(({data})=>{
      if(live)setCourses((data??[]) as Course[]);
    });
    const day=new Date().toISOString().slice(0,10);
    void client.from('ai_daily_usage').select('used').eq('user_id',user.id).eq('usage_date',day).maybeSingle().then(({data,error})=>{
      if(live&&!error)setRemaining(Math.max(0,DAILY_QUESTIONS-Number(data?.used??0)));
    });
    return ()=>{live=false;};
  },[user?.id]);
  useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest',behavior:'smooth'});},[messages.length]);

  async function send(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy||!user||prompt.trim().length<3||prompt.trim().length>MAX_PROMPT_CHARS)return;
    const client=getSupabase();if(!client)return;
    const previous=messages.slice(-4);
    setBusy(true);setError('');
    try{
      const {data:{session},error:sessionError}=await client.auth.getSession();
      if(sessionError||!session?.access_token)throw new Error('SIGN_IN_REQUIRED');
      const response=await fetch('/api/ai-study',{
        method:'POST',cache:'no-store',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},
        body:JSON.stringify({prompt:prompt.trim(),notes:notes.trim(),courseId,mode,history:previous}),
      });
      const result=await response.json() as {answer?:string;error?:string;remaining?:number};
      if(typeof result.remaining==='number')setRemaining(result.remaining);
      if(!response.ok||!result.answer)throw new Error(result.error||'AI_UNAVAILABLE');
      setMessages(old=>[...old,{role:'user',content:prompt.trim()},{role:'assistant',content:result.answer!}].slice(-20));
      setPrompt('');
    }catch(err){
      const code=err instanceof Error?err.message:'AI_UNAVAILABLE';
      const localized=MESSAGES[code];
      setError(localized?(lang==='ar'?localized.ar:localized.en):text('حصل خطأ في الطلب. حاول مرة تانية.', 'Request failed. Please retry.'));
    }finally{setBusy(false);}
  }
  const examples=[
    {ar:'اشرح لي مفهوم الـRecursion بمثال بسيط',en:'Explain recursion with a simple example'},
    {ar:'اعمل لي اختبار قصير عن قواعد البيانات',en:'Create a short quiz on databases'},
    {ar:'إزاي أحل مسائل الـBig O خطوة بخطوة؟',en:'Walk me through Big O problems'},
  ];
  if(authLoading||!configured||!user)return <><div className="page-hero"><div className="container"><span className="section-kicker">AI STUDY ASSISTANT</span><h1>{text('مساعد مذاكرتك الذكي ✨','Your AI Study Assistant ✨')}</h1></div></div><div className="page-content"><div className="container"><section className="panel auth-panel center"><p>{authLoading?text('جاري التحقق من الحساب...','Checking your account...'):text('المساعد متاح بحساب مجاني، 5 أسئلة يوميًا أثناء التجربة.','Sign in to try five AI questions per day.')}</p><Link to="/auth" className="btn btn-primary">{text('تسجيل الدخول أو إنشاء حساب','Sign in or create account')}</Link></section></div></div></>;
  return <><div className="page-hero"><div className="container"><span className="section-kicker">AI STUDY ASSISTANT</span><h1>{text('مساعد مذاكرتك الذكي ✨','Your AI Study Assistant ✨')}</h1><p>{text('اسأل عن أي موضوع، افهم خطوة بخطوة، أو ولّد أسئلة تدريبية.','Ask about a topic, get clear explanations and generate practice questions.')}</p></div></div>
    <div className="page-content"><div className="container ai-study-layout">
      <section className="panel ai-study-main">
        <div className="planner-head"><h2 className="panel-title">{text('المحادثة','Study conversation')}</h2><button type="button" className="small-btn" disabled={busy||messages.length===0} onClick={()=>{setMessages([]);setError('');}}>{text('محادثة جديدة','New conversation')}</button></div>
        <div className="ai-study-thread" role="log" aria-live="polite">
          {messages.length===0&&<div className="ai-study-empty"><span aria-hidden="true">🧠</span><h3>{text('تبدأ بإيه النهارده؟','What would you like to learn today?')}</h3><p>{text('اختار المادة لو حابب، وبعدها اكتب سؤالك.','Choose a course if you like, then ask your question.')}</p><div className="ai-study-examples">{examples.map((x,i)=><button type="button" key={i} className="small-btn" onClick={()=>setPrompt(text(x.ar,x.en))}>{text(x.ar,x.en)}</button>)}</div></div>}
          {messages.map((message,i)=><div key={i} className={'ai-study-message '+(message.role==='user'?'is-user':'is-assistant')}><b>{message.role==='user'?text('أنت','You'):'GoAcadio AI'}</b><div className="ai-study-message-text" dir="auto">{message.content}</div></div>)}
          {busy&&<p className="inline-help" role="status">{text('بنجهز الإجابة...','Generating your answer...')}</p>}
          <div ref={bottom}/>
        </div>
        {error&&<div className="note warn" role="alert">{error}</div>}
        <form className="stack" onSubmit={e=>void send(e)}>
          <div className="field"><label htmlFor="ai-question">{text('سؤالك','Your question')}</label><textarea id="ai-question" className="input" rows={3} required minLength={3} maxLength={MAX_PROMPT_CHARS} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={text('مثلاً: اشرح الفرق بين Stack وQueue...', 'For example: Explain the difference between stack and queue...')}/><small className="inline-help">{prompt.length}/{MAX_PROMPT_CHARS}</small></div>
          <div className="actions"><button disabled={busy||prompt.trim().length<3} className="btn btn-primary" type="submit">{busy?text('جاري الإرسال...','Sending...'):text('اسأل المساعد ✨','Ask AI ✨')}</button><span className="inline-help">{remaining===null?text(`${DAILY_QUESTIONS} أسئلة يوميًا`,` ${DAILY_QUESTIONS} questions/day`):text(`متبقي ${remaining} سؤال اليوم`,`${remaining} questions remaining today`)}</span></div>
        </form>
      </section>
      <aside className="panel ai-study-sidebar"><h2 className="panel-title">{text('خصّص المساعدة','Personalize your help')}</h2><div className="stack">
        <div className="field"><label htmlFor="ai-course">{text('المادة (اختياري)','Course (optional)')}</label><select id="ai-course" className="input" value={courseId} onChange={e=>setCourseId(e.target.value)}><option value="">{text('مذاكرة عامة','General study')}</option>{courses.map(c=><option value={c.id} key={c.id}>{c.name} {c.code?`(${c.code})`:''}</option>)}</select></div>
        <div className="field"><label htmlFor="ai-mode">{text('نوع المساعدة','Type of help')}</label><select id="ai-mode" className="input" value={mode} onChange={e=>setMode(e.target.value as StudyMode)}><option value="explain">{text('شرح وتبسيط','Explain concepts')}</option><option value="practice">{text('أسئلة تدريبية','Practice questions')}</option><option value="summarize">{text('تلخيص ملاحظات','Summarize notes')}</option></select></div>
        <div className="field"><label htmlFor="ai-notes">{text('ملاحظات أو نص محاضرة (اختياري)','Notes or lecture excerpt (optional)')}</label><textarea id="ai-notes" className="input" rows={6} maxLength={MAX_NOTES_CHARS} value={notes} onChange={e=>setNotes(e.target.value)} placeholder={text('الصق جزء من ملاحظاتك علشان أشرحها أو ألخصها...', 'Paste a portion of your notes to explain or summarize...')}/><small className="inline-help">{notes.length}/{MAX_NOTES_CHARS}</small></div>
        <div className="note">{text('لسه مش بنقرأ ملفات PDF تلقائيًا في النسخة دي. المحادثة مش محفوظة على حسابك بعد قفل الصفحة.','PDF upload is not supported yet. This chat is not saved to your account after you close the page.')}</div>
        <div className="note warn">{text('سؤالك والملاحظات بتتبعت إلى Cloudflare Workers AI لإنتاج الإجابة. بلاش تكتب بيانات حساسة، وراجع صحة الإجابات المهمة.','Questions and excerpts are sent to Cloudflare Workers AI for processing. Avoid sensitive data and verify important answers.')}</div>
        <Link to="/privacy" className="inline-help">{text('سياسة الخصوصية','Privacy information')}</Link>
      </div></aside>
    </div></div></>;
}
