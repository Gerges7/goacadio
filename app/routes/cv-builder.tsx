import { publicSeoMeta } from '@/lib/seo';
import type { MetaFunction } from 'react-router';
export const meta: MetaFunction = () => publicSeoMeta(
  'Free Student CV Builder | GoAcadio',
  'Create a simple university student CV and print it to PDF. No account required.',
  '/tools/cv-builder',
);
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { loadLocal, saveLocal, storageKeys } from '@/lib/storage';

type Cv = { name:string; title:string; email:string; phone:string; location:string; summary:string; education:string; experience:string; projects:string; skills:string; };
const blank:Cv={name:'',title:'',email:'',phone:'',location:'',summary:'',education:'',experience:'',projects:'',skills:''};
const fields:{key:keyof Cv;ar:string;en:string;multiline?:boolean;placeholder:string}[]=[
  {key:'name',ar:'الاسم بالكامل',en:'Full name',placeholder:'Your full name'},
  {key:'title',ar:'المسمى المستهدف',en:'Target role',placeholder:'Junior Software Developer'},
  {key:'email',ar:'البريد الإلكتروني',en:'Email',placeholder:'you@example.com'},
  {key:'phone',ar:'الموبايل',en:'Phone',placeholder:'+20 ...'},
  {key:'location',ar:'المدينة والدولة',en:'City & country',placeholder:'Cairo, Egypt'},
  {key:'summary',ar:'النبذة الشخصية',en:'Professional summary',multiline:true,placeholder:'2–3 short sentences about your goal, skills and achievements.'},
  {key:'education',ar:'التعليم',en:'Education',multiline:true,placeholder:'University · Degree · Expected graduation'},
  {key:'experience',ar:'الخبرة والتدريب',en:'Experience & internships',multiline:true,placeholder:'Role · Company · Dates · Impact'},
  {key:'projects',ar:'المشاريع',en:'Projects',multiline:true,placeholder:'Project name · Tech stack · Results'},
  {key:'skills',ar:'المهارات',en:'Skills',multiline:true,placeholder:'Python, SQL, React, communication, ...'},
];
export default function CvBuilder(){
  const {lang,text}=useLocale();const [cv,setCv]=useState<Cv>(blank);const [loaded,setLoaded]=useState(false);
  useEffect(()=>{setCv(loadLocal(storageKeys.cv,blank));setLoaded(true);},[]);
  useEffect(()=>{if(loaded)saveLocal(storageKeys.cv,cv);},[cv,loaded]);
  function update(key:keyof Cv,val:string){setCv(old=>({...old,[key]:val}));}
  return <><div className="page-hero no-print"><div className="container"><span className="section-kicker">CAREER TOOLS</span><h1>{text('CV Builder — أول خطوة في مستقبلك 📄','CV Builder — Make your next move 📄')}</h1><p>{text('اكتب بياناتك واطبع السيرة الذاتية كـPDF من المتصفح. البيانات محفوظة محليًا على الجهاز فقط.', 'Fill in your information and print or save as PDF. Your data stays in local browser storage.')}</p></div></div><div className="page-content"><div className="container two-col"><section className="panel no-print"><h2 className="panel-title">{text('بيانات السيرة الذاتية', 'Resume details')}</h2><div className="stack">{fields.map(f=><div className="field" key={f.key}><label htmlFor={'cv-'+f.key}>{text(f.ar,f.en)}</label>{f.multiline?<textarea id={'cv-'+f.key} className="input" rows={3} value={cv[f.key]} onChange={e=>update(f.key,e.target.value)} placeholder={f.placeholder}/>:<input id={'cv-'+f.key} className="input" type={f.key==='email'?'email':'text'} value={cv[f.key]} onChange={e=>update(f.key,e.target.value)} placeholder={f.placeholder}/>}</div>)}</div><div className="actions"><button className="btn btn-primary" onClick={()=>window.print()}>{text('طباعة / حفظ PDF','Print / Save as PDF')}</button><button className="btn btn-outline" onClick={()=>{if(window.confirm(text('مسح بيانات الـCV من المتصفح؟','Clear locally saved CV?')))setCv(blank);}}>{text('مسح البيانات','Clear details')}</button></div><p className="inline-help">{text('ملحوظة: هذا نموذج بسيط، وليس ضمانًا لنجاح فحص ATS. لا تضف معلومات حساسة على جهاز مشترك.', 'Basic single-column format, not a guarantee of ATS compatibility. Avoid entering private data on shared devices.')}</p></section>
    <section className="panel cv-preview-pane"><div className="toolbar no-print" style={{marginTop:0}}><h2 className="panel-title" style={{margin:0}}>{text('معاينة الـCV','CV preview')}</h2><span className="tag green">A4</span></div><div className="cv-resume" dir={lang==='ar'?'rtl':'ltr'}><h2>{cv.name||text('اسمك بالكامل','Your full name')}</h2><p style={{fontWeight:700,color:'#5b56c5'}}>{cv.title||text('المسمى المستهدف','Target Role')}</p><div className="cv-contact">{[cv.email,cv.phone,cv.location].filter(Boolean).join('  •  ')||'email@example.com  •  Cairo, Egypt'}</div>{([['summary',text('نبذة شخصية','Summary')],['education',text('التعليم','Education')],['experience',text('الخبرة','Experience')],['projects',text('المشاريع','Projects')],['skills',text('المهارات','Skills')]] as [keyof Cv,string][]).map(([key,label])=><div key={key}><h3>{label}</h3><p>{cv[key]||text('أضف بياناتك من النموذج المجاور.','Add your details in the form.')}</p></div>)}</div></section></div></div></>;
}
