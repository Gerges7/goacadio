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
  {url:'/quiz-generator',emoji:'📝',name:'PDF Quiz Generator',ar:'حوّل محاضرات PDF النصية لأسئلة تدريبية مع تصحيح',en:'Generate and grade practice quizzes from text-based lecture PDFs',status:true},
  {url:'/ai-study',emoji:'🧠',name:'AI Study Assistant',ar:'شرح المفاهيم وأسئلة تدريبية من موادك بعد تسجيل الدخول',en:'Study explanations and practice questions for signed-in students',status:true},
  {url:'/dashboard',emoji:'🎯',name:'Student Dashboard',ar:'سجل جامعتك وموادك داخل المتصفح',en:'Create a local study profile and track courses',status:true},
];
export default function Tools() {
  const { text } = useLocale();
  return <><div className="page-hero"><div className="container"><span className="section-kicker">TOOLS</span><h1>{text('أدوات الطالب الجامعي', 'University student tools')}</h1><p>{text('الأدوات الأساسية بدون حساب، وميزات الذكاء الاصطناعي تحتاج تسجيل دخول.', 'Core tools work without signup; AI features require a student account.')}</p></div></div><div className="page-content"><div className="container"><div className="tool-list">{list.map(x=><Link className="feature-card" to={x.url} key={x.name}><div className="feature-icon">{x.emoji}</div><h3>{x.name}</h3><p>{text(x.ar,x.en)}</p><div className="card-bottom"><span>{text('التفاصيل ←','Explore →')}</span><span className={'tag '+(x.status?'green':'orange')}>{text('متاحة','Available')}</span></div></Link>)}</div></div></div></>;
}
