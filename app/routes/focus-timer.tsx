import { publicSeoMeta } from '@/lib/seo';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';
import { getSupabase } from '@/lib/supabase';
import { loadLocal, saveLocal, storageKeys, todayKey } from '@/lib/storage';
import type { PendingFocusSession } from '@/lib/focus';
import {
  DEFAULT_FOCUS_SETTINGS, FOCUS_SETTING_FIELDS, FOCUS_SETTING_LIMITS,
  normalizeFocusSettings, parseFocusSettings, focusModeMinutes, recommendedBreak,
  type FocusMode, type FocusSettings,
} from '@/lib/focus-settings';

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
  const [settings,setSettings] = useState<FocusSettings>({...DEFAULT_FOCUS_SETTINGS});
  const [draft,setDraft] = useState<Record<keyof FocusSettings,string>>({
    focusMinutes:'25',shortBreakMinutes:'5',longBreakMinutes:'15',longBreakEvery:'4',
  });
  const [mode,setMode] = useState<FocusMode>('focus');
  const [settingsNotice,setSettingsNotice] = useState('');
  const [completionNote,setCompletionNote] = useState('');
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
    if(saved && typeof saved==='object' && saved.day === todayKey() && Number.isInteger(saved.sessions) && saved.sessions>=0 && saved.sessions<=1000 && Number.isFinite(saved.minutes) && saved.minutes>=0 && saved.minutes<=180000) setStats(saved);
    const savedSettings=normalizeFocusSettings(loadLocal<unknown>(storageKeys.focusSettings, DEFAULT_FOCUS_SETTINGS));
    setSettings(savedSettings);
    setDraft({
      focusMinutes:String(savedSettings.focusMinutes),
      shortBreakMinutes:String(savedSettings.shortBreakMinutes),
      longBreakMinutes:String(savedSettings.longBreakMinutes),
      longBreakEvery:String(savedSettings.longBreakEvery),
    });
    setDuration(savedSettings.focusMinutes);
    setRemaining(savedSettings.focusMinutes*60);
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
    if(mode!=='focus'){
      setCompletionNote(text('انتهت الاستراحة. جاهز لجلسة تركيز جديدة؟','Break complete. Ready for your next focus session?'));
      return;
    }
    const day=todayKey();
    const nextSessions=(stats.day===day?stats.sessions:0)+1;
    const nextBreak=recommendedBreak(nextSessions,settings);
    setCompletionNote(nextBreak==='longBreak'
      ?text('جلسة تركيز مكتملة! يُنصح باستراحة طويلة الآن.','Focus session complete! Consider a long break.')
      :text('جلسة تركيز مكتملة! يُنصح باستراحة قصيرة.','Focus session complete! Consider a short break.'));
    setStats(prev=>{
      const base=prev.day===day?prev:{day,sessions:0,minutes:0};
      return {day,sessions:base.sessions+1,minutes:base.minutes+duration};
    });
    if(user){
      const entry:PendingFocusSession={
        client_session_id:crypto.randomUUID(),minutes:duration,
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
  },[running,duration,mode,courseId,user?.id,syncQueued]);

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
  function change(nextMode:FocusMode){
    if(running)return;
    deadline.current=null;
    completed.current=false;
    setMode(nextMode);
    const minutes=focusModeMinutes(settings,nextMode);
    setDuration(minutes);
    setRemaining(minutes*60);
    setCompletionNote('');
  }
  function saveSettings(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(running)return;
    const next=parseFocusSettings(draft);
    if(!next){
      setSettingsNotice(text('أدخل أرقامًا صحيحة ضمن الحدود الموضحة لكل إعداد.','Enter whole numbers within the limits for each setting.'));
      return;
    }
    setSettings(next);
    saveLocal(storageKeys.focusSettings,next);
    const minutes=focusModeMinutes(next,mode);
    deadline.current=null;
    completed.current=false;
    setDuration(minutes);
    setRemaining(minutes*60);
    setCompletionNote('');
    setSettingsNotice(text('تم حفظ الإعدادات وتحديث المؤقت.','Preferences saved and timer reset.'));
  }
  function reset(){setRunning(false);deadline.current=null;completed.current=false;setRemaining(duration*60);setCompletionNote('');}
  const display=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  const today=stats.day===todayKey()?stats:{day:todayKey(),sessions:0,minutes:0};
  return <><div className="page-hero"><div className="container"><span className="section-kicker">PRODUCTIVITY</span>
    <h1>{text('Focus Mode — وقتك أهم حاجة ⏱️','Focus Mode — Your time matters ⏱️')}</h1>
    <p>{text('حدّد مدة التركيز والاستراحات بالشكل المناسب ليومك. جلسات التركيز المكتملة تتزامن مع حسابك بعد تسجيل الدخول.', 'Choose your focus and break lengths. Completed focus sessions sync when you sign in.')}</p></div></div>
    <div className="page-content"><div className="container two-col">
    <section className="panel center"><h2 className="panel-title">{text('اختار نوع الجلسة','Choose a session')}</h2>
      <div className="preset-row">{([
        ['focus',text('تركيز','Focus')],
        ['shortBreak',text('راحة قصيرة','Short break')],
        ['longBreak',text('راحة طويلة','Long break')],
      ] as const).map(([item,label])=><button key={item} type="button"
        aria-pressed={mode===item} disabled={!loaded||running}
        className={'preset '+(mode===item?'active':'')} onClick={()=>change(item)}>
        {label} · {focusModeMinutes(settings,item)} {text('دقيقة','min')}
      </button>)}</div>
      {user&&<div className="field" style={{maxWidth:320,margin:'18px auto',textAlign:'start'}}>
        <label htmlFor="focus-course">{text('المادة (اختياري)','Course (optional)')}</label>
        <select id="focus-course" className="input" value={courseId} disabled={running} onChange={e=>setCourseId(e.target.value)}>
          <option value="">{text('مذاكرة عامة','General study')}</option>
          {courses.map(course=><option key={course.id} value={course.id}>{course.code?`${course.code} — `:''}{course.name}</option>)}
        </select>
      </div>}
      <div className="timer-ring"><div><div role="timer" aria-live="off" className="timer-display compact">{display}</div><span>{mode==='focus'?text('جلسة تركيز','Focus session'):text('وقت الراحة','Break time')}</span></div></div>
      <div className="actions" style={{justifyContent:'center'}}><button type="button" className="btn btn-primary" disabled={!loaded} onClick={toggle}>{running?text('إيقاف مؤقت','Pause'):text('ابدأ الجلسة','Start session')}</button><button type="button" className="btn btn-outline" onClick={reset}>{text('إعادة ضبط','Reset')}</button></div>
      {completionNote&&<p className="note" role="status">{completionNote}</p>}
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
      <form className="focus-settings stack" onSubmit={saveSettings}>
        <h3 className="panel-title">{text('تخصيص المؤقت','Customize your timer')}</h3>
        <div className="focus-settings-grid">
          {FOCUS_SETTING_FIELDS.map(key=>{
            const label=key==='focusMinutes'?text('دقائق التركيز','Focus minutes')
              :key==='shortBreakMinutes'?text('الراحة القصيرة','Short break')
              :key==='longBreakMinutes'?text('الراحة الطويلة','Long break')
              :text('اقترح راحة طويلة كل عدد جلسات','Long-break reminder every N sessions');
            return <div className="field" key={key}>
              <label htmlFor={'focus-setting-'+key}>{label}</label>
              <input type="number" className="input" id={'focus-setting-'+key}
                min={FOCUS_SETTING_LIMITS[key].min} max={FOCUS_SETTING_LIMITS[key].max}
                step={1} required disabled={!loaded||running}
                value={draft[key]}
                onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}/>
              <small className="inline-help">{FOCUS_SETTING_LIMITS[key].min}–{FOCUS_SETTING_LIMITS[key].max}</small>
            </div>;
          })}
        </div>
        <button type="submit" className="btn btn-primary" disabled={!loaded||running}>{text('حفظ الإعدادات','Save preferences')}</button>
        {settingsNotice&&<p className="inline-help" role="status">{settingsNotice}</p>}
        <p className="inline-help">{text('الإعدادات محفوظة على الجهاز. حفظ تعديل جديد يعيد ضبط الجلسة الحالية، والاستراحات لا تدخل في ساعات المذاكرة.', 'Settings stay on this device. Saving changes resets the current timer; breaks do not count as study time.')}</p>
      </form>
    </aside></div>
    <div className="container" style={{marginTop:24}}>
      <section className="panel stack focus-method-guide" aria-labelledby="focus-method-heading">
        <h2 id="focus-method-heading">{text('كيف تختار مدة تركيز مناسبة؟', 'How to choose an effective focus interval')}</h2>
        <p>{text('جلسة الـ25 دقيقة مجرد نقطة بداية، مش قانون لكل المواد. لو بتراجع تعريفات أو بطاقات سريعة جرّب 20 دقيقة، ولو بتحل مسألة برمجة طويلة جرّب 40 دقيقة. راقب عدد المهام اللي خلصتها والأخطاء اللي صححتها، مش عدد الدقائق لوحده.', 'A 25-minute session is a starting point, not a universal rule. Try 20 minutes for short recall exercises or 40 minutes for a difficult programming problem. Evaluate the tasks completed and mistakes corrected rather than treating time alone as proof of learning.')}</p>
        <h3>{text('مثال عملي: مذاكرة لمدة 110 دقائق', 'Worked example: a 110-minute study block')}</h3>
        <p>{text('ابدأ بـ40 دقيقة لحل 3 مسائل بدون فتح الحلول. خد استراحة 10 دقائق بعيد عن الشاشة. ارجع 40 دقيقة لتصحيح أخطاء المسائل وإعادة حلها، وبعدين خصص 20 دقيقة لكتابة أسئلة مراجعة. كده عندك 100 دقيقة عمل مخطط و10 دقائق راحة؛ ومش لازم كل طالب يمشي على نفس التقسيم.', 'Start with 40 minutes solving three problems without opening the answers. Take a 10-minute break away from the screen. Spend 40 more minutes checking and retrying mistakes, followed by 20 minutes writing recall questions. That is 100 minutes of planned work and ten minutes of rest; adjust the split to the task and your own circumstances.')}</p>
        <h3>{text('إزاي تستخدم النتائج بدون ما تخدع نفسك؟', 'How to interpret your focus totals')}</h3>
        <p>{text('الأداة تسجّل جلسة التركيز عند اكتمالها فقط، والاستراحات لا تزود وقت المذاكرة. لو قفلت التبويب قبل نهاية الجلسة مش هتتحسب مكتملة. عند تسجيل الدخول يمكن مزامنة الجلسات المكتملة، لكن إعدادات المؤقت نفسها محلية على الجهاز.', 'Only finished focus sessions count toward local study totals; breaks do not. Closing the browser tab before completion means that session is not recorded as finished. After signing in, completed sessions can sync, but timer preferences remain local to this device.')}</p>
        <p>{text('في نهاية اليوم اسأل نفسك: هل أقدر أحل سؤال جديد بدون ملاحظات؟ لو لأ، ممكن تحتاج تعديل صعوبة المهمة أو طريقة المراجعة بدلاً من إطالة المؤقت.', 'At the end of a session, ask whether you can solve a fresh question without notes. If not, change the task or review method instead of simply extending the timer.')}</p>
        <div className="actions"><Link className="btn btn-soft" to="/guides/pomodoro-study-timer">{text('اقرأ دليل بومودورو', 'Read the Pomodoro guide')}</Link><Link className="btn btn-outline" to="/guides/seven-day-exam-revision-plan">{text('خطة أسبوع قبل الامتحان', 'Seven-day revision plan')}</Link></div>
      </section>
    </div></div></>;
}
