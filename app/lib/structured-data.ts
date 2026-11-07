import type { StudyGuide } from './study-guides';

/** Guide JSON-LD is an exact reflection of visible editorial content, not an ad or rating claim. */
const SITE = 'https://goacadio.com';
type Locale = 'ar' | 'en';

export function guideStructuredData(guide: StudyGuide, locale: Locale) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug)) throw new Error('Invalid guide slug');
  const url = `${SITE}/guides/${guide.slug}`;
  const title = guide.title[locale];
  const brand = { '@type': 'Organization', name: 'GoAcadio', url: SITE + '/' };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description: guide.description[locale],
        inLanguage: locale,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: brand,
        publisher: brand,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: locale === 'ar' ? 'الرئيسية' : 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: locale === 'ar' ? 'أدلة الطلاب' : 'Study guides', item: `${SITE}/guides` },
          { '@type': 'ListItem', position: 3, name: title, item: url },
        ],
      },
    ],
  } as const;
}

/** Escape characters that could otherwise end an HTML script tag or break a JSON-LD block. */
export function safeJsonLd(value: unknown): string {
  const json = JSON.stringify(value);
  if (typeof json !== 'string') throw new Error('Cannot serialize JSON-LD');
  const backslash = String.fromCharCode(92);
  return json.replace(/</g, backslash + 'u003c')
    .replace(/>/g, backslash + 'u003e')
    .replace(/&/g, backslash + 'u0026')
    .replace(/\u2028/g, backslash + 'u2028')
    .replace(/\u2029/g, backslash + 'u2029');
}
