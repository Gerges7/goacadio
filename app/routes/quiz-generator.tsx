import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { DAILY_QUESTIONS } from '@/lib/ai-study';
import {
  MAX_QUIZ_SOURCE_CHARS, MIN_QUIZ_SOURCE_CHARS, MAX_PDF_BYTES, MAX_PDF_PAGES,
  gradeQuiz, type QuizData, type QuizFormat, type QuizLanguage, type QuizSize,
} from '@/lib/quiz';

export const meta:MetaFunction=()=>[
  {title:'PDF Quiz Generator & Practice Tests | GoAcadio'},
  {name:'description',content:'Create multiple-choice and true/false practice quizzes from lecture PDFs or pasted text.'},
  {name:'robots',content:'noindex, nofollow'},
];

type Course={id:string;name:string;code:string|null};
const ERRORS:Record<string,{ar:string;en:string}>={
  SIGN_IN_REQUIRED:{ar:'انتهت جلسة الدخول. سجّل دخول من جديد.',en:'Your session has expired. Please sign in again.'},
  AI_NOT_CONFIGURED:{ar:'خدمة توليد الاختبارات غير مفعلة على الخادم.',en:'Quiz generation is not configured on the server.'},
  QUOTA_NOT_READY:{ar:'شغّل SQL Migration 005 الخاص بحصة أدوات الذكاء الاصطناعي.',en:'Run SQL Migration 005 for the AI usage quota.'},
  QUOTA_UNAVAILABLE:{ar:'تعذر الوصول إلى خدمة الحصص اليومية.',en:'Daily usage service is unavailable.'},
  DAILY_LIMIT_REACHED:{ar:'استهلكت 5 طلبات AI اليوم. الحصة مشتركة مع مساعد المذاكرة وتُجدد يوميًا بتوقيت UTC.',en:'Your five shared AI requests are used today. The limit resets daily (UTC).'},
  QUIZ_INVALID_RESPONSE:{ar:'الاختبار اتولد بشكل غير مكتمل. حاول بنص أقصر أو أوضح. قد تُحتسب المحاولة.',en:'The generated quiz was incomplete. Try clearer or shorter text. This attempt may count.'},
  AI_UNAVAILABLE:{ar:'تعذر توليد الاختبار حاليًا. قد تُحتسب المحاولة.',en:'Could not generate a quiz right now. This attempt may count.'},
  COURSE_NOT_FOUND:{ar:'المادة المختارة مش موجودة في حسابك.',en:'The selected course was not found in your account.'},
  INVALID_INPUT:{ar:'النص أو إعدادات الاختبار غير صالحة.',en:'Check the lecture text and quiz settings.'},
  NOT_PDF:{ar:'اختار ملف PDF صالح.',en:'Choose a valid PDF file.'},
  PDF_SIZE:{ar:'حجم ملف PDF لازم يكون أقل من 8 ميجابايت.',en:'PDF must be no larger than 8 MB.'},
  PDF_NO_TEXT:{ar:'الملف مفيهوش نص كفاية. لو PDF عبارة عن صور، استخدم نسخة نصية أو الصق النص يدويًا؛ النسخة دي لا تدعم OCR.',en:'Not enough selectable text. For scanned PDFs, paste the text or use a searchable version; OCR is not supported yet.'},
  PDF_READ:{ar:'تعذر استخراج نص الملف. جرّب PDF غير محمي أو الصق النص يدويًا.',en:'Could not read this PDF. Try an unprotected text-based PDF or paste the text.'},
};

