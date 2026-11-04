import { useEffect, useState, type FormEvent } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';

export const meta: MetaFunction = () => [
  { title: 'Administration | GoAcadio' },
  { name: 'robots', content: 'noindex, nofollow' },
];

type Country = { code:string; name_en:string };
type Uni = { id:string; country_code:string; name_en:string; name_ar:string|null; is_published:boolean };
type Faculty = { id:string; university_id:string; name_en:string; name_ar:string|null; is_published:boolean };
type Program = { id:string; faculty_id:string; name_en:string; name_ar:string|null; is_published:boolean };
type Request = { id:string; service_type:string; subject:string; description:string; status:string; created_at:string };
type EntityKind = 'universities' | 'faculties' | 'programs';
const statuses=['new','quoted','accepted','in_progress','done','cancelled'];

export default function Admin() {
  const {user,loading,configured}=useAuth();
  const {text}=useLocale();
  const [checked,setChecked]=useState(false);
  const [allowed,setAllowed]=useState(false);
  useEffect(()=>{
    if(!user){setChecked(true);setAllowed(false);return;}
    let active=true;setChecked(false);
    void getSupabase()?.from('app_admins').select('user_id').eq('user_id',user.id).maybeSingle().then(({data,error})=>{
      if(active){setAllowed(Boolean(data&&!error));setChecked(true);}
    });
    return()=>{active=false;};
  },[user?.id]);
  if(!configured)return <div className="page-content"><div className="container"><div className="panel">{text('لوحة الإدارة غير مفعّلة حتى يتم ربط قاعدة البيانات.', 'Admin requires a connected database.')}</div></div></div>;
  if(loading||!checked)return <div className="page-content"><div className="container"><div className="panel">{text('جاري التحقق من الصلاحيات...', 'Checking permissions...')}</div></div></div>;
  if(!user)return <div className="page-content"><div className="container"><div className="panel"><h1>{text('سجّل الدخول أولًا', 'Sign in first')}</h1><Link to="/auth" className="btn btn-primary">{text('تسجيل الدخول','Sign in')}</Link></div></div></div>;
  if(!allowed)return <div className="page-content"><div className="container"><div className="panel"><h1>403</h1><p>{text('الحساب ده مش عنده صلاحية إدارة.', 'This account does not have administrator privileges.')}</p></div></div></div>;
  return <AdminContent/>;
}
function AdminContent(){
  const {text}=useLocale();
  const [tab,setTab]=useState<EntityKind>('universities');
  const [countries,setCountries]=useState<Country[]>([]);
  const [unis,setUnis]=useState<Uni[]>([]);
  const [faculties,setFaculties]=useState<Faculty[]>([]);
  const [programs,setPrograms]=useState<Program[]>([]);
  const [requests,setRequests]=useState<Request[]>([]);
  const [parentId,setParentId]=useState('');
  const [nameEn,setNameEn]=useState('');
  const [nameAr,setNameAr]=useState('');
  const [publish,setPublish]=useState(false);
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  async function refresh(){
    const client=getSupabase();if(!client)return;
    const [a,b,c,d,e]=await Promise.all([
      client.from('countries').select('code,name_en').order('name_en'),
      client.from('universities').select('id,country_code,name_en,name_ar,is_published').order('name_en'),
      client.from('faculties').select('id,university_id,name_en,name_ar,is_published').order('name_en'),
      client.from('programs').select('id,faculty_id,name_en,name_ar,is_published').order('name_en'),
      client.from('service_requests').select('id,service_type,subject,description,status,created_at').order('created_at',{ascending:false}).limit(100),
    ]);
    setCountries((a.data??[]) as Country[]);setUnis((b.data??[]) as Uni[]);setFaculties((c.data??[]) as Faculty[]);setPrograms((d.data??[]) as Program[]);setRequests((e.data??[]) as Request[]);
    const err=[a.error,b.error,c.error,d.error,e.error].find(Boolean);
    if(err)setStatus(err.message);
  }
  useEffect(()=>{void refresh();},[]);
  function changeTab(next:EntityKind){setTab(next);setParentId('');setNameEn('');setNameAr('');setPublish(false);setStatus('');}
  const parentOptions=tab==='universities'?countries.map(x=>({id:x.code,label:x.name_en})):tab==='faculties'?unis.map(x=>({id:x.id,label:x.name_en})):faculties.map(x=>({id:x.id,label:x.name_en}));
  const parentField=tab==='universities'?'country_code':tab==='faculties'?'university_id':'faculty_id';
  const rows=tab==='universities'?unis:tab==='faculties'?faculties:programs;
  async function add(e:FormEvent){
    e.preventDefault(); const client=getSupabase();if(!client||!parentId||!nameEn.trim())return;
    setBusy(true);setStatus('');
    const payload={ [parentField]: parentId, name_en:nameEn.trim().slice(0,160), name_ar:nameAr.trim().slice(0,160)||null, is_published:publish };
    const {error}=await client.from(tab).insert(payload);
    setStatus(error?error.message:text('تمت الإضافة ✓','Added successfully ✓'));
    if(!error){setNameEn('');setNameAr('');setPublish(false);await refresh();}
    setBusy(false);
  }
  async function togglePublished(id:string,value:boolean){
    const client=getSupabase();if(!client)return;
    const {error}=await client.from(tab).update({is_published:!value}).eq('id',id);
    if(error)setStatus(error.message);else{setStatus('');await refresh();}
  }
  async function updateRequest(id:string,newStatus:string){
    const client=getSupabase();if(!client)return;
    const {error}=await client.from('service_requests').update({status:newStatus}).eq('id',id);
    if(error)setStatus(error.message);else setRequests(rs=>rs.map(r=>r.id===id?{...r,status:newStatus}:r));
  }
  return <><div className="page-hero"><div className="container"><span className="section-kicker">ADMIN CONSOLE</span><h1>{text('إدارة GoAcadio', 'GoAcadio administration')}</h1><p>{text('إضافة الجامعات والكليات والبرامج ومتابعة طلبات المساعدة. هذه الصفحة متاحة للحسابات الإدارية فقط.', 'Manage the catalog and student support requests. Server database policies enforce administrator access.')}</p></div></div>
    <div className="page-content"><div className="container stack">
      {status&&<div className="note" role="status">{status}</div>}
      <div className="dash-summary"><div className="metric-card"><strong>{unis.length}</strong><span>{text('جامعات','Universities')}</span></div><div className="metric-card"><strong>{faculties.length}</strong><span>{text('كليات','Faculties')}</span></div><div className="metric-card"><strong>{requests.filter(r=>r.status==='new').length}</strong><span>{text('طلبات جديدة','New requests')}</span></div></div>
      <section className="panel"><h2 className="panel-title">{text('دليل الجامعات','Academic catalog')}</h2><div className="actions">
        {([['universities',text('الجامعات','Universities')],['faculties',text('الكليات','Faculties')],['programs',text('البرامج','Programs')]] as const).map(([key,label])=><button type="button" key={key} className={'small-btn '+(tab===key?'active-tab':'')} onClick={()=>changeTab(key)}>{label}</button>)}
      </div><form onSubmit={e=>void add(e)} className="stack" style={{marginTop:20}}><div className="form-grid">
        <div className="field"><label>{text('التبعية','Parent')}</label><select className="input" required value={parentId} onChange={e=>setParentId(e.target.value)}><option value="">{text('اختار','Select')}</option>{parentOptions.map(x=><option value={x.id} key={x.id}>{x.label}</option>)}</select></div>
        <div className="field"><label>{text('الاسم بالإنجليزي','English name')}</label><input className="input" maxLength={160} required value={nameEn} onChange={e=>setNameEn(e.target.value)}/></div>
        <div className="field"><label>{text('الاسم بالعربي','Arabic name')}</label><input className="input" maxLength={160} value={nameAr} onChange={e=>setNameAr(e.target.value)}/></div>
        <label className="field admin-check"><input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)}/>{text('انشرها للطلاب (بعد مراجعة دقة الاسم)','Publish to students (after verification)')}</label>
      </div><div className="actions"><button className="btn btn-primary" disabled={busy||!parentId||!nameEn.trim()} type="submit">{text('إضافة','Add record')}</button></div></form>
        <div className="admin-table"><table><thead><tr><th>{text('الاسم','Name')}</th><th>{text('الحالة','Visibility')}</th><th>{text('إجراء','Action')}</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><b>{x.name_en}</b><small>{x.name_ar}</small></td><td>{x.is_published?text('منشور','Published'):text('مسودة','Draft')}</td><td><button className="small-btn" onClick={()=>void togglePublished(x.id,x.is_published)}>{x.is_published?text('إلغاء النشر','Unpublish'):text('نشر','Publish')}</button></td></tr>)}</tbody></table></div>
      </section>
      <section className="panel"><h2 className="panel-title">{text('طلبات المساعدة الأكاديمية','Academic support requests')}</h2><div className="stack">{requests.length===0?<div className="placeholder">{text('مفيش طلبات حاليًا','No requests yet')}</div>:requests.map(r=><article className="admin-request" key={r.id}><div className="toolbar"><strong>{r.subject}</strong><span className="tag">{r.service_type}</span></div><p>{r.description}</p><small>{new Date(r.created_at).toLocaleString()}</small><div className="field"><label>{text('حالة الطلب','Request status')}</label><select className="input" value={r.status} onChange={e=>void updateRequest(r.id,e.target.value)}>{statuses.map(s=><option value={s} key={s}>{s}</option>)}</select></div></article>)}</div></section>
    </div></div></>;
}
