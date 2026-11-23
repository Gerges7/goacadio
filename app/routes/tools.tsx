import { publicSeoMeta } from '@/lib/seo';
import type { MetaFunction } from 'react-router';
export const meta: MetaFunction = () => publicSeoMeta(
  'Free Student Tools | GoAcadio',
  'Free GPA and CGPA calculator, Focus Timer, Flashcards and Student CV Builder, plus personal study tools.',
  '/tools',
);
import { Link } from 'react-router';
import { useLocale } from '@/components/locale-provider';
const list = [
  {url:'/tools/gpa-calculator',emoji:'🎓',name:'GPA & CGPA Calculator',ar:'حساب المعدل الفصلي والتراكمي من الدرجات والساعات',en:'Weighted semester and cumulative GPA calculator',status:true},
  {url:'/tools/focus-timer',emoji:'⏱️',name:'Focus Mode',ar:'جلسات بومودورو وإحصائيات مذاكرة مع مزامنة اختيارية',en:'Pomodoro sessions with optional account syncing',status:true},
  {url:'/tools/cv-builder',emoji:'📄',name:'CV Builder',ar:'بناء CV بسيط وقابل للطباعة PDF',en:'Build a simple CV and print to PDF',status:true},
  {url:'/tools/flashcards',emoji:'🗂️',name:'Flashcards & Spaced Review',ar:'بطاقات أسئلة وإجابات مع مواعيد مراجعة ذكية وحفظ محلي',en:'Create cards and schedule spaced review without an account',status:true},
  {url:'/quiz-generator',emoji:'📝',name:'PDF Quiz Generator',ar:'حوّل محاضرات PDF النصية لأسئلة تدريبية مع تصحيح',en:'Generate and grade practice quizzes from text-based lecture PDFs',status:true},
  {url:'/ai-study',emoji:'🧠',name:'AI Study Assistant',ar:'شرح المفاهيم وأسئلة تدريبية من موادك بعد تسجيل الدخول',en:'Study explanations and practice questions for signed-in students',status:true},
  {url:'/dashboard',emoji:'🎯',name:'Student Dashboard',ar:'احتفظ بملفك الجامعي وموادك داخل حسابك',en:'Save your study profile and courses to your account',status:true},
];
export default function Tools() {
  const { text } = useLocale();
  return <><div className="page-hero"><div className="container"><span className="section-kicker">TOOLS</span><h1>{text('أدوات الطالب الجامعي', 'University student tools')}</h1><p>{text('الأدوات الأساسية بدون حساب، وميزات الذكاء الاصطناعي تحتاج تسجيل دخول.', 'Core tools work without signup; AI features require a student account.')}</p></div></div><div className="page-content"><div className="container"><div className="tool-list">{list.map(x=><Link className="feature-card" to={x.url} key={x.name}><div className="feature-icon">{x.emoji}</div><h3>{x.name}</h3><p>{text(x.ar,x.en)}</p><div className="card-bottom"><span>{text('التفاصيل ←','Explore →')}</span><span className={'tag '+(x.status?'green':'orange')}>{text('متاحة','Available')}</span></div></Link>)}</div><section className="panel stack" style={{marginTop:24}} aria-labelledby="tool-use-heading">
        <h2 id="tool-use-heading" className="panel-title">{text('اختار الأداة المناسبة: 4 أمثلة عملية', 'Choose the right tool: four practical examples')}</h2>
        <p>{text('لو محتاج تعرف تأثير مادة 3 ساعات على معدلك، استخدم حاسبة GPA بعد اختيار سلم النقاط الصحيح من لائحة برنامجك. لأن عدد الساعات بيغيّر الوزن، متوسط تقديرات المواد وحده ممكن يطلع مضلل.',
          'If you want to see how a three-credit course changes your GPA, use the GPA calculator after confirming your program’s grade-point scale. Credits affect the weight, so a simple average of grades can mislead.')}</p>
        <p>{text('لو الامتحان قريب وعندك موضوعات كتير، ابدأ بجلسة تركيز قصيرة وحاول تحل سؤالًا من غير ملاحظات. للمساعدة في توزيع الأسبوع، اقرأ خطة مراجعة السبعة أيام وعدّلها حسب الوقت المتاح فعلًا.',
          'When an exam is near and your to-do list is long, start with a short focus session and answer one question without notes. Use the seven-day revision plan for a sample schedule you can fit to your own time.')}</p>
        <p>{text('ولو بتجهز تدريب صيفي ومش عندك خبرة وظيفية، ركز في الـCV على مشروع واضح: المشكلة، دورك، الأدوات اللي استخدمتها والنتيجة اللي قدرت تقيسها. مش لازم تخترع خبرة علشان تملأ الصفحة.',
          'For a first internship CV without paid experience, describe a real project: the problem, your contribution, tools used and a measurable result where one exists. Never invent employment history just to fill a page.')}</p>
        <p>{text('ولو عندك تعريفات كتير بتتنسي بسرعة، افتح Flashcards واكتب السؤال في وجه البطاقة والإجابة المختصرة في ظهرها. مثال: «إيه الفرق بين Stack وQueue؟» وإجابته «Stack آخر عنصر يدخل أول عنصر يخرج (LIFO)، وQueue أول عنصر يدخل أول عنصر يخرج (FIFO)». اختبر نفسك قبل كشف الإجابة وحدد مستوى تذكّرك علشان الأداة تجدول المراجعة الجاية. احتفظ بنسخة JSON لأن البطاقات محلية على الجهاز.',
          'If definitions keep slipping from memory, create a Flashcard with a question on the front and a concise explanation on the back. For example, ask “How do a stack and queue differ?” and answer “A stack uses last-in-first-out (LIFO), while a queue uses first-in-first-out (FIFO).” Try to recall before revealing the answer, rate how well you remembered, and let the tool schedule the next review. Export a JSON backup because these cards remain on your device.')}</p>
        <div className="actions"><Link className="btn btn-outline" to="/guides/seven-day-exam-revision-plan">{text('مثال خطة مذاكرة أسبوع', 'Seven-day revision example')}</Link><Link className="btn btn-outline" to="/guides/student-cv-guide">{text('دليل CV للطالب', 'Student CV guide')}</Link></div>
      </section>
      <div className="actions" style={{justifyContent:'center',marginTop:28}}><Link className="btn btn-soft" to="/guides">{text('اقرأ الأدلة التعليمية المجانية','Explore free study guides')}</Link></div></div></div></>;
}
