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
type ProgramCourse = { id:string; program_id:string; code:string; name_en:string; name_ar:string|null; credit_hours:number|null; academic_level:number|null; semester:string|null; is_published:boolean };
type EntityKind = 'universities' | 'faculties' | 'programs' | 'program_courses';
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
  const [catalogCourses,setCatalogCourses]=useState<ProgramCourse[]>([]);
  const [requests,setRequests]=useState<Request[]>([]);
  const [parentId,setParentId]=useState('');
  const [nameEn,setNameEn]=useState('');
  const [nameAr,setNameAr]=useState('');
  const [publish,setPublish]=useState(false);
  const [code,setCode]=useState('');
  const [creditHours,setCreditHours]=useState('');
  const [academicLevel,setAcademicLevel]=useState('');
  const [semester,setSemester]=useState('');
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  async function refresh(){
    const client=getSupabase();if(!client)return;
    const [a,b,c,d,e,f]=await Promise.all([
      client.from('countries').select('code,name_en').order('name_en'),
      client.from('universities').select('id,country_code,name_en,name_ar,is_published').order('name_en'),
      client.from('faculties').select('id,university_id,name_en,name_ar,is_published').order('name_en'),
      client.from('programs').select('id,faculty_id,name_en,name_ar,is_published').order('name_en'),
      client.from('service_requests').select('id,service_type,subject,description,status,created_at').order('created_at',{ascending:false}).limit(100),
      client.from('program_courses').select('id,program_id,code,name_en,name_ar,credit_hours,academic_level,semester,is_published').order('code').limit(1000),
    ]);
    setCountries((a.data??[]) as Country[]);setUnis((b.data??[]) as Uni[]);setFaculties((c.data??[]) as Faculty[]);setPrograms((d.data??[]) as Program[]);setRequests((e.data??[]) as Request[]);setCatalogCourses((f.data??[]) as ProgramCourse[]);
    const err=[a.error,b.error,c.error,d.error,e.error,f.error].find(Boolean);
    if(err)setStatus(err.message);
  }
  useEffect(()=>{void refresh();},[]);
  function changeTab(next:EntityKind){setTab(next);setEditingId(null);setParentId('');setNameEn('');setNameAr('');setPublish(false);setCode('');setCreditHours('');setAcademicLevel('');setSemester('');setStatus('');}
  const parentOptions=tab==='universities'?countries.map(x=>({id:x.code,label:x.name_en})):tab==='faculties'?unis.map(x=>({id:x.id,label:x.name_en})):tab==='programs'?faculties.map(x=>({id:x.id,label:x.name_en+' — '+(unis.find(u=>u.id===x.university_id)?.name_en||'')})):programs.map(x=>({id:x.id,label:x.name_en+' — '+(faculties.find(f=>f.id===x.faculty_id)?.name_en||'')}));
  const parentField=tab==='universities'?'country_code':tab==='faculties'?'university_id':tab==='programs'?'faculty_id':'program_id';
  const rows=tab==='universities'?unis:tab==='faculties'?faculties:tab==='programs'?programs:catalogCourses;
  function editRow(item:Uni|Faculty|Program|ProgramCourse){
    setEditingId(item.id);setNameEn(item.name_en);setNameAr(item.name_ar??'');setPublish(item.is_published);
    setParentId('country_code' in item?item.country_code:'university_id' in item?item.university_id:'faculty_id' in item?item.faculty_id:item.program_id);
    setCode('code' in item?item.code:'');setCreditHours('credit_hours' in item&&item.credit_hours!=null?String(item.credit_hours):'');
    setAcademicLevel('academic_level' in item&&item.academic_level!=null?String(item.academic_level):'');
    setSemester('semester' in item?item.semester??'':'');setStatus('');
    window.scrollTo?.({top:0,behavior:'smooth'});
  }
  async function add(e:FormEvent){
    e.preventDefault(); const client=getSupabase();if(!client||!parentId||!nameEn.trim())return;
    if(tab==='program_courses'&&!code.trim()){setStatus(text('كود المادة مطلوب.','Course code is required.'));return;}
    const credits=creditHours===''?null:Number(creditHours);
    if(tab==='program_courses'&&credits!==null&&(!Number.isFinite(credits)||credits<0.5||credits>12)){setStatus(text('الساعات لازم تكون من 0.5 إلى 12.','Credits must be between 0.5 and 12.'));return;}
    setBusy(true);setStatus('');
    const payload={ [parentField]: parentId, name_en:nameEn.trim().slice(0,160), name_ar:nameAr.trim().slice(0,160)||null, is_published:publish, ...(tab==='program_courses'?{code:code.trim().slice(0,32),credit_hours:credits,academic_level:academicLevel?Number(academicLevel):null,semester:semester||null}:{}) };
    const {error}=editingId
      ?await client.from(tab).update({name_en:nameEn.trim().slice(0,160),name_ar:nameAr.trim().slice(0,160)||null,is_published:publish,...(tab==='program_courses'?{code:code.trim().slice(0,32),credit_hours:credits,academic_level:academicLevel?Number(academicLevel):null,semester:semester||null}:{})}).eq('id',editingId)
      :await client.from(tab).insert(payload);
    setStatus(error?error.message:editingId?text('تم حفظ التعديلات ✓','Changes saved ✓'):text('تمت الإضافة ✓','Added successfully ✓'));
    if(!error){setEditingId(null);setParentId('');setNameEn('');setNameAr('');setCode('');setCreditHours('');setAcademicLevel('');setSemester('');setPublish(false);await refresh();}
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
  return <><div className="page-hero"><div className="container"><span className="section-kicker">ADMIN CONSOLE</span><h1>{text('إدارة GoAcadio', 'GoAcadio administration')}</h1><p>{text('إدارة الجامعات والكليات والبرامج والمواد ومتابعة طلبات المساعدة.', 'Manage universities, faculties, programs, courses and student support requests.')}</p></div></div>
    <div className="page-content"><div className="container stack">
      {status&&<div className="note" role="status">{status}</div>}
      <div className="dash-summary"><div className="metric-card"><strong>{unis.length}</strong><span>{text('جامعات','Universities')}</span></div><div className="metric-card"><strong>{faculties.length}</strong><span>{text('كليات','Faculties')}</span></div><div className="metric-card"><strong>{catalogCourses.length}</strong><span>{text('مواد','Courses')}</span></div><div className="metric-card"><strong>{requests.filter(r=>r.status==='new').length}</strong><span>{text('طلبات جديدة','New requests')}</span></div></div>
      <section className="panel"><h2 className="panel-title">{text('دليل الجامعات','Academic catalog')}</h2><div className="actions">
        {([['universities',text('الجامعات','Universities')],['faculties',text('الكليات','Faculties')],['programs',text('البرامج','Programs')],['program_courses',text('المواد','Courses')]] as const).map(([key,label])=><button type="button" key={key} className={'small-btn '+(tab===key?'active-tab':'')} onClick={()=>changeTab(key)}>{label}</button>)}
      </div><form onSubmit={e=>void add(e)} className="stack" style={{marginTop:20}}><div className="form-grid">
        <div className="field"><label>{text('التبعية','Parent')}</label><select className="input" disabled={Boolean(editingId)} required value={parentId} onChange={e=>setParentId(e.target.value)}><option value="">{text('اختار','Select')}</option>{parentOptions.map(x=><option value={x.id} key={x.id}>{x.label}</option>)}</select></div>
        <div className="field"><label>{text('الاسم بالإنجليزي','English name')}</label><input className="input" maxLength={160} required value={nameEn} onChange={e=>setNameEn(e.target.value)}/></div>
        <div className="field"><label>{text('الاسم بالعربي','Arabic name')}</label><input className="input" maxLength={160} value={nameAr} onChange={e=>setNameAr(e.target.value)}/></div>
        {tab==='program_courses'&&<>
          <div className="field"><label>{text('كود المادة','Course code')}</label><input className="input" maxLength={32} required value={code} onChange={e=>setCode(e.target.value)} placeholder="CS301"/></div>
          <div className="field"><label>{text('الساعات المعتمدة (اختياري)','Credit hours (optional)')}</label><input className="input" type="number" min="0.5" max="12" step="0.5" value={creditHours} onChange={e=>setCreditHours(e.target.value)}/></div>
          <div className="field"><label>{text('المستوى (اختياري)','Academic level (optional)')}</label><select className="input" value={academicLevel} onChange={e=>setAcademicLevel(e.target.value)}><option value="">{text('غير محدد','Not specified')}</option>{Array.from({length:8},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
          <div className="field"><label>{text('الفصل (اختياري)','Semester (optional)')}</label><select className="input" value={semester} onChange={e=>setSemester(e.target.value)}><option value="">{text('غير محدد','Not specified')}</option><option value="fall">Fall</option><option value="spring">Spring</option><option value="summer">Summer</option><option value="both">Both</option></select></div>
        </>}
        <label className="field admin-check"><input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)}/>{text('انشرها للطلاب (بعد مراجعة دقة الاسم)','Publish to students (after verification)')}</label>
      </div><div className="actions"><button className="btn btn-primary" disabled={busy||!parentId||!nameEn.trim()||(tab==='program_courses'&&!code.trim())} type="submit">{editingId?text('حفظ التعديلات','Save changes'):text('إضافة','Add record')}</button>{editingId&&<button type="button" className="btn btn-outline" onClick={()=>changeTab(tab)}>{text('إلغاء التعديل','Cancel editing')}</button>}</div></form>
        <div className="admin-table"><table><thead><tr><th>{text('الاسم','Name')}</th><th>{text('الحالة','Visibility')}</th><th>{text('إجراء','Action')}</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><b>{x.name_en}</b>{'code' in x&&<small>{x.code} · {x.credit_hours??'—'} CH · {x.academic_level?`L${x.academic_level}`:'—'} · {x.semester||'—'}</small>}{x.name_ar&&<small>{x.name_ar}</small>}</td><td>{x.is_published?text('منشور','Published'):text('مسودة','Draft')}</td><td><div className="actions"><button type="button" className="small-btn" onClick={()=>editRow(x)}>{text('تعديل','Edit')}</button><button type="button" className="small-btn" onClick={()=>void togglePublished(x.id,x.is_published)}>{x.is_published?text('إلغاء النشر','Unpublish'):text('نشر','Publish')}</button></div></td></tr>)}</tbody></table></div>
      </section>
      <section className="panel"><h2 className="panel-title">{text('طلبات المساعدة الأكاديمية','Academic support requests')}</h2><div className="stack">{requests.length===0?<div className="placeholder">{text('مفيش طلبات حاليًا','No requests yet')}</div>:requests.map(r=><article className="admin-request" key={r.id}><div className="toolbar"><strong>{r.subject}</strong><span className="tag">{r.service_type}</span></div><p>{r.description}</p><small>{new Date(r.created_at).toLocaleString()}</small><div className="field"><label>{text('حالة الطلب','Request status')}</label><select className="input" value={r.status} onChange={e=>void updateRequest(r.id,e.target.value)}>{statuses.map(s=><option value={s} key={s}>{s}</option>)}</select></div></article>)}</div></section>
    </div></div></>;
}
