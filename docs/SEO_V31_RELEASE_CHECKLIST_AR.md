# GoAcadio V3.1 — SEO & Public Launch Readiness (Internal Only)

**حالة المشروع:** إعداد محتوى وSEO تقني فقط؛ لا تُفعّل فهرسة Google أو AdSense بعد.
هذا المستند داخلي داخل GitHub `docs/` ولا يُعرض ضمن روابط الموقع.

## الموجود في V3.1
- صفحة `/guides` وثلاثة أدلة أصلية بالعربي والإنجليزي: GPA، Pomodoro، وCV.
- روابط داخلية بين الأدلة والأدوات المجانية وصفحة الأدوات والتذييل.
- عناوين ووصف وCanonical وOpen Graph للصفحات العامة الأساسية؛ من دون اسم جامعة في حساب التقديرات.
- لم تتغير صفحات الحسابات والطلاب وAPI؛ كل البيانات الخاصة تستمر بحماية Supabase وRLS.
- كل الصفحات العامة الجديدة تحت `noindex, follow` لحين قرار نشر موثق.
- `public/robots.txt` ما زال `Disallow: /`؛ لا يوجد `public/sitemap.xml` فعلي حتى نراجع الإطلاق.

## شروط أساسية قبل فتح فهرسة الموقع
1. مراجعة الصلاحيات RLS واختبار كل حساب آخر؛ مراجعة حدود AI والتعامل مع فشل التوليد.
2. تجهيز سياسة خصوصية نهائية وقناة تواصل عامة موثقة وعمليات استلام طلبات حذف الحساب وتصدير البيانات وتنفيذها فعليًا.
3. التأكد من توافق المحتوى، الأسعار، وتفاصيل الخدمة مع الخدمة الفعلية؛ لا تضع شهادات أو تقييمات غير حقيقية.
4. اختبار الموقع على Chrome وSafari وFirefox، على موبايل حقيقي؛ وقياس Core Web Vitals واختبار الوصول بلوحة المفاتيح.
5. تصحيح الأخطاء والنصوص القديمة، مراجعة لغة المحتوى، وفحص روابط الصفحات العامة.
6. اختبار نشر نهائي: SSR للصفحات العامة، status 404 لمسارات الأدلة المجهولة، وcanonical لكل صفحة.

## نشر SEO بعد تحقق الشروط وبقرار منفصل
- **أولًا:** ارفع القيود على PUBLIC pages فقط؛ احتفظ بـ `noindex, nofollow` على `/dashboard` و`/admin` و`/account` و`/auth` و`/planner` و`/quiz-history` و`/study-stats` و`/revision` وواجهات الـAI الخاصة، و`/api/*`.
- **ثانيًا:** أزل `Disallow: /` من `public/robots.txt` واستبدله بالقواعد المتفق عليها. robots.txt ليس وسيلة لحماية المعلومات الخاصة.
- **ثالثًا:** غيّر `noindex` إلى `index, follow` للصفحات العامة المنشورة فقط، بعد مراجعة الـroot والـroute meta والـHTTP headers. لا يكفي تعديل ملف واحد.
- **رابعًا:** أنشئ `public/sitemap.xml` بعد تفعيل الفهرسة من القالب الداخلي `docs/sitemap-public-template.xml` مع مراجعة كل URL؛ لا تضع صفحات خاصة أو API في sitemap.
- **خامسًا:** أكّد ملكية النطاق داخل Google Search Console واطلب فهرسة الصفحات الرئيسية، ثم راقب تقارير Indexing وPerformance.

**مهم من Google:** لو الصفحة ممنوعة في robots.txt، Googlebot قد لا يقرأ `noindex` الموجود فيها. وعشان تستفيد من `noindex` في منع الفهرسة، لازم يكون الزحف مسموحًا للصفحات المعنية. أبقينا كل إعدادات مرحلة ما قبل الإطلاق كما هي ولم نفعّل الفهرسة تلقائيًا.

مراجع رسمية:
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://reactrouter.com/how-to/meta
