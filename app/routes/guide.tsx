import { Link, useParams, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { getStudyGuide, studyGuides, type Localized } from '@/lib/study-guides';
import { publicSeoMeta } from '@/lib/seo';
import { guideStructuredData, safeJsonLd } from '@/lib/structured-data';

export function loader({ params }: LoaderFunctionArgs) {
  if (!getStudyGuide(params.slug)) throw new Response('Guide not found', { status: 404 });
  return null;
}

export const meta: MetaFunction = ({ params }) => {
  const guide = getStudyGuide(params.slug);
  return guide
    ? publicSeoMeta(guide.seoTitle, guide.seoDescription, `/guides/${guide.slug}`)
    : [{ title: 'Guide not found | GoAcadio' }, { name: 'robots', content: 'noindex, nofollow' }];
};

export default function GuidePage() {
  const { slug } = useParams();
  const guide = getStudyGuide(slug);
  const { text, lang } = useLocale();
  if (!guide) return null;
  const t = (value: Localized) => text(value.ar, value.en);
  const others = studyGuides.filter(item => item.slug !== guide.slug);
  const structuredJson = safeJsonLd(guideStructuredData(guide, lang));
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredJson }} />
    <div className="page-hero"><div className="container">
      <nav className="guide-breadcrumbs" aria-label={text('مسار الصفحة', 'Breadcrumb')}>
        <Link to="/">{text('الرئيسية', 'Home')}</Link><span aria-hidden="true">/</span>
        <Link to="/guides">{text('أدلة الطلاب', 'Study guides')}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{t(guide.title)}</span>
      </nav>
      <span className="section-kicker">{t(guide.category)}</span>
      <h1>{t(guide.title)}</h1>
      <p>{t(guide.description)}</p>
    </div></div>
    <div className="page-content"><div className="container guide-layout">
      <article className="panel guide-article">
        <p className="guide-intro">{t(guide.intro)}</p>
        {guide.sections.map((section, index) => <section key={index} className="guide-section">
          <h2>{t(section.title)}</h2>
          {section.paragraphs.map((paragraph, i) => <p key={i}>{t(paragraph)}</p>)}
          {section.points && <ul>{section.points.map((point, i) => <li key={i}>{t(point)}</li>)}</ul>}
        </section>)}
        <section className="guide-section">
          <h2>{text('أسئلة شائعة', 'Frequently asked questions')}</h2>
          {guide.faqs.map((faq, i) => <details key={i} className="help-question">
            <summary>{t(faq.question)}</summary><p>{t(faq.answer)}</p>
          </details>)}
        </section>
        <div className="guide-cta">
          <h2>{text('طبّق اللي اتعلمته', 'Put it into practice')}</h2>
          <p>{text('الأداة المجانية تساعدك تبدأ، والقرارات الأكاديمية النهائية تعتمد على لوائح مؤسستك.', 'Use the free tool to get started. Official academic policies remain your source of truth.')}</p>
          <Link className="btn btn-primary" to={guide.toolUrl}>{t(guide.toolLabel)}</Link>
        </div>
      </article>
      <aside className="guide-aside stack">
        <section className="panel">
          <h2 className="panel-title">{text('أدوات مرتبطة', 'Related tool')}</h2>
          <Link className="btn btn-soft" to={guide.toolUrl}>{t(guide.toolLabel)}</Link>
        </section>
        <section className="panel">
          <h2 className="panel-title">{text('اقرأ كمان', 'Read next')}</h2>
          <div className="guide-related">
            {others.map(item => <Link to={`/guides/${item.slug}`} key={item.slug}>{item.icon} {t(item.title)}</Link>)}
          </div>
        </section>
      </aside>
    </div></div>
  </>;
}
