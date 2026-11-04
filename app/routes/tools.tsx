import type { MetaFunction } from 'react-router';
export const meta: MetaFunction = () => [
  { title: 'Free Student Tools | GoAcadio' },
  { name: 'description', content: 'Discover GPA and CGPA calculators, focus timer and CV builder — use GoAcadio tools for free.' },
  { name: 'robots', content: 'noindex, follow' },
];
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
const list = [
  {url:'/tools/gpa-calculator',emoji:'🎓',name:'GPA & CGPA Calculator',ar:'حساب المعدل الفصلي والتراكمي من الدرجات والساعات',en:'Weighted semester and cumulative GPA calculator',status:true},
  {url:'/tools/focus-timer',emoji:'⏱️',name:'Focus Mode',ar:'جلسات بومودورو وإحصائيات مذاكرة محلية',en:'Pomodoro sessions with local progress tracking',status:true},
  {url:'/tools/cv-builder',emoji:'📄',name:'CV Builder',ar:'بناء CV بسيط وقابل للطباعة PDF',en:'Build a simple CV and print to PDF',status:true},
  {url:'/dashboard',emoji:'🎯',name:'Student Dashboard',ar:'سجل جامعتك وموادك داخل المتصفح',en:'Create a local study profile and track courses',status:true},
];
export default function Tools() {
  const { text } = useLocale();
  return <><div className="page-hero"><div className="container"><span className="section-kicker">TOOLS</span><h1>{text('أدوات الطالب الجامعي', 'University student tools')}</h1><p>{text('استخدم الأدوات المجانية بدون إنشاء حساب.', 'Use the free tools without creating an account.')}</p></div></div><div className="page-content"><div className="container"><div className="tool-list">{list.map(x=><Link className="feature-card" to={x.url} key={x.name}><div className="feature-icon">{x.emoji}</div><h3>{x.name}</h3><p>{text(x.ar,x.en)}</p><div className="card-bottom"><span>{text('التفاصيل ←','Explore →')}</span><span className={'tag '+(x.status?'green':'orange')}>{text('متاحة','Available')}</span></div></Link>)}</div></div></div></>;
}
