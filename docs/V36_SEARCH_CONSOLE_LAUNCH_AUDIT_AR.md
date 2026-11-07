# GoAcadio V3.6 — Search Console & Prelaunch Audit

> **وضع النسخة الحالي: ما قبل الإطلاق.** لا تفتح الفهرسة بعد تثبيت هذه النسخة. هذا تحديث فحص وتجهيز، وليس موافقة إطلاق.

## 1) ما الذي يضيفه التحديث؟
- بيانات `Article` و`BreadcrumbList` للأدلة التعليمية الثلاثة من النص المعروض نفسه (عربي/إنجليزي)، بدون تقييمات أو تواريخ أو ادعاءات مؤلفة.
- شريط تنقل Breadcrumbs مرئي وقابل للوصول بالكيبورد داخل صفحة الدليل.
- فحص حي موسع: 14 مسارًا عامًا، صفحتان خاصتان في حالة عدم تسجيل الدخول، صفحة 404، `robots.txt` و`/sitemap.xml` غير المنشور (الإجمالي: 19 مسارًا).
- يمنع الفحص تجاوز الأخطاء الصامتة: يتحقق من HTTP status، وCanonical واحد صحيح، و`og:url`، و`noindex`، وترويسات الأمان؛ كما يتحقق من `no-store` و`X-Robots-Tag` للصفحات الخاصة.
- لا يقرأ محتوى مستخدم مسجل دخول، ولا يرسل كلمات مرور أو مفاتيح، ولا يغيّر إعدادات Google أو Cloudflare.

## 2) تشغيل الاختبارات

من مجلد المشروع بعد تثبيت dependencies:

```powershell
npm run test:v36
npm run check:prelaunch
npm run check:live
```

وللحصول على تقرير JSON **بعد نشر الملفات**:

```powershell
npm run check:live:json > v36-live-audit.json
```

يمكن أيضًا اختبار نطاق https آخر تديره:

```powershell
node scripts/check-live.mjs https://your-domain.example
```

أداة الفحص تستقبل HTTPS origin فقط، بدون مسار أو query، ولا تستخدم جلسات تسجيل الدخول. فشل الاتصال أو تغير إعدادات الحماية ينتج **FAIL** لا نتيجة نجاح وهمية. أرقام الـms زمن طلب HTTP من جهاز الفحص وليست Lighthouse أو Core Web Vitals.

إذا ظهر فشل في `sitemap.xml`: قد يكون تم نشر Sitemap بالفعل؛ راجع ذلك يدويًا، لأن هذه النسخة تتوقع عدم نشره حتى موافقة الإطلاق. وإذا ظهر نقص في headers على صفحات عامة فتحقق أن نشر Cloudflare Worker مُحدّث.

## 3) إعداد Google Search Console الآن (بدون فتح الفهرسة)

1. سجّل دخولك في [Google Search Console](https://search.google.com/search-console).
2. اختر **Add property → Domain** وأدخل `goacadio.com` فقط (بدون `https://`).
3. انسخ سجل `TXT` الذي يعرضه Google وضعه في DNS الخاص بالنطاق من Cloudflare **DNS**، ثم انتظر اكتمال انتشار السجل واضغط **Verify**.
4. بعد التحقق يمكنك مراجعة التقارير الفنية؛ **لا ترفع Sitemap ولا تطلب فهرسة الصفحات حتى قرار فتح الإطلاق**.
5. احتفظ بصلاحية DNS والوصول لـSearch Console لدى مالك المشروع فقط. لا تنسخ قيمة TXT كسر أو ترسلها في محادثات عامة.

ملحوظة: تحقق الملكية عبر DNS مستقل عن فهرسة الصفحات، وبالتالي يمكن إجراؤه بينما `robots.txt` و`noindex` مقفولان.

## 4) بوابات لا بد من إكمالها قبل الإطلاق الواسع أو AdSense

- اختبار Build كامل وCloudflare Deploy، وفحص `/contact` والتأكد أن متغير `PUBLIC_SUPPORT_EMAIL` مضبوط لبريد تتسلم عليه الرسائل فعلًا.
- اختبار تسجيل الدخول وإعادة تعيين كلمة المرور من حساب طالب حقيقي، وتسجيل الخروج من جهاز آخر.
- اختبار RLS بحسابين منفصلين: لا يستطيع الطالب الاطلاع على بيانات/نتائج/طلبات/خطط طالب آخر.
- إجراء إداري موثق للتحقق من هوية صاحب طلب حذف الحساب وتنفيذه، وتقديم سجل واضح بمعالجة الطلب.
- مراجعة نهائية دقيقة لسياسة الخصوصية وشروط الاستخدام، والكوكيز والتحليلات والإعلانات وحقوق المحتوى وفق القانون الملائم.
- مراجعة المحتوى المنشور من حيث الدقة، وتجربة الموبايل، وقياسات Lighthouse / Core Web Vitals الحقيقية.
- اختبار مسارات الدروس والـGPA والـCV والـQuiz مع عدد من الأجهزة، ومعرفة سياسة أسعار/حدود Cloudflare AI الفعلية.

## 5) بعد الموافقة الصريحة على الإطلاق فقط

**هذه خطوات مستقبلية وليست منفذة في V3.6:**

1. عدّل `public/robots.txt` ليتوقف عن `Disallow: /` بشكل مدروس، بعد التأكد من منع صفحات الحساب عبر مصادقة المستخدم و`X-Robots-Tag`.
2. أزل `noindex` من الصفحات **العامة المعتمدة فقط** في `app/lib/seo.ts` وراجع metadata الخاصة بكل صفحة؛ احتفظ بـ`noindex` لكل صفحات الحساب والـAPI ونتائج الطلاب.
3. انشر Sitemap عامة من `docs/sitemap-public-template.xml` بعد مراجعتها وتحديثها؛ لا تنقل أي مسارات شخصية إليها.
4. أضف رابط Sitemap إلى `robots.txt`، ثم أرسل `https://goacadio.com/sitemap.xml` في Search Console.
5. راقب تقارير Coverage/Page Indexing وSecurity Issues وPerformance. إرسال Sitemap لا يضمن الفهرسة.
6. قدّم طلب AdSense فقط عند اكتمال سياسة الخصوصية والتواصل والصفحات ذات المحتوى الأصلي والامتثال للسياسات ذات الصلة؛ لا يوجد ضمان قبول.

**لا توجد ميزة Roadmap عامة. لا يوجد أي SQL جديد لهذا التحديث.**

المراجع الرسمية:
- https://support.google.com/webmasters/answer/9008080
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
