import { publicSeoMeta } from '@/lib/seo';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';
import { getSupabase } from '@/lib/supabase';

export const meta: MetaFunction = () => publicSeoMeta(
  'Academic Tutoring & Code Review | GoAcadio',
  'Request academic tutoring, code review, and graduation project mentoring. Students stay responsible for their own work.',
  '/services',
);
type StudentRequest = {id:string;service_type:string;subject:string;status:string;created_at:string};
export default function Services(){
  const {text}=useLocale();
  const {user,configured}=useAuth();
  const [kind,setKind]=useState('Course tutoring');
  const [subject,setSubject]=useState('');
  const [details,setDetails]=useState('');
  const [copied,setCopied]=useState(false);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  const [requests,setRequests]=useState<StudentRequest[]>([]);
  useEffect(()=>{
    const client=getSupabase();if(!client||!user)return;
    let active=true;
    void client.from('service_requests').select('id,service_type,subject,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(30).then(({data})=>{if(active)setRequests((data??[]) as StudentRequest[]);});
    return ()=>{active=false;};
  },[user?.id]);
  const message=`GoAcadio Academic Help Request\nType: ${kind}\nSubject: ${subject}\nDetails: ${details}\n`;
  async function copy(){
    if(!subject.trim()||!details.trim())return;
    try {await navigator.clipboard.writeText(message);setCopied(true);} catch {setFeedback(text('النسخ غير متاح في المتصفح ده.', 'Clipboard unavailable in this browser.'));}
  }
  async function submit(e:FormEvent){
    e.preventDefault();const client=getSupabase();if(!client||!user)return;
    if(subject.trim().length<2||details.trim().length<10){setFeedback(text('اكتب عنوان ووصف واضحين للطلب.', 'Please enter a clear title and description.'));return;}
    setBusy(true);setFeedback('');
    const {data,error}=await client.from('service_requests').insert({user_id:user.id,service_type:kind,subject:subject.trim().slice(0,160),description:details.trim().slice(0,4000)}).select('id,service_type,subject,status,created_at').single();
    if(error)setFeedback(error.message);
    else{if(data)setRequests(old=>[data as StudentRequest,...old]);setSubject('');setDetails('');setFeedback(text('تم تسجيل الطلب. ده طلب مبدئي مش حجز أو دفع.', 'Request received. This is an inquiry, not a booking or payment.'));}
    setBusy(false);
  }
  return <><div className="page-hero"><div className="container"><span className="section-kicker">EXPERT HELP</span><h1>{text('مساعدة أكاديمية متخصصة 🤝','Academic help when you need it 🤝')}</h1><p>{text('جلسات شرح ومراجعة أكواد وإرشاد مشاريع. اطلب المساعدة واحصل على متابعة حسب توفر الخدمة.', 'Tutoring, code reviews and project mentoring. Send an inquiry for individual guidance.')}</p></div></div>
    <div className="page-content"><div className="container two-col"><section className="panel"><h2 className="panel-title">{text('اطلب مساعدة','Request academic help')}</h2>
      <form className="stack" onSubmit={e=>void submit(e)}><div className="field"><label>{text('نوع المساعدة','Type of help')}</label><select className="input" value={kind} onChange={e=>setKind(e.target.value)}><option>Course tutoring</option><option>Code review & debugging</option><option>Graduation project mentoring</option><option>Study plan consultation</option></select></div>
        <div className="field"><label>{text('المادة أو الموضوع','Course or topic')}</label><input className="input" required maxLength={160} minLength={2} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Data Structures"/></div>
        <div className="field"><label>{text('اشرح المطلوب','Describe what you need')}</label><textarea className="input" required minLength={10} maxLength={4000} rows={6} value={details} onChange={e=>{setDetails(e.target.value);setCopied(false);}} placeholder={text('محتاج أفهم ... أو أراجع الكود علشان ...', 'I would like help with ...')}/></div>
        {feedback&&<div className="note" role="status">{feedback}</div>}
        <div className="actions">
          {configured&&user ? <button disabled={busy||subject.trim().length<2||details.trim().length<10} type="submit" className="btn btn-primary">{busy?text('جاري الإرسال...', 'Submitting...'):text('إرسال الطلب','Send inquiry')}</button> : <>
            <button type="button" className="btn btn-primary" disabled={!subject.trim()||!details.trim()} onClick={()=>void copy()}>{copied?text('تم النسخ ✓','Copied ✓'):text('نسخ وصف الطلب','Copy inquiry')}</button>
            {configured&&<Link className="btn btn-outline" to="/auth">{text('سجل لإرسال الطلب','Sign in to submit')}</Link>}
          </>}
        </div>
        {!configured&&<div className="note warn">{text('الإرسال أونلاين لسه غير مفعّل. تقدر تنسخ الوصف فقط.', 'Online submission is not connected. You can copy the description for now.')}</div>}
      </form>
      {user&&requests.length>0&&<div className="stack" style={{marginTop:24}}><h3>{text('طلباتي السابقة','My inquiries')}</h3>{requests.map(r=><div key={r.id} className="course-item"><div><b>{r.subject}</b><small>{r.service_type} · {new Date(r.created_at).toLocaleDateString()}</small></div><span className="tag">{r.status}</span></div>)}</div>}
    </section>
    <aside className="panel"><h2 className="panel-title">{text('بماذا نقدر نساعدك؟','How we can help')}</h2><div className="stack"><div>✅ {text('شرح وتوجيه خطوة بخطوة','Guided tutoring')}</div><div>✅ {text('مراجعة كود وإصلاح الأخطاء مع شرح','Code review with explanations')}</div><div>✅ {text('إرشاد لمشاريع التخرج','Graduation project mentoring')}</div><div>✅ {text('خطة تعلم حسب احتياجك','Personal study guidance')}</div></div>
      <div className="note" style={{marginTop:20}}>{text('بنساعدك تفهم المادة وتطوّر مشروعك خطوة بخطوة.', 'Get tailored guidance to learn and improve your project step by step.')}</div>
      <div className="note" style={{marginTop:12}}>{text('إرسال الطلب لا يعني حجز جلسة. لا يوجد دفع إلكتروني داخل الموقع حاليًا.', 'Submitting an inquiry does not guarantee a booking. Payments are not processed by this website yet.')}</div>
    </aside></div></div></>;
}
