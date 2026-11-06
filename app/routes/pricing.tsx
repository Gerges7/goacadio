import { Link } from 'react-router';
import type { MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
export const meta:MetaFunction=()=>[{title:'GoAcadio Services & Free Tools'},{name:'robots',content:'noindex,follow'}];
export default function Pricing(){
  const {text}=useLocale();
  return <><div className="page-hero"><div className="container"><span className="section-kicker">GOACADIO</span><h1>{text('أدوات مجانية ومساعدة أكاديمية','Free tools & academic support')}</h1></div></div>
    <div className="page-content"><div className="container pricing-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
      <section className="price-card"><h2>{text('أدوات مجانية','Free tools')}</h2><p>{text('حساب GPA وCGPA، مؤقت التركيز، وإنشاء CV.','GPA / CGPA calculator, focus timer, and CV builder.')}</p><Link className="btn btn-primary" to="/tools">{text('تصفح الأدوات','Browse tools')}</Link></section>
      <section className="price-card"><h2>{text('مساعدة أكاديمية','Academic support')}</h2><p>{text('تقديم طلب شرح أو مراجعة كود أو إرشاد مشروع.','Request tutoring, code review, or project mentoring.')}</p><Link className="btn btn-outline" to="/services">{text('تقديم طلب','Send inquiry')}</Link></section>
    </div></div></>;
}
