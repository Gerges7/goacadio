import type { MetaDescriptor } from 'react-router';

/** Metadata for public routes. Pre-launch noindex is deliberately ON until legal/security review. */
const SITE = 'https://goacadio.com';

export function publicSeoMeta(title: string, description: string, path: string): MetaDescriptor[] {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('SEO path must be an absolute local path');
  const url = SITE + (path === '/' ? '/' : path.replace(/\/$/, ''));
  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, follow' },
    { tagName: 'link' as const, rel: 'canonical', href: url },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ];
}
