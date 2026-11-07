import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { LinksFunction, MetaFunction } from 'react-router';
import { LocaleProvider } from '@/components/locale-provider';
import Chrome from '@/components/chrome';
import { AuthProvider } from '@/components/auth-provider';
import stylesHref from './styles.css?url';
import stylesV30Href from './styles-v30.css?url';

// Keep the prototype out of search indexes until legal/privacy/SEO release review.
export const meta: MetaFunction = () => [
  { title: 'GoAcadio | Your University Life, All in One Place' },
  { name: 'description', content: 'Free GPA & CGPA calculator, focus timer, CV maker and student study workspace. أدوات طلابية مجانية.' },
  { name: 'robots', content: 'noindex, follow' },
  { property: 'og:title', content: 'GoAcadio — Student Hub' },
  { property: 'og:type', content: 'website' },
];
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesHref },
  { rel: 'stylesheet', href: stylesV30Href },
  { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><Meta /><Links /></head>
    <body><LocaleProvider><AuthProvider><Chrome>{children}</Chrome></AuthProvider></LocaleProvider><ScrollRestoration /><Scripts /></body></html>;
}
export default function App() { return <Outlet />; }
export function ErrorBoundary({ error }: { error: unknown }) {
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return <div className="page-content"><div className="container"><h1>{missing ? '404 — Page not found' : 'An error occurred'}</h1><p>GoAcadio · Try the homepage.</p><a className="btn btn-primary" href="/">Home</a></div></div>;
}
