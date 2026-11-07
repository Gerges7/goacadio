import { publicSeoMeta } from '@/lib/seo';
import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';

export const meta: MetaFunction = () => publicSeoMeta(
  'Help & Support | GoAcadio',
  'GoAcadio help, student account support, data requests, and troubleshooting.',
  '/help',
);

export default function Help(){
  const {text} = useLocale();
  const {user} = useAuth();
  return <>
    <div className="page-hero"><div className="container"><span className="section-kicker">HELP CENTER</span>
      <h1>{text('مركز المساعدة','Help & support')}</h1>
      <p>{text('إجابات لأكثر الأسئلة شيوعًا وطريقة للتواصل مع إدارة GoAcadio من حسابك.','Answers to common questions and a way to contact GoAcadio support from your account.')}</p>
    </div></div>
    <div className="page-content"><div className="container help-layout">
      <section className="panel stack">
        <h2 className="panel-title">{text('أسئلة شائعة','Frequently asked questions')}</h2>
        <details className="help-question"><summary>{text('هل الأدوات المجانية تحتاج تسجيل دخول؟','Do free tools require an account?')}</summary><p>{text('حاسبة المعدل ومؤقت التركيز وباني السيرة الذاتية متاحين بدون تسجيل. مزامنة بياناتك وميزات المذاكرة الشخصية تحتاج حسابًا.','GPA, Focus Timer and CV Builder are available without signing in. Account syncing and personal study features require an account.')}</p></details>
        <details className="help-question"><summary>{text('فين ملفاتي والاختبارات اللي عملتها؟','Where are my files and quiz questions?')}</summary><p>{text('ملفات PDF تُقرأ محليًا في المتصفح، ومش بنحفظ نسخة منها أو الأسئلة الكاملة على حسابك. تقدر تختار حفظ ملخص درجة الاختبار بعد تصحيحه.','PDFs are read locally in your browser. We do not save the original files or full quiz questions to your account. You can optionally save the quiz score summary after grading.')}</p></details>
        <details className="help-question"><summary>{text('ليه توليد الاختبار ممكن يقف؟','Why might quiz generation stop?')}</summary><p>{text('اتأكد إنك مسجل دخول، وعندك رصيد طلبات AI، وإن النص المستخرج من المحاضرة كافٍ. لو ظهر خطأ انسخ رسالة الخطأ في طلب الدعم، بدون إرسال بيانات سرية.','Check that you are signed in, have AI requests remaining, and extracted enough lecture text. If an error appears, submit its message in a support request without sensitive data.')}</p></details>
        <details className="help-question"><summary>{text('إزاي أطلب نسخة من بياناتي أو حذف حسابي؟','How can I request my data or account deletion?')}</summary><p>{text('من «الحساب والخصوصية» تقدر تنزّل بيانات حسابك الأساسية في JSON فورًا، أو تقدّم طلبًا إداريًا لنسخة أشمل أو حذف الحساب. حذف الحساب مش تلقائي.','Open Account & Privacy to download your GoAcadio account records as JSON, or submit a request for a broader data export or account deletion. Account deletion is not automatic.')}</p></details>
        <div className="actions"><Link className="btn btn-outline" to="/about">{text('عن المنصة', 'About')}</Link><Link className="btn btn-outline" to="/terms">{text('شروط الاستخدام', 'Terms of use')}</Link><Link className="btn btn-primary" to="/contact">{text('تواصل معانا','Contact us')}</Link><Link className="btn btn-outline" to={user?'/account':'/auth'}>{user?text('طلبات حسابي','Account requests'):text('تسجيل الدخول للدعم','Sign in for in-app support')}</Link><Link className="btn btn-outline" to="/privacy">{text('الخصوصية','Privacy')}</Link></div>
        <p className="inline-help">{text('طلبات الدعم داخل الحساب تتطلب تسجيل الدخول. التواصل عبر البريد الخارجي متاح للزائر بعد ما إدارة الموقع تفعّل عنوان دعم رسمي.','In-app support requests require sign-in. Guest email contact is available after the site owner configures a verified public mailbox.')}</p>
      </section>
      <aside className="panel stack"><h2 className="panel-title">{text('روابط سريعة','Quick links')}</h2>
        <Link className="btn btn-ghost" to="/dashboard">🎓 {text('لوحة الطالب','Student dashboard')}</Link>
        <Link className="btn btn-ghost" to="/quiz-history">📝 {text('سجل الاختبارات','Quiz history')}</Link>
        <Link className="btn btn-ghost" to="/planner">🗓️ {text('خطة المذاكرة','Study Planner')}</Link>
        <Link className="btn btn-ghost" to="/study-stats">📊 {text('إحصائيات المذاكرة','Study insights')}</Link>
      </aside>
    </div></div>
  </>;
}
