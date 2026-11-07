import { useEffect, useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';

type RequestRow = {
  id:string;
  user_id:string;
  category:'support'|'data_export'|'account_deletion';
  details:string;
  status:'new'|'in_review'|'resolved'|'declined';
  created_at:string;
};
const statusOptions = ['new','in_review','resolved','declined'] as const;

/** Only mount inside AdminContent after checking membership in app_admins. DB RLS is authoritative. */
export default function AccountRequestsAdmin(){
  const {text}=useLocale();
  const [items,setItems]=useState<RequestRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  async function load(){
    const client=getSupabase(); if(!client)return;
    const {data,error}=await client.from('account_requests')
      .select('id,user_id,category,details,status,created_at').order('created_at',{ascending:false}).limit(100);
    if(error)setMessage(text('تعذر تحميل طلبات الحساب. تأكد من SQL 007 وصلاحيات الإدارة.','Could not load account requests. Check SQL 007 and administrator permissions.'));
    else{setItems((data??[]) as RequestRow[]);setMessage('');}
    setLoading(false);
  }
  useEffect(()=>{void load();},[]);
  async function setStatus(id:string,status:RequestRow['status']){
    const client=getSupabase();if(!client||busy)return;
    setBusy(id);setMessage('');
    const {data,error}=await client.from('account_requests').update({status}).eq('id',id)
      .select('id,status').single();
    if(error||!data)setMessage(text('تعذّر تحديث الحالة.','Could not update request status.'));
    else setItems(old=>old.map(r=>r.id===id?{...r,status}:r));
    setBusy(null);
  }
  const labels={
    support:text('دعم فني','Support'),data_export:text('نسخة بيانات','Data access'),
    account_deletion:text('طلب حذف الحساب','Account deletion'),
  };
  return <section className="panel"><div className="planner-head"><div><h2 className="panel-title">{text('طلبات الحساب والخصوصية','Account & privacy requests')}</h2>
    <p className="panel-description">{text('التغيير هنا يحدّث حالة الطلب فقط؛ لا يحذف حسابات Supabase ولا يصدّر بيانات تلقائيًا.','Updating a request status does not delete Supabase accounts or export data automatically.')}</p></div>
    <button type="button" className="small-btn" onClick={()=>void load()}>{text('تحديث','Refresh')}</button></div>
    {message&&<div role="alert" className="note warn">{message}</div>}
    {loading?<p className="inline-help">{text('جاري التحميل...','Loading...')}</p>:!items.length?<p className="placeholder">{text('لا توجد طلبات حاليًا.','No account requests yet.')}</p>
      :<div className="stack">{items.map(item=><article className="admin-request" key={item.id}>
        <div className="toolbar"><strong>{labels[item.category]}</strong><span className="tag">{item.status}</span></div>
        <p dir="auto">{item.details||text('لم يُضف تفاصيل','No details supplied')}</p>
        <small>{new Date(item.created_at).toLocaleString()} · {text('معرّف المستخدم','User ID')}:</small>
        <code className="account-user-id" dir="ltr">{item.user_id}</code>
        <div className="field"><label htmlFor={`account-status-${item.id}`}>{text('الحالة','Status')}</label>
          <select id={`account-status-${item.id}`} className="input" disabled={busy!==null} value={item.status} onChange={e=>void setStatus(item.id,e.target.value as RequestRow['status'])}>
            {statusOptions.map(s=><option value={s} key={s}>{s}</option>)}
          </select></div>
      </article>)}</div>}
    <p className="inline-help">{text('قبل تحديد «تمت المعالجة»، نفّذ الإجراء يدويًا وتحقق من ملكية الحساب. ابحث عن معرّف المستخدم في Supabase Authentication. عرض أحدث 100 طلب فقط.','Before marking “resolved”, carry out the action manually and verify account ownership. Look up the user ID in Supabase Authentication. Showing the latest 100 requests only.')}</p>
  </section>;
}
