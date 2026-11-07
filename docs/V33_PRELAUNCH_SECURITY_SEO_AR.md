# GoAcadio V3.3 — Internal prelaunch security & technical SEO verification

هذا الملف داخلي للمشروع في `docs/`، وليس صفحة منشورة على الموقع. لم يتم تغيير وضع الفهرسة أو فتح AdSense.

## ما تغيّر
1. ترويسات HTTP في Cloudflare Worker: `X-Content-Type-Options: nosniff` و`Referrer-Policy: strict-origin-when-cross-origin` و`Permissions-Policy` لتقييد أذونات غير مطلوبة.
2. حماية HTML من التضمين (clickjacking): `X-Frame-Options: DENY` و`Content-Security-Policy: frame-ancestors 'none'`.
3. صفحات الحساب والإدارة والدراسة الشخصية و`/api/*`: `Cache-Control: private, no-store, max-age=0` و`X-Robots-Tag: noindex, nofollow`.
4. الحفاظ على Cookie وVary وباقي الترويسات واستجابات SSR من خلال إعادة تغليف آمنة للـResponse، من دون معالجة أو تسجيل المحتوى.
5. صفحة الأخطاء: ترجمة عربية/إنجليزية وروابط للرئيسية والمساعدة، بدون رسائل أخطاء داخلية.
6. قالب sitemap داخلي قابل للتحديث، ولن يُنشر إلى `public/` قبل السماح بالفهرسة.
7. فحص ثابت `npm run check:prelaunch` وفحص اختياري لشكل استجابات الموقع المنشور `npm run check:live`.

## تشغيل الاختبارات

```bash
npm run check:prelaunch
npm run prepare:sitemap
npm run check:live
```

`check:prelaunch`: 31 فحصًا ثابتًا (15 سابقًا + 16 جديدًا) بدون إنترنت أو حزم إضافية.

`prepare:sitemap`: يجهّز **docs/sitemap-public-template.xml فقط** ويتأكد من الروابط العامة؛ لا ينشئ sitemap منشورًا، ولا يضيف صفحات حساب أو API.

`check:live`: يطلب 9 روابط عامة بدون تسجيل دخول أو كوكيز، ويراجع HTTP status وContent-Type وSecurity Headers وnoindex وCanonical و404، مع طباعة زمن طلب HTTP. هذه الأزمنة **ليست** LCP أو INP أو CLS. يُجرى بعد نشر الملفات.

يمكن استهداف بيئة نشر أخرى باستخدام: `node scripts/check-live.mjs https://your-test-domain.example` (يقبل HTTPS origin فقط).

## اختبارات يدوية أساسية
- سجّل دخول لحساب تجريبي، واختبر أن `/dashboard` و`/account` و`/quiz-history` والـAPI ما زالت تعمل.
- في DevTools > Network افتح استجابة صفحة `/dashboard` وتأكد من `Cache-Control: private, no-store` و`X-Robots-Tag: noindex`.
- افحص `/guides` وتأكد أن Canonical يشير إلى goacadio.com وأن `noindex` ما زال موجودًا، وأنها **ليست** صفحة خاصة ولا تفقد كاش الأصول الثابتة.
- اختبر `/guides/no-such-article`؛ يُنتظر HTTP 404 مع واجهة مفهومة دون ظهور مسارات داخلية أو stack traces.
- اختبار HTML العادي يجب أن يُظهر `X-Frame-Options: DENY` و`frame-ancestors 'none'`.
- اختبر تسجيل الدخول وتسجيل الخروج وQuiz Generator والـAI؛ تغييرات Worker لا يجب أن توقفها.
- افتح من موبايل حقيقي، واختبر القائمة والكيبورد وحجم النص والطباعة.
- استخدم Chrome DevTools Lighthouse وPageSpeed Insights بعد النشر، وراقب **LCP وINP وCLS** على بيانات حقيقية إذا توفرت. لا تستخدم زمن HTTP في check:live كبديل.

## قبل قرار الفهرسة والإعلانات
- مطلوب وسيلة تواصل عامة موثقة وسياسة خصوصية نهائية وطريقة عملية للرد على طلبات حذف الحساب وتصدير البيانات، وليس مجرد تسجيل الطلب.
- راجع صلاحيات RLS بحسابين منفصلين، وأكّد عدم كشف بيانات طالب لآخر.
- راجع جودة الأدلة، دقة المحتوى، مصدر البيانات، وتوافر المنتجات والخدمات كما هو مُعلن.
- عند اتخاذ قرار مستقل بإطلاق الموقع: راجع **جميع** إشارات `noindex` و`X-Robots-Tag` على الصفحات العامة، وحدّث robots.txt، ثم انقل قالب sitemap المراجع فقط إلى `public/sitemap.xml` وقدمه في Search Console. أبقِ صفحات الطالب والـAPI مستثناة.
- تنبيه Google: إذا منعت الزحف في robots.txt فقد لا يطلع Googlebot على `noindex` داخل HTML؛ الروبوتس ليس حاجز حماية للبيانات الشخصية.
- لم أفتح أي صفحات Roadmap عامة. لا توجد تغييرات في SQL أو AI Binding أو حدود الاستخدام.

مراجع:
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/essentials/technical
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
