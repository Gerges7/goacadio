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
  PDF_READ:{ar:'تعذر فتح هذا الـPDF في المتصفح. افتح تفاصيل الخطأ بالأسفل وأرسلها للدعم.',en:'Could not open this PDF in your browser. Expand the technical details below for support.'},
  PDF_READER_LOAD:{ar:'تعذر تحميل قارئ PDF. جرب تحديث الصفحة، أو افتح تفاصيل الخطأ.',en:'PDF reader could not load. Refresh the page or check the technical details.'},
  PDF_PASSWORD:{ar:'ملف PDF محمي بكلمة مرور؛ افتحه بدون تشفير وأعد المحاولة.',en:'This PDF is password-protected. Try an unlocked copy.'},
  REQUEST_TIMEOUT:{ar:'استغرق إنشاء الاختبار وقتًا أطول من المعتاد. توقّف الانتظار؛ راجع رصيدك قبل إعادة المحاولة لأن الطلب قد يُحتسب.',en:'Quiz generation took too long. The wait was stopped. Check your quota before retrying because the request may have counted.'},
  INVALID_SOURCE_LENGTH:{ar:'نص المحاضرة لازم يكون بين 200 و12000 حرف. راجع عدد الحروف تحت مربع النص.',en:'Lecture text must contain between 200 and 12,000 characters. Check the character count below.'},
  QUIZ_SERVER_ERROR:{ar:'الخادم لم يرجع نتيجة صالحة. راجع تفاصيل الخطأ بالأسفل.',en:'The server did not return a valid result. See the error details below.'},
};

