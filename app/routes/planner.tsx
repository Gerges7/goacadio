import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { localToday, dayDiff, plannerStats, type StudyItem } from '@/lib/planner';

export const meta:MetaFunction = () => [
  { title:'Study Planner & Exam Tracker | GoAcadio' },
  { name:'description',content:'Track your personal study tasks, assignments and exam dates in one place.' },
  { name:'robots',content:'noindex, nofollow' },
];

type Course = { id:string; name:string; code:string|null };
type Draft = { kind:'task'|'exam'; title:string; notes:string; course_id:string; due_date:string; due_time:string; priority:'low'|'normal'|'high' };
const empty:Draft = {kind:'task',title:'',notes:'',course_id:'',due_date:'',due_time:'',priority:'normal'};
const fields='id,user_id,course_id,kind,title,notes,due_date,due_time,priority,is_done,created_at';

export default function Planner(){
  const {text,lang}=useLocale();
  const {user,configured,loading:authLoading}=useAuth();
  const [items,setItems]=useState<StudyItem[]>([]);
  const [courses,setCourses]=useState<Course[]>([]);
  const [draft,setDraft]=useState<Draft>({...empty});
  const [editingId,setEditingId]=useState<string|null>(null);
  const [filter,setFilter]=useState<'open'|'all'|'done'|'exam'>('open');
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [today,setToday]=useState('');
  useEffect(()=>{setToday(localToday());},[]);
  useEffect(()=>{
    const client=getSupabase(); if(!client||!user){setItems([]);setCourses([]);return;}
    let active=true; setLoading(true);setMessage('');
    void Promise.all([
      client.from('study_items').select(fields).eq('user_id',user.id).order('created_at',{ascending:false}).limit(500),
      client.from('student_courses').select('id,name,code').eq('user_id',user.id).order('name'),
    ]).then(([taskResult,courseResult])=>{
      if(!active)return;
      if(taskResult.error)setMessage(text('تعذر تحميل المهام. تأكد من تشغيل ملف 003_study_planner.sql في Supabase.','Could not load planner items. Check that migration 003_study_planner.sql has been applied.')+` (${taskResult.error.code||taskResult.error.message})`);
      else setItems((taskResult.data??[]) as StudyItem[]);
      if(courseResult.error)setMessage(courseResult.error.message);
      else setCourses((courseResult.data??[]) as Course[]);
      setLoading(false);
    }).catch(()=>{if(active){setLoading(false);setMessage(text('تعذر الاتصال. حاول مرة أخرى.','Connection failed. Please retry.'));}});
    return ()=>{active=false;};
  },[user?.id]);

  const stats=useMemo(()=>plannerStats(items,today),[items,today]);
  const visible=useMemo(()=>items.filter(x=>filter==='all'||(filter==='open'&&!x.is_done)||(filter==='done'&&x.is_done)||(filter==='exam'&&x.kind==='exam'&&!x.is_done)).sort((a,b)=>{
    if(a.is_done!==b.is_done)return a.is_done?1:-1;
    if(a.due_date===null && b.due_date!==null)return 1;
    if(b.due_date===null && a.due_date!==null)return -1;
    if(a.due_date!==b.due_date)return (a.due_date??'').localeCompare(b.due_date??'');
    return (a.due_time??'').localeCompare(b.due_time??'');
  }),[items,filter]);
  const set = (next:Partial<Draft>)=>setDraft(old=>({...old,...next}));
  const reset=()=>{setDraft({...empty});setEditingId(null);};
  function startEdit(item:StudyItem){
    setEditingId(item.id);
    setDraft({kind:item.kind,title:item.title,notes:item.notes??'',course_id:item.course_id??'',due_date:item.due_date??'',due_time:item.due_time?.slice(0,5)??'',priority:item.priority});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  async function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const client=getSupabase(); if(!client||!user||busy)return;
    const title=draft.title.trim();
    if(!title||title.length>160||draft.notes.length>1000){setMessage(text('راجع العنوان والملاحظات.','Check the title and notes.'));return;}
    if(draft.kind==='exam'&&!draft.due_date){setMessage(text('لازم تحدد تاريخ الامتحان.','Please select an exam date.'));return;}
    if(draft.due_time&&!draft.due_date){setMessage(text('اختار تاريخًا قبل تحديد الوقت.','Select a date before adding a time.'));return;}
    setBusy(true);setMessage('');
    const input={kind:draft.kind,title,notes:draft.notes.trim()||null,course_id:draft.course_id||null,due_date:draft.due_date||null,due_time:draft.due_date&&draft.due_time?draft.due_time:null,priority:draft.priority};
    const {data,error}=editingId
      ?await client.from('study_items').update(input).eq('id',editingId).eq('user_id',user.id).select(fields).single()
      :await client.from('study_items').insert({...input,user_id:user.id}).select(fields).single();
    if(error)setMessage(error.message);
    else if(data){
      const saved=data as StudyItem;
      setItems(old=>editingId?old.map(x=>x.id===saved.id?saved:x):[saved,...old]);
      reset();setMessage(text('اتحفظ في حسابك بنجاح ✓','Saved to your account ✓'));
    }
    setBusy(false);
  }
  async function toggleDone(item:StudyItem){
    const client=getSupabase(); if(!client||!user||busy)return;
    setBusy(true);setMessage('');
    const {data,error}=await client.from('study_items').update({is_done:!item.is_done}).eq('id',item.id).eq('user_id',user.id).select(fields).single();
    if(error)setMessage(error.message);
    else if(data)setItems(old=>old.map(x=>x.id===item.id?data as StudyItem:x));
    setBusy(false);
  }
  async function remove(item:StudyItem){
    if(!window.confirm(text('تمسح العنصر ده نهائيًا؟','Permanently delete this item?')))return;
    const client=getSupabase();if(!client||!user||busy)return;
    setBusy(true);setMessage('');
    const {data,error}=await client.from('study_items').delete().eq('id',item.id).eq('user_id',user.id).select('id');
    if(error)setMessage(error.message);
    else if(data?.length){setItems(old=>old.filter(x=>x.id!==item.id));if(editingId===item.id)reset();}
    else setMessage(text('لم يتم حذف العنصر.','Item was not deleted.'));
    setBusy(false);
  }
  function describeDate(date:string|null,time:string|null){
    if(!date)return text('بدون تاريخ','No date');
    const diff=today?dayDiff(date,today):99;
    const when=diff===0?text('اليوم','Today'):diff===1?text('بكرة','Tomorrow'):diff<0?text(`متأخر ${Math.abs(diff)} يوم`,`Overdue ${Math.abs(diff)}d`):diff<=7?text(`بعد ${diff} أيام`,`In ${diff}d`):'';
    const pretty=new Intl.DateTimeFormat(lang==='ar'?'ar-EG':'en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`));
    return [when,pretty,time?.slice(0,5)||''].filter(Boolean).join(' · ');
  }
  if(!configured||authLoading||!user)return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDY PLANNER</span><h1>{text('خطة مذاكرتك ومواعيد امتحاناتك','Your study planner & exams')}</h1></div></div><div className="page-content"><div className="container"><section className="panel auth-panel center"><p>{authLoading?text('بنتحقق من حسابك...','Checking your account...'):text('سجّل دخول عشان تحفظ المواعيد والمهام وتلاقيها على أي جهاز.','Sign in to sync your study tasks and exams across devices.')}</p><Link className="btn btn-primary" to="/auth">{text('تسجيل الدخول','Sign in')}</Link></section></div></div></>;
  return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDY PLANNER</span><h1>{text('خطتك الدراسية 🗓️','Your study planner 🗓️')}</h1><p>{text('رتّب المهام والامتحانات، تابع المواعيد والتقدم، وكل شيء محفوظ في حسابك.','Plan study tasks, track exam dates and stay on top of deadlines — synced to your account.')}</p></div></div>
    <div className="page-content"><div className="container">
      {message&&<div className="note" role="status" style={{marginBottom:18}}>{message}</div>}
      <div className="planner-stats">
        <div className="metric-card"><strong>{stats.totalOpen}</strong><span>{text('مهام ومواعيد مفتوحة','Open items')}</span></div>
        <div className="metric-card"><strong>{stats.nextWeek}</strong><span>{text('خلال 7 أيام','Next 7 days')}</span></div>
        <div className="metric-card"><strong>{stats.exams}</strong><span>{text('امتحانات قادمة','Upcoming exams')}</span></div>
        <div className="metric-card"><strong>{stats.overdue}</strong><span>{text('متأخرة','Overdue')}</span></div>
      </div>
      <div className="planner-layout">
        <section className="panel"><h2 className="panel-title">{editingId?text('تعديل العنصر','Edit item'):text('أضف مهمة أو امتحان','Add a task or exam')}</h2>
          <form className="stack" onSubmit={e=>void save(e)}>
            <div className="form-grid"><div className="field"><label htmlFor="study-kind">{text('النوع','Type')}</label><select id="study-kind" className="input" value={draft.kind} onChange={e=>set({kind:e.target.value as Draft['kind']})}><option value="task">{text('مهمة مذاكرة','Study task')}</option><option value="exam">{text('امتحان','Exam')}</option></select></div>
            <div className="field"><label htmlFor="study-course">{text('المادة (اختياري)','Course (optional)')}</label><select id="study-course" className="input" value={draft.course_id} onChange={e=>set({course_id:e.target.value})}><option value="">{text('بدون مادة','No course')}</option>{courses.map(c=><option key={c.id} value={c.id}>{c.code?`${c.code} — `:''}{c.name}</option>)}</select></div></div>
            <div className="field"><label htmlFor="study-title">{text('العنوان','Title')}</label><input id="study-title" className="input" required maxLength={160} placeholder={text('حل مسائل الفصل الثالث','Review chapter 3')} value={draft.title} onChange={e=>set({title:e.target.value})}/></div>
            <div className="form-grid"><div className="field"><label htmlFor="study-date">{text('الموعد','Due date')}{draft.kind==='exam'?' *':''}</label><input id="study-date" className="input" type="date" required={draft.kind==='exam'} value={draft.due_date} onChange={e=>set({due_date:e.target.value,due_time:e.target.value?draft.due_time:''})}/></div>
            <div className="field"><label htmlFor="study-time">{text('الساعة (اختياري)','Time (optional)')}</label><input id="study-time" className="input" type="time" disabled={!draft.due_date} value={draft.due_time} onChange={e=>set({due_time:e.target.value})}/></div></div>
            <div className="field"><label htmlFor="study-priority">{text('الأولوية','Priority')}</label><select id="study-priority" className="input" value={draft.priority} onChange={e=>set({priority:e.target.value as Draft['priority']})}><option value="normal">{text('عادية','Normal')}</option><option value="high">{text('عالية','High')}</option><option value="low">{text('منخفضة','Low')}</option></select></div>
            <div className="field"><label htmlFor="study-notes">{text('ملاحظات (اختياري)','Notes (optional)')}</label><textarea id="study-notes" className="input" maxLength={1000} rows={3} value={draft.notes} onChange={e=>set({notes:e.target.value})}/></div>
            <div className="actions"><button className="btn btn-primary" type="submit" disabled={busy||!draft.title.trim()}>{busy?text('جاري الحفظ...','Saving...'):editingId?text('حفظ التعديل','Save changes'):text('إضافة','Add item')}</button>{editingId&&<button className="btn btn-outline" type="button" onClick={reset}>{text('إلغاء','Cancel')}</button>}</div>
          </form><p className="inline-help" style={{marginTop:18}}>{text('تقدر تضيف موادك من لوحة الطالب، أو تسجل مهمة بدون ربطها بمادة.','Add courses from your Student Dashboard, or create items without selecting a course.')}</p>
          <Link className="small-btn" to="/dashboard">{text('إدارة المواد','Manage courses')}</Link>
        </section>
        <section className="panel"><div className="planner-head"><h2 className="panel-title">{text('مهامي ومواعيدي','My schedule')}</h2><div className="planner-filters" role="group" aria-label={text('تصفية العناصر','Filter items')}>
          {(['open','exam','done','all'] as const).map(f=><button type="button" key={f} aria-pressed={filter===f} className={'small-btn '+(filter===f?'active-tab':'')} onClick={()=>setFilter(f)}>{f==='open'?text('القادمة','Open'):f==='exam'?text('امتحانات','Exams'):f==='done'?text('مكتملة','Done'):text('الكل','All')}</button>)}
        </div></div>
          {loading?<div className="placeholder">{text('جاري تحميل المواعيد...','Loading schedule...')}</div>:visible.length===0?<div className="placeholder">{text('مفيش عناصر في الاختيار ده. أضف أول مهمة أو امتحان.','Nothing here yet. Add your first task or exam.')}</div>:<div className="planner-items">{visible.map(item=>{
            const c=courses.find(x=>x.id===item.course_id);
            const overdue=!item.is_done&&!!item.due_date&&!!today&&item.due_date<today;
            return <article className={'planner-item '+(item.is_done?'is-done':'')} key={item.id}>
              <div className="planner-item-top"><span className={'tag '+(item.kind==='exam'?'orange':'green')}>{item.kind==='exam'?text('امتحان','Exam'):text('مهمة','Task')}</span>{item.priority==='high'&&<span className="tag orange">{text('أولوية عالية','High priority')}</span>}{overdue&&<span className="tag orange">{text('متأخر','Overdue')}</span>}</div>
              <h3>{item.title}</h3><p className="planner-item-date">{describeDate(item.due_date,item.due_time)}</p>
              {c&&<p className="planner-course">📚 {c.name}</p>}{item.notes&&<p className="planner-notes">{item.notes}</p>}
              <div className="planner-item-actions"><button type="button" className="small-btn" disabled={busy} onClick={()=>void toggleDone(item)}>{item.is_done?text('إعادة فتح','Reopen'):text('إنجاز ✓','Mark done ✓')}</button><button type="button" className="small-btn" disabled={busy} onClick={()=>startEdit(item)}>{text('تعديل','Edit')}</button><button type="button" className="small-btn danger-btn" disabled={busy} onClick={()=>void remove(item)}>{text('حذف','Delete')}</button></div>
            </article>;
          })}</div>}
        </section>
      </div>
      <div className="note" style={{marginTop:18}}>{text('المواعيد محفوظة في حسابك. تنبيهات البريد والإشعارات لم تُفعّل بعد؛ تابع الصفحة للاطلاع على المواعيد.', 'Dates sync to your account. Email and push reminders are not enabled; check this page for upcoming deadlines.')}</div>
    </div></div>
  </>;
}
