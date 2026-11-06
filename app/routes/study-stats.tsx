import { useEffect, useMemo, useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { summarizeFocus, type FocusSession } from '@/lib/focus';

export const meta:MetaFunction = () => [
  {title:'Personal Study Insights | GoAcadio'},
  {name:'robots',content:'noindex, nofollow'},
];

type Course = {id:string;name:string};
export default function StudyStats(){
  const {text,lang}=useLocale();
  const {user,loading:authLoading} = useAuth();
  const [sessions,setSessions]=useState<FocusSession[]>([]);
  const [courses,setCourses]=useState<Course[]>([]);
  const [days,setDays]=useState<7|30>(7);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [now,setNow]=useState<Date|null>(null);
  useEffect(()=>{setNow(new Date());},[]);
  useEffect(()=>{
    const client=getSupabase();if(!client||!user){setLoading(false);return;}
    let active=true;setLoading(true);setMessage('');
    const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-29);
    void Promise.all([
      client.from('focus_sessions').select('id,minutes,completed_at,course_id').eq('user_id',user.id).gte('completed_at',start.toISOString()).order('completed_at',{ascending:false}).limit(3000),
      client.from('student_courses').select('id,name').eq('user_id',user.id).order('name').limit(200),
    ]).then(([activity,courseResult])=>{
      if(!active)return;
      if(activity.error)setMessage(text('تعذر تحميل النشاط. تأكد من تنفيذ SQL 004.','Unable to load sessions. Apply SQL migration 004 first.')+` (${activity.error.code||activity.error.message})`);
      else setSessions((activity.data??[]) as FocusSession[]);
      if(courseResult.data)setCourses(courseResult.data as Course[]);
      setLoading(false);
    }).catch(()=>{if(active){setLoading(false);setMessage(text('تعذر الاتصال بالخادم.','Could not connect to the server.'));}});
    return ()=>{active=false;};
  },[user?.id]);
  const stats=useMemo(()=>summarizeFocus(sessions,days,now??new Date()),[sessions,days,now]);
  const coursesById=useMemo(()=>new Map<string,string>(courses.map(c=>[c.id,c.name] as const)),[courses]);
  const breakdown=useMemo(()=>{
    const validDays=new Set(stats.chart.map(x=>x.day));
    const counts=new Map<string,number>();
    for(const session of sessions){
      const stamp=new Date(session.completed_at);if(!Number.isFinite(stamp.getTime()))continue;
      const day=[stamp.getFullYear(),String(stamp.getMonth()+1).padStart(2,'0'),String(stamp.getDate()).padStart(2,'0')].join('-');
      if(!validDays.has(day))continue;
      const key=session.course_id??'';
      counts.set(key,(counts.get(key)??0)+session.minutes);
    }
    return [...counts].sort((a,b)=>b[1]-a[1]);
  },[sessions,stats.chart]);

  async function deleteAll(){
    if(!user||busy)return;
    if(!window.confirm(text('تمسح كل سجل جلسات التركيز من حسابك نهائيًا؟','Permanently delete your entire saved focus-session history?')))return;
    const client=getSupabase();if(!client)return;
    setBusy(true);setMessage('');
    const {error}=await client.from('focus_sessions').delete().eq('user_id',user.id);
    if(error)setMessage(error.message);
    else {
      setSessions([]);
      try{window.localStorage.removeItem(`goacadio:focus:pending:${user.id}`);}catch{}
      setMessage(text('تم حذف الجلسات المحفوظة في حسابك.','Saved account sessions deleted.'));
    }
    setBusy(false);
  }

  if(authLoading||!user)return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDY INSIGHTS</span><h1>{text('إحصائيات مذاكرتك','Your study insights')}</h1></div></div><div className="page-content"><div className="container"><section className="panel auth-panel center"><p>{text('سجّل دخول عشان تتابع نشاطك على مختلف الأجهزة.','Sign in to see your synced study activity.')}</p><Link to="/auth" className="btn btn-primary">{text('تسجيل الدخول','Sign in')}</Link></section></div></div></>;
  const maxMinutes=Math.max(25,...stats.chart.map(x=>x.minutes));
  const formatDay=(date:string)=>new Intl.DateTimeFormat(lang==='ar'?'ar-EG':'en-GB',{day:'numeric',month:'short'}).format(new Date(date+'T12:00:00'));
  return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDY INSIGHTS</span><h1>{text('تقدمك في المذاكرة 📊','Your study progress 📊')}</h1><p>{text('اعرف عدد جلسات التركيز والساعات اللي أنجزتها، وراجع نشاطك حسب المادة.','Track completed focus sessions, minutes and study activity by course.')}</p></div></div>
    <div className="page-content"><div className="container"><div className="planner-head">
      <div className="planner-filters" role="group" aria-label={text('الفترة','Period')}>
        <button type="button" className={'small-btn '+(days===7?'active-tab':'')} onClick={()=>setDays(7)}>{text('7 أيام','7 days')}</button>
        <button type="button" className={'small-btn '+(days===30?'active-tab':'')} onClick={()=>setDays(30)}>{text('30 يوم','30 days')}</button>
      </div>
      <Link to="/tools/focus-timer" className="btn btn-primary">{text('ابدأ جلسة تركيز','Start focus session')}</Link>
    </div>
    {message&&<div className="note warn" role="status" style={{marginBottom:16}}>{message}</div>}
    {loading?<div className="panel">{text('جاري تحميل بياناتك...','Loading your sessions...')}</div>:<>
      <div className="study-metrics">
        <div className="metric-card"><strong>{stats.totalMinutes}</strong><span>{text('دقيقة تركيز','Focus minutes')}</span></div>
        <div className="metric-card"><strong>{stats.totalSessions}</strong><span>{text('جلسة مكتملة','Completed sessions')}</span></div>
        <div className="metric-card"><strong>{(stats.totalMinutes/60).toFixed(1)}</strong><span>{text('ساعة مذاكرة','Study hours')}</span></div>
        <div className="metric-card"><strong>{stats.activeDays}</strong><span>{text('أيام نشطة','Active days')}</span></div>
      </div>
      <div className="study-insights-grid">
        <section className="panel"><h2 className="panel-title">{text('نشاطك اليومي','Daily focus')}</h2>
          <p className="panel-description">{text('كل عمود يمثل دقائق جلسات التركيز المكتملة في يوم.','Each bar represents completed focus minutes on that day.')}</p>
          <div className="focus-bars" role="img" aria-label={stats.chart.map(d=>`${d.day}: ${d.minutes} min`).join(', ')}>
            {stats.chart.map(({day,minutes})=><div key={day} className="focus-bar-col" title={`${day}: ${minutes} min`}>
              <div className="focus-bar-track"><div className="focus-bar-fill" style={{height:`${Math.min(100,minutes/maxMinutes*100)}%`}}/></div>
              <small>{days===7?formatDay(day):day.slice(-2)}</small>
            </div>)}
          </div>
          {!stats.totalSessions&&<p className="inline-help">{text('لسه مفيش جلسات متزامنة في الفترة دي.','No synced sessions in this period yet.')}</p>}
        </section>
        <aside className="panel"><h2 className="panel-title">{text('التوزيع حسب المادة','Study time by course')}</h2>
          {breakdown.length?breakdown.map(([courseId,minutes])=><div className="course-item" key={courseId||'general'}><span>📚</span><div><b>{coursesById.get(courseId)??text('مذاكرة عامة','General study')}</b><small>{minutes} {text('دقيقة','minutes')}</small></div></div>):<p className="inline-help">{text('لا توجد بيانات بعد.','No data yet.')}</p>}
          <div className="note" style={{marginTop:16}}>{text('جلسات التركيز المكتملة فقط هي اللي بتتحسب. جلسات المتصفح القديمة قبل V2.5 مش بتتنقل تلقائيًا.','Only completed sessions count. Device-only sessions from before V2.5 are not imported automatically.')}</div>
        </aside>
      </div>
      <div className="actions"><button type="button" disabled={busy} className="small-btn danger-btn" onClick={()=>void deleteAll()}>{busy?text('جاري الحذف...','Deleting...'):text('حذف سجل جلساتي','Delete my focus history')}</button><Link to="/dashboard" className="btn btn-outline">{text('العودة للوحة الطالب','Back to dashboard')}</Link></div>
    </>}
    </div></div>
  </>;
}