export default function QuizGenerator(){
  const {text,lang}=useLocale();
  const {user,configured,loading:authLoading}=useAuth();
  const [courses,setCourses]=useState<Course[]>([]);
  const [courseId,setCourseId]=useState('');
  const [source,setSource]=useState('');
  const [fileName,setFileName]=useState('');
  const [fileNotice,setFileNotice]=useState('');
  const [format,setFormat]=useState<QuizFormat>('mixed');
  const [count,setCount]=useState<QuizSize>(6);
  const [language,setLanguage]=useState<QuizLanguage>('auto');
  const [quiz,setQuiz]=useState<QuizData|null>(null);
  const [selected,setSelected]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState(false);
  const [remaining,setRemaining]=useState<number|null>(null);
  const [busy,setBusy]=useState(false);
  const [extracting,setExtracting]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const client=getSupabase();if(!user||!client){setCourses([]);setRemaining(null);return;}
    let active=true;
    void client.from('student_courses').select('id,name,code').eq('user_id',user.id).order('name').limit(100).then(({data})=>{
      if(active)setCourses((data??[]) as Course[]);
    });
    const day=new Date().toISOString().slice(0,10);
    void client.from('ai_daily_usage').select('used').eq('user_id',user.id).eq('usage_date',day).maybeSingle().then(({data,error:queryError})=>{
      if(active&&!queryError)setRemaining(Math.max(0,DAILY_QUESTIONS-Number(data?.used??0)));
    });
    return ()=>{active=false;};
  },[user?.id]);

  async function onPdfChange(event:ChangeEvent<HTMLInputElement>){
    const file=event.currentTarget.files?.[0];
    event.currentTarget.value='';
    if(!file)return;
    setError('');setFileNotice('');setExtracting(true);
    try{
      if(file.size>MAX_PDF_BYTES)throw new Error('PDF_SIZE');
      const {extractPdfText}=await import('@/lib/pdf-text.client');
      const result=await extractPdfText(file);
      if(result.text.length<MIN_QUIZ_SOURCE_CHARS)throw new Error('PDF_NO_TEXT');
      setSource(result.text);
      setFileName(file.name);
      setQuiz(null);setSelected({});setSubmitted(false);
      setFileNotice(result.truncated
        ?text(`تم استخراج ${result.pagesRead} من ${result.totalPages} صفحة. استخدمنا أول ${MAX_QUIZ_SOURCE_CHARS} حرف بحد أقصى.`, `Read ${result.pagesRead} of ${result.totalPages} pages; limited to ${MAX_QUIZ_SOURCE_CHARS} characters.`)
        :text(`تم استخراج نص ${result.pagesRead} صفحة بنجاح.`, `Extracted text from ${result.pagesRead} pages.`));
    }catch(err){
      const code=err instanceof Error?err.message:'PDF_READ';
      const message=ERRORS[code]??ERRORS.PDF_READ;
      setError(lang==='ar'?message.ar:message.en);
    }finally{setExtracting(false);}
  }

  async function generate(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy||extracting||!user||source.trim().length<MIN_QUIZ_SOURCE_CHARS||source.length>MAX_QUIZ_SOURCE_CHARS)return;
    const client=getSupabase();if(!client)return;
    setBusy(true);setError('');
    try{
      const {data:{session},error:sessionError}=await client.auth.getSession();
      if(sessionError||!session?.access_token)throw new Error('SIGN_IN_REQUIRED');
      const response=await fetch('/api/generate-quiz',{
        method:'POST',cache:'no-store',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},
        body:JSON.stringify({source:source.trim(),courseId,count,format,language}),
      });
      const result=await response.json() as {quiz?:QuizData;error?:string;remaining?:number};
      if(typeof result.remaining==='number')setRemaining(result.remaining);
      if(!response.ok||!result.quiz?.questions?.length)throw new Error(result.error||'AI_UNAVAILABLE');
      setQuiz(result.quiz);setSelected({});setSubmitted(false);
    }catch(err){
      const code=err instanceof Error?err.message:'AI_UNAVAILABLE';
      const item=ERRORS[code];
      setError(item?(lang==='ar'?item.ar:item.en):text('حصل خطأ. جرّب تاني.', 'Something went wrong. Please retry.'));
    }finally{setBusy(false);}
  }

  const result=useMemo(()=>quiz?gradeQuiz(quiz.questions,selected):null,[quiz,selected]);
  const allAnswered=Boolean(result&&result.answered===result.total);
  const usageLabel=remaining===null
    ?text(`الحد اليومي المشترك: ${DAILY_QUESTIONS} طلبات AI`,`Shared daily limit: ${DAILY_QUESTIONS} AI requests`)
    :text(`متبقي ${remaining} طلب AI اليوم`,`${remaining} AI requests left today`);

  if(authLoading||!configured||!user)return <><div className="page-hero"><div className="container"><span className="section-kicker">QUIZ GENERATOR</span><h1>{text('اختبر نفسك من محاضراتك 📝','Make quizzes from your lectures 📝')}</h1></div></div><div className="page-content"><div className="container"><section className="panel auth-panel center"><p>{text('سجّل دخول عشان تولّد اختبارات من ملفاتك أو ملاحظاتك.', 'Sign in to create quizzes from your lecture notes or PDFs.')}</p><Link className="btn btn-primary" to="/auth">{text('تسجيل الدخول','Sign in')}</Link></section></div></div></>;

  return <><div className="page-hero"><div className="container"><span className="section-kicker">QUIZ GENERATOR</span><h1>{text('حوّل محاضرتك لاختبار 📝','Turn your lecture into a quiz 📝')}</h1><p>{text('ارفع PDF نصي أو الصق نص محاضرة، وجاوب أسئلة تدريبية مع تصحيح وتفسير.', 'Choose a text-based PDF or paste lecture notes, then practice MCQs and true/false questions with explanations.')}</p></div></div>
    <div className="page-content"><div className="container quiz-page-layout">
      <form className="panel stack quiz-editor" onSubmit={e=>void generate(e)}>
        <h2 className="panel-title">{text('مصدر الاختبار','Quiz source')}</h2>
        <div className="field"><label htmlFor="quiz-file">{text('ملف PDF (اختياري)','PDF file (optional)')}</label><input id="quiz-file" className="input" type="file" accept="application/pdf,.pdf" disabled={busy||extracting} onChange={e=>void onPdfChange(e)}/><small className="inline-help">{text(`حد أقصى ${MAX_PDF_BYTES/1024/1024} MB و${MAX_PDF_PAGES} صفحة. PDF المصوّر بدون نص مش مدعوم.`,`Up to ${MAX_PDF_BYTES/1024/1024} MB and ${MAX_PDF_PAGES} pages. Scanned PDFs without selectable text are not supported.`)}</small></div>
        {extracting&&<p className="inline-help" role="status">{text('جاري قراءة نص PDF داخل المتصفح...','Extracting PDF text in your browser...')}</p>}
        {fileNotice&&<p className="note" role="status">{fileName&&`${fileName} — `}{fileNotice}</p>}
        <div className="field"><label htmlFor="quiz-text">{text('نص المحاضرة','Lecture text')}</label><textarea id="quiz-text" className="input" rows={10} minLength={MIN_QUIZ_SOURCE_CHARS} maxLength={MAX_QUIZ_SOURCE_CHARS} required value={source} onChange={e=>{setSource(e.target.value);setFileName('');setFileNotice('');}} placeholder={text('الصق نص المحاضرة هنا أو ارفعه من ملف PDF...', 'Paste lecture text here, or extract it from a PDF...')}/><small className="inline-help">{source.length}/{MAX_QUIZ_SOURCE_CHARS} — {text(`على الأقل ${MIN_QUIZ_SOURCE_CHARS} حرف`,`At least ${MIN_QUIZ_SOURCE_CHARS} characters`)}</small></div>
        <div className="field"><label htmlFor="quiz-course">{text('المادة (اختياري)','Course (optional)')}</label><select id="quiz-course" className="input" value={courseId} onChange={e=>setCourseId(e.target.value)}><option value="">{text('مذاكرة عامة','General study')}</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name}{c.code?` (${c.code})`:''}</option>)}</select></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="quiz-count">{text('عدد الأسئلة','Questions')}</label><select id="quiz-count" className="input" value={count} onChange={e=>setCount(Number(e.target.value) as QuizSize)}>{[4,6,8].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          <div className="field"><label htmlFor="quiz-format">{text('نوع الأسئلة','Question type')}</label><select id="quiz-format" className="input" value={format} onChange={e=>setFormat(e.target.value as QuizFormat)}><option value="mixed">MCQ + True/False</option><option value="mcq">MCQ</option><option value="tf">True/False</option></select></div>
          <div className="field"><label htmlFor="quiz-lang">{text('لغة الأسئلة','Question language')}</label><select id="quiz-lang" className="input" value={language} onChange={e=>setLanguage(e.target.value as QuizLanguage)}><option value="auto">{text('لغة النص','Same as source')}</option><option value="ar">{text('العربية','Arabic')}</option><option value="en">English</option></select></div>
        </div>
        {error&&<div className="note warn" role="alert">{error}</div>}
        <div className="actions"><button className="btn btn-primary" disabled={busy||extracting||source.trim().length<MIN_QUIZ_SOURCE_CHARS||remaining===0} type="submit">{busy?text('جاري توليد الاختبار...','Generating quiz...'):text('ولّد الاختبار ✨','Generate quiz ✨')}</button></div>
        <p className="inline-help">{usageLabel}. {text('الحصة مشتركة مع مساعد المذاكرة. المحاولات الفاشلة قد تُحتسب.', 'Shared with Study Assistant. Failed generation may count.')}</p>
        <div className="note">{text('بيتم استخراج نص PDF داخل متصفحك، وبيتبعت النص فقط لخدمة الذكاء الاصطناعي لتوليد الاختبار. مش بنحفظ ملف PDF أو الاختبار في حسابك. تجنّب البيانات الحساسة.', 'PDF text is extracted in your browser. Only the extracted text is sent for quiz generation. PDFs and quizzes are not stored in your account. Avoid sensitive information.')}</div>
      </form>

      <section className="panel quiz-results">
        {!quiz?<div className="quiz-empty"><span aria-hidden="true">📝</span><h2>{text('اختبارك هيظهر هنا','Your practice quiz will appear here')}</h2><p>{text('اختار ملف أو الصق النص وحدد عدد الأسئلة، وبعدها اضغط ولّد الاختبار.', 'Choose a PDF or paste notes, select question count and generate your quiz.')}</p></div>:<>
          <div className="planner-head"><div><h2 className="panel-title">{quiz.title}</h2><p className="inline-help">{quiz.questions.length} {text('أسئلة','questions')}{quiz.questions.length<count?' · '+text('تم توليد عدد أقل من المطلوب','Fewer questions were generated'):''}</p></div>{submitted&&<button type="button" className="small-btn no-print" onClick={()=>window.print()}>{text('طباعة النتيجة / PDF','Print result / PDF')}</button>}</div>
          {submitted&&result&&<div className="quiz-score" role="status"><strong>{result.correct} / {result.total}</strong><span>{text('إجابات صحيحة','Correct answers')} — {Math.round(result.correct/result.total*100)}%</span></div>}
          <div className="quiz-questions">{quiz.questions.map((q,index)=><section className="quiz-question" key={index}>
            <div className="quiz-question-title"><span className="tag">{index+1} · {q.kind==='mcq'?'MCQ':'T/F'}</span><h3 dir="auto">{q.question}</h3></div>
            <div className="quiz-options">{q.options.map((option,optionIndex)=>{
              const chosen=selected[index]===optionIndex;
              const isCorrect=submitted&&optionIndex===q.answerIndex;
              const isWrong=submitted&&chosen&&optionIndex!==q.answerIndex;
              return <label className={'quiz-option'+(isCorrect?' correct':'')+(isWrong?' incorrect':'')} key={optionIndex}>
                <input type="radio" name={`quiz-q-${index}`} disabled={submitted} checked={chosen} onChange={()=>setSelected(old=>({...old,[index]:optionIndex}))}/><span dir="auto">{option}</span>
                {isCorrect&&<span className="quiz-answer-icon">✓</span>}{isWrong&&<span className="quiz-answer-icon">×</span>}
              </label>;
            })}</div>
            {submitted&&<p className="quiz-explanation" dir="auto"><b>{text('التفسير:','Explanation:')}</b> {q.explanation}</p>}
          </section>)}</div>
          <div className="actions no-print">{!submitted?<button type="button" className="btn btn-primary" disabled={!allAnswered} onClick={()=>setSubmitted(true)}>{text('صحّح الاختبار','Grade quiz')}</button>:<button className="btn btn-outline" type="button" onClick={()=>{setSelected({});setSubmitted(false);}}>{text('إعادة المحاولة','Retake quiz')}</button>}</div>
          {!submitted&&!allAnswered&&<p className="inline-help no-print">{text('جاوب كل الأسئلة الأول عشان تشوف الدرجة والتفسيرات.', 'Answer all questions to see your score and explanations.')}</p>}
          <p className="inline-help">{text('دي أسئلة مولّدة للمراجعة، مش امتحان رسمي. راجع الإجابات المهمة مع محاضرتك.', 'AI-generated practice, not an official exam. Verify answers against the lecture.')}</p>
        </>}
      </section>
    </div></div>
  </>;
}
