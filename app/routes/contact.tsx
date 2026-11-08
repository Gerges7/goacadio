import { useState } from 'react';
import { Link, useLoaderData, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';
import { publicSeoMeta } from '@/lib/seo';
import { composeContactMailto, OFFICIAL_SUPPORT_EMAIL, type ContactTopic } from '@/lib/contact';

export const meta: MetaFunction = () => publicSeoMeta(
  'Contact & Support | GoAcadio',
  'Contact GoAcadio for technical support, privacy requests or student questions. Guest contact does not require an account.',
  '/contact',
);

/** Owner-approved public email address, rendered in SSR and available to guests. */
export function loader() {
  return {supportEmail: OFFICIAL_SUPPORT_EMAIL};
}

export default function Contact(){
  const {supportEmail} = useLoaderData<typeof loader>();
  const {text} = useLocale();
  const {user} = useAuth();
  const [topic,setTopic] = useState<ContactTopic>('technical');
  const [subject,setSubject] = useState('');
  const [message,setMessage] = useState('');
  const mailto = supportEmail ? composeContactMailto(supportEmail,topic,subject,message) : null;
  return <>
    <div className="page-hero"><div className="container"><span className="section-kicker">CONTACT GOACADIO</span>
      <h1>{text('تواصل معانا','Contact & support')}</h1>
      <p>{text('مساعدة فنية، استفسار عام، أو طلب متعلق بالخصوصية — حتى من غير حساب.',
        'Technical support, general questions, and privacy requests — even without an account.')}</p>
    </div></div>
    <div className="page-content"><div className="container contact-layout">
      <section className="panel stack">
        <h2 className="panel-title">{text('التواصل بالبريد الإلكتروني','Email support')}</h2>
        {supportEmail ? <>
          <p className="panel-description">{text('جهّز رسالتك هنا، وبعدها افتح تطبيق البريد وأرسلها بنفسك. الرسالة مش بتتبعت تلقائيًا من الموقع ولا بنخزنها هنا.',
            'Compose your message here, then open your email application and send it yourself. The website does not send or store this message.')}</p>
          <div className="field"><label>{text('البريد الرسمي للتواصل','Public contact email')}</label>
            <a href={`mailto:${supportEmail}`} className="contact-email" dir="ltr">{supportEmail}</a></div>
          <div className="field"><label htmlFor="contact-type">{text('نوع الاستفسار','Request type')}</label>
            <select className="input" id="contact-type" value={topic} onChange={e=>setTopic(e.target.value as ContactTopic)}>
              <option value="technical">{text('مشكلة فنية','Technical support')}</option>
              <option value="privacy">{text('خصوصية أو بيانات','Privacy or data request')}</option>
              <option value="general">{text('استفسار عام','General question')}</option>
            </select></div>
          <div className="field"><label htmlFor="contact-subject">{text('الموضوع','Subject')}</label>
            <input id="contact-subject" className="input" maxLength={120} minLength={4} value={subject} onChange={e=>setSubject(e.target.value)} placeholder={text('مثال: مشكلة في إنشاء اختبار','Example: Issue generating a quiz')}/>
            <small className="inline-help">{subject.length}/120</small></div>
          <div className="field"><label htmlFor="contact-message">{text('تفاصيل الرسالة','Message')}</label>
            <textarea id="contact-message" className="input" rows={6} maxLength={900} minLength={10} value={message} onChange={e=>setMessage(e.target.value)} placeholder={text('اشرح المشكلة أو الاستفسار بدون كتابة كلمات مرور أو بيانات حساسة.','Describe your question without passwords or sensitive details.')}/>
            <small className="inline-help">{message.length}/900</small></div>
          {mailto ? <a className="btn btn-primary contact-send" href={mailto}>{text('افتح تطبيق البريد لإرسال الرسالة','Open email app to send')}</a>
            : <button className="btn btn-primary contact-send" type="button" disabled>{text('اكتب الموضوع والرسالة أولًا','Enter a subject and message')}</button>}
          <p className="inline-help">{text('الضغط على الزر يفتح تطبيق البريد فقط. لازم تضغط إرسال داخل التطبيق. لو معندكش تطبيق بريد، انسخ العنوان واستخدم بريد الويب.',
            'This button only opens your email app. You must press Send there. If no app is configured, copy the address and use webmail.')}</p>
        </> : <>
          <div className="note warn" role="status">{text('قناة البريد العامة لسه مش متفعّلة من إدارة الموقع. من فضلك استخدم مركز طلبات الحساب لو عندك حساب. مش هنعرِض بريد غير موثّق.',
            'The public support mailbox has not been configured by the site owner. Signed-in students can use account requests. We do not display an unverified address.')}</div>
          <Link className="btn btn-outline" to="/account">{text('مركز طلبات الحساب','Account requests')}</Link>
        </>}
      </section>
      <aside className="panel stack">
        <h2 className="panel-title">{text('طرق تانية للمساعدة','Other help options')}</h2>
        <p>{text('لو عندك حساب تقدر تبعت طلب من داخل المنصة وتتابع حالته. ده مختلف عن رسالة البريد الخارجية.',
          'Signed-in students can submit an in-app request and track its status. That is separate from external email.')}</p>
        <Link to={user?'/account':'/auth'} className="btn btn-outline">{user?text('طلب دعم من حسابي','Account support request'):text('تسجيل الدخول للدعم','Sign in for account support')}</Link>
        <Link to="/help" className="btn btn-ghost">{text('الأسئلة الشائعة','Help center')}</Link>
        <Link to="/privacy" className="btn btn-ghost">{text('سياسة الخصوصية','Privacy information')}</Link>
        <div className="note">{text('ما تبعتش كلمات مرور أو رموز تحقق أو ملفات فيها بيانات شخصية حساسة. لو بتطلب حذف الحساب، وضّح الطلب من غير مشاركة كلمة المرور.',
          'Never send passwords, verification codes, or sensitive documents. For deletion requests, describe the request without sharing credentials.')}</div>
      </aside>
    </div></div>
  </>;
}
