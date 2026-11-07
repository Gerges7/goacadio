import { Link, useLocation } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/locale-provider';

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const { lang, setLang, text } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const menuButton = useRef<HTMLButtonElement | null>(null);
  // When navigating via the browser Back button, a previously opened menu must close.
  useEffect(() => { setExpanded(false); }, [pathname]);
  useEffect(() => {
    if (!expanded) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setExpanded(false);
      menuButton.current?.focus();
    }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [expanded]);
  const nav = [
    { href: '/tools', ar: 'الأدوات', en: 'Tools' },
    { href: '/universities', ar: 'الجامعات', en: 'Universities' },
    { href: '/planner', ar: 'خطتي الدراسية', en: 'Study Planner' },
    { href: '/ai-study', ar: 'مساعد AI', en: 'AI Study' },
    { href: '/services', ar: 'مساعدة أكاديمية', en: 'Expert Help' }
  ];
  return <>
    <a className="skip-to-content" href="#main-content">{text('تخطّى إلى المحتوى الرئيسي', 'Skip to main content')}</a>
    <header className="site-header">
      <div className="container nav-row">
        <Link to="/" className="brand" aria-label="GoAcadio Home" onClick={() => setExpanded(false)}>
          <span className="brand-mark">G<span>✦</span></span><span>Go<span className="brand-accent">Acadio</span></span>
        </Link>
        <nav id="site-primary-nav" className={'navigation ' + (expanded ? 'open' : '')} aria-label={text('القائمة الرئيسية', 'Main navigation')}>
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return <Link key={item.href} to={item.href} onClick={() => setExpanded(false)} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>{text(item.ar, item.en)}</Link>;
          })}
        </nav>
        <div className="nav-actions">
          <button type="button" className="lang-toggle" aria-label="Change language" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
          <Link to="/dashboard" className="btn btn-primary btn-small">{text('لوحة الطالب', 'Student Hub')} <span aria-hidden="true">↗</span></Link>
          <button ref={menuButton} type="button" className="menu-toggle" aria-label={expanded ? text('إغلاق القائمة','Close menu') : text('فتح القائمة','Open menu')} aria-controls="site-primary-nav" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><span aria-hidden="true">{expanded ? '×' : '☰'}</span></button>
        </div>
      </div>
    </header>
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="footer">
      <div className="container footer-inner">
        <div><Link to="/" className="brand brand-footer"><span className="brand-mark">G<span>✦</span></span><span>Go<span className="brand-accent">Acadio</span></span></Link><p>{text('أدوات تساعدك تذاكر بذكاء وتحقق أهدافك.', 'Tools to help you study smarter and move forward.')}</p></div>
        <div className="footer-links"><Link to="/guides">{text('أدلة الطلاب', 'Study guides')}</Link><Link to="/tools">{text('الأدوات', 'Tools')}</Link><Link to="/help">{text('المساعدة', 'Help')}</Link><Link to="/account">{text('الحساب والخصوصية', 'Account & privacy')}</Link><Link to="/privacy">{text('الخصوصية', 'Privacy')}</Link></div>
        <span className="footer-note">© {new Date().getFullYear()} GoAcadio · {text('منصة طلابية', 'Student platform')}</span>
      </div>
    </footer>
  </>;
}
