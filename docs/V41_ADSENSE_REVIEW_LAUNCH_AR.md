GoAcadio V4.1 — AdSense Ownership Verification + Public SEO Launch
===============================================================

1) فك ضغط ZIP وارفع الملفات بنفس المسارات إلى main (شامل public/ و scripts/).
2) انتظر نجاح GitHub Actions: GoAcadio build & quality check + Cloudflare Workers Builds.
3) شغّل GoAcadio production smoke check يدويًا من GitHub Actions.
4) افتح الروابط:
   https://goacadio.com/         ← View Page Source → google-adsense-account ca-pub-1551519098591089
   https://goacadio.com/ads.txt  ← google.com, pub-1551519098591089, DIRECT, f08c47fec0942fa0
   https://goacadio.com/robots.txt ← Allow: / + Sitemap URL
   https://goacadio.com/sitemap.xml ← 16 روابط عامة فقط
   https://goacadio.com/contact  ← بريد الدعم gergesmorad17@gmail.com
5) راجع بصفتك صاحب الموقع نص Terms (موجود كمسودة توضيحية)، وPrivacy، ومحتوى الصفحات قبل طلب المراجعة. احصل على مراجعة قانونية مناسبة عند الحاجة.
6) من AdSense > Sites > goacadio.com اختر Meta tag method ثم Verify وRequest review بعد التحقق والنشر. ليس بإمكان ZIP إرسال الطلب نيابة عنك.

ملاحظات:
- رمز Meta وads.txt لإثبات الملكية فقط؛ لا نحمّل مكتبة عرض الإعلانات ولا نفعل Auto Ads.
- الصفحات الخاصة تبقى noindex بوسم الصفحة وX-Robots-Tag وCache-Control: no-store، والحماية الفعلية عبر Supabase RLS.
- قد تحتاج إعداد consent/CMP ومتطلبات إفصاح الخصوصية قبل عرض إعلانات للزوار في المناطق المنطبقة.
- لا يضمن هذا التحديث قبول Google AdSense، ولا يتضمن تغيير قاعدة البيانات أو مفاتيح سرية.
- نشر التحديث سيجعل الصفحات العامة قابلة للفهرسة، وليس مجرد إعداد محلي.
