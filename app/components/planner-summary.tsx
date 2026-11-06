import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { localToday, plannerStats, type StudyItem } from '@/lib/planner';

export default function PlannerSummary({userId}:{userId:string}){
  const {text}=useLocale();
  const [items,setItems]=useState<StudyItem[]>([]);
  const [today,setToday]=useState('');
  const [error,setError]=useState(false);
  useEffect(()=>{setToday(localToday());},[]);
  useEffect(()=>{
    const client=getSupabase();if(!client)return;
    let active=true;
    void client.from('study_items')
      .select('id,user_id,course_id,kind,title,notes,due_date,due_time,priority,is_done,created_at')
      .eq('user_id',userId).eq('is_done',false).order('due_date',{ascending:true,nullsFirst:false}).limit(500)
      .then(({data,error:queryError})=>{
        if(!active)return;
        if(queryError)setError(true);
        else {setItems((data??[]) as StudyItem[]);setError(false);}
      });
    return ()=>{active=false;};
  },[userId]);
  const next=useMemo(()=>items.filter(i=>i.due_date!==null&&(!today||i.due_date>=today)).slice(0,3),[items,today]);
  const stats=useMemo(()=>plannerStats(items,today),[items,today]);
  return <section className="panel"><h2 className="panel-title">{text('المذاكرة والامتحانات','Study plan & exams')}</h2>
    {error?<p className="inline-help">{text('فعّل إعداد المهام أولًا من لوحة الإدارة التقنية.','Planner setup has not been completed.')}</p>:<>
      <p className="panel-description">{text(`${stats.nextWeek} مواعيد خلال 7 أيام`,`${stats.nextWeek} items in the next 7 days`)}</p>
      {next.length?next.map(x=><div key={x.id} className="course-item"><span>{x.kind==='exam'?'📝':'📌'}</span><div><b>{x.title}</b><small>{x.due_date} {x.due_time?.slice(0,5)??''}</small></div></div>):<p className="inline-help">{text('مفيش مواعيد قريبة مسجلة.','No upcoming deadlines recorded.')}</p>}
    </>}
    <div className="actions"><Link className="btn btn-soft" to="/planner">{text('فتح خطة المذاكرة','Open planner')}</Link></div>
  </section>;
}
