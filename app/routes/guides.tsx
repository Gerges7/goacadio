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
      <div className="note" style={{marginTop:24}}>
        {text('المحتوى للإرشاد الدراسي العام؛ سياسات التقديرات ومقررات الجامعات تختلف. ارجع دائمًا للائحة برنامجك عند اتخاذ قرارات أكاديمية.', 'These guides are general learning resources. Grade scales and academic policies vary; check your program’s official rules for decisions about grades and credits.')}
      </div>
    </div></div>
  </>;
}
