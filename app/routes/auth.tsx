import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { useAuth } from '@/components/auth-provider';
import { getSupabase } from '@/lib/supabase';

export const meta: MetaFunction = () => [
  { title: 'Student Sign In | GoAcadio' },
  { name: 'robots', content: 'noindex, nofollow' },
];
type Mode = 'login' | 'signup' | 'reset' | 'new-password';

export default function AuthPage() {
  const { text } = useLocale();
  const navigate = useNavigate();
  const { user, configured, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('recovery')) setMode('new-password');
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  // The password recovery redirect is handled client-side by the SDK.
  // Change-password mode can be selected after clicking the recovery link.
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const client = getSupabase();
    if (!client) return;
    setBusy(true); setFeedback('');
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth?recovery=1` });
        if (error) throw error;
        setFeedback(text('لو البريد مسجل هتوصلك رسالة لاستعادة كلمة المرور.', 'If the email is registered, you will receive a recovery link.'));
      } else if (mode === 'new-password') {
        if (password.length < 8) throw new Error(text('كلمة المرور لازم تكون 8 أحرف على الأقل.', 'Password must have at least 8 characters.'));
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setFeedback(text('تم تحديث كلمة المرور.', 'Password updated.'));
        setMode('login');
      } else if (mode === 'signup') {
        if (password.length < 8) throw new Error(text('كلمة المرور لازم تكون 8 أحرف على الأقل.', 'Password must have at least 8 characters.'));
        const { error, data } = await client.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        if (data.session) navigate('/dashboard');
        else setFeedback(text('راجع بريدك الإلكتروني لتأكيد الحساب قبل الدخول.', 'Check your email to confirm your account before signing in.'));
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : text('حصل خطأ أثناء العملية.', 'Something went wrong.'));
    } finally { setBusy(false); }
  }
  async function googleSignIn() {
    const client = getSupabase();
    if (!client) return;
    setBusy(true); setFeedback('');
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { setFeedback(error.message); setBusy(false); }
  }
  const recovery = mode === 'new-password';
  const effectiveMode: Mode = mode;
  return <><div className="page-hero"><div className="container"><span className="section-kicker">STUDENT ACCOUNT</span><h1>{text('حسابك في GoAcadio', 'Your GoAcadio account')}</h1><p>{text('الأدوات المجانية بدون حساب. سجّل لحفظ ملفك وموادك بين الأجهزة.', 'Free tools need no account. Sign in to save and sync your courses and profile.')}</p></div></div>
    <div className="page-content"><div className="container"><section className="panel auth-panel">
      {!configured ? <div className="note warn">{text('التسجيل غير مفعّل بعد. الأدوات العامة متاحة، وصاحب الموقع يحتاج ضبط Supabase.', 'Account registration is not yet connected. Public tools remain available; Supabase setup is required.')}</div> : authLoading ? <p>{text('جاري التحقق من الحساب...', 'Checking your session...')}</p> : user && !recovery ? <div className="stack"><h2 className="panel-title">{text('أنت مسجل دخول بالفعل', 'You are signed in')}</h2><p>{user.email}</p><Link className="btn btn-primary" to="/dashboard">{text('افتح لوحة الطالب', 'Open dashboard')}</Link></div> : <>
        <h2 className="panel-title">{effectiveMode === 'signup' ? text('إنشاء حساب جديد','Create an account') : effectiveMode === 'reset' ? text('استعادة كلمة المرور','Reset password') : effectiveMode === 'new-password' ? text('تعيين كلمة مرور جديدة','Set a new password') : text('تسجيل الدخول','Sign in')}</h2>
        <form className="stack" onSubmit={submit}>
          {effectiveMode !== 'new-password' && <div className="field"><label htmlFor="email">Email</label><input id="email" className="input" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></div>}
          {effectiveMode !== 'reset' && <div className="field"><label htmlFor="password">{text('كلمة المرور','Password')}</label><input id="password" className="input" type="password" autoComplete={effectiveMode === 'login' ? 'current-password' : 'new-password'} required minLength={effectiveMode === 'signup' || effectiveMode === 'new-password' ? 8 : 1} value={password} onChange={e=>setPassword(e.target.value)}/></div>}
          {effectiveMode === 'signup' && <div className="note" role="note">
            {text('قبل إنشاء الحساب، راجع معلومات ', 'Before creating an account, review our ')}
            <Link to="/privacy" className="auth-policy-link">{text('الخصوصية','Privacy information')}</Link>
            {text(' و', ' and ')}
            <Link to="/terms" className="auth-policy-link">{text('شروط الاستخدام','Terms of use')}</Link>.
            <p className="inline-help">{text('الشروط الحالية مسودة توضيحية قيد المراجعة القانونية. لا يتم طلب موافقة قانونية نهائية على مسودة.',
              'The current terms are an informational draft pending legal review. This notice is not a final legal consent agreement.')}</p>
          </div>}
          {feedback && <div className="note" role="status">{feedback}</div>}
          <button disabled={busy} className="btn btn-primary" type="submit">{busy ? text('جاري التنفيذ...', 'Working...') : effectiveMode === 'signup' ? text('أنشئ الحساب','Create account') : effectiveMode === 'reset' ? text('أرسل رابط الاستعادة','Send reset link') : effectiveMode === 'new-password' ? text('حدّث كلمة المرور','Update password') : text('دخول','Sign in')}</button>
        </form>
        {effectiveMode === 'login' && <button disabled={busy} className="btn btn-outline auth-google" type="button" onClick={googleSignIn}>G &nbsp; {text('الدخول باستخدام Google', 'Continue with Google')}</button>}
        <div className="auth-switch">
          <button className="text-button" type="button" onClick={()=>{setMode(effectiveMode === 'signup' ? 'login' : 'signup'); setFeedback('');}}>{effectiveMode === 'signup' ? text('عندي حساب بالفعل', 'I already have an account') : text('إنشاء حساب جديد', 'Create an account')}</button>
          <button className="text-button" type="button" onClick={()=>{setMode(effectiveMode === 'reset' ? 'login' : 'reset'); setFeedback('');}}>{effectiveMode === 'reset' ? text('العودة للدخول', 'Back to sign in') : text('نسيت كلمة المرور؟', 'Forgot password?')}</button>
        </div>
        <p className="inline-help">{text('معلومات مهمة عن الحساب والبيانات:', 'Account and data information:')} <Link to="/privacy" className="auth-policy-link">{text('الخصوصية', 'Privacy')}</Link> · <Link to="/terms" className="auth-policy-link">{text('شروط الاستخدام', 'Terms of use')}</Link> · <Link to="/contact" className="auth-policy-link">{text('التواصل', 'Contact')}</Link></p>
      </>}
    </section></div></div></>;
}
