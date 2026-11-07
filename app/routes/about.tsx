import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { publicSeoMeta } from '@/lib/seo';

export const meta: MetaFunction = () => publicSeoMeta(
  'About GoAcadio | Student Tools & Study Guides',
  'Learn what GoAcadio does, which study tools are free, how student information is handled, and where to get support.',
  '/about',
);

export default function About() {
  const { text } = useLocale();
  return <>
    <div className="page-hero"><div className="container">
      <span className="section-kicker">ABOUT GOACADIO</span>
      <h1>{text('عن GoAcadio', 'About GoAcadio')}</h1>
      <p>{text('مساحة تجمع أدوات عملية تساعد الطالب يذاكر وينظّم يومه ويجهّز للخطوة اللي بعد الجامعة.',
        'A practical student workspace for studying, planning your time, and preparing for your next step.')}</p>
    </div></div>
    <div className="page-content"><div className="container trust-layout">
      <article className="panel stack trust-content">
        <section><h2>{text('إيه هي GoAcadio؟', 'What is GoAcadio?')}</h2>
          <p>{text('GoAcadio مشروع أدوات تعليمية مستقل للطلاب. بنجمع أدوات حساب المعدل، وتنظيم المذاكرة، وإنشاء CV، وأدلة دراسية عامة في مكان واحد. مش جامعة أو جهة رسمية، ومش بنصدر شهادات أو درجات معتمدة.',
            'GoAcadio is an independent student-tools project. It brings GPA calculation, study planning, CV creation and practical guides together. We are not a university or an official academic authority; we do not issue credentials or official grades.')}</p></section>
        <section><h2>{text('تقدر تعمل إيه؟', 'What can you do here?')}</h2>
          <div className="trust-feature-grid">
            <div><strong>{text('احسب المعدل', 'Calculate GPA')}</strong><p>{text('اختار سلم التقديرات واحسب المتوسط الموزون بالساعات. ارجع للائحة برنامجك لتأكيد النتائج.',
              'Choose your grade-point scale and calculate a weighted average. Check your institution’s rules for official results.')}</p></div>
            <div><strong>{text('ذاكر وراجع', 'Study and revise')}</strong><p>{text('استخدم مؤقت التركيز وخطة المذاكرة، وأنشئ أسئلة تدريبية من نصوص محاضراتك بعد تسجيل الدخول.',
              'Use the focus timer and planner, and create practice questions from lecture text when signed in.')}</p></div>
            <div><strong>{text('جهّز السيرة الذاتية', 'Build a student CV')}</strong><p>{text('أنشئ مسودة قابلة للطباعة بدون رفع بيانات السيرة الذاتية لقاعدة حسابك.',
              'Prepare a printable CV draft without uploading your CV details to your account database.')}</p></div>
            <div><strong>{text('افهم قبل ما تستخدم', 'Learn the basics')}</strong><p>{text('اقرأ الأدلة التعليمية عن GPA وطريقة بومودورو وكتابة CV، ثم جرّب الأدوات بنفسك.',
              'Read guides about GPA, Pomodoro and student CV writing, then try the corresponding tools.')}</p></div>
          </div></section>
        <section><h2>{text('إزاي بنتعامل مع بياناتك؟', 'How do we handle student data?')}</h2>
          <p>{text('بعض الأدوات الأساسية بتخزن المسودات محليًا في متصفحك. بعد تسجيل الدخول، بيانات ملفك الدراسي ومهامك وملخصات نتائج الاختبارات المحفوظة بتتزامن عبر Supabase. في مولّد الاختبارات، ملف PDF بيتقرأ داخل المتصفح والنص المستخرج فقط هو اللي بيتبعت لخدمة توليد الأسئلة. مش بنحفظ النص الكامل للمحاضرة أو الأسئلة في حسابك.',
            'Some public tools keep drafts in your browser. After sign-in, your study profile, tasks and optional quiz score summaries sync through Supabase. With the quiz generator, the PDF is parsed in your browser and only extracted text is sent to the quiz-generation service. Full lecture text and generated questions are not saved in your account database.')}</p>
          <p>{text('اعرف تفاصيل أكتر عن البيانات والقيود وطلبات التصدير والحذف من صفحة الخصوصية ومركز الحساب.',
            'Read more about data, limitations, export and deletion requests on the privacy and account pages.')}</p>
          <div className="actions"><Link className="btn btn-outline" to="/privacy">{text('الخصوصية', 'Privacy information')}</Link>
            <Link className="btn btn-outline" to="/account">{text('بيانات حسابي', 'Account & data')}</Link></div></section>
        <section><h2>{text('الاستقلالية والدقة', 'Independence and accuracy')}</h2>
          <p>{text('المحتوى عام للتعلّم والمراجعة. الحسابات تعتمد على البيانات وسلم الدرجات اللي تختاره، ونتائج الذكاء الاصطناعي ممكن تحتوي أخطاء. ما تعتمدش على GoAcadio بدل اللوائح الجامعية أو المدرّس أو المرجع الرسمي.',
            'Guides are general educational resources. Calculations depend on the data and grade scale you select, and AI-generated answers can contain mistakes. GoAcadio does not replace institutional rules, instructors or official references.')}</p></section>
        <section><h2>{text('المساعدة والملاحظات', 'Support and feedback')}</h2>
          <p>{text('لو عندك مشكلة في أداة أو محتاج تصحيح معلومة، استخدم صفحة التواصل. التواصل عبر البريد الخارجي محتاج عنوان دعم رسمي مفعّل من إدارة الموقع؛ المستخدم المسجل يقدر كمان يقدّم طلبًا من حسابه.',
            'If a tool is broken or you spot an inaccurate explanation, use our contact page. Guest email contact requires a support mailbox configured by the site operator; signed-in students can also send account requests.')}</p>
          <div className="actions"><Link className="btn btn-primary" to="/contact">{text('تواصل معنا', 'Contact us')}</Link>
            <Link className="btn btn-soft" to="/help">{text('مركز المساعدة', 'Help center')}</Link></div></section>
      </article>
      <aside className="panel stack trust-aside"><h2 className="panel-title">{text('ابدأ من هنا', 'Start here')}</h2>
        <Link className="btn btn-ghost" to="/tools">🧰 {text('أدوات الطلاب', 'Student tools')}</Link>
        <Link className="btn btn-ghost" to="/guides">📚 {text('أدلة المذاكرة', 'Study guides')}</Link>
        <Link className="btn btn-ghost" to="/terms">📃 {text('شروط الاستخدام', 'Terms of use')}</Link>
        <p className="inline-help">{text('الموقع مستقل، ولا يقدّم خدمات رسمية باسم أي جامعة.',
          'GoAcadio is independent; it does not act on behalf of a university.')}</p>
      </aside>
    </div></div>
  </>;
}