export default function QuizGenerator(){
  const {text,lang}=useLocale();
  const {user,configured,loading:authLoading}=useAuth();
  const [courses,setCourses]=useState<Course[]>([]);
  const [courseId,setCourseId]=useState('');
  const [source,setSource]=useState('');
  const [fileName,setFileName]=useState('');
  const [fileNotice,setFileNotice]=useState('');
  const [pdfDiagnostic,setPdfDiagnostic]=useState('');
  const [format,setFormat]=useState<QuizFormat>('mixed');
  const [count,setCount]=useState<QuizSize>(6);
  const [language,setLanguage]=useState<QuizLanguage>('auto');
  const [quiz,setQuiz]=useState<QuizData|null>(null);
  const [selected,setSelected]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState(false);
  const [attemptId,setAttemptId]=useState('');
  const [quizContext,setQuizContext]=useState<{courseId:string;quizFormat:QuizFormat;sourceType:'pdf'|'text'}|null>(null);
  const [savedAttempt,setSavedAttempt]=useState(false);
  const [savingAttempt,setSavingAttempt]=useState(false);
  const [saveMessage,setSaveMessage]=useState('');
  const [remaining,setRemaining]=useState<number|null>(null);
  const [busy,setBusy]=useState(false);
  const [extracting,setExtracting]=useState(false);
  const [error,setError]=useState('');
  const [requestDiagnostic,setRequestDiagnostic]=useState('');
  const [phase,setPhase]=useState<'auth'|'generate'>('auth');
  const [elapsedSeconds,setElapsedSeconds]=useState(0);

  useEffect(()=>{
    if(!busy)return;
    const timer=window.setInterval(()=>setElapsedSeconds(x=>x+1),1000);
    return ()=>window.clearInterval(timer);
  },[busy]);

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
    setError('');setFileNotice('');setPdfDiagnostic('');setFileName('');setSource('');
    setQuiz(null);setSelected({});setSubmitted(false);setSavedAttempt(false);setAttemptId('');setQuizContext(null);setSaveMessage('');setExtracting(true);
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
      if(result.skippedPages>0) setFileNotice(old=>old+' '+text(`تعذر قراءة ${result.skippedPages} صفحة.`,`Could not read ${result.skippedPages} page(s).`));
    }catch(err){
      const code=err instanceof Error?err.message:'PDF_READ';
      const message=ERRORS[code]??ERRORS.PDF_READ;
      setError(lang==='ar'?message.ar:message.en);
      if(err instanceof Error && 'diagnostic' in err && typeof err.diagnostic==='string') {
        setPdfDiagnostic(`${code}: ${err.diagnostic}`.slice(0,600));
      }
    }finally{setExtracting(false);}
  }

  async function generate(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy||extracting)return;
    setError('');setRequestDiagnostic('');
    const lecture=source.trim();
    if(lecture.length<MIN_QUIZ_SOURCE_CHARS||lecture.length>MAX_QUIZ_SOURCE_CHARS){
      const item=ERRORS.INVALID_SOURCE_LENGTH;
      setError(lang==='ar'?item.ar:item.en);
      return;
    }
    if(remaining===0){
      const item=ERRORS.DAILY_LIMIT_REACHED;
      setError(lang==='ar'?item.ar:item.en);
      return;
    }
    if(!user){
      const item=ERRORS.SIGN_IN_REQUIRED;
      setError(lang==='ar'?item.ar:item.en);
      return;
    }
    const client=getSupabase();
    if(!client){
      setError(text('تعذّر الاتصال بحسابك. حدّث الصفحة وسجّل الدخول.', 'Could not access your account. Refresh and sign in.'));
      return;
    }

    setBusy(true);setPhase('auth');setElapsedSeconds(0);
    // A bounded client wait prevents an indefinite spinner. Aborting the browser
    // request does not guarantee an already-started server inference is cancelled.
    const controller=new AbortController();
    const timeoutId=window.setTimeout(()=>controller.abort(),90000);
    try{
      const {data:{session},error:sessionError}=await client.auth.getSession();
      if(sessionError||!session?.access_token)throw new Error('SIGN_IN_REQUIRED');
      if(controller.signal.aborted)throw new Error('REQUEST_TIMEOUT');
      setPhase('generate');
      const response=await fetch('/api/generate-quiz',{
        method:'POST',cache:'no-store',signal:controller.signal,
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},
        body:JSON.stringify({source:lecture,courseId,count,format,language}),
      });
      let result:{quiz?:QuizData;error?:string;remaining?:number};
      try { result=await response.json() as typeof result; }
      catch { throw new Error(`HTTP_${response.status}`); }
      if(typeof result.remaining==='number')setRemaining(result.remaining);
      if(!response.ok||!result.quiz?.questions?.length){
        setRequestDiagnostic(`HTTP ${response.status} · ${typeof result.error==='string'?result.error:'EMPTY_RESULT'}`);
        throw new Error(result.error||`HTTP_${response.status}`);
      }
      setQuiz(result.quiz);setSelected({});setSubmitted(false);
      setSavedAttempt(false);setSaveMessage('');setAttemptId(window.crypto.randomUUID());
      setQuizContext({courseId,quizFormat:format,sourceType:fileName?'pdf':'text'});
    }catch(err){
      const code=controller.signal.aborted?'REQUEST_TIMEOUT':err instanceof Error?err.message:'AI_UNAVAILABLE';
      const item=ERRORS[code];
      setError(item?(lang==='ar'?item.ar:item.en):code.startsWith('HTTP_')
        ?text('فشل الاتصال بخادم إنشاء الاختبار. راجع تفاصيل الخطأ.', 'The quiz server returned an error. See details below.')
        :text('تعذر إكمال الطلب. تحقق من اتصال الإنترنت وحاول مرة أخرى.', 'Could not complete the request. Check your connection and retry.'));
      if(code.startsWith('HTTP_'))setRequestDiagnostic(code.replace('HTTP_','HTTP '));
      if(code==='REQUEST_TIMEOUT')setRequestDiagnostic('Browser request timeout after 90 seconds');
      if(code==='SIGN_IN_REQUIRED')setRequestDiagnostic('Session validation failed');
    }finally{
      window.clearTimeout(timeoutId);
      setBusy(false);
    }
  }

  async function saveQuizAttempt(){
    if(!quiz||!quizContext||!submitted||!result||!user||!attemptId||savingAttempt||savedAttempt)return;
    const client=getSupabase();if(!client)return;
    setSavingAttempt(true);setSaveMessage('');
    try{
      const {error:insertError}=await client.from('quiz_attempts').insert({
        user_id:user.id, client_attempt_id:attemptId, course_id:quizContext.courseId||null,
        title:quiz.title.trim().slice(0,140)||'Practice Quiz',
        question_count:result.total, correct_count:result.correct,
        quiz_format:quizContext.quizFormat, source_type:quizContext.sourceType,
      });
      if(insertError){
        // Idempotency key protects against duplicate saves after network retries.
        if(insertError.code==='23505') setSavedAttempt(true);
        else if(insertError.code==='42P01'||insertError.code==='PGRST205')
          setSaveMessage(text('شغّل SQL 006 في Supabase لتفعيل حفظ النتائج.','Apply SQL migration 006 to enable result saving.'));
        else setSaveMessage(insertError.message);
      }else setSavedAttempt(true);
    }catch{
      setSaveMessage(text('تعذر حفظ النتيجة. اتأكد من اتصالك وجرب تاني.','Could not save your result. Check your connection and retry.'));
    }finally{setSavingAttempt(false);}
  }

  const result=useMemo(()=>quiz?gradeQuiz(quiz.questions,selected):null,[quiz,selected]);
  const allAnswered=Boolean(result&&result.answered===result.total);
  const usageLabel=remaining===null
    ?text(`الحد اليومي المشترك: ${DAILY_QUESTIONS} طلبات AI`,`Shared daily limit: ${DAILY_QUESTIONS} AI requests`)
    :text(`متبقي ${remaining} طلب AI اليوم`,`${remaining} AI requests left today`);

  if(authLoading||!configured||!user)return <><div className="page-hero"><div className="container"><span className="section-kicker">QUIZ GENERATOR</span><h1>{text('اختبر نفسك من محاضراتك 📝','Make quizzes from your lectures 📝')}</h1></div></div><div className="page-content"><div className="container"><section className="panel auth-panel center"><p>{text('سجّل دخول عشان تولّد اختبارات من ملفاتك أو ملاحظاتك.', 'Sign in to create quizzes from your lecture notes or PDFs.')}</p><Link className="btn btn-primary" to="/auth">{text('تسجيل الدخول','Sign in')}</Link></section></div></div></>;

  return <><div className="page-hero"><div className="container"><span className="section-kicker">QUIZ GENERATOR</span><h1>{text('حوّل محاضرتك لاختبار 📝','Turn your lecture into a quiz 📝')}</h1><p>{text('ارفع PDF نصي أو الصق نص محاضرة، وجاوب أسئلة تدريبية مع تصحيح وتفسير.', 'Choose a text-based PDF or paste lecture notes, then practice MCQs and true/false questions with explanations.')}</p></div></div>
    <div className="page-content"><div className="container quiz-page-layout">
      <form className="panel stack quiz-editor" noValidate onSubmit={e=>void generate(e)}>
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
        {requestDiagnostic&&<details className="note"><summary>{text('تفاصيل طلب الاختبار (للدعم)','Quiz request details (for support)')}</summary><code dir="ltr" style={{overflowWrap:'anywhere'}}>{requestDiagnostic}</code></details>}
        {pdfDiagnostic&&<details className="note"><summary>{text('تفاصيل الخطأ (للدعم الفني)','Technical details (for support)')}</summary><code style={{overflowWrap:'anywhere'}}>{pdfDiagnostic}</code></details>}
        <div className="actions"><button className="btn btn-primary" disabled={busy||extracting} type="submit">{busy?text('جاري توليد الاختبار...','Generating quiz...'):text('ولّد الاختبار ✨','Generate quiz ✨')}</button></div>
        {busy&&<div className="note" role="status" aria-live="polite">
          <strong>{phase==='auth'?text('بنتحقق من الحساب...', 'Checking your account...'):text('بنجهز أسئلة الاختبار...', 'Generating practice questions...')}</strong>
          <div>{text(`الوقت المنقضي: ${elapsedSeconds} ثانية`,`Elapsed: ${elapsedSeconds} seconds`)}</div>
          <div>{text('ممكن يستغرق الطلب بعض الوقت حسب طول النص والضغط على الخدمة. لو فشل هنوضح السبب؛ بلاش تضغط الزر تاني أثناء التحميل.', 'Longer texts can take time. If it fails, you’ll see the reason. Please avoid sending duplicates.')}</div>
        </div>}
        {remaining===0&&!busy&&<div className="note warn" role="status">{text('رصيدك اليومي انتهى؛ مش هيتبعت طلب جديد قبل تجديد الحصة عند منتصف الليل UTC.', 'Your daily quota is exhausted. No request will be sent until midnight UTC.')}</div>}
        {!busy&&!extracting&&source.trim().length<MIN_QUIZ_SOURCE_CHARS&&<p className="inline-help">{text('أدخل نص محاضرة لا يقل عن 200 حرف، ثم اضغط زر التوليد.', 'Enter at least 200 characters of lecture text, then generate.')}</p>}
        <p className="inline-help">{usageLabel}. {text('الحصة مشتركة مع مساعد المذاكرة. المحاولات الفاشلة قد تُحتسب.', 'Shared with Study Assistant. Failed generation may count.')}</p>
        <div className="note">{text('بيتم استخراج نص PDF داخل متصفحك، وبيتبعت النص فقط لخدمة الذكاء الاصطناعي لتوليد الاختبار. مش بنحفظ ملف PDF أو الأسئلة. تقدر تختار تحفظ ملخص النتيجة بعد التصحيح. تجنّب البيانات الحساسة.', 'PDF text is extracted in your browser. Only the extracted text is sent for quiz generation. The PDF and quiz questions are not stored. You can optionally save a score summary after grading. Avoid sensitive information.')}</div>
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
          <div className="actions no-print">{!submitted?<button type="button" className="btn btn-primary" disabled={!allAnswered} onClick={()=>setSubmitted(true)}>{text('صحّح الاختبار','Grade quiz')}</button>:<>
            <button type="button" className="btn btn-primary" disabled={savedAttempt||savingAttempt} onClick={()=>void saveQuizAttempt()}>{savedAttempt?text('النتيجة محفوظة ✓','Result saved ✓'):savingAttempt?text('جاري الحفظ...','Saving...'):text('احفظ نتيجتك','Save result')}</button>
            <button className="btn btn-outline" type="button" onClick={()=>{setSelected({});setSubmitted(false);setSavedAttempt(false);setAttemptId(window.crypto.randomUUID());setSaveMessage('');}}>{text('إعادة المحاولة','Retake quiz')}</button>
            <Link className="btn btn-soft" to="/quiz-history">{text('سجل اختباراتي','My quiz history')}</Link>
          </>}</div>
          {saveMessage&&<div className="note warn no-print" role="status">{saveMessage}</div>}
          {submitted&&<p className="inline-help no-print">{text('حفظ النتيجة اختياري؛ بيتم حفظ عنوان الاختبار والدرجة والمادة فقط، من غير نص المحاضرة أو إجاباتك.','Saving is optional: only the quiz title, score and course are stored, not the lecture or your answers.')}</p>}
          {!submitted&&!allAnswered&&<p className="inline-help no-print">{text('جاوب كل الأسئلة الأول عشان تشوف الدرجة والتفسيرات.', 'Answer all questions to see your score and explanations.')}</p>}
          <p className="inline-help">{text('دي أسئلة مولّدة للمراجعة، مش امتحان رسمي. راجع الإجابات المهمة مع محاضرتك.', 'AI-generated practice, not an official exam. Verify answers against the lecture.')}</p>
        </>}
      </section>
    </div></div>
  </>;
}
