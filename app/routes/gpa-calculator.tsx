import { useEffect, useMemo, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { saveLocal, storageKeys } from '@/lib/storage';
import {
  MTI_GRADES, getGrades, gradeFromPercentage, mtiOverallGrade,
  type GradeSystem,
} from '@/lib/grading';

export const meta: MetaFunction = () => [
  { title: 'GPA & CGPA Calculator — MTI & General | GoAcadio' },
  { name: 'description', content: 'Credit-weighted GPA and CGPA calculator with an MTI grading-system option, percentages, and an illustrative general 4.0 scale.' },
  { name: 'robots', content: 'noindex, follow' },
];

type Row = { id:number; name:string; credits:string; grade:string; percent?:string };
type EntryMode = 'letter' | 'percent';
const draftKey='goacadio:v1:gpa:draft';
const initial:Row[]=[
  {id:1,name:'',credits:'3',grade:'A',percent:''},
  {id:2,name:'',credits:'3',grade:'B+',percent:''},
  {id:3,name:'',credits:'3',grade:'B',percent:''},
];

export default function Gpa() {
  const {text,lang}=useLocale();
  const [rows,setRows]=useState<Row[]>(initial);
  const [system,setSystem]=useState<GradeSystem>('general-example');
  const [entryMode,setEntryMode]=useState<EntryMode>('letter');
  const [previousGpa,setPreviousGpa]=useState('');
  const [previousCredits,setPreviousCredits]=useState('');
  const [ready,setReady]=useState(false);
  const scale=getGrades(system);

  useEffect(()=>{
    try {
      const stored=localStorage.getItem(draftKey);
      if(stored) {
        const saved=JSON.parse(stored) as Record<string,unknown>;
        if(Array.isArray(saved.rows) && saved.rows.length) {
          const safe=saved.rows.filter((x):x is Row=>!!x&&typeof x==='object'&&typeof x.id==='number'&&typeof x.credits==='string'&&typeof x.grade==='string')
            .slice(0,60).map(x=>({id:x.id,name:String(x.name??''),credits:x.credits,grade:x.grade,percent:typeof x.percent==='string'?x.percent:''}));
          if(safe.length) setRows(safe);
        }
        setPreviousGpa(typeof saved.previousGpa==='string'?saved.previousGpa:'');
        setPreviousCredits(typeof saved.previousCredits==='string'?saved.previousCredits:'');
        if(saved.system==='mti') setSystem('mti');
        if(saved.system==='mti'&&saved.entryMode==='percent') setEntryMode('percent');
      }
    } catch { /* Browsers with localStorage disabled use defaults. */ }
    setReady(true);
  },[]);
  useEffect(()=>{
    if(ready) saveLocal(draftKey,{rows,previousGpa,previousCredits,system,entryMode});
  },[rows,previousGpa,previousCredits,system,entryMode,ready]);

  const calc=useMemo(()=>{
    const valid=rows.flatMap(row=>{
      const credits=Number(row.credits);
      if(row.credits.trim()===''||!Number.isFinite(credits)||credits<=0||credits>12)return [];
      const grade=system==='mti'&&entryMode==='percent'
        ? row.percent?.trim()!=='' && row.percent!==undefined ? gradeFromPercentage(Number(row.percent)) : null
        : scale.find(x=>x.grade===row.grade)??null;
      if(!grade)return [];
      return [{credits,points:grade.points}];
    });
    const credits=valid.reduce((sum,item)=>sum+item.credits,0);
    const total=valid.reduce((sum,item)=>sum+item.credits*item.points,0);
    const semester=credits>0?total/credits:null;
    const prevC=Number(previousCredits),prevG=Number(previousGpa);
    const hasPrevious=previousCredits.trim()!==''&&previousGpa.trim()!==''&&Number.isFinite(prevC)&&Number.isFinite(prevG)&&prevC>=0&&prevG>=0&&prevG<=4;
    const cumulative=hasPrevious&&credits+prevC>0?(total+prevG*prevC)/(credits+prevC):null;
    return {semester,cumulative,credits,validCount:valid.length,invalidCount:rows.length-valid.length};
  },[rows,system,entryMode,scale,previousGpa,previousCredits]);

  function update(id:number,field:keyof Row,value:string){
    setRows(old=>old.map(row=>row.id===id?{...row,[field]:value}:row));
  }
  function changeSystem(next:GradeSystem){
    setSystem(next);
    if(next!=='mti'){
      setEntryMode('letter');
      setRows(old=>old.map(row=>row.grade==='A+'?{...row,grade:'A'}:row));
    }
  }
  function saveResult(){
    saveLocal(storageKeys.gpa,{
      semester:calc.semester,cumulative:calc.cumulative,credits:calc.credits,
      gradingSystem:system,updatedAt:new Date().toISOString(),
    });
    window.alert(text('اتحفظت آخر نتيجة على الجهاز ده.','Latest result saved in this browser.'));
  }
  const overall=system==='mti'&&calc.cumulative!==null?mtiOverallGrade(calc.cumulative):null;

  return <>
    <div className="page-hero"><div className="container"><span className="section-kicker">ACADEMIC TOOLS</span><h1>GPA & CGPA Calculator 🎓</h1><p>{text('احسب المعدل الفصلي والتراكمي بالساعات المعتمدة، واختار نظام التقدير المناسب لجامعتك.','Calculate credit-weighted semester and cumulative GPA using the right grading scale for your institution.')}</p></div></div>
    <div className="page-content"><div className="container two-col"><div className="panel">
      <h2 className="panel-title">{text('نظام التقديرات','Grading system')}</h2>
      <div className="field" style={{marginBottom:16}}>
        <label htmlFor="grading-system">{text('اختار السلم','Choose scale')}</label>
        <select id="grading-system" className="input" value={system} onChange={e=>changeSystem(e.target.value as GradeSystem)}>
          <option value="general-example">{text('سلم 4.0 عام (مثال توضيحي)','General 4.0 example (illustrative)')}</option>
          <option value="mti">{text('جامعة MTI — السلم الموجود باللائحة','MTI University — provided grading table')}</option>
        </select>
      </div>
      {system==='mti'&&<div className="field" style={{marginBottom:16}}>
        <label htmlFor="entry-mode">{text('طريقة إدخال النتيجة','Enter results as')}</label>
        <select id="entry-mode" className="input" value={entryMode} onChange={e=>setEntryMode(e.target.value as EntryMode)}>
          <option value="letter">{text('تقدير المادة (A+، A، B+...)','Letter grades (A+, A, B+...)')}</option>
          <option value="percent">{text('النسبة المئوية (من 0 إلى 100)','Percentage (0 to 100)')}</option>
        </select>
      </div>}
      <h2 className="panel-title">{text('مواد الفصل الحالي','Current semester courses')}</h2>
      <p className="panel-description">{system==='mti'
        ? text('النقاط وحدود النسب من صور لائحة MTI التي تم توفيرها. راجع كشف درجاتك الرسمي عند الحاجة.','Points and score thresholds are transcribed from the supplied MTI regulations images. Verify against your official transcript when needed.')
        : text('السلم العام مثال توضيحي فقط، وقد يختلف عن نظام جامعتك.','This general scale is illustrative and may differ from your university.')}</p>
      <div className="course-grid" style={{marginBottom:6}}>
        <div className="inline-help">{text('المادة','Course')}</div>
        <div className="inline-help">{text('الساعات','Credits')}</div>
        <div className="inline-help">{system==='mti'&&entryMode==='percent'?text('الدرجة %','Score %'):text('التقدير','Grade')}</div><div/>
      </div>
      {rows.map(row=>{
        const autoGrade=system==='mti'&&entryMode==='percent'&&row.percent?.trim()!==''&&row.percent!==undefined ? gradeFromPercentage(Number(row.percent)):null;
        return <div className="course-grid" key={row.id}>
          <input className="input" aria-label="Course name" placeholder={text('اسم المادة','Course name')} value={row.name} onChange={e=>update(row.id,'name',e.target.value)}/>
          <input className="input" aria-label="Credits" type="number" min="0.5" max="12" step="0.5" value={row.credits} onChange={e=>update(row.id,'credits',e.target.value)}/>
          {system==='mti'&&entryMode==='percent'
            ? <div><input className="input" aria-label="Score percent" type="number" min="0" max="100" step="0.01" value={row.percent??''} onChange={e=>update(row.id,'percent',e.target.value)} placeholder="85"/>
                <div className="inline-help">{autoGrade?`${autoGrade.grade} (${autoGrade.points.toFixed(1)})`:row.percent?.trim()?text('درجة غير صالحة','Invalid score'):'—'}</div></div>
            : <select className="input" aria-label="Grade" value={scale.some(g=>g.grade===row.grade)?row.grade:'A'} onChange={e=>update(row.id,'grade',e.target.value)}>{scale.map(({grade,points,minimumPercent},i)=><option key={grade} value={grade}>{grade} ({points.toFixed(2)}){system==='mti'?` · ${minimumPercent}%${i===0?'+':''}`:''}</option>)}</select>}
          <button type="button" className="small-btn danger-btn" aria-label="Remove course" title={text('حذف','Remove')} onClick={()=>setRows(old=>old.filter(x=>x.id!==row.id))}>×</button>
        </div>;
      })}
      <div className="toolbar"><button className="small-btn" type="button" onClick={()=>setRows(old=>[...old,{id:Math.max(0,...old.map(x=>x.id))+1,name:'',credits:'3',grade:'A',percent:''}])}>＋ {text('إضافة مادة','Add course')}</button><button className="small-btn" type="button" onClick={()=>setRows(initial)}>{text('إعادة المواد الافتراضية','Reset rows')}</button></div>
      {calc.invalidCount>0&&<p className="inline-help">{text('لن تُحسب المادة إذا كانت الساعات أو الدرجة غير صالحة، أو لم تُدخل الدرجة بعد.','Courses with invalid/missing credits or grades are excluded.')}</p>}
      {system==='mti'&&<details style={{margin:'15px 0'}}><summary style={{cursor:'pointer',fontWeight:700}}>{text('عرض جدول تقديرات MTI','Show MTI grading table')}</summary>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:13,borderCollapse:'collapse',marginTop:12}}><thead><tr><th>{text('التقدير','Grade')}</th><th>{text('الدرجة من','Score from')}</th><th>{text('النقاط','Points')}</th></tr></thead><tbody>{MTI_GRADES.map((grade)=><tr key={grade.grade}><td>{grade.grade}</td><td>{grade.minimumPercent===95?'95–100%':grade.grade==='F'?'< 50%':`${grade.minimumPercent}%–<${MTI_GRADES[MTI_GRADES.indexOf(grade)-1].minimumPercent}%`}</td><td>{grade.points.toFixed(1)}</td></tr>)}</tbody></table></div>
      </details>}
      <hr style={{border:0,borderTop:'1px solid #e7eaf2',margin:'25px 0'}}/>
      <h2 className="panel-title">{text('بيانات التراكمي السابق (اختياري)','Previous cumulative GPA (optional)')}</h2>
      <div className="form-grid"><div className="field"><label htmlFor="previous-gpa">{text('CGPA السابق (0–4)','Previous CGPA (0–4)')}</label><input className="input" id="previous-gpa" type="number" min="0" max="4" step="0.01" value={previousGpa} onChange={e=>setPreviousGpa(e.target.value)} placeholder="3.25"/></div><div className="field"><label htmlFor="previous-credits">{text('الساعات السابقة','Previous credits')}</label><input className="input" id="previous-credits" type="number" min="0" step="0.5" value={previousCredits} onChange={e=>setPreviousCredits(e.target.value)} placeholder="60"/></div></div>
      <p className="inline-help">{text('اكتب CGPA والساعات السابقة بدون ساعات الفصل الحالي.','Exclude this semester when entering previous cumulative credits.')}</p>
      <div className="note warn">{system==='mti'
        ? text('وفق الصورة المقدمة، المقرر المعاد بعد الرسوب له حد أقصى D+ (2.2) بعد النجاح. الحاسبة لا تطبق إعادة حساب الساعات أو استبدال درجات الإعادة تلقائيًا.','Per the supplied policy image, a passed retake after failure is capped at D+ (2.2). Automatic retake/replacement calculations are not implemented.')
        : text('⚠️ تختلف سياسات التقدير والإعادة بين الجامعات. النتيجة تقديرية وليست كشف درجات رسميًا.','⚠️ University grading and retake rules vary. Results are estimates, not official transcripts.')}</div>
    </div>
    <aside className="panel"><h2 className="panel-title center">{text('نتيجتك','Your result')}</h2>
      <div className="result-label">{text('المعدل الفصلي (GPA)','Semester GPA')}</div><div className="result-number">{calc.semester===null?'—':calc.semester.toFixed(2)}</div>
      <div className="metric-row"><div className="metric-card"><strong>{calc.credits.toFixed(1)}</strong><span>{text('ساعات الفصل','Semester credits')}</span></div><div className="metric-card"><strong>{calc.validCount}</strong><span>{text('مواد محتسبة','Included courses')}</span></div></div>
      <div className="note" style={{marginTop:17,textAlign:'center'}}><b>{text('CGPA الجديد','New CGPA')}</b><div style={{fontSize:35,fontWeight:800,color:'#5952dc',lineHeight:1.6,direction:'ltr'}}>{calc.cumulative===null?'—':calc.cumulative.toFixed(2)}</div>
        {calc.cumulative===null&&<span>{text('أدخل المعدل والساعات السابقة لعرض التراكمي.','Enter previous GPA and credits for cumulative GPA.')}</span>}
        {overall&&<div><strong>{lang==='ar'?overall.ar:overall.en}</strong></div>}
      </div>
      <div className="actions"><button className="btn btn-primary" onClick={saveResult} disabled={calc.semester===null}>{text('احفظ النتيجة على جهازك','Save in browser')}</button><Link className="btn" to="/dashboard">{text('لوحة الطالب','Student Hub')}</Link></div>
      {system==='mti'&&<p className="inline-help" style={{marginTop:16}}>{text('وصف التقدير العام يعتمد على CGPA حسب الجدول المرفق.','Overall classification uses CGPA per the supplied table.')}</p>}
    </aside></div></div>
  </>;
}
