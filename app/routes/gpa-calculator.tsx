import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { saveLocal, storageKeys } from '@/lib/storage';

type Row = { id:number; name:string; credits:string; grade:string };
const scale = [ ['A','4.00'],['A-','3.70'],['B+','3.30'],['B','3.00'],['B-','2.70'],['C+','2.30'],['C','2.00'],['C-','1.70'],['D+','1.30'],['D','1.00'],['F','0.00'] ] as const;
const initial:Row[]=[{id:1,name:'',credits:'3',grade:'A'},{id:2,name:'',credits:'3',grade:'B+'},{id:3,name:'',credits:'3',grade:'B'}];
export default function Gpa() {
  const { text } = useLocale();
  const [rows,setRows]=useState<Row[]>(initial);
  const [previousGpa,setPreviousGpa]=useState('');
  const [previousCredits,setPreviousCredits]=useState('');
  const [ready,setReady]=useState(false);
  useEffect(()=>{ try {const x=localStorage.getItem('goacadio:v1:gpa:draft');if(x){const saved=JSON.parse(x);if(Array.isArray(saved.rows)&&saved.rows.length) setRows(saved.rows);setPreviousGpa(saved.previousGpa??'');setPreviousCredits(saved.previousCredits??'');}}catch{}setReady(true);},[]);
  useEffect(()=>{if(ready) saveLocal('goacadio:v1:gpa:draft',{rows,previousGpa,previousCredits});},[rows,previousGpa,previousCredits,ready]);
  const calc=useMemo(()=>{
    const valid=rows.filter(r=>Number.isFinite(Number(r.credits))&&Number(r.credits)>0&&Number(r.credits)<=12&&scale.some(s=>s[0]===r.grade));
    const credits=valid.reduce((x,r)=>x+Number(r.credits),0);
    const total=valid.reduce((x,r)=>x+Number(r.credits)*Number(scale.find(s=>s[0]===r.grade)?.[1]??0),0);
    const semester=credits>0?total/credits:null;
    const prevC=Number(previousCredits), prevG=Number(previousGpa);
    const hasPrevious=previousCredits.trim()!=='' && previousGpa.trim()!=='' && Number.isFinite(prevC)&&Number.isFinite(prevG)&&prevC>=0&&prevG>=0&&prevG<=4;
    const cumulative=hasPrevious&&credits+prevC>0?(total+prevG*prevC)/(credits+prevC):null;
    return {semester,cumulative,credits,hasPrevious,validCount:valid.length};
  },[rows,previousGpa,previousCredits]);
  function update(id:number,field:keyof Row,value:string){setRows(old=>old.map(row=>row.id===id?{...row,[field]:value}:row));}
  function saveResult(){saveLocal(storageKeys.gpa,{semester:calc.semester,cumulative:calc.cumulative,credits:calc.credits,updatedAt:new Date().toISOString()});window.alert(text('اتحفظت آخر نتيجة على الجهاز ده.','Latest result saved in this browser.'));}
  return <><div className="page-hero"><div className="container"><span className="section-kicker">ACADEMIC TOOLS</span><h1>GPA & CGPA Calculator 🎓</h1><p>{text('احسب معدلك بدقة وفق سلم 4.0 عام قابل للتعديل في كل مادة، وادخل معدلك السابق لحساب التراكمي.', 'Calculate your weighted GPA on an example 4.0 grading scale and combine it with previous completed credits.')}</p></div></div>
    <div className="page-content"><div className="container two-col"><div className="panel"><h2 className="panel-title">{text('مواد الفصل الحالي', 'Current semester courses')}</h2><p className="panel-description">{text('الدرجات المعروضة نقاط افتراضية وليست سلمًا رسميًا لأي جامعة. يمكنك اختيار التقدير المناسب لكل مادة.', 'This is an illustrative point scale, not an official university grading policy.')}</p>
    <div className="course-grid" style={{marginBottom:6}}><div className="inline-help">{text('المادة','Course')}</div><div className="inline-help">{text('الساعات','Credits')}</div><div className="inline-help">{text('التقدير','Grade')}</div><div/></div>
    {rows.map(r=><div className="course-grid" key={r.id}><input className="input" aria-label="Course name" placeholder={text('اسم المادة','Course name')} value={r.name} onChange={e=>update(r.id,'name',e.target.value)} /><input className="input" aria-label="Credits" type="number" min="0.5" max="12" step="0.5" value={r.credits} onChange={e=>update(r.id,'credits',e.target.value)} /><select className="input" aria-label="Grade" value={r.grade} onChange={e=>update(r.id,'grade',e.target.value)}>{scale.map(([grade,points])=><option key={grade} value={grade}>{grade} ({points})</option>)}</select><button type="button" className="small-btn danger-btn" aria-label="Remove course" title={text('حذف','Remove')} onClick={()=>setRows(old=>old.filter(x=>x.id!==r.id))}>×</button></div>)}
    <div className="toolbar"><button className="small-btn" type="button" onClick={()=>setRows(old=>[...old,{id:Math.max(0,...old.map(x=>x.id))+1,name:'',credits:'3',grade:'A'}])}>＋ {text('إضافة مادة','Add course')}</button><button className="small-btn" type="button" onClick={()=>setRows(initial)}>{text('إعادة المواد الافتراضية','Reset rows')}</button></div><hr style={{border:0,borderTop:'1px solid #e7eaf2',margin:'25px 0'}}/><h2 className="panel-title">{text('بيانات التراكمي السابق (اختياري)', 'Previous cumulative GPA (optional)')}</h2><div className="form-grid"><div className="field"><label htmlFor="previous-gpa">{text('CGPA السابق (0–4)','Previous CGPA (0–4)')}</label><input className="input" id="previous-gpa" type="number" min="0" max="4" step="0.01" value={previousGpa} onChange={e=>setPreviousGpa(e.target.value)} placeholder="3.25"/></div><div className="field"><label htmlFor="previous-credits">{text('الساعات المنجزة سابقًا','Previously completed credits')}</label><input className="input" id="previous-credits" type="number" min="0" step="0.5" value={previousCredits} onChange={e=>setPreviousCredits(e.target.value)} placeholder="60"/></div></div><p className="inline-help">{text('أدخل القيمة التراكمية والساعات السابقة معًا، دون ساعات هذا الفصل.','Enter both values from prior semesters; exclude current semester credits.')}</p>
    <div className="note warn">{text('⚠️ نظام التقديرات والساعات المعتمدة والمواد المعادة يختلف من جامعة لأخرى. النتيجة تقديرية وليست بيانًا رسميًا.','⚠️ Grading policies, retakes and credit rules vary by institution. The result is an estimate, not an official transcript.')}</div>
    </div><aside className="panel"><h2 className="panel-title center">{text('نتيجتك', 'Your result')}</h2><div className="result-label">{text('المعدل الفصلي (GPA)','Semester GPA')}</div><div className="result-number">{calc.semester===null?'—':calc.semester.toFixed(2)}</div><div className="metric-row"><div className="metric-card"><strong>{calc.credits.toFixed(1)}</strong><span>{text('ساعات الفصل','Semester credits')}</span></div><div className="metric-card"><strong>{calc.validCount}</strong><span>{text('مواد محتسبة','Included courses')}</span></div></div><div className="note" style={{marginTop:17,textAlign:'center'}}><b>{text('CGPA الجديد','New CGPA')}</b><div style={{fontSize:35,fontWeight:800,color:'#5952dc',lineHeight:1.6,direction:'ltr'}}>{calc.cumulative===null?'—':calc.cumulative.toFixed(2)}</div>{calc.cumulative===null&&<span>{text('أدخل المعدل والساعات السابقة لعرض التراكمي.', 'Enter previous GPA and credits to see the cumulative result.')}</span>}</div><div className="actions"><button className="btn btn-primary" onClick={saveResult} disabled={calc.semester===null}>{text('احفظ النتيجة على جهازك','Save in browser')}</button><a className="btn" href="/dashboard">{text('لوحة الطالب','Student Hub')}</a></div></aside></div></div>
  </>;
}
