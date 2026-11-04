import type { MetaFunction } from 'react-router';
export const meta: MetaFunction = () => [
  { title: 'GoAcadio | Free Tools for University Students' },
  { name: 'description', content: 'Calculate GPA, build your CV, and organize your study time with GoAcadio — free tools for university students.' },
  { name: 'robots', content: 'noindex, follow' },
];
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';

const tools = [
  {icon:'🎓', className:'', ar:'GPA & CGPA Calculator', en:'GPA & CGPA Calculator', descAr:'احسب معدلك الفصلي والتراكمي واستكشف تأثير درجاتك.', descEn:'Calculate semester and cumulative GPA with a flexible 4.0 model.', href:'/tools/gpa-calculator', ready:true},
  {icon:'⏱️', className:'mint', ar:'Focus Mode', en:'Focus Mode', descAr:'نظّم وقتك بجلسات مذاكرة وراحة بتقنية بومودورو.', descEn:'Stay consistent with focus sessions and breaks.', href:'/tools/focus-timer', ready:true},
  {icon:'📄', className:'peach', ar:'CV Builder', en:'CV Builder', descAr:'كوّن سيرة ذاتية منظمة واطبعها بصيغة PDF بسهولة.', descEn:'Create and export a clean, print-ready CV.', href:'/tools/cv-builder', ready:true},
  {icon:'✨', className:'mint', ar:'Student Dashboard', en:'Student Dashboard', descAr:'نظّم موادك وخططك الدراسية في مكان واحد.', descEn:'Your study profile, courses and progress in one place.', href:'/dashboard', ready:true}
];
export default function Home() {
  const { text } = useLocale();
  return <>
    <section className="hero"><div className="container hero-grid">
      <div>
        <span className="eyebrow"><i className="pulse"/>{text('من مصر، لكل طلاب الجامعات', 'Starting in Egypt. Built for students everywhere.')}</span>
        <h1>{text('رحلتك الجامعية،', 'Your university life,')}<br/><span className="highlight">{text('أسهل وأذكى.', 'all in one place.')}</span></h1>
        <p className="lead">{text('من حساب المعدل وتنظيم المذاكرة، لحد بناء الـCV وتطوير مهاراتك. GoAcadio يجمع أدوات الطالب المهمة في مكان واحد.', 'From GPA calculations and focused study sessions to building your first professional CV. Make every semester count with GoAcadio.')}</p>
        <div className="hero-ctas"><Link className="btn btn-primary" to="/tools">{text('استكشف الأدوات المجانية', 'Explore free tools')} <span>←</span></Link><Link className="btn btn-outline" to="/dashboard">{text('جرّب لوحة الطالب', 'Explore student hub')} <span>↗</span></Link></div>
        <div className="hero-points"><span>{text('بدون حساب للأدوات الأساسية', 'Free tools without signup')}</span><span>{text('بالعربي والإنجليزي', 'Arabic & English')}</span><span>{text('احفظ تقدمك بعد إنشاء حساب', 'Save your progress with an account')}</span></div>
      </div>
      <div className="hero-art">
        <div className="floating-pill"><span>📝</span>{text('مذاكرة منظمة، نتيجة أفضل', 'Study smarter, grow faster')}</div>
        <div className="dashboard-demo">
          <div className="demo-top"><div><div className="demo-greeting">{text('صباح الخير، يا بطل! 👋', 'Welcome back! 👋')}</div><div className="tiny-muted">{text('مثال توضيحي · طالب حاسبات - مستوى ثالث', 'Illustrative dashboard · Computer Science')}</div></div><div className="demo-avatar">🎓</div></div>
          <div className="demo-banner"><div><small>{text('رحلتك الدراسية', 'Your study journey')}</small><strong>{text('كل خطوة بتفرق ✨', 'Make every step count ✨')}</strong></div><div className="emoji">📚</div></div>
          <div className="demo-stats"><div className="demo-stat"><strong>3.42</strong><small>{text('مثال CGPA', 'Sample CGPA')}</small></div><div className="demo-stat"><strong>5</strong><small>{text('مثال عدد المواد', 'Sample courses')}</small></div><div className="demo-stat"><strong>12h</strong><small>{text('مثال مذاكرة', 'Sample focus time')}</small></div></div>
          <div className="demo-section">{text('موادك هذا الفصل', 'Your courses this semester')}</div>
          {[['💻','Data Structures','70%'],['🗃️','Database Systems','48%'],['🧮','Discrete Mathematics','83%']].map((course)=><div className="demo-course" key={course[1]}><span className="demo-course-icon">{course[0]}</span><div><strong>{course[1]}</strong><small>{text('متابعة التقدم — مثال', 'Illustrative progress')}</small></div><div className="progress"><span style={{width:course[2]}}/></div></div>)}
        </div>
        <div className="floating-pill float-bottom"><span>🎯</span>{text('هدفك أقرب كل يوم', 'One step closer to your goal')}</div>
      </div>
    </div></section>
    <section className="section"><div className="container">
      <div className="section-head"><span className="section-kicker">THE TOOLKIT</span><h2>{text('كل اللي محتاجه في مكان واحد', 'Everything you need to move forward')}</h2><p>{text('أدوات جامعية مفيدة تقدر تستخدمها فورًا.', 'Useful university tools you can start using right away.')}</p></div>
      <div className="feature-grid">{tools.map(tool=><Link to={tool.href} className="feature-card" key={tool.ar}><div className={'feature-icon '+tool.className}>{tool.icon}</div><h3>{text(tool.ar,tool.en)}</h3><p>{text(tool.descAr,tool.descEn)}</p><div className="card-bottom"><span>{text('افتح الأداة ←','Explore tool →')}</span><span className={'tag '+(tool.ready?'green':'orange')}>{text('متاحة','Available')}</span></div></Link>)}</div>
    </div></section>
    <section className="section section-white"><div className="container"><div className="section-head"><span className="section-kicker">HOW IT WORKS</span><h2>{text('ابدأ مجانًا.. وطور تجربتك', 'Your workspace, your way')}</h2></div><div className="steps"><div className="step"><div className="step-number">01</div><h3>{text('استخدم الأدوات فورًا', 'Start with free tools')}</h3><p>{text('احسب معدلك أو ابدأ جلسة مذاكرة بدون تسجيل.', 'Calculate GPA or launch a focus session without an account.')}</p></div><div className="step"><div className="step-number">02</div><h3>{text('خصّص لوحة الطالب', 'Personalize your hub')}</h3><p>{text('اختار جامعتك وكليتك ومستواك وضيف المواد اللي بتدرسها.', 'Select your institution and add the courses you actually study.')}</p></div><div className="step"><div className="step-number">03</div><h3>{text('ذاكر وتابع تقدمك', 'Build your momentum')}</h3><p>{text('تابع معدلك وموادك وجلسات تركيزك في مساحة واحدة.', 'Track your GPA, courses, and focus sessions together.')}</p></div></div></div></section>
    <section className="section"><div className="container"><div className="callout"><div><h2>{text('كل ترم بداية جديدة 🚀', 'Your next chapter starts here 🚀')}</h2><p>{text('ابدأ الآن بأدوات مجانية، وجهّز مساحة دراستك الخاصة.', 'Start with free tools and build a study space that feels like yours.')}</p></div><Link to="/dashboard" className="btn">{text('ابدأ لوحة الطالب', 'Open student hub')} <span>↗</span></Link></div></div></section>
  </>;
}
