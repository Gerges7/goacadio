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
        <details className="help-question"><summary>{text('إزاي أطلب نسخة من بياناتي أو حذف حسابي؟','How can I request my data or account deletion?')}</summary><p>{text('من «الحساب والخصوصية» قدّم طلبًا. الطلب بيتراجع يدويًا ولا يحذف الحساب أو يرسل نسخة بيانات تلقائيًا.','Open Account & Privacy and submit a request. Requests are reviewed manually; neither deletion nor export happens automatically.')}</p></details>
        <div className="actions"><Link className="btn btn-primary" to={user?'/account':'/auth'}>{user?text('افتح مركز الحساب والطلبات','Open account requests'):text('سجّل دخول لإرسال طلب','Sign in to submit a request')}</Link><Link className="btn btn-outline" to="/privacy">{text('الخصوصية','Privacy')}</Link></div>
        <p className="inline-help">{text('إرسال طلبات الدعم متاح حاليًا للمستخدمين المسجلين فقط. نحتاج قناة تواصل عامة موثقة قبل الإطلاق الواسع.','Support requests currently require a signed-in account. A verified public contact channel is needed before broad launch.')}</p>
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
