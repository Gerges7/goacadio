import { publicSeoMeta } from '@/lib/seo';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';
import { getSupabase } from '@/lib/supabase';
import { loadLocal, saveLocal, storageKeys, todayKey } from '@/lib/storage';
import type { PendingFocusSession } from '@/lib/focus';

export const meta: MetaFunction = () => publicSeoMeta(
  'Focus Timer & Study Sessions | GoAcadio',
  'Free Pomodoro focus timer with optional private study-session syncing.',
  '/tools/focus-timer',
);

type Stats = {day:string; sessions:number; minutes:number};
type Course = {id:string; name:string; code:string|null};
const queueKey = (userId:string) => `goacadio:focus:pending:${userId}`;

export default function Focus(){
  const {text,lang} = useLocale();
  const {user} = useAuth();
  const [duration,setDuration] = useState(25);
  const [remaining,setRemaining] = useState(25*60);
  const [running,setRunning] = useState(false);
  const [stats,setStats] = useState<Stats>({day:todayKey(),sessions:0,minutes:0});
  const [loaded,setLoaded] = useState(false);
  const [courses,setCourses] = useState<Course[]>([]);
  const [courseId,setCourseId] = useState('');
  const [pendingCount,setPendingCount] = useState(0);
  const [syncStatus,setSyncStatus] = useState('');
  const deadline = useRef<number|null>(null);
  const completed = useRef(false);
  const syncing = useRef(false);

  useEffect(()=>{
    const saved = loadLocal<Stats>(storageKeys.focus,{day:todayKey(),sessions:0,minutes:0});
    if(saved.day === todayKey() && Number.isFinite(saved.sessions) && Number.isFinite(saved.minutes)) setStats(saved);
    setLoaded(true);
  },[]);
  useEffect(()=>{if(loaded)saveLocal(storageKeys.focus,stats);},[stats,loaded]);

  const syncQueued = useCallback(async ()=>{
    const uid=user?.id;
    const client=getSupabase();
    if(!uid||!client||syncing.current)return;
    syncing.current=true;
    try {
      const queue=loadLocal<PendingFocusSession[]>(queueKey(uid),[]).slice(0,200);
      const remainingQueue:PendingFocusSession[]=[];
      for(const entry of queue){
        const {error}=await client.from('focus_sessions').insert({
          user_id:uid,client_session_id:entry.client_session_id,
          minutes:entry.minutes,completed_at:entry.completed_at,course_id:entry.course_id,
        });
        if(error && error.code!=='23505') remainingQueue.push(entry);
      }
      // Preserve sessions appended while this request was running.
      const current=loadLocal<PendingFocusSession[]>(queueKey(uid),[]);
      const processed=new Set(queue.map(x=>x.client_session_id));
      const unprocessed=current.filter(x=>!processed.has(x.client_session_id));
      const updated=[...remainingQueue,...unprocessed].slice(-200);
      saveLocal(queueKey(uid),updated);
      setPendingCount(updated.length);
      if(queue.length) setSyncStatus(updated.length
        ?(lang==='ar'?'في جلسات لم تتزامن بعد. جرّب إعادة المحاولة.':'Some sessions could not sync. Try again.')
        :(lang==='ar'?'تمت مزامنة الجلسات ✓':'Sessions synced ✓'));
    } catch {
      setSyncStatus((lang==='ar'?'تعذر الاتصال، الجلسات هتفضل في قائمة إعادة المحاولة على الجهاز.':'Offline. Sessions are queued on this device for retry.'));
    } finally {syncing.current=false;}
  },[user?.id,lang]);

  useEffect(()=>{
    const uid=user?.id;
    if(!uid){setCourses([]);setCourseId('');setPendingCount(0);setSyncStatus('');return;}
    const client=getSupabase();if(!client)return;
    let active=true;
    setPendingCount(loadLocal<PendingFocusSession[]>(queueKey(uid),[]).length);
    void syncQueued();
    void client.from('student_courses').select('id,name,code').eq('user_id',uid).order('name').limit(150)
      .then(({data})=>{if(active)setCourses((data??[]) as Course[]);});
    return ()=>{active=false;};
  },[user?.id,syncQueued]);

  function completedFocus(){
    if(completed.current)return;
    completed.current=true;
    if(duration!==25)return;
    const day=todayKey();
    setStats(prev=>{
      const base=prev.day===day?prev:{day,sessions:0,minutes:0};
      return {day,sessions:base.sessions+1,minutes:base.minutes+25};
    });
    if(user){
      const entry:PendingFocusSession={
        client_session_id:crypto.randomUUID(),minutes:25,
        completed_at:new Date().toISOString(),course_id:courseId||null,
      };
      const key=queueKey(user.id);
      const stored=loadLocal<PendingFocusSession[]>(key,[]);
      const next=[...stored,entry].slice(-200);
      saveLocal(key,next);
      setPendingCount(next.length);
      void syncQueued();
    }
  }
  useEffect(()=>{
    if(!running)return;
    const interval=window.setInterval(()=>{
      if(deadline.current===null)return;
      const left=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));
      setRemaining(left);
      if(left===0){setRunning(false);deadline.current=null;completedFocus();}
    },250);
    return ()=>clearInterval(interval);
  },[running,duration,courseId,user?.id,syncQueued]);

  function pause(){
    if(deadline.current)setRemaining(Math.max(0,Math.ceil((deadline.current-Date.now())/1000)));
    deadline.current=null;setRunning(false);
  }
  function toggle(){
    if(running){pause();return;}
    const seconds=remaining<=0?duration*60:remaining;
    if(remaining<=0)setRemaining(seconds);
    completed.current=false;
    deadline.current=Date.now()+seconds*1000;
    setRunning(true);
  }
  function change(minutes:number){setRunning(false);deadline.current=null;completed.current=false;setDuration(minutes);setRemaining(minutes*60);}
  function reset(){setRunning(false);deadline.current=null;completed.current=false;setRemaining(duration*60);}
  const display=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  const today=stats.day===todayKey()?stats:{day:todayKey(),sessions:0,minutes:0};
  return <><div className="page-hero"><div className="container"><span className="section-kicker">PRODUCTIVITY</span>
    <h1>{text('Focus Mode — وقتك أهم حاجة ⏱️','Focus Mode — Your time matters ⏱️')}</h1>
    <p>{text('استخدم مؤقت التركيز مجانًا. لو مسجل دخول، جلسات الـ25 دقيقة المكتملة تتزامن مع حسابك.', 'Use the timer for free. Sign in to sync completed 25-minute focus sessions across devices.')}</p></div></div>
    <div className="page-content"><div className="container two-col">
    <section className="panel center"><h2 className="panel-title">{text('اختار نوع الجلسة','Choose a session')}</h2>
      <div className="preset-row">{[[25,text('تركيز 25 دقيقة','Focus · 25 min')],[5,text('راحة 5 دقائق','Break · 5 min')],[15,text('راحة طويلة 15','Long break · 15')]].map(([time,label])=><button key={time} type="button" className={'preset '+(duration===time?'active':'')} onClick={()=>change(Number(time))}>{label}</button>)}</div>
      {user&&<div className="field" style={{maxWidth:320,margin:'18px auto',textAlign:'start'}}>
        <label htmlFor="focus-course">{text('المادة (اختياري)','Course (optional)')}</label>
        <select id="focus-course" className="input" value={courseId} disabled={running} onChange={e=>setCourseId(e.target.value)}>
          <option value="">{text('مذاكرة عامة','General study')}</option>
          {courses.map(course=><option key={course.id} value={course.id}>{course.code?`${course.code} — `:''}{course.name}</option>)}
        </select>
      </div>}
      <div className="timer-ring"><div><div role="timer" aria-live="off" className="timer-display compact">{display}</div><span>{duration===25?text('جلسة تركيز','Focus session'):text('وقت الراحة','Break time')}</span></div></div>
      <div className="actions" style={{justifyContent:'center'}}><button type="button" className="btn btn-primary" onClick={toggle}>{running?text('إيقاف مؤقت','Pause'):text('ابدأ الجلسة','Start session')}</button><button type="button" className="btn btn-outline" onClick={reset}>{text('إعادة ضبط','Reset')}</button></div>
      <p className="inline-help">{text('الجلسة المكتملة فقط بتتحسب. إغلاق الصفحة قبل نهايتها بيوقف التسجيل.','Only completed sessions count. Closing the tab before the end stops recording.')}</p>
    </section>
    <aside className="panel"><h2 className="panel-title">{text('إنجازاتك اليوم','Today’s progress')}</h2>
      <p className="panel-description">{text('العداد ده محلي للجهاز؛ سجل حسابك لعرض نشاطك المتزامن.','These are device-local totals. Sign in for synced activity.')}</p>
      <div className="metric-row"><div className="metric-card"><strong>{today.sessions}</strong><span>{text('جلسات مكتملة','Completed sessions')}</span></div><div className="metric-card"><strong>{today.minutes}</strong><span>{text('دقائق تركيز','Focus minutes')}</span></div></div>
      {user?<>
        <div className="actions"><Link to="/study-stats" className="btn btn-soft">{text('إحصائيات حسابي','My study insights')}</Link></div>
        {pendingCount>0&&<div className="note warn" role="status">{text(`${pendingCount} جلسة في انتظار المزامنة`,`${pendingCount} session(s) awaiting sync`)} <button className="small-btn" type="button" onClick={()=>void syncQueued()}>{text('إعادة المحاولة','Retry')}</button></div>}
        {syncStatus&&<p className="inline-help" role="status">{syncStatus}</p>}
      </>:<div className="actions"><Link to="/auth" className="btn btn-outline">{text('سجّل لحفظ تقدمك','Sign in to save progress')}</Link></div>}
      <div className="note" style={{marginTop:18}}>{text('💡 جرّب 25 دقيقة تركيز + 5 دقائق راحة. عدّل المواعيد حسب ظروفك.','💡 Try 25 minutes of focus followed by a 5-minute break.')}</div>
    </aside></div></div></>;
}
