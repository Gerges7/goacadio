import { useEffect, useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type University = {id:string;name_en:string;name_ar:string|null;country_code:string};
export const meta: MetaFunction = () => [
  { title: 'Universities | GoAcadio' },
  { name: 'description', content: 'Select your university and personalize your academic workspace with GoAcadio.' },
  { name: 'robots', content: 'noindex, follow' },
];
export default function Universities(){
  const {text,lang}=useLocale();
  const [unis,setUnis]=useState<University[]>([]);
  const [loading,setLoading]=useState(isSupabaseConfigured);
  const [country,setCountry]=useState('EG');
  useEffect(()=>{
    const client=getSupabase();if(!client){setLoading(false);return;}
    let active=true;setLoading(true);
    void client.from('universities').select('id,name_en,name_ar,country_code').eq('country_code',country).order('name_en').then(({data})=>{if(active){setUnis((data??[]) as University[]);setLoading(false);}});
    return ()=>{active=false;};
  },[country]);
  return <><div className="page-hero"><div className="container"><span className="section-kicker">UNIVERSITIES</span><h1>{text('جامعتك، تجربتك 🎓','Your university, your workspace 🎓')}</h1><p>{text('اختار جامعتك من القائمة أو أدخل بياناتها بنفسك في حسابك.', 'Select a listed university, or enter your institution manually in your profile.')}</p></div></div>
    <div className="page-content"><div className="container stack"><section className="panel"><div className="toolbar"><h2 className="panel-title">{text('دليل الجامعات','University directory')}</h2><div className="field"><label>{text('الدولة','Country')}</label><select className="input" value={country} onChange={e=>setCountry(e.target.value)}><option value="EG">🇪🇬 Egypt</option><option value="SA">🇸🇦 Saudi Arabia</option></select></div></div>
      {loading?<div className="placeholder">{text('جاري تحميل الجامعات...','Loading universities...')}</div>:unis.length?<div className="universities-grid">{unis.map(x=><div key={x.id} className="university-tile"><h3>{lang==='ar'&&x.name_ar?x.name_ar:x.name_en}</h3><p>{text('يمكنك تخصيص ملفك الدراسي من لوحة الطالب.', 'Personalize your student profile from the dashboard.')}</p></div>)}</div>:<div className="placeholder">{text('لا توجد جامعات منشورة لهذه الدولة حاليًا. تقدر تدخل بيانات جامعتك يدويًا من حسابك.', 'No verified entries published here yet. You can enter your university manually in your profile.')}</div>}
    </section><div className="actions"><Link to="/dashboard" className="btn btn-primary">{text('لوحة الطالب','Student dashboard')}</Link></div></div></div></>;
}
