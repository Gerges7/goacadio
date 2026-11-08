import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import { summarizeQuizAttempts, type QuizAttempt } from '@/lib/quiz-history';

export default function QuizSummary({userId}:{userId:string}) {
  const {text} = useLocale();
  const [items,setItems]=useState<QuizAttempt[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);
  useEffect(()=>{
    const client=getSupabase(); if(!client){setLoading(false);return;}
    let live=true;
    void Promise.resolve(client.from('quiz_attempts')
      .select('id,course_id,title,question_count,correct_count,quiz_format,source_type,created_at')
      .eq('user_id',userId).order('created_at',{ascending:false}).limit(50))
      .then(({data,error:err})=>{
        if(!live)return;
        setLoading(false);setError(!!err);
        if(!err)setItems((data??[]) as QuizAttempt[]);
      }).catch(()=>{if(live){setLoading(false);setError(true);}});
    return ()=>{live=false;};
  },[userId]);
  const s=useMemo(()=>summarizeQuizAttempts(items),[items]);
  return <section className="panel">
    <h2 className="panel-title">{text('نتائج الاختبارات','Quiz progress')}</h2>
    <p className="panel-description">{text('آخر 50 اختبار محفوظ في حسابك','Your 50 most recent saved quiz results')}</p>
    {loading?<p className="inline-help">{text('جاري تحميل النتائج...','Loading results...')}</p>
      :error?<p className="note warn">{text('سجل الاختبارات غير متاح. شغّل SQL 006 في Supabase.','Quiz history unavailable. Apply SQL migration 006.')}</p>
      :<>
        <div className="metric-row">
          <div className="metric-card"><strong>{s.totalAttempts}</strong><span>{text('اختبارات محفوظة','Saved quizzes')}</span></div>
          <div className="metric-card"><strong>{s.totalAttempts?s.accuracy+'%':'—'}</strong><span>{text('نسبة الإجابات الصحيحة','Correct answers')}</span></div>
        </div>
        {!s.totalAttempts&&<p className="inline-help">{text('بعد ما تصحّح أي اختبار، اضغط «احفظ النتيجة» عشان تظهر هنا.','After grading a quiz, choose Save result to track it here.')}</p>}
      </>}
    <div className="actions"><Link className="btn btn-soft" to="/quiz-history">{text('عرض سجل الاختبارات','View quiz history')}</Link><Link className="btn btn-outline" to="/revision">{text('خطة المراجعة','Revision plan')}</Link></div>
  </section>;
}
