import { useEffect, useMemo, useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { summarizeQuizAttempts, accuracy, type QuizAttempt } from '@/lib/quiz-history';

export const meta: MetaFunction = () => [
  {title:'My Quiz History & Progress | GoAcadio'},
  {name:'robots',content:'noindex, nofollow'},
];
type Course = {id:string; name:string};
const fields='id,course_id,title,question_count,correct_count,quiz_format,source_type,created_at';
export default function QuizHistory(){
  const {text,lang}=useLocale();
  const {user,loading:authLoading}=useAuth();
  const [items,setItems]=useState<QuizAttempt[]>([]);
  const [courses,setCourses]=useState<Course[]>([]);
  const [filter,setFilter]=useState('all');
  const [loading,setLoading]=useState(true);
  const [deleting,setDeleting]=useState<string|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    const client=getSupabase(); if(!client||!user){setLoading(false);setItems([]);return;}
    let live=true;setLoading(true);setError('');
    void Promise.all([
      client.from('quiz_attempts').select(fields).eq('user_id',user.id).order('created_at',{ascending:false}).limit(200),
      client.from('student_courses').select('id,name').eq('user_id',user.id).order('name').limit(200),
    ]).then(([attemptResult,courseResult])=>{
      if(!live)return;
      if(attemptResult.error)setError(text('تعذر قراءة سجل الاختبارات. تأكد من تشغيل SQL 006.','Cannot load quiz history. Check SQL migration 006.')+' ('+attemptResult.error.code+')');
      else setItems((attemptResult.data??[]) as QuizAttempt[]);
      if(courseResult.data)setCourses(courseResult.data as Course[]);
      setLoading(false);
    }).catch(()=>{if(live){setLoading(false);setError(text('تعذر الاتصال بالخادم.','Unable to connect to the server.'));}});
    return ()=>{live=false;};
  },[user?.id]);
  const visible=useMemo(()=>filter==='all'?items:items.filter(a=>(a.course_id??'')===filter),[items,filter]);
  const summary=useMemo(()=>summarizeQuizAttempts(visible),[visible]);
  const labels=useMemo(()=>new Map(courses.map(c=>[c.id,c.name] as const)),[courses]);
  async function remove(id:string){
    const client=getSupabase();if(!client||!user||deleting)return;
    if(!window.confirm(text('تحذف النتيجة دي من حسابك نهائيًا؟','Permanently delete this quiz result?')))return;
    setDeleting(id);setError('');
    const {error:deleteError}=await client.from('quiz_attempts').delete().eq('id',id).eq('user_id',user.id).select('id');
    if(deleteError)setError(deleteError.message);
    else setItems(old=>old.filter(x=>x.id!==id));
    setDeleting(null);
  }
  if(authLoading||!user) return <div className="page-content"><div className="container"><section className="panel auth-panel center"><h1>{text('سجل اختباراتي','My quiz history')}</h1><p>{text('سجّل دخول عشان تتابع تقدمك.', 'Sign in to track your quiz results.')}</p><Link className="btn btn-primary" to="/auth">{text('تسجيل الدخول','Sign in')}</Link></section></div></div>;
  const date=(s:string)=>new Intl.DateTimeFormat(lang==='ar'?'ar-EG':'en-GB',{dateStyle:'medium'}).format(new Date(s));
  return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDY INSIGHTS</span><h1>{text('سجل الاختبارات وتقدمك 📊','Your quiz history & progress 📊')}</h1><p>{text('راجع نتائجك المحفوظة والمواد اللي محتاجة وقت مذاكرة أكتر.','Review saved quiz scores and identify courses that could use more practice.')}</p></div></div>
    <div className="page-content"><div className="container">
      {error&&<div className="note warn" role="alert" style={{marginBottom:18}}>{error}</div>}
      <div className="planner-head"><div className="field"><label htmlFor="quiz-history-course">{text('تصفية حسب المادة','Filter by course')}</label><select id="quiz-history-course" className="input" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{text('كل المواد','All courses')}</option><option value="">{text('اختبارات عامة','General quizzes')}</option>{courses.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div><Link to="/quiz-generator" className="btn btn-primary">{text('اختبار جديد','New quiz')}</Link></div>
      {loading?<section className="panel">{text('جاري تحميل النتائج...','Loading quiz history...')}</section>:<>
        <div className="study-metrics">
          <div className="metric-card"><strong>{summary.totalAttempts}</strong><span>{text('اختبارات محفوظة','Saved quizzes')}</span></div>
          <div className="metric-card"><strong>{summary.totalQuestions}</strong><span>{text('أسئلة تمت الإجابة عنها','Questions answered')}</span></div>
          <div className="metric-card"><strong>{summary.totalAttempts?summary.accuracy+'%':'—'}</strong><span>{text('متوسط صحة الإجابات','Weighted accuracy')}</span></div>
          <div className="metric-card"><strong>{summary.lastSevenDays}</strong><span>{text('آخر 7 أيام','Last 7 days')}</span></div>
        </div>
        <div className="study-insights-grid">
          <section className="panel"><h2 className="panel-title">{text('الأداء حسب المادة','Performance by course')}</h2>
            {summary.courses.length?summary.courses.map(c=><div className="quiz-history-course" key={c.courseId||'general'}><div className="quiz-history-course-head"><strong>{labels.get(c.courseId)??text('اختبارات عامة / مادة محذوفة','General / deleted course')}</strong><span>{c.accuracy}% · {c.attempts} {text('اختبار','quizzes')}</span></div><div className="quiz-history-track"><span style={{width:`${c.accuracy}%`}}/></div></div>)
            :<p className="inline-help">{text('لا توجد نتائج محفوظة في الاختيار الحالي.','No saved results for this selection.')}</p>}
            {summary.needsReview.length>0&&<div className="note" style={{marginTop:18}}><b>{text('مواد للمراجعة:','Courses to review:')}</b> {summary.needsReview.map(c=>labels.get(c.courseId)??text('مادة محذوفة','Deleted course')).join('، ')}.<div>{text('ده مؤشر من نتائج اختبارين على الأقل، مش تقييم أكاديمي رسمي.','Based on at least two saved quizzes, not an official academic assessment.')}</div></div>}
          </section>
          <aside className="panel"><h2 className="panel-title">{text('آخر النتائج','Recent results')}</h2>
            {visible.length?visible.map(a=><div className="quiz-attempt-row" key={a.id}>
              <div className="quiz-attempt-detail"><strong dir="auto">{a.title}</strong><small>{labels.get(a.course_id??'')??text('مذاكرة عامة','General study')} · {date(a.created_at)} · {a.quiz_format.toUpperCase()}</small></div>
              <span className="quiz-attempt-score">{a.correct_count}/{a.question_count} <small>({accuracy(a.correct_count,a.question_count)}%)</small></span>
              <button type="button" className="small-btn danger-btn" disabled={deleting!==null} onClick={()=>void remove(a.id)} aria-label={text('حذف النتيجة','Delete result')}>{text('حذف','Delete')}</button>
            </div>):<p className="inline-help">{text('مفيش نتائج محفوظة لسه.','No saved quiz results yet.')}</p>}
            <p className="inline-help">{text('الصفحة تعرض أحدث 200 نتيجة كحد أقصى. تقدر تحذف أي نتيجة من حسابك.','Shows at most your 200 most recent results. You can delete individual entries.')}</p>
          </aside>
        </div>
        <p className="inline-help" style={{marginTop:16}}>{text('النسب مبنية على الاختبارات اللي اخترت تحفظها فقط، ومش معناها تقدير نهائي للمادة.','Statistics only reflect the quiz results you chose to save, not an official course grade.')}</p>
      </>}
    </div></div></>;
}
