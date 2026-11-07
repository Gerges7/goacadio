import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useAuth } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import { getSupabase } from '@/lib/supabase';
import type { AccountExport, ExportSection } from '@/lib/account-data-export.client';

type Category = 'support' | 'data_export' | 'account_deletion';
type RequestState = 'new'|'in_review'|'resolved'|'declined';
type AccountRequest = {id:string; category:Category; status:RequestState; created_at:string};
export const meta:MetaFunction = () => [
  {title:'Account & Privacy Requests | GoAcadio'},
  {name:'robots',content:'noindex, nofollow'},
];

export default function Account(){
  const {user,loading:authLoading,configured,signOut}=useAuth();
  const {text,lang}=useLocale();
  const [requests,setRequests]=useState<AccountRequest[]>([]);
  const [category,setCategory]=useState<Category>('support');
  const [details,setDetails]=useState('');
  const [acknowledged,setAcknowledged]=useState(false);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  const exportSnapshotRef=useRef<AccountExport|null>(null);
  const exportDownloadRef=useRef<((snapshot:AccountExport)=>void)|null>(null);
  const [exportReady,setExportReady]=useState(false);
  const [exportBusy,setExportBusy]=useState(false);
  const [exportProgress,setExportProgress]=useState('');
  const [exportError,setExportError]=useState('');
  const [exportDone,setExportDone]=useState(false);
  const [error,setError]=useState('');
  const categories:Record<Category,string>={
    support:text('مساعدة فنية','Technical support'),
    data_export:text('طلب نسخة من بياناتي','Request my data'),
    account_deletion:text('طلب حذف الحساب','Request account deletion'),
  };
  const statuses:Record<RequestState,string>={
    new:text('جديد','New'),in_review:text('تحت المراجعة','In review'),
    resolved:text('تمت المعالجة','Processed'),declined:text('تعذر التنفيذ','Unable to fulfill'),
  };
  useEffect(()=>{
    const client=getSupabase();
    if(!client||!user){setLoading(false);setRequests([]);return;}
    let active=true;setLoading(true);setError('');
    void client.from('account_requests').select('id,category,status,created_at')
      .eq('user_id',user.id).order('created_at',{ascending:false}).limit(50)
      .then(({data,error:queryError})=>{
        if(!active)return;
        if(queryError)setError(text('طلبات الحساب غير متاحة. تأكد من تشغيل SQL 007.','Account requests are unavailable. Please apply SQL migration 007.'));
        else setRequests((data??[]) as AccountRequest[]);
        setLoading(false);
      }).catch(()=>{if(active){setLoading(false);setError(text('تعذّر الاتصال. جرّب تحديث الصفحة.','Connection failed. Please refresh.'));}});
    return ()=>{active=false;};
  },[user?.id]);
  useEffect(()=>{exportSnapshotRef.current=null;exportDownloadRef.current=null;setExportReady(false);setExportDone(false);},[user?.id]);
  const hasActive = useMemo(()=>requests.some(r=>r.category===category&&(r.status==='new'||r.status==='in_review')),[requests,category]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!user||busy||hasActive||!getSupabase())return;
    if(category==='support'&&details.trim().length<10){setError(text('اكتب وصف المشكلة في 10 حروف على الأقل.','Describe the issue in at least 10 characters.'));return;}
    if(category==='account_deletion'&&!acknowledged){setError(text('لازم تؤكد إنك فاهم إن الطلب مش حذف فوري.','Please confirm you understand this is a request, not immediate deletion.'));return;}
    setBusy(true);setError('');setFeedback('');
    const {data,error:insertError}=await getSupabase()!.from('account_requests')
      .insert({category,details:details.trim().slice(0,1000)})
      .select('id,category,status,created_at').single();
    if(insertError){
      setError(insertError.code==='23505'
        ?text('عندك طلب مفتوح من النوع ده بالفعل.','You already have an open request of this type.')
        :text('تعذّر إرسال الطلب. حاول مرة أخرى أو تواصل من صفحة المساعدة.','Could not submit your request. Please try again.'));
    }else if(data){
      setRequests(old=>[data as AccountRequest,...old]);setDetails('');setAcknowledged(false);
      setFeedback(text('تم تسجيل طلبك. المراجعة والتنفيذ مش تلقائيين.','Request recorded. Review and fulfillment are not automatic.'));
    }
    setBusy(false);
  }
  async function downloadMyData(){
    const client=getSupabase();
    if(!client||!user||exportBusy)return;
    setExportBusy(true);setExportError('');setExportDone(false);setExportReady(false);setExportProgress('');
    exportSnapshotRef.current=null;exportDownloadRef.current=null;
    const names:Record<ExportSection,string>={
      student_profiles:text('الملف الأكاديمي','Profile'),
      student_courses:text('المواد','Courses'),
      study_items:text('المهام والامتحانات','Study planner'),
      focus_sessions:text('جلسات التركيز','Focus sessions'),
      quiz_attempts:text('نتائج الاختبارات','Quiz results'),
      service_requests:text('طلبات المساعدة الأكاديمية','Academic inquiries'),
      account_requests:text('طلبات الحساب والخصوصية','Account requests'),
      ai_daily_usage:text('عداد الاستخدام اليومي','Daily AI usage'),
    };
    try {
      const {prepareAccountExport,downloadAccountExport}=await import('@/lib/account-data-export.client');
      const snapshot=await prepareAccountExport(client,user.id,(section,count)=>{
        setExportProgress(text(`قراءة ${names[section]}: ${count} سجل`,`Reading ${names[section]}: ${count} records`));
      });
      exportSnapshotRef.current=snapshot;exportDownloadRef.current=downloadAccountExport;
      setExportReady(true);
      setExportProgress('');
    }catch(err){
      const code=err instanceof Error?err.message:'';
      setExportError(code==='SIGN_IN_REQUIRED'
        ?text('الجلسة انتهت أو اتغير الحساب. سجل دخول وجرب تاني.','Session expired or account changed. Sign in again and retry.')
        :code==='TOO_MANY_ROWS'
          ?text('عندك سجلات أكتر من حد التصدير. اطلب نسخة كاملة من الإدارة.','Your account exceeds the self-service export limit. Request a full export from support.')
          :code==='DOWNLOAD_FAILED'
            ?text('المتصفح منع التنزيل. راجع إعدادات التنزيل وجرب تاني.','Browser blocked the download. Check download permissions and retry.')
            :text('تعذّر قراءة مجموعة من بياناتك. لم يتم تنزيل نسخة ناقصة. يمكنك طلب نسخة من الإدارة.','Could not read all account data; no incomplete export was downloaded. Request an administrative export.'));
      setExportProgress('');
    }finally{setExportBusy(false);}
  }
  function downloadPreparedData(){
    const snapshot=exportSnapshotRef.current;
    const downloader=exportDownloadRef.current;
    if(!snapshot||!downloader||!user||snapshot.account.id!==user.id){
      exportSnapshotRef.current=null;exportDownloadRef.current=null;setExportReady(false);
      setExportError(text('نسخة البيانات غير متاحة. جهّز نسخة جديدة بعد تسجيل الدخول.','Export is unavailable. Prepare a new one after signing in.'));
      return;
    }
    try{
      downloader(snapshot);
      setExportDone(true);setExportError('');setExportReady(false);exportSnapshotRef.current=null;exportDownloadRef.current=null;
    }catch{
      setExportError(text('المتصفح منع التنزيل. راجع إعدادات التنزيل وحاول مرة تانية.','Browser blocked the download. Check browser permissions and retry.'));
    }
  }
  if(authLoading||!configured||!user)return <div className="page-content"><div className="container"><section className="panel auth-panel center"><h1>{text('الحساب والخصوصية','Account & privacy')}</h1><p>{text('سجّل دخول لتتابع طلبات الدعم والبيانات.', 'Sign in to access your account and privacy requests.')}</p><Link to="/auth" className="btn btn-primary">{text('تسجيل الدخول','Sign in')}</Link></section></div></div>;
  return <>
    <div className="page-hero"><div className="container"><span className="section-kicker">YOUR ACCOUNT</span><h1>{text('الحساب والخصوصية 🔐','Account & privacy 🔐')}</h1><p>{text('تابع طلبات الدعم، واطلب بياناتك أو حذف حسابك من مكان واحد.','Manage support, data-access and deletion requests in one place.')}</p></div></div>
    <div className="page-content"><div className="container account-layout">
      <section className="stack">
        <div className="panel"><h2 className="panel-title">{text('بيانات الحساب','Account details')}</h2><p className="inline-help">{text('البريد المسجل','Signed-in email')}</p><p dir="ltr" style={{overflowWrap:'anywhere'}}>{user.email??'—'}</p>
          <div className="actions"><Link to="/dashboard" className="btn btn-outline">{text('تعديل ملفي الأكاديمي','Edit academic profile')}</Link><button type="button" className="btn btn-ghost" onClick={()=>void signOut()}>{text('تسجيل الخروج','Sign out')}</button></div>
        </div>
        <section className="panel stack" aria-labelledby="data-download-heading">
          <h2 className="panel-title" id="data-download-heading">{text('نزّل بيانات حسابك','Download your account data')}</h2>
          <p className="panel-description">{text('حمّل ملف JSON فيه ملفك الأكاديمي وموادك ومهامك وجلسات التركيز وملخص نتائج الاختبارات وطلباتك. الملف بيتجمّع داخل متصفحك من بيانات حسابك فقط، ومش بيتبعت لخدمة جديدة.', 'Download a JSON snapshot of your profile, courses, study tasks, focus sessions, saved quiz scores and requests. Your own records are assembled in this browser without a new upload service.')}</p>
          <p className="inline-help">{text('الملف ممكن يحتوي على معلومات شخصية: احتفظ بيه في مكان آمن. مش بيشمل مسودات GPA وCV المحفوظة على جهاز مختلف، أو سجلات خدمات البنية التحتية. لو محتاج نسخة شاملة قدّم طلب بيانات أدناه.', 'This file can contain personal information: store it securely. It excludes GPA/CV drafts saved on other devices and provider logs. For a comprehensive request, use the data-access form below.')}</p>
          {exportProgress&&<p className="inline-help" role="status" aria-live="polite">{exportProgress}</p>}
          {exportError&&<p className="note warn" role="alert">{exportError}</p>}
          {exportReady&&<p className="note" role="status">{text('الملف جاهز. اضغط «تنزيل الملف» عشان تحفظه على جهازك.','The file is ready. Select Download file to save it to your device.')}</p>}
          {exportDone&&<p className="note" role="status">{text('تم تجهيز التنزيل. راجع مجلد التنزيلات في متصفحك.','Download prepared. Check your browser downloads.')}</p>}
          <div className="actions"><button type="button" className="btn btn-primary" disabled={exportBusy} onClick={()=>void downloadMyData()}>{exportBusy?text('جاري تجهيز البيانات...','Preparing export...'):text('تجهيز نسخة JSON','Prepare JSON export')}</button>{exportReady&&<button type="button" className="btn btn-outline" onClick={downloadPreparedData}>{text('تنزيل الملف الآن ↓','Download file now ↓')}</button>}</div>
        </section>
        <div className="panel"><h2 className="panel-title">{text('إرسال طلب','Submit a request')}</h2><p className="panel-description">{text('تقدر تطلب الدعم أو الاطلاع على بياناتك أو حذف حسابك. طلب الحذف مش هيحذف أي بيانات فورًا.','Request support, a copy of your data, or account deletion. Submitting a deletion request does not immediately erase data.')}</p>
          {error&&<p role="alert" className="note warn">{error}</p>}
          {feedback&&<p role="status" className="note">{feedback}</p>}
          <form onSubmit={e=>void submit(e)} className="stack">
            <div className="field"><label htmlFor="request-category">{text('نوع الطلب','Request type')}</label>
              <select className="input" id="request-category" value={category} onChange={e=>{setCategory(e.target.value as Category);setError('');setFeedback('');setAcknowledged(false);}}>
                {(Object.keys(categories) as Category[]).map(key=><option value={key} key={key}>{categories[key]}</option>)}
              </select></div>
            <div className="field"><label htmlFor="request-details">{text('تفاصيل إضافية (بدون معلومات حساسة)','Additional details (avoid sensitive data)')}</label>
              <textarea id="request-details" className="input" rows={4} maxLength={1000} value={details} onChange={e=>setDetails(e.target.value)} placeholder={category==='support'?text('اكتب رسالة الخطأ والخطوات اللي عملتها...','Describe what went wrong and the steps you took...'):text('اكتب تفاصيل إضافية لو حابب','Optional additional context')} required={category==='support'} minLength={category==='support'?10:undefined}/>
              <small className="inline-help">{details.length}/1000</small></div>
            {category==='account_deletion'&&<label className="account-confirm"><input type="checkbox" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/><span>{text('فاهم إن ده طلب مراجعة لحذف الحساب، مش حذف تلقائي، وقد تحتاج الإدارة للتحقق من ملكية الحساب قبل التنفيذ.','I understand this starts a manually reviewed deletion request, not automatic deletion, and the team may need to verify account ownership.')}</span></label>}
            {hasActive&&<p className="note">{text('عندك طلب مفتوح من النوع ده. تابع حالته بالأسفل قبل إرسال واحد جديد.','You already have an open request of this type. Track its status below.')}</p>}
            <div className="actions"><button type="submit" className="btn btn-primary" disabled={loading||busy||hasActive||(category==='account_deletion'&&!acknowledged)}>{busy?text('جاري الإرسال...','Sending...'):text('سجّل الطلب','Submit request')}</button></div>
          </form>
        </div>
        <div className="panel"><h2 className="panel-title">{text('طلباتي السابقة','My requests')}</h2>
          {loading?<p>{text('جاري تحميل الطلبات...','Loading requests...')}</p>:!requests.length?<p className="inline-help">{text('مفيش طلبات سابقة.','No requests yet.')}</p>:<div className="account-request-list">{requests.map(r=><div className="account-request-row" key={r.id}><div><strong>{categories[r.category]}</strong><small>{new Intl.DateTimeFormat(lang==='ar'?'ar-EG':'en-GB',{dateStyle:'medium'}).format(new Date(r.created_at))}</small></div><span className="tag">{statuses[r.status]}</span></div>)}</div>}
          <p className="inline-help">{text('الحالة «تمت المعالجة» لا تعني بالضرورة حذف الحساب؛ لو حذفت الإدارة الحساب فلن تتمكن من تسجيل الدخول بعد ذلك.','A “Processed” status does not by itself prove that an account was deleted; deletion is performed separately by administrators.')}</p>
        </div>
      </section>
      <aside className="panel stack"><h2 className="panel-title">{text('التحكم في بياناتك','Your data controls')}</h2>
        <button type="button" className="btn btn-ghost" disabled={exportBusy} onClick={()=>void downloadMyData()}>⬇️ {text('تجهيز نسخة البيانات','Prepare data export')}</button>
        <Link className="btn btn-ghost" to="/quiz-history">📝 {text('الاختبارات المحفوظة','Saved quiz scores')}</Link>
        <Link className="btn btn-ghost" to="/study-stats">⏱️ {text('سجل جلسات التركيز','Focus session history')}</Link>
        <Link className="btn btn-ghost" to="/planner">🗓️ {text('المهام والامتحانات','Study tasks & exams')}</Link>
        <Link className="btn btn-ghost" to="/help">❔ {text('مركز المساعدة','Help center')}</Link>
        <Link className="btn btn-outline" to="/privacy">{text('معلومات الخصوصية','Privacy information')}</Link>
        <p className="inline-help">{text('طلبات البيانات والحذف بتتم مراجعتها يدويًا. لازم نوفر وسيلة تواصل عامة وسياسة خصوصية نهائية قبل الإطلاق الواسع.','Data access and deletion requests are handled manually. A verified public contact channel and finalized privacy policy are still required before broad launch.')}</p>
      </aside>
    </div></div>
  </>;
}
