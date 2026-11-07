import { useEffect, useMemo, useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { summarizeQuizAttempts, type QuizAttempt } from '@/lib/quiz-history';
import {
  buildRevisionAdvice, dateInLocalDays, revisionTaskNotes, revisionTaskTitle,
  type RevisionCourse, type RevisionLevel,
} from '@/lib/revision';

export const meta:MetaFunction=()=>[
  {title:'Personal Revision Planner | GoAcadio'},
  {name:'robots',content:'noindex, nofollow'},
];

type PlannedTask={id:string;course_id:string|null;title:string;kind:'task'|'exam';due_date:string|null;is_done:boolean};
const quizFields='id,course_id,title,question_count,correct_count,quiz_format,source_type,created_at';

export default function Revision(){
  const {text,lang}=useLocale();
  const {user,loading:authLoading}=useAuth();
  const [courses,setCourses]=useState<RevisionCourse[]>([]);
  const [attempts,setAttempts]=useState<QuizAttempt[]>([]);
  const [tasks,setTasks]=useState<PlannedTask[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState<string|null>(null);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [dueDate,setDueDate]=useState('');
  const [minutes,setMinutes]=useState<25|50>(25);
  const [today,setToday]=useState('');

  useEffect(()=>{
    setToday(dateInLocalDays(0));
    setDueDate(dateInLocalDays(1));
  },[]);
  useEffect(()=>{
    const client=getSupabase();
    if(!client||!user){setLoading(false);setCourses([]);setAttempts([]);setTasks([]);return;}
    let active=true;
    setLoading(true);setError('');
    void Promise.all([
      client.from('student_courses').select('id,name,code').eq('user_id',user.id).order('name').limit(200),
      client.from('quiz_attempts').select(quizFields).eq('user_id',user.id).order('created_at',{ascending:false}).limit(200),
      client.from('study_items').select('id,course_id,title,kind,due_date,is_done')
        .eq('user_id',user.id).eq('is_done',false).limit(500),
    ]).then(([courseRes,attemptRes,taskRes])=>{
      if(!active)return;
      if(courseRes.error||attemptRes.error||taskRes.error){
        setError(text('تعذر تحميل بيانات المراجعة. تأكد من تشغيل SQL 003 و006 وصلاحيات حسابك.',
          'Cannot load revision data. Check SQL migrations 003 and 006 and account access.'));
      }else{
        setCourses((courseRes.data??[]) as RevisionCourse[]);
        setAttempts((attemptRes.data??[]) as QuizAttempt[]);
        setTasks((taskRes.data??[]) as PlannedTask[]);
      }
      setLoading(false);
    }).catch(()=>{if(active){setLoading(false);setError(text('تعذر الاتصال. حاول تحديث الصفحة.', 'Connection failed. Try refreshing.'));}});
    return ()=>{active=false;};
  },[user?.id]);

  const summary=useMemo(()=>summarizeQuizAttempts(attempts),[attempts]);
  const suggestions=useMemo(()=>buildRevisionAdvice(courses,summary.courses),[courses,summary.courses]);
  const reviewCount=suggestions.filter(x=>x.level==='review').length;

  async function addRevision(course:RevisionCourse,level:RevisionLevel){
    const client=getSupabase();
    if(!client||!user||saving||loading)return;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)||dueDate<(today||dateInLocalDays(0))){
      setError(text('اختار تاريخ مراجعة اليوم أو بعده.', 'Choose today or a future revision date.'));return;
    }
    const title=revisionTaskTitle(course.name,lang==='ar');
    const exists=tasks.some(t=>t.course_id===course.id&&t.kind==='task'&&!t.is_done
      &&t.due_date===dueDate&&(t.title===title||t.title===revisionTaskTitle(course.name,lang!=='ar')));
    if(exists){
      setError(text('فيه مهمة مراجعة لنفس المادة في اليوم ده بالفعل. تقدر تعدلها من خطة المذاكرة.',
        'A revision task already exists for this course and date. Edit it in the Study Planner.'));
      return;
    }
    setSaving(course.id);setError('');setSuccess('');
    try{
      const {data,error:saveError}=await client.from('study_items').insert({
        user_id:user.id,course_id:course.id,kind:'task',title,
        notes:revisionTaskNotes(minutes,lang==='ar'),due_date:dueDate,due_time:null,
        priority:level==='review'?'high':'normal',is_done:false,
      }).select('id,course_id,title,kind,due_date,is_done').single();
      if(saveError)throw saveError;
      if(data)setTasks(old=>[data as PlannedTask,...old]);
      setSuccess(text(`تمت إضافة مهمة مراجعة «${course.name}» إلى خطة المذاكرة ✓`,
        `Revision task for “${course.name}” added to your Study Planner ✓`));
    }catch{
      setError(text('لم نتمكن من حفظ المهمة. تأكد من صلاحيات Study Planner ثم حاول مرة أخرى.',
        'Could not save the task. Check Study Planner access and try again.'));
    }finally{setSaving(null);}
  }

  const info=(level:RevisionLevel)=>{
    if(level==='review')return {label:text('مراجعة مقترحة','Revision suggested'),description:text('على الأقل اختباران و8 أسئلة، والمتوسط أقل من 70%.','At least 2 quizzes and 8 questions, with an average below 70%.')};
    if(level==='insufficient')return {label:text('بيانات قليلة','More practice needed'),description:text('احتجنا لاختبارين و8 أسئلة على الأقل عشان نقترح مراجعة بناءً على المتوسط.','Two quizzes and at least 8 questions are needed for a score-based revision hint.')};
    if(level==='on-track')return {label:text('نتائج جيدة في التدريبات','Practice results on track'),description:text('متوسط التدريبات المحفوظة 70% أو أكثر. راجع المادة دوريًا.','Your saved practice average is 70% or higher. Keep revisiting the course.')};
    return {label:text('لسه مفيش اختبارات','No saved quizzes yet'),description:text('تقدر تخطط للمراجعة دلوقتي، أو تعمل اختبار أولًا.','You can plan revision now, or take a practice quiz first.')};
  };

  if(authLoading||!user)return <div className="page-content"><div className="container"><section className="panel auth-panel center"><h1>{text('خطة المراجعة','Revision planner')}</h1><p>{text('سجّل دخول عشان تربط نتائجك بمهام المذاكرة.', 'Sign in to turn your quiz results into study tasks.')}</p><Link to="/auth" className="btn btn-primary">{text('تسجيل الدخول','Sign in')}</Link></section></div></div>;
  return <><div className="page-hero"><div className="container"><span className="section-kicker">PERSONAL STUDY TOOLS</span><h1>{text('خطّة مراجعتك 📚','Your revision plan 📚')}</h1><p>{text('حوّل نتائج اختباراتك إلى مهام مذاكرة واقعية، من غير طلبات AI إضافية.','Turn saved practice results into manageable study tasks without using extra AI requests.')}</p></div></div>
    <div className="page-content"><div className="container">
      {error&&<div className="note warn" role="alert" style={{marginBottom:14}}>{error}</div>}
      {success&&<div className="note" role="status" style={{marginBottom:14}}>{success} <Link to="/planner" style={{textDecoration:'underline'}}>{text('افتح خطة المذاكرة','Open Study Planner')}</Link></div>}
      <div className="revision-layout">
        <div>
          <section className="panel" style={{marginBottom:16}}><h2 className="panel-title">{text('التحليل من اختباراتك','Based on your saved quizzes')}</h2>
            <div className="metric-row"><div className="metric-card"><strong>{courses.length}</strong><span>{text('مواد مسجلة','Saved courses')}</span></div><div className="metric-card"><strong>{reviewCount}</strong><span>{text('مواد مقترحة للمراجعة','Revision suggestions')}</span></div></div>
            <p className="inline-help" style={{marginTop:12}}>{text('التوصيات تقريبية بناءً على أحدث 200 نتيجة محفوظة، وليست درجات رسمية أو توقعًا للامتحان.',
              'These hints use up to 200 recent saved practice results; they are not official grades or exam predictions.')}</p>
          </section>
          {loading?<section className="panel">{text('بنحمّل بيانات مذاكرتك...','Loading your study data...')}</section>
            :!courses.length?<section className="panel"><p>{text('ضيف موادك من لوحة الطالب الأول، وبعدها هتقدر تعمل خطة مراجعة.', 'Add your courses in the Student Dashboard to build a revision plan.')}</p><Link className="btn btn-primary" to="/dashboard">{text('إضافة المواد','Add courses')}</Link></section>
            :<div className="revision-cards">{suggestions.map(item=>{
              const description=info(item.level);
              const planned=tasks.filter(t=>!t.is_done&&t.course_id===item.course.id&&t.kind==='task').length;
              return <section className="panel revision-card" key={item.course.id}>
                <div className="revision-card-head"><div><h2 dir="auto">{item.course.name}</h2><small>{item.course.code??''}</small></div><span className="tag">{description.label}</span></div>
                <p className="inline-help">{description.description}</p>
                <div className="revision-card-metrics"><span>{text('الاختبارات','Quizzes')}: <strong>{item.attempts}</strong></span><span>{text('الدقة','Accuracy')}: <strong>{item.accuracy===null?'—':`${item.accuracy}%`}</strong></span><span>{text('مهام مفتوحة','Open tasks')}: <strong>{planned}</strong></span></div>
                <div className="actions"><button type="button" className="btn btn-primary btn-small" disabled={saving!==null||loading||!dueDate}
                  onClick={()=>void addRevision(item.course,item.level)}>{saving===item.course.id?text('جاري الحفظ...','Saving...'):text('أضف مهمة مراجعة','Plan a revision session')}</button><Link to="/quiz-generator" className="btn btn-outline btn-small">{text('اختبار جديد','New quiz')}</Link></div>
              </section>;
            })}</div>}
        </div>
        <aside className="panel revision-settings"><h2 className="panel-title">{text('إعداد جلسة المراجعة','Revision session settings')}</h2>
          <div className="stack"><div className="field"><label htmlFor="revision-date">{text('تاريخ الجلسة','Session date')}</label>
            <input id="revision-date" className="input" type="date" value={dueDate} min={today||undefined} onChange={e=>setDueDate(e.target.value)}/></div>
            <div className="field"><label htmlFor="revision-duration">{text('مدة المذاكرة المقترحة','Suggested duration')}</label>
              <select id="revision-duration" className="input" value={minutes} onChange={e=>setMinutes(Number(e.target.value) as 25|50)}>
                <option value={25}>25 {text('دقيقة','minutes')}</option><option value={50}>50 {text('دقيقة','minutes')}</option>
              </select></div>
            <p className="inline-help">{text('اضبط التاريخ والمدة، ثم اختار «أضف مهمة مراجعة» عند المادة. المدة هتتحفظ في وصف المهمة.',
              'Choose a date and duration, then add a task from the course card. Duration is saved in the task notes.')}</p>
            <Link to="/planner" className="btn btn-soft">{text('عرض خطة المذاكرة','View Study Planner')}</Link>
            <Link to="/quiz-history" className="btn btn-outline">{text('سجل الاختبارات','Quiz History')}</Link></div>
        </aside>
      </div>
    </div></div></>;
}
