import { useEffect, useMemo, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { saveLocal, storageKeys } from '@/lib/storage';
import {
  FOUR_POINT_A_PLUS, FOUR_POINT_STANDARD, GRADING_SYSTEMS, getGrades, gradeFromPercentage, overallGradeForFourPointAPlus,
  type GradeSystem, type GradeEntry,
} from '@/lib/grading';

export const meta: MetaFunction = () => [
  { title: 'GPA & CGPA Calculator — Multiple Grading Scales | GoAcadio' },
  { name: 'description', content: 'Calculate GPA and CGPA with selectable grading scales and configurable grade points.' },
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
  const [system,setSystem]=useState<GradeSystem>('four-point-standard');
  const [customMax,setCustomMax]=useState(4);
  const [customGrades,setCustomGrades]=useState<GradeEntry[]>(FOUR_POINT_STANDARD.map(g=>({...g})));
  const [entryMode,setEntryMode]=useState<EntryMode>('letter');
  const [previousGpa,setPreviousGpa]=useState('');
  const [previousCredits,setPreviousCredits]=useState('');
  const [ready,setReady]=useState(false);
  const scale=getGrades(system,customGrades);
  const maxPoints=system==='custom'?customMax:4;

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
        const chosen=saved.system;
        if(chosen==='mti'||chosen==='four-point-a-plus') setSystem('four-point-a-plus');
        else if(chosen==='custom') setSystem('custom');
        if((chosen==='mti'||chosen==='four-point-a-plus')&&saved.entryMode==='percent') setEntryMode('percent');
        if(typeof saved.customMax==='number'&&Number.isFinite(saved.customMax)&&saved.customMax>=1&&saved.customMax<=100) setCustomMax(saved.customMax);
        if(Array.isArray(saved.customGrades)){
          const cleaned=saved.customGrades.filter((g):g is GradeEntry=>!!g&&typeof g==='object'&&typeof g.grade==='string'&&typeof g.points==='number'&&Number.isFinite(g.points))
            .slice(0,30).map(g=>({grade:g.grade.slice(0,16),points:g.points}));
          if(cleaned.length) setCustomGrades(cleaned);
        }
      }
    } catch { /* Browsers with localStorage disabled use defaults. */ }
    setReady(true);
  },[]);
  useEffect(()=>{
    if(ready) saveLocal(draftKey,{rows,previousGpa,previousCredits,system,entryMode,customMax,customGrades});
  },[rows,previousGpa,previousCredits,system,entryMode,customMax,customGrades,ready]);

  const customValid=customMax>=1&&customMax<=100&&Number.isFinite(customMax)&&customGrades.length>0&&customGrades.every(g=>g.grade.trim().length>0&&Number.isFinite(g.points)&&g.points>=0&&g.points<=customMax)
    &&new Set(customGrades.map(g=>g.grade.trim().toLowerCase())).size===customGrades.length;

  const calc=useMemo(()=>{
    const valid=rows.flatMap(row=>{
      const credits=Number(row.credits);
      if(row.credits.trim()===''||!Number.isFinite(credits)||credits<=0||credits>12)return [];
      if(system==='custom' && !customGrades.length) return [];
      const grade=system==='four-point-a-plus'&&entryMode==='percent'
        ? row.percent?.trim()!=='' && row.percent!==undefined ? gradeFromPercentage(Number(row.percent)) : null
        : scale.find(x=>x.grade===row.grade&&Number.isFinite(x.points)&&x.points>=0&&x.points<=maxPoints)??null;
      if(!grade || (system==='custom' && !customValid))return [];
      return [{credits,points:grade.points}];
    });
    const credits=valid.reduce((sum,item)=>sum+item.credits,0);
    const total=valid.reduce((sum,item)=>sum+item.credits*item.points,0);
    const semester=credits>0?total/credits:null;
    const prevC=Number(previousCredits),prevG=Number(previousGpa);
    const hasPrevious=previousCredits.trim()!==''&&previousGpa.trim()!==''&&Number.isFinite(prevC)&&Number.isFinite(prevG)&&prevC>=0&&prevG>=0&&prevG<=maxPoints;
    const cumulative=hasPrevious&&credits+prevC>0?(total+prevG*prevC)/(credits+prevC):null;
    return {semester,cumulative,credits,validCount:valid.length,invalidCount:rows.length-valid.length};
  },[rows,system,entryMode,scale,maxPoints,customValid,previousGpa,previousCredits]);

  function update(id:number,field:keyof Row,value:string){
    setRows(old=>old.map(row=>row.id===id?{...row,[field]:value}:row));
  }
  function changeSystem(next:GradeSystem){
    setSystem(next);
    if(next!=='four-point-a-plus') setEntryMode('letter');
    const nextGrades=getGrades(next,customGrades);
    setRows(old=>old.map(row=>nextGrades.some(g=>g.grade===row.grade)?row:{...row,grade:nextGrades[0]?.grade??'A'}));
  }
  function saveResult(){
    saveLocal(storageKeys.gpa,{
      semester:calc.semester,cumulative:calc.cumulative,credits:calc.credits,
      gradingSystem:system,updatedAt:new Date().toISOString(),
    });
    window.alert(text('اتحفظت آخر نتيجة على الجهاز ده.','Latest result saved in this browser.'));
  }
  const overall=system==='four-point-a-plus'&&calc.cumulative!==null?overallGradeForFourPointAPlus(calc.cumulative):null;
  function updateCustomGrade(index:number,field:'grade'|'points',value:string){
    if(field==='grade'){
      const oldGrade=customGrades[index]?.grade;
      if(oldGrade!==undefined) setRows(old=>old.map(row=>row.grade===oldGrade?{...row,grade:value.slice(0,16)}:row));
    }
    setCustomGrades(old=>old.map((g,i)=>i!==index?g:{...g,[field]:field==='grade'?value.slice(0,16):value.trim()===''?NaN:Number(value)}));
  }

  return <>
    <div className="page-hero"><div className="container"><span className="section-kicker">ACADEMIC TOOLS</span><h1>GPA & CGPA Calculator 🎓</h1><p>{text('احسب المعدل الفصلي والتراكمي بالساعات المعتمدة، واختار نظام التقدير المناسب لجامعتك.','Calculate credit-weighted semester and cumulative GPA using the right grading scale for your institution.')}</p></div></div>
    <div className="page-content"><div className="container two-col"><div className="panel">
      <h2 className="panel-title">{text('نظام التقديرات','Grading system')}</h2>
      <div className="field" style={{marginBottom:16}}>
        <label htmlFor="grading-system">{text('اختار السلم','Choose scale')}</label>
        <select id="grading-system" className="input" value={system} onChange={e=>changeSystem(e.target.value as GradeSystem)}>
          {GRADING_SYSTEMS.map(item=><option value={item.id} key={item.id}>{text(item.ar,item.en)}</option>)}
        </select>
      </div>
      {system==='four-point-a-plus'&&<div className="field" style={{marginBottom:16}}>
        <label htmlFor="entry-mode">{text('طريقة إدخال النتيجة','Enter results as')}</label>
        <select id="entry-mode" className="input" value={entryMode} onChange={e=>setEntryMode(e.target.value as EntryMode)}>
          <option value="letter">{text('تقدير المادة (A+، A، B+...)','Letter grades (A+, A, B+...)')}</option>
          <option value="percent">{text('النسبة المئوية (من 0 إلى 100)','Percentage (0 to 100)')}</option>
        </select>
      </div>}
      {system==='custom'&&<section className="panel" style={{marginBottom:20,padding:16}}>
        <h3 className="panel-title">{text('تحديد نقاط التقديرات','Set grade points')}</h3>
        <div className="field" style={{marginBottom:12}}><label htmlFor="custom-max">{text('الحد الأقصى للمعدل','Maximum GPA')}</label>
          <input id="custom-max" className="input" type="number" min={1} max={100} step="0.1" value={customMax||''} onChange={e=>setCustomMax(Number(e.target.value))}/>
          <p className="inline-help">{text('زي 4.0 أو 4.3 أو 5.0 أو 10.0 حسب جامعتك.','For example, 4.0, 4.3, 5.0 or 10.0 based on your institution.')}</p></div>
        {customGrades.map((g,i)=><div key={i} className="form-grid" style={{marginBottom:8,gridTemplateColumns:'1fr 1fr auto'}}>
          <input className="input" aria-label={`Grade label ${i+1}`} value={g.grade} maxLength={16} onChange={e=>updateCustomGrade(i,'grade',e.target.value)}/>
          <input className="input" aria-label={`Grade points ${i+1}`} type="number" min="0" max={customMax} step="0.01" value={Number.isFinite(g.points)?g.points:''} onChange={e=>updateCustomGrade(i,'points',e.target.value)}/>
          <button type="button" className="small-btn danger-btn" aria-label={text('حذف التقدير','Remove grade')} onClick={()=>setCustomGrades(old=>old.filter((_,j)=>j!==i))}>×</button>
        </div>)}
        <button type="button" className="small-btn" disabled={customGrades.length>=30} onClick={()=>setCustomGrades(old=>[...old,{grade:'',points:0}])}>＋ {text('إضافة تقدير','Add grade')}</button>
        {!customValid&&<p className="note warn">{text('كل تقدير يحتاج اسمًا مختلفًا ونقاطًا من الصفر حتى الحد الأقصى.','Each grade needs a unique name and points between zero and the maximum.')}</p>}
      </section>}
      <h2 className="panel-title">{text('مواد الفصل الحالي','Current semester courses')}</h2>
      <p className="panel-description">{text('اختار السلم اللي بيطابق لائحة جامعتك، أو حدد نقاط التقديرات بنفسك من السلم المخصص.','Choose the scale matching your institution or set your own grade points.')}</p>
      <div className="course-grid" style={{marginBottom:6}}>
        <div className="inline-help">{text('المادة','Course')}</div>
        <div className="inline-help">{text('الساعات','Credits')}</div>
        <div className="inline-help">{system==='four-point-a-plus'&&entryMode==='percent'?text('الدرجة %','Score %'):text('التقدير','Grade')}</div><div/>
      </div>
      {rows.map(row=>{
        const autoGrade=system==='four-point-a-plus'&&entryMode==='percent'&&row.percent?.trim()!==''&&row.percent!==undefined ? gradeFromPercentage(Number(row.percent)):null;
        return <div className="course-grid" key={row.id}>
          <input className="input" aria-label="Course name" placeholder={text('اسم المادة','Course name')} value={row.name} onChange={e=>update(row.id,'name',e.target.value)}/>
          <input className="input" aria-label="Credits" type="number" min="0.5" max="12" step="0.5" value={row.credits} onChange={e=>update(row.id,'credits',e.target.value)}/>
          {system==='four-point-a-plus'&&entryMode==='percent'
            ? <div><input className="input" aria-label="Score percent" type="number" min="0" max="100" step="0.01" value={row.percent??''} onChange={e=>update(row.id,'percent',e.target.value)} placeholder="85"/>
                <div className="inline-help">{autoGrade?`${autoGrade.grade} (${autoGrade.points.toFixed(1)})`:row.percent?.trim()?text('درجة غير صالحة','Invalid score'):'—'}</div></div>
            : <select className="input" aria-label="Grade" value={scale.some(g=>g.grade===row.grade)?row.grade:''} onChange={e=>update(row.id,'grade',e.target.value)}><option value="" disabled>{text('اختار التقدير','Choose grade')}</option>{scale.map(({grade,points,minimumPercent},i)=><option key={grade} value={grade}>{grade} ({points.toFixed(2)}){system==='four-point-a-plus'?` · ${minimumPercent}%${i===0?'+':''}`:''}</option>)}</select>}
          <button type="button" className="small-btn danger-btn" aria-label="Remove course" title={text('حذف','Remove')} onClick={()=>setRows(old=>old.filter(x=>x.id!==row.id))}>×</button>
        </div>;
      })}
      <div className="toolbar"><button className="small-btn" type="button" onClick={()=>setRows(old=>[...old,{id:Math.max(0,...old.map(x=>x.id))+1,name:'',credits:'3',grade:'A',percent:''}])}>＋ {text('إضافة مادة','Add course')}</button><button className="small-btn" type="button" onClick={()=>setRows(initial)}>{text('إعادة المواد الافتراضية','Reset rows')}</button></div>
      {calc.invalidCount>0&&<p className="inline-help">{text('لن تُحسب المادة إذا كانت الساعات أو الدرجة غير صالحة، أو لم تُدخل الدرجة بعد.','Courses with invalid/missing credits or grades are excluded.')}</p>}
      {system==='four-point-a-plus'&&<details style={{margin:'15px 0'}}><summary style={{cursor:'pointer',fontWeight:700}}>{text('عرض جدول درجات هذا السلم','Show grading table for this scale')}</summary>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:13,borderCollapse:'collapse',marginTop:12}}><thead><tr><th>{text('التقدير','Grade')}</th><th>{text('الدرجة من','Score from')}</th><th>{text('النقاط','Points')}</th></tr></thead><tbody>{FOUR_POINT_A_PLUS.map((grade)=><tr key={grade.grade}><td>{grade.grade}</td><td>{grade.minimumPercent===95?'95–100%':grade.grade==='F'?'< 50%':`${grade.minimumPercent}%–<${FOUR_POINT_A_PLUS[FOUR_POINT_A_PLUS.indexOf(grade)-1].minimumPercent}%`}</td><td>{grade.points.toFixed(1)}</td></tr>)}</tbody></table></div>
      </details>}
      <hr style={{border:0,borderTop:'1px solid #e7eaf2',margin:'25px 0'}}/>
      <h2 className="panel-title">{text('بيانات التراكمي السابق (اختياري)','Previous cumulative GPA (optional)')}</h2>
      <div className="form-grid"><div className="field"><label htmlFor="previous-gpa">{text(`CGPA السابق (0–${maxPoints})`,`Previous CGPA (0–${maxPoints})`)}</label><input className="input" id="previous-gpa" type="number" min="0" max={maxPoints} step="0.01" value={previousGpa} onChange={e=>setPreviousGpa(e.target.value)} placeholder="3.25"/></div><div className="field"><label htmlFor="previous-credits">{text('الساعات السابقة','Previous credits')}</label><input className="input" id="previous-credits" type="number" min="0" step="0.5" value={previousCredits} onChange={e=>setPreviousCredits(e.target.value)} placeholder="60"/></div></div>
      <p className="inline-help">{text('اكتب CGPA والساعات السابقة بدون ساعات الفصل الحالي.','Exclude this semester when entering previous cumulative credits.')}</p>
      <div className="note warn">{text('⚠️ سياسات التقديرات والإعادة بتختلف من جامعة للتانية حتى لو نفس سلم النقاط. الحساب لا يطبق قواعد الإعادة تلقائيًا.','⚠️ Grading and retake policies may differ even when institutions use the same point scale. Retake rules are not applied automatically.')}</div>
    </div>
    <aside className="panel"><h2 className="panel-title center">{text('نتيجتك','Your result')}</h2>
      <div className="result-label">{text('المعدل الفصلي (GPA)','Semester GPA')}</div><div className="result-number">{calc.semester===null?'—':calc.semester.toFixed(2)}</div>
      <div className="metric-row"><div className="metric-card"><strong>{calc.credits.toFixed(1)}</strong><span>{text('ساعات الفصل','Semester credits')}</span></div><div className="metric-card"><strong>{calc.validCount}</strong><span>{text('مواد محتسبة','Included courses')}</span></div></div>
      <div className="note" style={{marginTop:17,textAlign:'center'}}><b>{text('CGPA الجديد','New CGPA')}</b><div style={{fontSize:35,fontWeight:800,color:'#5952dc',lineHeight:1.6,direction:'ltr'}}>{calc.cumulative===null?'—':calc.cumulative.toFixed(2)}</div>
        {calc.cumulative===null&&<span>{text('أدخل المعدل والساعات السابقة لعرض التراكمي.','Enter previous GPA and credits for cumulative GPA.')}</span>}
        {overall&&<div><strong>{lang==='ar'?overall.ar:overall.en}</strong></div>}
      </div>
      <div className="actions"><button className="btn btn-primary" onClick={saveResult} disabled={calc.semester===null}>{text('احفظ النتيجة على جهازك','Save in browser')}</button><Link className="btn" to="/dashboard">{text('لوحة الطالب','Student Hub')}</Link></div>
      {system==='four-point-a-plus'&&<p className="inline-help" style={{marginTop:16}}>{text('التقدير العام مأخوذ من جدول هذا السلم وقد تختلف المسميات حسب الجامعة.','Overall GPA classification uses this scale’s table; institutions may differ.')}</p>}
    </aside></div></div>
  </>;
}
