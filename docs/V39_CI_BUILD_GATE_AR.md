# GoAcadio V3.9 — Build verification (بالعربي)

## الجديد

- `.github/workflows/quality-gate.yml` يقوم بعد كل Push إلى `main` بفحص نسخ المشروع باستخدام Node.js 22.
- يفحص اختبارات الإصدارات السابقة، الروابط، صلاحية الملفات، TypeScript الفعلي، ثم `react-router build` وليس فحص الصياغة فقط.
- إصلاح `scripts/test-public-contact.mjs`: بدل الاستيراد المباشر لملف TypeScript (غير مدعوم على بعض إصدارات Node)، يتم تحويل الكود في الذاكرة باستخدام مكتبة TypeScript المتاحة ضمن devDependencies.
- تحديث `npm run typecheck` ليشغّل `react-router typegen` قبل `tsc --noEmit`.

## التثبيت

1. ارفع الملفات من ZIP إلى المستودع على `main` بنفس المسارات، بما فيها المجلد المخفي `.github/workflows/`.
2. افتح صفحة GitHub -> Actions -> `GoAcadio build & quality check` وتأكد من انتهاء الفحص بنجاح.
3. إذا كان هناك خطأ، افتح تفاصيل الـJob وانسخ أول رسالة `ERROR` للإصلاح.
4. محليًا: `npm install` ثم `npm run check:ci`.

## حدود التحقق

- لم يتم تشغيل npm install أو full build في بيئة إعداد هذا التحديث لعدم وجود اتصال بمستودع npm.
- CI لا ينشر الموقع ولا يتحكم في Cloudflare Auto Deploy؛ قد يتم نشر نسخة بها خطأ قبل ظهور فشل الفحص. ينبغي مراجعة Status بنجاح بعد الرفع.
- استخدم بريد دعم حقيقي، واختبر Supabase وWorkers AI بحساباتك قبل الفتح العام.
- `noindex` و `robots.txt` لم يتم تغييرهما، كما لم يُنشر sitemap ولا أُضيفت مفاتيح.
- الـWorkflow يستخدم `npm install` لأن المستودع الحالي لا يحتوي `package-lock.json`. عند اعتماد Lockfile يُنصح باستخدام `npm ci`.

## سريعًا

```powershell
npm install
npm run check:ci
npm run check:live
```
