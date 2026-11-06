import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { summarizeFocus, type FocusSession } from '@/lib/focus';

export default function FocusSummary({userId}:{userId:string}) {
  const {text} = useLocale();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = getSupabase(); if (!client) return;
    let active = true;
    const start = new Date();
    start.setHours(0,0,0,0);
    start.setDate(start.getDate()-6);
    void client.from('focus_sessions')
      .select('id,minutes,completed_at,course_id')
      .eq('user_id',userId).gte('completed_at',start.toISOString())
      .order('completed_at',{ascending:false}).limit(1000)
      .then(({data,error:err}) => {
        if(!active)return;
        setError(!!err);
        if(!err)setSessions((data??[]) as FocusSession[]);
        setLoading(false);
      }).catch(() => {if(active){setError(true);setLoading(false);}});
    return () => {active=false;};
  },[userId]);
  const stats = useMemo(() => summarizeFocus(sessions,7), [sessions]);
  return <section className="panel">
    <h2 className="panel-title">{text('نشاط المذاكرة','Study activity')}</h2>
    <p className="panel-description">{text('آخر 7 أيام — الجلسات المتزامنة مع حسابك','Last 7 days — sessions synced to your account')}</p>
    {loading?<p className="inline-help">{text('جاري تحميل النشاط...','Loading activity...')}</p>
      :error?<div className="note warn">{text('بيانات النشاط مش متاحة. تأكد من تطبيق SQL 004.','Activity is unavailable. Check that SQL migration 004 has been applied.')}</div>
      :<>
        <div className="metric-row">
          <div className="metric-card"><strong>{stats.totalMinutes}</strong><span>{text('دقيقة تركيز','Focus minutes')}</span></div>
          <div className="metric-card"><strong>{stats.totalSessions}</strong><span>{text('جلسة مكتملة','Completed sessions')}</span></div>
        </div>
        <div className="focus-bars compact" aria-label={text('نشاط الأسبوع','Weekly activity')}>
          {stats.chart.map(({day,minutes})=><div className="focus-bar-col" key={day} title={`${day}: ${minutes} min`}><div className="focus-bar-track"><div className="focus-bar-fill" style={{height:`${Math.min(100,minutes/Math.max(25,...stats.chart.map(x=>x.minutes))*100)}%`}}/></div><small>{day.slice(-2)}</small></div>)}
        </div>
      </>}
    <div className="actions"><Link className="btn btn-soft" to="/study-stats">{text('تفاصيل المذاكرة','View study insights')}</Link><Link className="btn btn-outline" to="/tools/focus-timer">{text('ابدأ تركيز','Start focusing')}</Link></div>
  </section>;
}
