import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
const list = [
  {url:'/tools/gpa-calculator',emoji:'🎓',name:'GPA & CGPA Calculator',ar:'حساب المعدل الفصلي والتراكمي من الدرجات والساعات',en:'Weighted semester and cumulative GPA calculator',status:true},
  {url:'/tools/focus-timer',emoji:'⏱️',name:'Focus Mode',ar:'جلسات بومودورو وإحصائيات مذاكرة محلية',en:'Pomodoro sessions with local progress tracking',status:true},
  {url:'/tools/cv-builder',emoji:'📄',name:'CV Builder',ar:'بناء CV بسيط وقابل للطباعة PDF',en:'Build a simple CV and print to PDF',status:true},
  {url:'/dashboard',emoji:'🎯',name:'Student Dashboard',ar:'سجل جامعتك وموادك داخل المتصفح',en:'Create a local study profile and track courses',status:true},
  {url:'/roadmap',emoji:'🤖',name:'AI Study Assistant',ar:'شرح المواد باستخدام ملفات الطالب — مخطط له',en:'Source-grounded AI tutoring — planned',status:false},
  {url:'/roadmap',emoji:'📝',name:'PDF Quiz Generator',ar:'اختبارات من المحاضرات — مخطط له',en:'Study quizzes generated from PDFs — planned',status:false},
];
export default function Tools() {
  const { text } = useLocale();
  return <><div className="page-hero"><div className="container"><span className="section-kicker">TOOLS</span><h1>{text('أدوات الطالب الجامعي', 'University student tools')}</h1><p>{text('استخدم الأدوات المتاحة مجانًا، بدون إنشاء حساب. الأدوات القادمة موضّح حالتها بوضوح.', 'Use available tools free, no account required. Planned tools are clearly marked.')}</p></div></div><div className="page-content"><div className="container"><div className="tool-list">{list.map(x=><Link className="feature-card" to={x.url} key={x.name}><div className="feature-icon">{x.emoji}</div><h3>{x.name}</h3><p>{text(x.ar,x.en)}</p><div className="card-bottom"><span>{text('التفاصيل ←','Explore →')}</span><span className={'tag '+(x.status?'green':'orange')}>{x.status?text('جاهزة','Available'):text('قريبًا','Planned')}</span></div></Link>)}</div></div></div></>;
}
