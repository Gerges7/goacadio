import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { studyGuides } from '@/lib/study-guides';
import { publicSeoMeta } from '@/lib/seo';

export const meta: MetaFunction = () => publicSeoMeta(
  'Free Study Guides for University Students | GoAcadio',
  'Practical guides to GPA calculation, Pomodoro study sessions and student CV writing, with free tools and clear examples.',
  '/guides',
);

export default function Guides() {
  const { text } = useLocale();
  return <>
    <div className="page-hero"><div className="container">
      <span className="section-kicker">STUDENT GUIDES</span>
      <h1>{text('أدلة عملية لحياتك الجامعية', 'Practical guides for university life')}</h1>
      <p>{text('شرح بسيط وتطبيقات تساعدك تفهم وتحسب وتذاكر وتجهز لسوق العمل، مع أدوات مجانية تقدر تستخدمها فورًا.', 'Clear explanations and examples for grades, studying and career preparation, paired with free tools you can use today.')}</p>
    </div></div>
    <div className="page-content"><div className="container">
      <div className="guide-cards">
        {studyGuides.map(guide => <article key={guide.slug} className="panel guide-tile">
          <span className="guide-icon" aria-hidden="true">{guide.icon}</span>
          <small className="section-kicker">{text(guide.category.ar, guide.category.en)}</small>
          <h2><Link to={`/guides/${guide.slug}`}>{text(guide.title.ar, guide.title.en)}</Link></h2>
          <p>{text(guide.description.ar, guide.description.en)}</p>
          <div className="actions"><Link className="btn btn-soft" to={`/guides/${guide.slug}`}>{text('اقرأ الدليل', 'Read guide')}</Link></div>
        </article>)}
      </div>
      <section className="panel stack" style={{marginTop:24}} aria-labelledby="guide-method-heading">
        <h2 id="guide-method-heading" className="panel-title">{text('إزاي تستخدم الأدلة عمليًا؟', 'How to use these guides')}</h2>
        <p>{text('ابدأ بالدليل المرتبط بالمشكلة اللي عندك دلوقتي، مش بمحاولة قراءة كل المقالات. كل دليل فيه خطوات وأمثلة وأسئلة شائعة، وبعدها رابط لأداة عملية لو متاحة. مثال: احسب GPA بعد مراجعة سلم جامعتك، أو جرّب اختبارًا صغيرًا بعد قراءة المحاضرة من غير ما تفتح ملاحظاتك.',
          'Start with the guide that addresses a problem you actually have. Each guide offers an example, a practical method and answers to common questions, followed by a relevant tool where available. For example, check your institutional grading scale before using the GPA calculator, or quiz yourself on a lecture without looking at the notes first.')}</p>
        <p>{text('الأدلة بتشرح مبادئ عامة قابلة للتجربة، مش لوائح رسمية لأي جامعة. نراجع الأمثلة ونتجنب نشر تفاصيل تخصصية لا نقدر نتحقق منها.',
          'These guides explain general methods you can test for yourself, not the official rules of any particular university. Examples are illustrative rather than claims about a specific institution.')}</p>
        <div className="actions"><Link className="btn btn-soft" to="/tools">{text('اختار أداة مجانية', 'Choose a free tool')}</Link></div>
      </section>
      <div className="note" style={{marginTop:24}}>
        {text('المحتوى للإرشاد الدراسي العام؛ سياسات التقديرات ومقررات الجامعات تختلف. ارجع دائمًا للائحة برنامجك عند اتخاذ قرارات أكاديمية.', 'These guides are general learning resources. Grade scales and academic policies vary; check your program’s official rules for decisions about grades and credits.')}
      </div>
    </div></div>
  </>;
}
