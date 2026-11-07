import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { publicSeoMeta } from '@/lib/seo';

export const meta: MetaFunction = () => publicSeoMeta(
  'Terms of Use | GoAcadio',
  'Understand how GoAcadio educational tools work, the limitations of AI and GPA estimates, acceptable use and account support.',
  '/terms',
);

export default function Terms(){
  const {text}=useLocale();
  return <>
    <div className="page-hero"><div className="container">
      <span className="section-kicker">TERMS & SERVICE INFORMATION</span>
      <h1>{text('شروط الاستخدام والمعلومات التشغيلية', 'Terms of use & service information')}</h1>
      <p>{text('اعرف إمكانيات الموقع وحدودها قبل استخدام الأدوات أو إنشاء حساب.',
        'Understand what the site offers and its limitations before using tools or creating an account.')}</p>
    </div></div>
    <div className="page-content"><div className="container trust-layout">
      <article className="panel stack trust-content">
        <div className="note warn" role="note"><strong>{text('نسخة توضيحية قبل الإطلاق', 'Pre-launch informational draft')}</strong>
          <p>{text('النص ده وصف تشغيلـي لاستخدام GoAcadio، ومحتاج مراجعة قانونية واعتمادًا من مالك الموقع قبل اعتباره شروطًا قانونية نهائية. لا تفترض إنه بديل عن اتفاق مُعتمد أو عن حقوقك القانونية.',
            'This describes how GoAcadio currently operates. It requires legal review and approval by the site owner before it can be treated as final legal terms. It does not replace an approved agreement or your statutory rights.')}</p></div>
        <section><h2>{text('1. طبيعة الخدمة', '1. What the service provides')}</h2>
          <p>{text('GoAcadio بتوفر أدوات تعليمية وإنتاجية تشمل حاسبة GPA وCGPA، مؤقت التركيز، إنشاء سيرة ذاتية، خطة للمذاكرة، وأدوات للمراجعة بمساعدة الذكاء الاصطناعي. ليست جهة أكاديمية معتمدة، ولا تعطي شهادات أو درجات رسمية.',
            'GoAcadio offers study and productivity tools: GPA and CGPA calculations, a focus timer, CV drafts, study planning and AI-assisted revision. It is not an accredited academic institution and does not issue official grades or credentials.')}</p></section>
        <section><h2>{text('2. الاستخدام المسؤول', '2. Responsible use')}</h2>
          <p>{text('استخدم الأدوات بصورة قانونية ومراعية لحقوق الآخرين. ما ترفعش بيانات شديدة الحساسية أو مستندات ما عندكش حق استخدامها، وما تحاولش تتجاوز حدود الطلبات أو الوصول لبيانات مستخدمين آخرين.',
            'Use tools lawfully and respect others’ rights. Do not upload highly sensitive information or material you lack permission to use, circumvent request limits or try to access another user’s records.')}</p></section>
        <section><h2>{text('3. دقة المحتوى والتقديرات', '3. Accuracy and educational limitations')}</h2>
          <p>{text('نتائج حساب المعدل تعتمد على السلم والبيانات اللي بتدخلها؛ وقد تختلف عن حساب جامعتك الرسمي. الأسئلة والإجابات المولدة بالذكاء الاصطناعي أدوات للمراجعة وقد تكون غير دقيقة أو ناقصة. راجع دائمًا اللوائح والمحاضرات والمصادر الأصلية.',
            'GPA results depend on your inputs and selected grading scale and may differ from your institution’s calculations. AI-generated questions and explanations are practice aids and can be inaccurate or incomplete. Verify important details against official rules, lectures and original materials.')}</p></section>
        <section><h2>{text('4. الحساب والبيانات', '4. Accounts and data')}</h2>
          <p>{text('بعض الأدوات متاحة بدون حساب، وممكن تحفظ المسودات محليًا على جهازك. الأدوات الشخصية تتطلب تسجيل دخول وتخزّن بيانات محددة في حسابك. قراءة PDF تتم داخل المتصفح؛ النص المستخرج قد يُرسل لخدمة الذكاء الاصطناعي لتوليد الأسئلة. راجع صفحة الخصوصية للتفاصيل.',
            'Some tools are available without an account and may store drafts in your browser. Personal features require sign-in and save certain records to your account. PDFs are parsed locally, and extracted text may be sent to an AI service for question generation. See our privacy page for details.')}</p>
          <p>{text('تقدر تطلب نسخة من البيانات أو حذف الحساب من مركز الحساب. إرسال طلب الحذف مش معناه إن الحذف تم؛ المراجعة والتنفيذ إداريين حاليًا.',
            'You can request data access or account deletion through Account & Privacy. Submitting a deletion request does not delete an account automatically; review and execution are currently handled by the operator.')}</p></section>
        <section><h2>{text('5. التوفر وحدود الاستخدام', '5. Availability and usage limits')}</h2>
          <p>{text('بعض الخدمات لها حدود يومية أو قيود تقنية، مثل حجم ملفات PDF وعدد طلبات AI. قد تتوقف خدمة مؤقتًا للصيانة أو بسبب قيود مزود خارجي. لا يوجد وعد بأن كل ميزة متاحة دائمًا أو بأن أي نتيجة تعليمية مضمونة.',
            'Some features have daily quotas and technical limits, such as PDF size and AI requests. Availability can be affected by maintenance or third-party providers. Continuous access or specific academic outcomes are not guaranteed.')}</p></section>
        <section><h2>{text('6. الدفع والإعلانات', '6. Payments and advertising')}</h2>
          <p>{text('في الإصدار الحالي، الموقع لا يعالج مدفوعات داخلية. إعداد الإعلانات ليس مفعّلًا في هذه المرحلة. أي تغيير مستقبلي في الدفع أو الإعلانات يحتاج توضيحًا وتحديثًا للمعلومات المناسبة قبل تفعيله.',
            'The current site does not process payments. Advertising is not enabled at this stage. Any future payments or advertising would require appropriate updated information before activation.')}</p></section>
        <section><h2>{text('7. الاستفسارات والتحديثات', '7. Questions and updates')}</h2>
          <p>{text('لو عندك سؤال أو مشكلة أو ملاحظة حول النص أو أدوات الموقع، تواصل مع الإدارة. سيتم توضيح التعديلات المهمة على الوثائق المنشورة عند اعتمادها.',
            'For questions, problems or comments about these materials and tools, contact the operator. Material changes to published documents should be clearly communicated when formally adopted.')}</p>
          <div className="actions"><Link className="btn btn-primary" to="/contact">{text('تواصل معنا', 'Contact us')}</Link>
            <Link className="btn btn-outline" to="/privacy">{text('معلومات الخصوصية', 'Privacy information')}</Link></div></section>
        <p className="inline-help">{text('آخر تحديث للمسودة: 8 نوفمبر 2026.', 'Draft last updated: 8 November 2026.')}</p>
      </article>
      <aside className="panel stack trust-aside"><h2 className="panel-title">{text('معلومات مهمة', 'Useful information')}</h2>
        <Link className="btn btn-ghost" to="/about">{text('عن GoAcadio', 'About GoAcadio')}</Link>
        <Link className="btn btn-ghost" to="/privacy">{text('الخصوصية', 'Privacy')}</Link>
        <Link className="btn btn-ghost" to="/help">{text('المساعدة', 'Help')}</Link>
        <Link className="btn btn-ghost" to="/account">{text('الحساب والبيانات', 'Account & data')}</Link>
      </aside>
    </div></div>
  </>;
}
