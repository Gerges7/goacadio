GoAcadio V3.9.1 — إصلاح GitHub Actions الأحمر

راجعت سجل التشغيل الفاشل بتاريخ 8 نوفمبر 2026 (Run 42509351241).
كل الاختبارات المحلية نجحت، لكن فحص TypeScript توقف عند 114 رسالة:
107 رسائل بسبب نقص rootDirs لإعداد React Router، و7 أخطاء في ملفات الكود.

خطوات الرفع:
1. فك ضغط الملف.
2. ارفع الملفات السبعة فقط على GitHub main بنفس مساراتها.
3. اضغط Commit changes.
4. افتح https://github.com/Gerges7/goacadio/actions
5. افتح آخر تشغيل جديد، واتأكد من نتيجة typecheck وbuild.

مفيش SQL جديد ولا تعديل في Supabase أو Cloudflare.
ملحوظة: فحص الصياغة نجح هنا، لكن لازم ننتظر نتيجة الـBuild الفعلي من GitHub.
