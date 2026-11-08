import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { LinksFunction, MetaFunction } from 'react-router';
import { LocaleProvider } from '@/components/locale-provider';
import Chrome from '@/components/chrome';
import { AuthProvider } from '@/components/auth-provider';
import { useLocale } from '@/components/locale-provider';
import stylesHref from './styles.css?url';

// Public pages are indexable for AdSense review; private routes keep noindex separately.
export const meta: MetaFunction = () => [
  { title: 'GoAcadio | Your University Life, All in One Place' },
  { name: 'description', content: 'Free GPA & CGPA calculator, focus timer, CV maker and student study workspace. أدوات طلابية مجانية.' },
  { name: 'robots', content: 'index, follow' },
  { property: 'og:title', content: 'GoAcadio — Student Hub' },
  { property: 'og:type', content: 'website' },
];
export const links: LinksFunction = () => [
  // Start external font connections in the HTML head rather than behind a CSS @import.
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap' },
  // One bundled site stylesheet instead of three independent render-blocking requests.
  { rel: 'stylesheet', href: stylesHref },
  { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="google-adsense-account" content="ca-pub-1551519098591089" /><Meta /><Links /></head>
    <body><LocaleProvider><AuthProvider><Chrome>{children}</Chrome></AuthProvider></LocaleProvider><ScrollRestoration /><Scripts /></body></html>;
}
export default function App() { return <Outlet />; }
export function ErrorBoundary({ error }: { error: unknown }) {
  const {text} = useLocale();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  // Never expose error messages, internal paths or server stack traces to visitors.
  return <div className="page-content"><div className="container"><section className="panel center" style={{maxWidth:650,margin:'40px auto'}} role="alert">
    <span className="section-kicker">{missing?'404':'GOACADIO'}</span>
    <h1>{missing?text('الصفحة مش موجودة','Page not found'):text('حصل خطأ غير متوقع','Something went wrong')}</h1>
    <p>{missing?text('راجع رابط الصفحة أو ارجع للأدوات المتاحة.','Check the address or browse our available tools.'):
      text('جرّب تحديث الصفحة. لو المشكلة مستمرة، افتح مركز المساعدة.','Try reloading the page. If it continues, visit Help & Support.')}</p>
    <div className="actions" style={{justifyContent:'center'}}><Link className="btn btn-primary" to="/">{text('الرئيسية','Homepage')}</Link>
      <Link className="btn btn-outline" to="/help">{text('مركز المساعدة','Help center')}</Link></div>
  </section></div></div>;
}
