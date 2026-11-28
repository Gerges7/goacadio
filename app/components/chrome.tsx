import { Link, useLocation } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { useTheme } from '@/components/theme-provider';
import { OFFICIAL_SUPPORT_EMAIL, OFFICIAL_WHATSAPP_USERNAME } from '@/lib/contact';

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const { lang, setLang, text } = useLocale();
  const { theme, toggleTheme } = useTheme();
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
    { href: '/planner', ar: 'خطتي الدراسية', en: 'Study Planner' },
    { href: '/ai-study', ar: 'مساعد AI', en: 'AI Study' },
    { href: '/guides', ar: 'أدلة الطلاب', en: 'Study Guides' }
  ];
  return <>
    <a className="skip-to-content" href="#main-content">{text('تخطّى إلى المحتوى الرئيسي', 'Skip to main content')}</a>
    <header className="site-header">
      <div className="container nav-row">
        <Link to="/" className="brand" aria-label="GoAcadio Home" onClick={() => setExpanded(false)}>
          <img className="brand-logo" src="/brand-icon.png" alt="" width={42} height={42} /><span className="brand-name">Go<span className="brand-accent">Acadio</span></span>
        </Link>
        <nav id="site-primary-nav" className={'navigation ' + (expanded ? 'open' : '')} aria-label={text('القائمة الرئيسية', 'Main navigation')}>
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return <Link key={item.href} to={item.href} onClick={() => setExpanded(false)} className={active ? 'nav-link active' : 'nav-link'} aria-current={active ? 'page' : undefined}>{text(item.ar, item.en)}</Link>;
          })}
        </nav>
        <div className="nav-actions">
          <button type="button" className="theme-toggle" aria-pressed={theme === 'dark'} aria-label={theme === 'dark' ? text('التبديل للوضع الفاتح', 'Switch to light mode') : text('التبديل للوضع الداكن', 'Switch to dark mode')} title={theme === 'dark' ? text('الوضع الفاتح', 'Light mode') : text('الوضع الداكن', 'Dark mode')} onClick={toggleTheme}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span></button>
          <button type="button" className="lang-toggle" aria-label="Change language" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
          <Link to="/dashboard" className="btn btn-primary btn-small">{text('لوحة الطالب', 'Student Hub')} <span aria-hidden="true">↗</span></Link>
          <button ref={menuButton} type="button" className="menu-toggle" aria-label={expanded ? text('إغلاق القائمة','Close menu') : text('فتح القائمة','Open menu')} aria-controls="site-primary-nav" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><span aria-hidden="true">{expanded ? '×' : '☰'}</span></button>
        </div>
      </div>
    </header>
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="footer">
      <div className="container footer-inner">
        <div><Link to="/" className="brand brand-footer"><img className="brand-logo" src="/brand-icon.png" alt="" width={42} height={42} /><span className="brand-name">Go<span className="brand-accent">Acadio</span></span></Link><p>{text('أدوات تساعدك تذاكر بذكاء وتحقق أهدافك.', 'Tools to help you study smarter and move forward.')}</p></div>
        <div className="footer-links"><Link to="/about">{text('عن GoAcadio', 'About')}</Link><Link to="/terms">{text('شروط الاستخدام', 'Terms of use')}</Link><Link to="/guides">{text('أدلة الطلاب', 'Study guides')}</Link><Link to="/tools">{text('الأدوات', 'Tools')}</Link><Link to="/help">{text('المساعدة', 'Help')}</Link><Link to="/contact">{text('تواصل معنا', 'Contact')}</Link><Link to="/account">{text('الحساب والخصوصية', 'Account & privacy')}</Link><Link to="/privacy">{text('الخصوصية', 'Privacy')}</Link></div>
        <div className="footer-contact"><a href={`mailto:${OFFICIAL_SUPPORT_EMAIL}`} dir="ltr">{OFFICIAL_SUPPORT_EMAIL}</a><span>{text('واتساب:', 'WhatsApp:')} <strong dir="ltr">{OFFICIAL_WHATSAPP_USERNAME}</strong></span></div>
        <span className="footer-note">© {new Date().getFullYear()} GoAcadio · {text('منصة طلابية', 'Student platform')}</span>
      </div>
    </footer>
  </>;
}
