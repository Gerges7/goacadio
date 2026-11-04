import { Link } from 'react-router';
import { useLocation } from 'react-router';
import { useState } from 'react';
import { useLocale } from '@/components/locale-provider';

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const { lang, setLang, text } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const nav = [
    { href: '/tools', ar: 'الأدوات', en: 'Tools' },
    { href: '/universities', ar: 'الجامعات', en: 'Universities' },
    { href: '/services', ar: 'مساعدة أكاديمية', en: 'Expert Help' },
    { href: '/pricing', ar: 'الأسعار', en: 'Pricing' }
  ];
  return <>
    <header className="site-header">
      <div className="container nav-row">
        <Link to="/" className="brand" aria-label="GoAcadio Home" onClick={() => setExpanded(false)}>
          <span className="brand-mark">G<span>✦</span></span><span>Go<span className="brand-accent">Acadio</span></span>
        </Link>
        <nav className={'navigation ' + (expanded ? 'open' : '')} aria-label="Main navigation">
          {nav.map(item => <Link key={item.href} to={item.href} onClick={() => setExpanded(false)} className={pathname === item.href ? 'nav-link active' : 'nav-link'}>{text(item.ar, item.en)}</Link>)}
        </nav>
        <div className="nav-actions">
          <button type="button" className="lang-toggle" aria-label="Change language" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
          <Link to="/dashboard" className="btn btn-primary btn-small">{text('لوحة الطالب', 'Student Hub')} <span aria-hidden="true">↗</span></Link>
          <button className="menu-toggle" aria-label="Toggle menu" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>☰</button>
        </div>
      </div>
    </header>
    <main>{children}</main>
    <footer className="footer">
      <div className="container footer-inner">
        <div><Link to="/" className="brand brand-footer"><span className="brand-mark">G<span>✦</span></span><span>Go<span className="brand-accent">Acadio</span></span></Link><p>{text('أدوات تساعدك تذاكر بذكاء وتحقق أهدافك.', 'Tools to help you study smarter and move forward.')}</p></div>
        <div className="footer-links"><Link to="/tools">{text('الأدوات', 'Tools')}</Link><Link to="/roadmap">{text('خطة التطوير', 'Roadmap')}</Link><Link to="/privacy">{text('الخصوصية', 'Privacy')}</Link></div>
        <span className="footer-note">© {new Date().getFullYear()} GoAcadio · {text('نسخة تجريبية', 'Prototype')}</span>
      </div>
    </footer>
  </>;
}
