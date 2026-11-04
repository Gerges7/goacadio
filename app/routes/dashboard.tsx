import { useEffect, useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';
import { getSupabase } from '@/lib/supabase';
import LegacyDashboard from '@/components/legacy-dashboard';
import { loadLocal, storageKeys } from '@/lib/storage';

export const meta: MetaFunction = () => [
  { title: 'Student Dashboard | GoAcadio' },
  { name: 'robots', content: 'noindex, nofollow' },
];

type Country = { code: string; name_en: string; name_ar: string };
type University = { id: string; name_en: string; name_ar: string | null };
type Faculty = { id: string; name_en: string; name_ar: string | null };
type Program = { id: string; name_en: string; name_ar: string | null };
type Course = { id: string; name: string; code: string | null };
type Profile = {
  display_name: string; country_code: string;
  university_id: string; university_other: string;
  faculty_id: string; faculty_other: string;
  program_id: string; program_other: string; academic_level: string;
};
const initialProfile: Profile = {
  display_name: '', country_code: 'EG', university_id: '', university_other: '',
  faculty_id: '', faculty_other: '', program_id: '', program_other: '', academic_level: '1',
};

export default function Dashboard() {
  const { text } = useLocale();
  const { user, loading, configured } = useAuth();
  if (!configured) return <LegacyDashboard/>;
  if (loading) return <div className="page-content"><div className="container"><div className="panel">{text('بنحمّل حسابك...', 'Loading your account...')}</div></div></div>;
  if (!user) return <div className="page-content"><div className="container"><section className="panel auth-panel center"><h1>{text('لوحة الطالب الخاصة بك','Your student workspace')}</h1><p className="panel-description">{text('الأدوات المجانية مش محتاجة تسجيل، لكن حفظ ملفك وموادك بين الأجهزة محتاج حساب.', 'You can use public tools without an account. Sign in to sync your personal profile and courses.')}</p><Link to="/auth" className="btn btn-primary">{text('إنشاء حساب أو تسجيل الدخول','Sign in or create account')}</Link><div className="actions" style={{justifyContent:'center'}}><Link to="/tools" className="btn btn-outline">{text('الأدوات المجانية','Free tools')}</Link></div></section></div></div>;
  return <ConnectedDashboard userId={user.id} email={user.email ?? ''}/>;
}
function ConnectedDashboard({ userId, email }: { userId: string; email: string }) {
  const { text, lang } = useLocale();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [hadProfile, setHadProfile] = useState(false);

  useEffect(() => {
    const client = getSupabase(); if (!client) return;
    let cancelled = false;
    async function load() {
      const [profileRes, courseRes, countriesRes] = await Promise.all([
        client!.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
        client!.from('student_courses').select('id,name,code').eq('user_id', userId).order('created_at',{ascending:false}),
        client!.from('countries').select('code,name_en,name_ar').order('name_en'),
      ]);
      if (cancelled) return;
      if (profileRes.data) {
        const d = profileRes.data as Record<string, unknown>;
        setProfile({
          display_name: String(d.display_name ?? ''), country_code: String(d.country_code ?? 'EG'),
          university_id: String(d.university_id ?? ''), university_other: String(d.university_other ?? ''),
          faculty_id: String(d.faculty_id ?? ''), faculty_other: String(d.faculty_other ?? ''),
          program_id: String(d.program_id ?? ''), program_other: String(d.program_other ?? ''),
          academic_level: String(d.academic_level ?? '1'),
        });
        setHadProfile(true);
      }
      if (courseRes.data) setCourses(courseRes.data as Course[]);
      if (countriesRes.data) setCountries(countriesRes.data as Country[]);
      const error = profileRes.error || courseRes.error || countriesRes.error;
      if (error) setStatus(`${text('تعذر قراءة بعض البيانات:', 'Could not load some data:')} ${error.message}`);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => {
    const client = getSupabase(); if (!client || !profile.country_code) return;
    let cancelled = false; setUniversities([]);
    void client.from('universities').select('id,name_en,name_ar').eq('country_code',profile.country_code).order('name_en').then(({data})=>{if (!cancelled) setUniversities((data ?? []) as University[]);});
    return () => {cancelled=true;};
  }, [profile.country_code]);
  useEffect(() => {
    const client = getSupabase(); if (!client || !profile.university_id) {setFaculties([]); return;}
    let cancelled=false; setFaculties([]);
    void client.from('faculties').select('id,name_en,name_ar').eq('university_id',profile.university_id).order('name_en').then(({data})=>{if(!cancelled)setFaculties((data??[]) as Faculty[]);});
    return ()=>{cancelled=true;};
  }, [profile.university_id]);
  useEffect(() => {
    const client = getSupabase(); if(!client || !profile.faculty_id) {setPrograms([]);return;}
    let cancelled=false;setPrograms([]);
    void client.from('programs').select('id,name_en,name_ar').eq('faculty_id',profile.faculty_id).order('name_en').then(({data})=>{if(!cancelled)setPrograms((data??[]) as Program[]);});
    return ()=>{cancelled=true;};
  }, [profile.faculty_id]);
  const p = (change: Partial<Profile>)=>setProfile(x=>({...x,...change}));
  const label = (x:{name_ar:string|null;name_en:string})=>lang==='ar'&&x.name_ar?x.name_ar:x.name_en;
  async function saveProfile() {
    const client=getSupabase();if(!client)return;
    setBusy(true);setStatus('');
    const {error}=await client.from('student_profiles').upsert({
      user_id:userId, display_name:profile.display_name.trim().slice(0,100),
      country_code:profile.country_code||null,
      university_id:profile.university_id||null, university_other:profile.university_id?null:profile.university_other.trim().slice(0,160)||null,
      faculty_id:profile.university_id&&profile.faculty_id?profile.faculty_id:null,
      faculty_other:profile.faculty_id?null:profile.faculty_other.trim().slice(0,160)||null,
      program_id:profile.faculty_id&&profile.program_id?profile.program_id:null,
      program_other:profile.program_id?null:profile.program_other.trim().slice(0,160)||null,
      academic_level:profile.academic_level,
      updated_at:new Date().toISOString(),
    },{onConflict:'user_id'});
    setBusy(false);
    setStatus(error?error.message:text('تم حفظ ملفك على حسابك ✓','Profile saved to your account ✓'));
    if(!error)setHadProfile(true);
  }
  async function addCourse() {
    const name=courseName.trim();if(!name)return;
    const client=getSupabase();if(!client)return;
    setBusy(true);setStatus('');
    const {data,error}=await client.from('student_courses').insert({user_id:userId,name:name.slice(0,160),code:courseCode.trim().slice(0,32)||null}).select('id,name,code').single();
    if(data)setCourses(x=>[data as Course,...x]);
    if(!error){setCourseName('');setCourseCode('');}
    setStatus(error?error.message:'');setBusy(false);
  }
  async function removeCourse(id:string) {
    const client=getSupabase();if(!client)return;
    const {error}=await client.from('student_courses').delete().eq('id',id).eq('user_id',userId);
    if(error)setStatus(error.message);else setCourses(x=>x.filter(c=>c.id!==id));
  }
  async function importBrowserCourses() {
    const client=getSupabase();if(!client)return;
    const local=loadLocal<{name:string;code?:string}[]>(storageKeys.courses,[]);
    const unique=local.filter(x=>typeof x.name==='string'&&x.name.trim()&&!courses.some(c=>c.name.toLowerCase()===x.name.trim().toLowerCase()));
    if(!unique.length){setStatus(text('مفيش مواد محلية جديدة للاستيراد.', 'No new local courses to import.'));return;}
    setBusy(true);
    const payload=unique.slice(0,50).map(x=>({user_id:userId,name:x.name.slice(0,160),code:(x.code||'').slice(0,32)||null}));
    const {data,error}=await client.from('student_courses').insert(payload).select('id,name,code');
    if(data)setCourses(x=>[...(data as Course[]),...x]);
    setStatus(error?error.message:text('تم استيراد المواد من المتصفح ✓','Browser courses imported ✓'));
    setBusy(false);
  }
  return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDENT DASHBOARD</span><h1>{text('لوحتك الدراسية 🎓','Your study dashboard 🎓')}</h1><p>{text('ملفك وموادك على حسابك، والأدوات العامة متاحة لأي طالب.', 'Your profile and courses are saved to your account. Free public tools stay open to everyone.')}</p></div></div>
    <div className="page-content"><div className="container">
      {status && <div className="note" role="status" style={{marginBottom:16}}>{status}</div>}
      {loading ? <div className="panel">{text('جاري تحميل بياناتك...', 'Loading your data...')}</div> : <div className="dashboard-grid">
        <div className="stack">
          <div className="hello"><h2>{text(`أهلًا ${profile.display_name||'بيك'} 👋`,`Welcome ${profile.display_name||'back'} 👋`)}</h2><p>{email}</p></div>
          <section className="panel"><h2 className="panel-title">{text('ملفك الأكاديمي','Academic profile')}</h2>
            <div className="form-grid">
              <div className="field"><label>{text('الاسم','Name')}</label><input className="input" value={profile.display_name} maxLength={100} onChange={e=>p({display_name:e.target.value})}/></div>
              <div className="field"><label>{text('الدولة','Country')}</label><select className="input" value={profile.country_code} onChange={e=>p({country_code:e.target.value,university_id:'',faculty_id:'',program_id:'',university_other:'',faculty_other:'',program_other:''})}>{countries.map(x=><option key={x.code} value={x.code}>{label({name_en:x.name_en,name_ar:x.name_ar})}</option>)}</select></div>
              <div className="field"><label>{text('الجامعة','University')}</label><select className="input" value={profile.university_id} onChange={e=>p({university_id:e.target.value,faculty_id:'',program_id:'',faculty_other:'',program_other:''})}><option value="">{text('جامعة أخرى / غير مدرجة','Other / not listed')}</option>{universities.map(x=><option key={x.id} value={x.id}>{label(x)}</option>)}</select>{!profile.university_id&&<input className="input" style={{marginTop:8}} value={profile.university_other} maxLength={160} onChange={e=>p({university_other:e.target.value})} placeholder={text('اكتب الجامعة (اختياري)','Enter university (optional)')}/>}</div>
              <div className="field"><label>{text('الكلية','Faculty')}</label><select className="input" value={profile.faculty_id} onChange={e=>p({faculty_id:e.target.value,program_id:''})}><option value="">{text('كلية أخرى / غير مدرجة','Other / not listed')}</option>{faculties.map(x=><option key={x.id} value={x.id}>{label(x)}</option>)}</select>{!profile.faculty_id&&<input className="input" style={{marginTop:8}} value={profile.faculty_other} maxLength={160} onChange={e=>p({faculty_other:e.target.value})} placeholder={text('اكتب الكلية (اختياري)','Enter faculty (optional)')}/>}</div>
              <div className="field"><label>{text('البرنامج','Program')}</label><select className="input" value={profile.program_id} onChange={e=>p({program_id:e.target.value})}><option value="">{text('برنامج آخر / غير مدرج','Other / not listed')}</option>{programs.map(x=><option key={x.id} value={x.id}>{label(x)}</option>)}</select>{!profile.program_id&&<input className="input" style={{marginTop:8}} value={profile.program_other} maxLength={160} onChange={e=>p({program_other:e.target.value})} placeholder="Computer Science"/>}</div>
              <div className="field"><label>{text('المستوى','Academic level')}</label><select className="input" value={profile.academic_level} onChange={e=>p({academic_level:e.target.value})}>{Array.from({length:8},(_,i)=><option value={String(i+1)} key={i}>{i+1}</option>)}</select></div>
            </div><div className="actions"><button disabled={busy} className="btn btn-primary" onClick={saveProfile}>{busy?text('جاري الحفظ...','Saving...'):text('حفظ الملف','Save profile')}</button></div>
          </section>
          <section className="panel"><h2 className="panel-title">{text('موادي الدراسية','My courses')}</h2><p className="panel-description">{text('أضف موادك، واحفظها على حسابك بدل المتصفح فقط.', 'Add your courses and sync them to your account.')}</p>
            <div className="form-grid"><div className="field"><label>{text('المادة','Course')}</label><input className="input" maxLength={160} value={courseName} onChange={e=>setCourseName(e.target.value)} placeholder="Data Structures" onKeyDown={e=>{if(e.key==='Enter')void addCourse();}}/></div><div className="field"><label>{text('الكود (اختياري)','Code (optional)')}</label><input className="input" maxLength={32} value={courseCode} onChange={e=>setCourseCode(e.target.value)} placeholder="CS301" onKeyDown={e=>{if(e.key==='Enter')void addCourse();}}/></div></div>
            <div className="actions"><button disabled={busy||!courseName.trim()} className="btn btn-primary" onClick={()=>void addCourse()}>{text('إضافة مادة','Add course')}</button><button disabled={busy} className="btn btn-outline" onClick={()=>void importBrowserCourses()}>{text('استيراد مواد V1 من الجهاز','Import V1 browser courses')}</button></div>
            {courses.length===0?<div className="placeholder">{text('لسه مفيش مواد محفوظة.','No courses saved yet.')}</div>:courses.map(c=><div className="course-item" key={c.id}><span>📚</span><div><b>{c.name}</b><small>{c.code||'—'}</small></div><button className="small-btn danger-btn" onClick={()=>void removeCourse(c.id)}>{text('حذف','Remove')}</button></div>)}
          </section>
        </div>
        <aside className="stack"><section className="panel"><h2 className="panel-title">{text('ملخصك','Your summary')}</h2><div className="metric-card"><strong>{courses.length}</strong><span>{text('عدد المواد المحفوظة','Saved courses')}</span></div><div className="metric-card" style={{marginTop:10}}><strong>{hadProfile?'✓':'—'}</strong><span>{text('ملف أكاديمي محفوظ','Saved academic profile')}</span></div></section><section className="panel"><h2 className="panel-title">{text('الأدوات','Quick tools')}</h2><div className="stack"><Link className="btn btn-ghost" to="/tools/gpa-calculator">🎓 GPA / CGPA</Link><Link className="btn btn-ghost" to="/tools/focus-timer">⏱️ Focus Timer</Link><Link className="btn btn-ghost" to="/tools/cv-builder">📄 CV Builder</Link><Link className="btn btn-ghost" to="/services">🤝 {text('مساعدة أكاديمية','Academic help')}</Link></div></section><section className="note">{text('ملفك والمواد يتزامنوا بين الأجهزة. حسابات GPA وبيانات الـCV وجلسات التركيز ما زالت تُحفظ محليًا على جهازك.', 'Your profile and courses sync across devices. GPA results, CV drafts and focus sessions still save only on this device.')}</section><button className="btn btn-outline" onClick={()=>void signOut()}>{text('تسجيل الخروج','Sign out')}</button></aside>
      </div>}
    </div></div></>;
}
