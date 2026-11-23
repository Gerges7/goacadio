/** Original, bilingual editorial study resources. No institutional grade scale is assumed. */
export type Localized = { ar: string; en: string };
export type GuideSection = { title: Localized; paragraphs: Localized[]; points?: Localized[] };
export type GuideFaq = { question: Localized; answer: Localized };
export type StudyGuide = {
  slug: string;
  icon: string;
  category: Localized;
  title: Localized;
  description: Localized;
  intro: Localized;
  sections: GuideSection[];
  faqs: GuideFaq[];
  toolUrl: string;
  toolLabel: Localized;
  seoTitle: string;
  seoDescription: string;
};

export const studyGuides: readonly StudyGuide[] = [
  {
    slug: 'how-to-calculate-gpa', icon: '🎓',
    category: { ar: 'المعدل الجامعي', en: 'Grades & GPA' },
    title: { ar: 'إزاي تحسب GPA وCGPA بالساعات المعتمدة؟', en: 'How to calculate GPA and CGPA with credit hours' },
    description: { ar: 'افهم الفرق بين المعدل الفصلي والتراكمي، واحسب المتوسط الموزون بدون افتراض نظام درجات محدد.', en: 'Understand term GPA, cumulative GPA, and credit-hour weighting without assuming one grading scale.' },
    intro: { ar: 'حساب المعدل مش متوسط درجات المواد العادي: الساعات المعتمدة بتحدد وزن كل مادة. أول خطوة دائمًا إنك تتأكد من سلم التقديرات المعمول به في برنامجك.', en: 'GPA is not usually the simple average of course grades: each course carries a credit-hour weight. Always check your program’s official grade-point scale first.' },
    sections: [
      { title: { ar: '1. اختار سلم التقديرات الصحيح', en: '1. Find your grade-point scale' },
        paragraphs: [{ ar: 'الحرف نفسه ممكن يساوي نقاط مختلفة من نظام لآخر. مثلًا B+ مش لازم يكون له نفس النقاط في كل الجامعات. استخدم لائحة برنامجك وحدد نقاط كل تقدير قبل الحساب.', en: 'A letter grade can map to different points across institutions. For example, B+ does not have one universal value. Use your official program policy to map grades to points.' }],
        points: [
          { ar: 'تأكد من الحد الأقصى للمعدل: 4.0 أو 5.0 أو نظام آخر.', en: 'Check whether your GPA scale is 4.0, 5.0, or something else.' },
          { ar: 'تأكد من معاملة المواد المعادة والمواد Pass/Fail.', en: 'Check how repeated courses and pass/fail classes are treated.' },
          { ar: 'متفترضش إن النسبة المئوية تتحول لنفس التقدير في كل جامعة.', en: 'Do not assume percentage cutoffs are universal.' },
        ] },
      { title: { ar: '2. معادلة GPA الفصلي', en: '2. Calculate semester GPA' },
        paragraphs: [{ ar: 'لكل مادة: اضرب نقاط التقدير في ساعاتها المعتمدة. اجمع النواتج، وبعدها اقسم على مجموع الساعات الداخلة في المعدل.', en: 'For each class, multiply the grade points by the class credit hours. Add those products and divide by all credit hours included in GPA.' },
          { ar: 'GPA = مجموع (نقاط المادة × ساعات المادة) ÷ مجموع الساعات المحتسبة.', en: 'GPA = sum of (course grade points × course credits) ÷ sum of counted credits.' },
          { ar: 'تجربة حسابية: مادة 3 ساعات بنقاط 3.8 ومادة ساعتين بنقاط 3.4. المعدل = (3×3.8 + 2×3.4) ÷ 5 = 3.64. الأرقام دي للتوضيح فقط، مش سلم جامعة بعينها.', en: 'Worked example: a 3-credit class worth 3.8 points and a 2-credit class worth 3.4 points yield (3×3.8 + 2×3.4) ÷ 5 = 3.64. These are example points, not a prescribed university scale.' }] },
      { title: { ar: '3. إزاي تحسب CGPA؟', en: '3. Calculate cumulative GPA' },
        paragraphs: [{ ar: 'لو معاك تراكمي سابق وساعاته، تقدر تضيف نتيجة الفصل الجديد بمتوسط موزون: (CGPA القديم × ساعاته + GPA الفصل × ساعاته) ÷ إجمالي الساعات. الصيغة دي صالحة لما قواعد الجامعة تسمح بدمج الساعات دي بالشكل ده.', en: 'If you know your previous CGPA and its counted credits, a weighted update is (previous CGPA × previous credits + new term GPA × new term credits) ÷ combined credits. This assumes your institution counts those credits in the same way.' },
          { ar: 'مثال تراكمي قابل لإعادة الحساب: لو معدلك السابق 3.20 على 60 ساعة، وحصلت في الفصل الجديد على 3.60 في 15 ساعة محسوبة، يبقى (3.20×60 + 3.60×15) ÷ 75 = 3.28. لو ساعات الفصل أقل أو عندك مواد إعادة، لازم تراجع قواعد جامعتك قبل اعتماد الرقم.',
            en: 'Reproducible cumulative example: your previous CGPA was 3.20 over 60 counted credits; the new semester GPA is 3.60 over 15 counted credits. Then (3.20×60 + 3.60×15) ÷ 75 = 3.28. If credits are excluded, repeated or treated differently, verify your institutional policy before relying on this projection.' }] },
      { title: { ar: '4. راجع النتيجة قبل الاعتماد عليها', en: '4. Check before relying on the result' },
        paragraphs: [{ ar: 'الدرجات التقديرية، الخصم عند الإعادة، والساعات غير المحتسبة ممكن تغيّر النتيجة. اعتبر الحاسبة أداة مساعدة، وكشف الدرجات الرسمي هو المرجع النهائي.', en: 'Estimated grades, retake rules, and excluded credits can change the final number. Treat the calculator as a planning tool; your official transcript and academic regulations remain authoritative.' }] },
    ],
    faqs: [
      { question: { ar: 'هل CGPA هو متوسط معدلات الفصول؟', en: 'Is CGPA the average of semester GPAs?' }, answer: { ar: 'مش دايمًا. لو عدد ساعات الفصول مختلف، لازم المتوسط يكون موزون بالساعات المعتمدة.', en: 'Not necessarily. When semesters have different credit totals, use a credit-weighted average.' } },
      { question: { ar: 'هل كل الجامعات بتستخدم سلم 4.0 نفسه؟', en: 'Do all universities use the same 4.0 scale?' }, answer: { ar: 'لا. حتى الأنظمة اللي حدها الأقصى 4.0 ممكن تختلف في نقاط A أو B+ وحدود النسب المئوية.', en: 'No. Two 4.0 systems may assign different points or percentage ranges to the same letter grades.' } },
    ],
    toolUrl: '/tools/gpa-calculator', toolLabel: { ar: 'افتح حاسبة GPA وCGPA', en: 'Open GPA & CGPA Calculator' },
    seoTitle: 'How to Calculate GPA and CGPA with Credit Hours | GoAcadio',
    seoDescription: 'Learn the credit-weighted GPA formula, cumulative GPA calculations, worked examples and common grading-scale mistakes.',
  },
  {
    slug: 'pomodoro-study-timer', icon: '⏱️',
    category: { ar: 'تنظيم المذاكرة', en: 'Study habits' },
    title: { ar: 'طريقة بومودورو: ازاي تنظّم وقت المذاكرة؟', en: 'How to use the Pomodoro method for studying' },
    description: { ar: 'دليل عملي لجلسات تركيز قصيرة وراحة منتظمة، مع نصائح لتجربة الطريقة حسب طبيعة كل مادة.', en: 'A practical guide to short focus sessions, breaks, and adapting the method to your studies.' },
    intro: { ar: 'بومودورو طريقة بسيطة: تذاكر لمدة محددة، وبعدها تاخد راحة قصيرة. الهدف مش إنك تلتزم برقم ثابت؛ الهدف إنك تبدأ وتعرف تحافظ على تركيزك.', en: 'Pomodoro is a simple structure: work for a defined interval, then take a short break. The goal is not to worship one exact number—it is to make starting and staying focused easier.' },
    sections: [
      { title: { ar: '1. ابدأ بجلسة صغيرة واضحة', en: '1. Start with a clear, small session' },
        paragraphs: [{ ar: 'اختار مهمة واحدة: حل خمس مسائل، قراءة جزء من فصل، أو مراجعة مفهوم. اضبط المؤقت على 25 دقيقة أو مدة تقدر تركز خلالها فعلًا.', en: 'Pick one concrete task: solve five problems, read a chapter section, or review a concept. Set a 25-minute timer, or a duration that realistically fits your attention.' }] },
      { title: { ar: '2. افصل بين التركيز والراحة', en: '2. Separate focus from breaks' },
        paragraphs: [{ ar: 'خلال الجلسة، ابعد المشتتات وسجّل أي فكرة جانبية لترجع لها بعدين. بعد انتهاء المؤقت، خد 5 دقائق راحة. وبعد عدة جولات، ممكن تجرب راحة أطول.', en: 'During the session, put distractions aside and jot down side thoughts for later. After the timer, take a 5-minute break. After several sessions, consider a longer break.' },
          { ar: 'تجربة قابلة للتعديل: لو عندك 110 دقائق قبل محاضرة، جرّب 40 دقيقة حل، و10 دقائق راحة، و40 دقيقة تصحيح وإعادة حل، وبعدها 20 دقيقة تلخيص أخطاء. مجموع التركيز هنا 100 دقيقة تقريباً إذا حسبت التلخيص ضمن العمل، والراحة لا تُحسب. في GoAcadio تقدر تضبط فترات التركيز والراحة بدل الالتزام بـ25 دقيقة.',
            en: 'Try a worked 110-minute study block: 40 minutes solving problems, a 10-minute break, 40 minutes correcting and retrying, then 20 minutes noting recurring mistakes. That is 100 minutes of planned work and ten minutes of rest; only completed focus sessions contribute to GoAcadio study totals. You can adjust the timer instead of being limited to 25 minutes.' }],
        points: [
          { ar: 'اقفل الإشعارات غير الضرورية.', en: 'Silence unnecessary notifications.' },
          { ar: 'لو المهمة كبيرة، قسّمها لخطوات تخلص في جلسة واحدة.', en: 'Break large work into tasks you can finish in one session.' },
          { ar: 'متعتبرش الراحة فشل؛ هي جزء من الخطة.', en: 'Treat breaks as part of the plan, not a failure.' },
        ] },
      { title: { ar: '3. عدّل المدة على حسب نوع المذاكرة', en: '3. Match the interval to the task' },
        paragraphs: [{ ar: 'مراجعة التعريفات ممكن تستفيد من جلسات قصيرة. مسائل البرمجة الطويلة ممكن تحتاج وقت أطول؛ متقطعش تركيزك لمجرد إن الوقت انتهى لو أنت في نقطة مهمة. جرّب وراجع النتيجة.', en: 'Flashcards may suit short intervals. A difficult programming problem may need longer uninterrupted work. If you are in productive flow, you can adjust rather than stopping mechanically.' }] },
      { title: { ar: '4. تابع التقدم بدل عدّ الجلسات فقط', en: '4. Track actual progress, not just timer totals' },
        paragraphs: [{ ar: 'سجّل إيه اتعمل فعلًا بعد كل جلسة، واحتفظ بقائمة صغيرة للحاجات اللي محتاجة متابعة. مؤقت GoAcadio يساعدك تتابع الجلسات المكتملة، لكن فهمك للمادة هو المقياس الأهم.', en: 'After each session, note what you actually completed and what remains. GoAcadio tracks completed focus time, but understanding the material matters more than collecting timer streaks.' }] },
    ],
    faqs: [
      { question: { ar: 'لازم أذاكر 25 دقيقة بالضبط؟', en: 'Must every focus session be exactly 25 minutes?' }, answer: { ar: 'لأ. دي نقطة بداية شائعة. اختار مدة تناسب المادة وقدرتك على التركيز.', en: 'No. It is a common starting point. Choose a session length that suits your work and attention.' } },
      { question: { ar: 'هل المؤقت بيحفظ جلساتي بدون حساب؟', en: 'Can I use the timer without an account?' }, answer: { ar: 'أيوه، المؤقت الأساسي مجاني. حفظ الجلسات محليًا متاح، ومزامنتها بين الأجهزة بتحتاج تسجيل دخول.', en: 'Yes. The basic timer is free. Local tracking works without an account, while cross-device syncing requires sign-in.' } },
    ],
    toolUrl: '/tools/focus-timer', toolLabel: { ar: 'ابدأ جلسة تركيز', en: 'Start a focus session' },
    seoTitle: 'Pomodoro Study Method: A Practical Student Guide | GoAcadio',
    seoDescription: 'Learn how to plan focus sessions and study breaks, adjust Pomodoro intervals, and track meaningful student progress.',
  },
  {
    slug: 'student-cv-guide', icon: '📄',
    category: { ar: 'الاستعداد للعمل', en: 'Career preparation' },
    title: { ar: 'إزاي تكتب CV مرتب وأنت لسه طالب؟', en: 'How to write a strong CV as a university student' },
    description: { ar: 'رتّب مشاريعك ومهاراتك وتعليمك، حتى لو خبرتك العملية قليلة، واطبع CV منظم.', en: 'Organize education, projects, skills, and real experience—even if you have not had a full-time job.' },
    intro: { ar: 'الـCV الجيد للطالب مش لازم يكون فيه خبرة سنين. المهم يوضح أنت بتتعلم إيه، عملت إيه بنفسك، وإيه المهارات اللي تقدر تثبتها بأمثلة.', en: 'A good student CV does not require years of employment. It should show what you study, what you have actually built, and the skills you can demonstrate.' },
    sections: [
      { title: { ar: '1. ابدأ ببيانات اتصال بسيطة', en: '1. Keep contact information focused' },
        paragraphs: [{ ar: 'اكتب اسمك، بريد إلكتروني مهني، المدينة والدولة، ورابط أعمال أو GitHub لو عندك. مش لازم تضيف عنوان سكنك التفصيلي أو معلومات شخصية مش مطلوبة.', en: 'Include your name, a professional email, city and country, and portfolio or GitHub if relevant. Avoid an unnecessary full home address or unrelated personal details.' }] },
      { title: { ar: '2. اكتب التعليم والمشاريع بشكل عملي', en: '2. Lead with education and projects' },
        paragraphs: [{ ar: 'اذكر التخصص والجامعة وموعد التخرج المتوقع لو معروف. في قسم المشاريع، اكتب دورك تحديدًا، التقنيات اللي استخدمتها، والنتيجة اللي وصلت لها. بلاش تنسب لنفسك شغل فريق كامل.', en: 'List your degree, institution, and expected graduation date when known. For projects, state your personal contribution, tools used, and outcome. Do not claim credit for teammates’ work.' }],
        points: [
          { ar: 'بدل «عملت مشروع»، اكتب «طورت واجهة React تعرض نتائج البحث وتتحقق من المدخلات».', en: 'Instead of “Made an app,” write “Built a React interface that displays search results and validates inputs.”' },
          { ar: 'اربط المشاريع بدور التدريب أو الوظيفة المستهدفة.', en: 'Choose projects relevant to the internship or role you want.' },
          { ar: 'لو فيه رابط شغال أو مستودع منظم، ضيفه.', en: 'Include a working demo or clean repository when available.' },
        ] },
      { title: { ar: '3. فرّق بين المهارات الحقيقية والمجردة', en: '3. Make skills credible' },
        paragraphs: [{ ar: 'اكتب اللغات والأدوات اللي استخدمتها فعليًا، وخلي المشاريع تثبتها. مجرد ذكر عشرين تقنية من غير تجربة مش بيساعد. لو عندك شهادات أو تدريب مرتبط، اذكره بصورة مختصرة.', en: 'List languages and tools you actually used, and let projects back them up. A long list of untested technologies is less useful than a few well-demonstrated skills. Include relevant training if you have it.' }] },
      { title: { ar: '4. راجع الشكل قبل التقديم', en: '4. Review readability and accuracy' },
        paragraphs: [{ ar: 'استخدم عناوين واضحة، صياغة مختصرة، وخط مقروء. راجع الروابط والأخطاء الإملائية، واطبع PDF واتأكد إن كل صفحة سليمة قبل الإرسال. خصص المحتوى للفرصة اللي بتقدم عليها.', en: 'Use clear headings, concise writing, and readable typography. Test links, proofread, and inspect the exported PDF before applying. Tailor the content to each opportunity.' },
          { ar: 'قبل التقديم، جرّب اختبار الخمس دقائق: اطبع نسخة PDF وافتحها على الموبايل بدون تكبير. هل اسمك ووسيلة التواصل واضحين؟ هل مشروعك الأهم ظاهر في أول نصف صفحة؟ هل رابط المشروع بيفتح فعلاً؟ لو اضطررت للتكبير لقراءة النص أو الرابط مش شغال، عدّل التنسيق قبل الإرسال.',
            en: 'Try a five-minute review before applying: export a PDF, open it on a phone without zooming, and check whether your name and contact method are readable, whether the strongest project appears early, and whether every portfolio link works. If small text or broken links slow down the reader, revise the layout before submitting.' }] },
    ],
    faqs: [
      { question: { ar: 'لو معنديش خبرة عمل أكتب إيه؟', en: 'What if I have no work experience?' }, answer: { ar: 'ابدأ بالتعليم والمشاريع الجامعية والتطوع أو التدريب لو موجود. مهم توضح إنجازاتك الحقيقية.', en: 'Lead with education, coursework, projects, volunteering, or internships that demonstrate real work.' } },
      { question: { ar: 'هل ينفع أطبع CV من GoAcadio؟', en: 'Can I export a CV from GoAcadio?' }, answer: { ar: 'أيوه، باني الـCV يتيح الطباعة، وتقدر تختار Save as PDF من خيارات المتصفح.', en: 'Yes. Use the CV Builder’s print option and choose “Save as PDF” in your browser.' } },
    ],
    toolUrl: '/tools/cv-builder', toolLabel: { ar: 'افتح باني الـCV', en: 'Open Student CV Builder' },
    seoTitle: 'How to Write a University Student CV | GoAcadio',
    seoDescription: 'A practical CV guide for university students covering education, projects, skills and preparing a clean PDF resume.',
  },
  {
    slug: 'seven-day-exam-revision-plan', icon: '🗓️',
    category: { ar: 'التخطيط للامتحانات', en: 'Exam preparation' },
    title: { ar: 'خطة مراجعة 7 أيام قبل الامتحان: مثال قابل للتعديل', en: 'A practical seven-day exam revision plan' },
    description: { ar: 'خطوات توزيع المواد على 14 جلسة قصيرة، مع مثال يوم بيوم وطريقة تعديل الخطة لو اتأخرت.', en: 'See how to distribute 14 focused study blocks across seven days, with a worked example and a recovery plan.' },
    intro: { ar: 'الخطة الجيدة مش جدول مليان ساعات؛ هي قرارات واقعية عن إيه هتراجع وإزاي هتختبر نفسك. المثال هنا لطالب عنده 90 دقيقة يوميًا وثلاث مواد، وتقدر تغيّر عدد الجلسات حسب ظروفك.', en: 'A useful revision plan is not a crowded calendar. It tells you what to practice and how you will test your understanding. This worked example assumes 90 minutes per day and three courses; adjust the block count to fit your situation.' },
    sections: [
      { title: { ar: '1. احسب قدرتك الفعلية قبل توزيع المواد', en: '1. Start with your real study capacity' },
        paragraphs: [
          { ar: 'لو تقدر تذاكر جلستين كل يوم، كل جلسة 45 دقيقة، يبقى عندك 14 جلسة خلال الأسبوع. اترك وقت الأكل والتنقل والنوم بعيدًا عن الخطة، ومتعتبرش أي وقت فاضي بالضرورة وقت مذاكرة قابل للاستمرار.', en: 'Two 45-minute blocks per day give you 14 blocks during the week. Do not count meals, travel, sleep or every spare minute as dependable study time.' },
          { ar: 'اعمل قائمة صغيرة لكل مادة: امتحانها إمتى؟ ما أهم الموضوعات؟ وإيه اللي تقدر تحل فيه أسئلة من غير ملاحظات؟ إجابات الأسئلة دي أهم من مجرد عدد صفحات المحاضرة.', en: 'For each course, write its exam date, essential topics and the questions you can answer without notes. Those answers matter more than the lecture page count.' },
        ], points: [
          { ar: 'ابدأ بالأسئلة أو الامتحانات السابقة المسموح باستخدامها لتكتشف نقاط الضعف.', en: 'Use permitted past questions or self-tests to identify weak topics.' },
          { ar: 'لو عندك جلسة واحدة فقط يوميًا، قلل الخطة إلى 7 جلسات بدل ما تنسخ الجدول كما هو.', en: 'With only one block per day, cut this to seven blocks rather than copying the schedule unchanged.' },
        ] },
      { title: { ar: '2. مثال على توزيع ثلاث مواد', en: '2. Worked example: three courses' },
        paragraphs: [
          { ar: 'افترض إن عندك Data Structures امتحانه قريب، وCalculus محتاج مسائل كتير، وDatabase Systems مذاكر أساسياتها لكن محتاج مراجعة. هنخصص أربع جلسات للـData Structures، وخمس للـCalculus، وثلاث للـDatabase، ونسيب جلستين أخيرتين لاختبار شامل وتصحيح أضعف نقطة.', en: 'Imagine Data Structures has the earliest exam, Calculus needs a lot of problem-solving, and Database Systems mainly needs consolidation. Allocate four blocks to Data Structures, five to Calculus, three to Database Systems, and reserve two for a mixed test and the weakest remaining topic.' },
          { ar: 'التوزيع ده مش قاعدة لكل الطلاب؛ لو امتحان مادة أقرب أو تقييمك فيها أضعف، انقل لها جلسة من مادة مستقرة بدل ما تزود عدد ساعات مستحيل تلتزم به.', en: 'This split is an example, not a rule. If a deadline is earlier or one course is much weaker, move a block from a stronger course instead of inventing extra hours.' },
        ] },
      { title: { ar: '3. الجدول يوم بيوم', en: '3. A day-by-day schedule' },
        paragraphs: [
          { ar: 'اليوم 1: جلستان Data Structures لفهم موضوعين صعبين وحل أمثلة. اليوم 2: جلسة مسائل Data Structures وجلسة تأسيس Calculus. اليوم 3: اختبار قصير Data Structures وجلسة أسئلة Database Systems.', en: 'Day 1: two Data Structures blocks on difficult topics and worked problems. Day 2: one Data Structures problem block and one Calculus foundation block. Day 3: one Data Structures mini-test and one Database Systems recall block.' },
          { ar: 'اليوم 4: جلستان مسائل Calculus. اليوم 5: جلسة Database Systems وجلسة Calculus. اليوم 6: جلسة Database Systems وجلسة Calculus. اليوم 7: اختبار مختلط بوقت محدد ثم جلسة لتصحيح الأخطاء فقط.', en: 'Day 4: two Calculus problem-solving blocks. Day 5: one Database Systems block and one Calculus block. Day 6: one Database Systems block and one Calculus block. Day 7: one timed mixed self-test and one block dedicated solely to corrections.' },
          { ar: 'لو امتحان Data Structures هيكون صباح اليوم 3 مثلًا، لازم تقدّم اختباره النهائي إلى اليوم 2. مواعيد الامتحانات الحقيقية هي اللي تحكم الترتيب؛ مش المثال المكتوب هنا.', en: 'If the Data Structures exam actually takes place on the morning of Day 3, move its final practice to Day 2. Real deadlines always override this sample order.' },
        ] },
      { title: { ar: '4. داخل كل جلسة: تذكّر ثم حل ثم صحّح', en: '4. Inside each block: recall, practice, correct' },
        paragraphs: [
          { ar: 'قسّم الـ45 دقيقة إلى 10 دقائق تكتب فيها ما تتذكره من غير فتح المحاضرة، ثم 25 دقيقة لحل أسئلة أو مسائل، ثم 10 دقائق لمراجعة الأخطاء وتسجيل سؤال واحد تحتاج ترجع له. مش لازم تلتزم بالدقائق حرفيًا؛ الفكرة إن المذاكرة تشمل استرجاعًا وتطبيقًا مش قراءة بس.', en: 'A useful 45-minute block can be 10 minutes recalling without notes, 25 minutes answering questions or solving problems, and 10 minutes checking errors and recording one follow-up question. The exact minutes are flexible; the key is retrieval and application, not only rereading.' },
          { ar: 'في نهاية اليوم اكتب «أقدر أشرح الموضوع في دقيقتين؟» و«أقدر أحل مسألة جديدة من غير ما أبص على الحل؟». لو الإجابة لا، الموضوع يحتاج مراجعة إضافية حتى لو خلصت قراءته.', en: 'At the end of the day ask: “Can I explain the idea in two minutes?” and “Can I solve a new problem without the solution?” A topic may need another block even if you finished reading it.' },
        ] },
      { title: { ar: '5. لو الخطة اتعطلت أو الوقت اتغير', en: '5. Recover when your plan slips' },
        paragraphs: [
          { ar: 'لو ضاعت جلسة، متحاولش تضاعف جلسات اليوم التالي بشكل تلقائي. حدد الجزء الأساسي اللي مش هينفع تدخل الامتحان من غيره، وانقل الأسئلة الأقل أهمية أو اختصر تلخيص الملاحظات.', en: 'If you miss a block, do not automatically double the next day. Keep the prerequisite topics and high-impact problems; shorten note rewriting or postpone lower-priority material.' },
          { ar: 'في الليلة الأخيرة، اختبر نفسك في نقاط الخطأ المتكررة، وجهّز أدوات الامتحان، وحافظ على وقت نوم مناسب. خطة أسبوع حقيقية تسيب مساحة للاستراحة والتغييرات الطارئة.', en: 'On the final evening, revisit repeated mistakes, prepare exam essentials and leave time for appropriate sleep. A realistic week includes breaks and room for surprises.' },
        ] },
    ],
    faqs: [
      { question: { ar: 'أذاكر مادة واحدة في اليوم ولا أنوّع؟', en: 'Should I study one course a day or mix courses?' }, answer: { ar: 'الاختيار يعتمد على قرب الامتحان وطبيعة المادة. التنويع ممكن يساعدك تراجع مهارات مختلفة، لكن المادة الأقرب امتحانًا قد تحتاج جلستين متتاليتين.', en: 'It depends on exam order and the tasks involved. Mixing can help you revisit different skills, but an imminent exam may deserve both daily blocks.' } },
      { question: { ar: 'لو متاح ليا 30 دقيقة فقط؟', en: 'What if I only have 30 minutes?' }, answer: { ar: 'اعمل 5 دقائق تذكّر، و20 دقيقة سؤال أو مسألة، و5 دقائق تصحيح. عدّل عدد المهام وفق الوقت بدل ما تلغي التمرين.', en: 'Try five minutes of recall, twenty minutes of a question or problem, and five minutes of checking. Reduce the number of tasks rather than removing practice.' } },
      { question: { ar: 'إزاي أعرف إن المراجعة نجحت؟', en: 'How do I know the revision worked?' }, answer: { ar: 'قارن قدرتك على حل أسئلة جديدة بدون الرجوع للحل، وسجّل أخطاء متكررة اختفت وأخطاء ما زالت موجودة. عدد الساعات وحده مش مقياس كفاية.', en: 'Track whether you can solve new questions without looking at solutions and whether repeated errors disappear. Hours studied alone are not a sufficient measure.' } },
    ],
    toolUrl: '/tools/focus-timer', toolLabel: { ar: 'ابدأ جلسة تركيز مجانية', en: 'Start a free focus session' },
    seoTitle: 'Seven-Day Exam Revision Plan with Worked Schedule | GoAcadio',
    seoDescription: 'A realistic seven-day study schedule for three courses, with 14 focus blocks, daily practice and a plan for missed sessions.',
  },
  {
    slug: 'lecture-to-practice-questions', icon: '🧩',
    category: { ar: 'المراجعة النشطة', en: 'Active recall' },
    title: { ar: 'إزاي تحوّل المحاضرة لأسئلة تدريبية مفيدة؟', en: 'Turn lecture notes into useful practice questions' },
    description: { ar: 'من الفكرة الأساسية إلى أسئلة اختيار وصح وغلط، مع أمثلة للأخطاء الشائعة وطريقة تقييم الإجابات.', en: 'Turn concepts into useful MCQ and true/false questions, avoid weak distractors and use mistakes to plan a second review.' },
    intro: { ar: 'قراءة المحاضرة خطوة مهمة، لكن الاختبار بيكشف لو أنت فاهم ولا بس متذكر شكل الكلام. تقدر تطبق الطريقة يدويًا بالقلم والورقة، أو تستعين بمولّد الاختبارات بعد تسجيل الدخول.', en: 'Reading lecture notes is useful, but a practice question tests whether you can retrieve and apply an idea without seeing the original wording. You can use this method with paper and pencil or with the quiz generator after signing in.' },
    sections: [
      { title: { ar: '1. اختر أهداف التعلم قبل كتابة الأسئلة', en: '1. Identify what the lesson actually teaches' },
        paragraphs: [
          { ar: 'بعد قراءة جزء صغير من المحاضرة، اكتب من ثلاثة إلى خمسة أهداف واضحة مثل «أميّز بين Stack وQueue» أو «أفسّر ليه البحث الثنائي يحتاج بيانات مرتبة». الهدف المحدد أسهل في التقييم من «أراجع الشابتر كله».', en: 'After reading a short section, write three to five specific objectives such as “distinguish a stack from a queue” or “explain why binary search needs ordered data.” A precise objective is easier to assess than “revise the whole chapter.”' },
          { ar: 'اختار لكل هدف مستوى مناسب: سؤال تعريف أو مقارنة أو تطبيق على مثال جديد. الأسئلة اللي تعتمد على نفس الجملة المنسوخة مش هتثبت بالضرورة إنك فاهم الفكرة.', en: 'For each objective, choose a level: recall, comparison, or applying the concept to a new example. Questions that simply repeat one memorized sentence may not show understanding.' },
        ] },
      { title: { ar: '2. مثال صحيح على سؤال اختيار من متعدد', en: '2. A worked multiple-choice example' },
        paragraphs: [
          { ar: 'المعلومة: البحث الثنائي Binary Search يفترض ترتيب العناصر حسب مفتاح المقارنة. السؤال: «أي شرط أساسي لاستخدام Binary Search على قائمة؟» الاختيارات: أ) العناصر مرتبة، ب) كل العناصر متساوية، ج) القائمة خالية، د) لا يحتاج لأي ترتيب. الإجابة: أ.', en: 'Concept: binary search requires the sequence to be sorted under the comparison used. Question: “Which condition is needed for binary search on a list?” Options: A) The list is sorted; B) All elements are identical; C) The list is empty; D) No ordering is needed. Answer: A.' },
          { ar: 'لما تراجع الإجابة، ما تكتفيش بالحرف الصحيح؛ اشرح لنفسك ليه باقي الاختيارات غير صحيحة. لو كل المشتتات سخيفة، السؤال بيبقى سهل بلا فائدة حتى لو شكله مرتب.', en: 'When checking the answer, explain why the other options are wrong. Distractors should be plausible misconceptions, not nonsense choices that make the question trivial.' },
        ], points: [
          { ar: 'خلّي سؤال الاختيار فيه إجابة واحدة واضحة في السياق المحدد.', en: 'Make sure the question has one defensible answer in its stated context.' },
          { ar: 'تجنب «كل ما سبق» لو بيخلي السؤال يعتمد على التخمين.', en: 'Avoid “all of the above” when it turns the item into a guessing exercise.' },
        ] },
      { title: { ar: '3. مثال لسؤال صح أو غلط مفيد', en: '3. A useful true-or-false example' },
        paragraphs: [
          { ar: 'مثال: «البحث الثنائي يقدر يشتغل بشكل صحيح على أي قائمة عشوائية الترتيب من غير تعديل». العبارة غلط في صورته القياسية، لأن طريقة تقسيم نطاق البحث تعتمد على ترتيب العناصر. بعد ما تجاوب، اكتب السبب في سطر واحد بدل ما تعتمد على الحفظ.', en: 'Example: “Standard binary search works correctly on any unsorted list without modification.” False: its range-elimination logic depends on an ordered sequence. After choosing true or false, write the reason in one sentence.' },
          { ar: 'ابتعد عن العبارات الملتبسة اللي تخلط بين أكثر من مفهوم أو تستعمل «دائمًا» و«مستحيل» من غير ضرورة. لو السؤال له أكثر من تفسير صحيح، عدّله قبل ما تحسب نتيجته.', en: 'Avoid ambiguous statements that combine several ideas or use absolutes without need. If a reasonable reader can interpret the statement in multiple ways, revise it before scoring yourself.' },
        ] },
      { title: { ar: '4. اختبر نفسك ثم ابنِ جولة ثانية من الأخطاء', en: '4. Test first, then turn mistakes into a second round' },
        paragraphs: [
          { ar: 'حل الأسئلة من غير فتح الملف، وبعدها صنّف كل إجابة: صحيح مع سبب، صحيح بالتخمين، أو خطأ. السؤال اللي جاوبته بالتخمين يحتاج مراجعة حتى لو اتحسب صح.', en: 'Answer without opening the notes. Then label each answer: correct with reasoning, correct by guessing, or incorrect. A lucky guess deserves review even if it counted as correct.' },
          { ar: 'مثال: من 10 أسئلة، حلّيت 6 بثقة و2 بالتخمين و2 خطأ. بدل ما تقول «8 من 10 وخلاص»، اعمل 4 أسئلة جديدة على الموضوعات اللي ما كانتش ثابتة عندك، وجربها بعد فاصل مناسب.', en: 'For example, out of ten questions you answer six with solid reasoning, guess two correctly and miss two. Rather than stopping at “8/10,” create four new questions on the weak concepts and try them again after a suitable interval.' },
        ] },
      { title: { ar: '5. التعامل مع PDF ومولّد الأسئلة بالذكاء الاصطناعي', en: '5. Working with lecture PDFs and AI-generated quizzes' },
        paragraphs: [
          { ar: 'لو ملف PDF عبارة عن صور ممسوحة، استخراج النص ممكن ما يشتغلش؛ استخدم ملاحظاتك المكتوبة أو ملف نصي واضح بدل الاعتماد على تخمين المحتوى. الأداة في GoAcadio تحتاج حسابًا لتوليد الاختبارات.', en: 'If a PDF is made of scanned images, text extraction may fail. Use clear typed notes or a text-based file instead of assuming the reader can see the scans. GoAcadio’s quiz-generation feature requires an account.' },
          { ar: 'ملف PDF الأصلي بيتقرأ داخل المتصفح، لكن النص المستخرج أو اللي بتلصقه بيتبعت لخدمة AI لتوليد الأسئلة. ما تدخلش معلومات سرية أو محتوى مش مسموح تشاركه. راجع كل إجابة وتفسير قبل ما تعتمد عليها للمذاكرة.', en: 'The PDF file is read in the browser, but extracted or pasted text is sent to the AI service for quiz generation. Do not submit confidential or unauthorized material. Check each answer and explanation before using it to study.' },
        ] },
    ],
    faqs: [
      { question: { ar: 'أبدأ بكام سؤال لكل موضوع؟', en: 'How many questions should I make per topic?' }, answer: { ar: 'ابدأ بثلاثة إلى خمسة أسئلة مختلفة: تعريف ومقارنة وتطبيق. زوّد العدد لو أخطاؤك بتكشف نقاط ضعف حقيقية، مش بهدف رقم ثابت.', en: 'Start with three to five varied questions: recall, comparison and application. Add more when mistakes show a real gap, not to reach an arbitrary total.' } },
      { question: { ar: 'هل صح وغلط كفاية لوحده؟', en: 'Is true or false enough on its own?' }, answer: { ar: 'مفيد للتأكد من المفاهيم، لكنه ممكن يشجّع التخمين. أضف سؤال «ليه؟» ومسألة تطبيقية لو طبيعة المادة تسمح.', en: 'It can check concepts but can also reward guessing. Add a “why?” prompt and an application question when relevant.' } },
      { question: { ar: 'هل لازم أستخدم AI؟', en: 'Do I need AI to use this method?' }, answer: { ar: 'لا. الطريقة كلها قابلة للتطبيق يدويًا. الأداة بتسرّع تجهيز مسودة الأسئلة لكن مش بديل عن مراجعة صحتها.', en: 'No. The full process works manually. An AI tool can speed up drafting, but it does not replace checking correctness.' } },
    ],
    toolUrl: '/quiz-generator', toolLabel: { ar: 'جرّب مولّد الاختبارات (بحساب)', en: 'Try the quiz generator (account required)' },
    seoTitle: 'How to Make Practice Questions from Lectures | GoAcadio',
    seoDescription: 'A student-friendly guide to writing meaningful MCQs and true-or-false questions from lectures, with worked examples and error review.',
  },
{
  slug: 'flashcards-spaced-repetition-study-guide',
  "icon": "🗂️",
  "category": {
    "ar": "المراجعة النشطة",
    "en": "Active recall & memory"
  },
  "title": {
    "ar": "طريقة عمل بطاقات Flashcards والمراجعة المتباعدة: مثال عملي لمدة أسبوع",
    "en": "How to use flashcards and spaced review: a worked one-week plan"
  },
  "description": {
    "ar": "حوّل الملاحظات لأسئلة تختبر الفهم، واعمل بطاقات جيدة وجدول مراجعتها مع مثال واقعي يمكن تكراره.",
    "en": "Turn lecture notes into effective recall questions, schedule reviews and follow a realistic one-week worked example."
  },
  "intro": {
    "ar": "البطاقة مش ملخص طويل بيتقلب على الشاشة؛ هي سؤال محدد تحاول تجاوبه قبل ما تشوف الحل. GoAcadio بتساعدك تراجع البطاقات المستحقة وتختار مستوى التذكر، لكن المواعيد تقديرية ومش ضمان إنك حفظت المعلومة.",
    "en": "A flashcard is not a tiny slide of notes: it is a precise question you answer from memory before revealing the back. GoAcadio schedules cards using your recall ratings, but those intervals are a simple study aid, not a guarantee of retention."
  },
  "sections": [
    {
      "title": {
        "ar": "1. قسم المحاضرة لأسئلة قابلة للإجابة",
        "en": "1. Convert a lecture into testable questions"
      },
      "paragraphs": [
        {
          "ar": "افترض إنك بتذاكر محاضرة Data Structures وفيها Stack وQueue. بدل ما تنسخ تعريف 10 سطور، اكتب على وجه البطاقة «لو أضفت 3 ثم 5 ثم 7 إلى Stack، إيه أول عنصر يخرج؟» وعلى الظهر «7، لأن Stack يعمل بمبدأ Last In, First Out (LIFO)». السؤال يختبر تطبيق المبدأ، مش مجرد تذكر اسمه.",
          "en": "Suppose your Data Structures notes cover stacks and queues. Instead of copying a ten-line definition, put “After pushing 3, then 5, then 7 onto a stack, which item is popped first?” on the front. On the back: “7, because a stack follows last-in, first-out (LIFO).” This tests applying the rule, not only reciting its name."
        },
        {
          "ar": "اعمل بطاقة تانية: «أضفت A ثم B ثم C إلى Queue، أي حرف يخرج أولاً؟» والإجابة «A؛ لأن Queue يعمل First In, First Out (FIFO)». ممكن تضيف بطاقة ثالثة تقارن بين الحالتين، لكن بلاش تحشر ثلاث أسئلة مستقلة في نفس الوجه.",
          "en": "Add a second card: “If A, B and C enter a queue in that order, which leaves first?” Answer: “A, because a queue is first-in, first-out (FIFO).” A third card can compare the two structures, but avoid asking three unrelated questions on one front."
        }
      ],
      "points": [
        {
          "ar": "خلي لكل بطاقة إجابة واحدة قصيرة يمكن التحقق منها.",
          "en": "Give each card one checkable answer."
        },
        {
          "ar": "اكتب الأمثلة والأرقام بنفسك بدل نسخ فقرات من المحاضرة.",
          "en": "Use your own examples rather than copying lecture paragraphs."
        },
        {
          "ar": "لو نسيت شرح الكلمة، أضف بطاقة تطبيق جديدة بدل ما تكدس كلاماً على الظهر.",
          "en": "If you miss a concept, add a new application card rather than piling notes onto the back."
        }
      ]
    },
    {
      "title": {
        "ar": "2. اختبر نفسك قبل كشف الإجابة",
        "en": "2. Recall first, reveal second"
      },
      "paragraphs": [
        {
          "ar": "اقرأ وجه البطاقة، وابعد إيدك عن زر «اعرض الإجابة» من خمس إلى عشر ثوانٍ. حاول تقول الإجابة وسببها بصوت منخفض أو تكتبها من غير فتح المحاضرة. بعد الكشف قارن الفكرة الأساسية، مش نفس الجملة حرفياً.",
          "en": "Read the front and wait five to ten seconds before selecting Reveal answer. Say or write an answer and explain why it is true without reopening your notes. Once revealed, compare the important idea rather than requiring identical wording."
        },
        {
          "ar": "لو جاوبت 7 بدل 3 لكن من غير ما تعرف تفسير LIFO، ما تعتبرهاش بطاقة سهلة. قيّم جودة الاسترجاع: «لم أتذكر» لو الإجابة غير صحيحة؛ «صعب» لو احتجت وقتاً أو مساعدة؛ «جيد» لو صح بفهم؛ «سهل» لو سريع وواضح.",
          "en": "If you answered “7” by guessing but cannot explain LIFO, do not rate the card Easy. Use Again for a missed answer, Hard for a slow or shaky recall, Good for a correct explained answer, and Easy when the concept is immediately clear."
        }
      ]
    },
    {
      "title": {
        "ar": "3. مثال أسبوع مراجعة من 12 بطاقة",
        "en": "3. A one-week example with 12 cards"
      },
      "paragraphs": [
        {
          "ar": "اليوم 1: اقرأ جزءاً من المحاضرة، وأنشئ 12 بطاقة: 4 تعريفات، و4 مقارنة، و4 تطبيق. جرّب الإجابة على الكل مرة واحدة بدون الملاحظات؛ أول محاولة بتكشف أسئلة صياغتها غامضة. لا ترفع العدد لمجرد الوصول لهدف شكلي.",
          "en": "Day 1: read one small lecture section and make 12 cards: four recall questions, four comparisons and four applications. Attempt each card once without notes. The first attempt often reveals poorly worded questions; do not increase the count merely to hit a target."
        },
        {
          "ar": "اليومان 2 و3: افتح «راجع البطاقات» واشتغل على المستحق فقط، ثم حل مسألة قصيرة من نفس الموضوع من غير مساعدة. اليوم 4: اختبر الفرق بين Stack وQueue بمثال جديد مثل ترتيب الطلبات في صف انتظار. اليومان 5 و6: راجع البطاقات المستحقة ودوّن الأخطاء المتكررة. اليوم 7: حل 5 أسئلة جديدة من المحاضرة ولا تكتفي بالبطاقات.",
          "en": "Days 2 and 3: review only due cards, then solve a short problem independently. Day 4: apply the stack-versus-queue idea to a new case, such as requests waiting in line. Days 5 and 6: review due cards and record repeated misconceptions. Day 7: solve five fresh questions based on the lecture instead of relying on cards alone."
        },
        {
          "ar": "المواعيد المعروضة في GoAcadio تختلف بحسب تقييمك: «لم أتذكر» تعيد البطاقة بعد حوالي 10 دقائق، وباقي الاختيارات قد تؤخرها أياماً. الجدول الأسبوعي هنا مثال على طريقة الاستخدام وليس وعداً بأن كل بطاقة ستظهر في يوم معين.",
          "en": "GoAcadio's next due date depends on your rating. Again reschedules a card for roughly ten minutes later; other responses can move it days ahead. This one-week plan is an example of habits, not a promise that every card will appear on a specific date."
        }
      ]
    },
    {
      "title": {
        "ar": "4. اعرف الفرق بين مراجعة حقيقية ونجاح وهمي",
        "en": "4. Avoid the illusion of knowing"
      },
      "paragraphs": [
        {
          "ar": "لو السؤال «ما معنى FIFO؟» وحفظت الاختصار، اعمل بطاقة ثانية تسألك عن حالة جديدة: «لو الناس دخلت شباك التذاكر بترتيب سارة، علي، منى؛ مين يتخدم أولاً في طابور عادي؟». القدرة على نقل الفكرة لموقف جديد مؤشر أقوى من تكرار الحروف.",
          "en": "Memorizing the letters in FIFO is easier than understanding a queue. Add a transfer question: “Sara, Ali and Mona join a normal ticket line in that order. Who is served first?” Correctly applying the idea to a new situation is stronger evidence than repeating an abbreviation."
        },
        {
          "ar": "لو بتجاوب نفس البطاقة غلط مرتين، ارجع للمصدر وعدّل صياغة السؤال أو اكتب السبب اللي كنت فاهمه خطأ. البطاقة وحدها لا تصلح فجوة فهم كبيرة؛ جرّب شرحاً أو مسألة ثم ارجع للمراجعة.",
          "en": "If you miss the same card twice, reopen the source and rewrite an ambiguous question or explain the misconception. Cards alone cannot repair a major gap in understanding; use a worked explanation or problem and then return to review."
        }
      ]
    },
    {
      "title": {
        "ar": "5. احفظ بطاقاتك واحمِ خصوصية ملاحظاتك",
        "en": "5. Keep your cards and lecture notes private"
      },
      "paragraphs": [
        {
          "ar": "GoAcadio تحفظ البطاقات ومجموعاتها ومواعيدها في المتصفح على جهازك، حتى من غير حساب. مفيش مزامنة تلقائية بين الموبايل واللابتوب في الإصدار ده. استخدم «تصدير JSON» كل فترة، واحفظ الملف في مكان آمن، واستورده من نفس أداة Flashcards على جهاز آخر.",
          "en": "GoAcadio stores cards, decks and due dates locally in your browser, even without an account. This version does not automatically sync those cards between phone and laptop. Periodically export a JSON backup, store it securely and import it into Flashcards on another device."
        },
        {
          "ar": "مسح بيانات المتصفح أو استخدام نافذة خاصة ممكن يضيّع البطاقات المحلية. ما تكتبش معلومات طلاب شخصية أو أسرار في البطاقات اللي هتشارك نسخها مع الآخرين، وماترفعش مواد محمية الحقوق بدون إذن.",
          "en": "Clearing browser data or using a private window can erase local cards. Avoid personal student information or confidential notes in backups you plan to share, and respect permissions for any copyrighted lecture material."
        }
      ]
    }
  ],
  "faqs": [
    {
      "question": {
        "ar": "هل المراجعة المتباعدة بتغني عن حل المسائل؟",
        "en": "Can spaced review replace problem solving?"
      },
      "answer": {
        "ar": "لا. البطاقات مفيدة لاسترجاع مفاهيم صغيرة، لكن المواد اللي فيها تطبيق تحتاج مسائل جديدة وشرح خطوات الحل.",
        "en": "No. Cards help retrieve small concepts, but application-heavy subjects still need novel problems and explained solutions."
      }
    },
    {
      "question": {
        "ar": "هل البطاقات بتتزامن لو سجلت دخول؟",
        "en": "Will cards sync if I sign in?"
      },
      "answer": {
        "ar": "لا، البطاقات حالياً محفوظة على نفس الجهاز. صدّر ملف JSON لاستعادتها لاحقاً أو نقلها.",
        "en": "Not yet. Cards currently stay on the device. Export a JSON file to back them up or move them."
      }
    },
    {
      "question": {
        "ar": "أعمل كام بطاقة في اليوم؟",
        "en": "How many cards should I create per day?"
      },
      "answer": {
        "ar": "ابدأ بمجموعة صغيرة لا تستهلك وقتك كله في الكتابة؛ مثلاً 8 إلى 12 بطاقة على جزء واحد، ثم اختبر جودتها في المراجعة.",
        "en": "Start with a small manageable set, for example eight to twelve cards on one lecture segment, then refine them after testing recall."
      }
    },
    {
      "question": {
        "ar": "هل «سهل» معناها إني مش هنسى المعلومة؟",
        "en": "Does an Easy rating mean I will never forget?"
      },
      "answer": {
        "ar": "لا. هو فقط تقييمك الحالي الذي يؤثر في موعد المراجعة التالية، وليس شهادة بحفظ المعلومة للأبد.",
        "en": "No. Easy is your current self-assessment for scheduling the next review, not proof of permanent retention."
      }
    }
  ],
  "toolUrl": "/tools/flashcards",
  "toolLabel": {
    "ar": "افتح بطاقات Flashcards المجانية",
    "en": "Open free Flashcards"
  },
  "seoTitle": "Spaced Repetition Flashcards: Worked One-Week Study Plan | GoAcadio",
  "seoDescription": "Create useful flashcards from class notes, use spaced review ratings, and follow a step-by-step one-week study example with privacy tips."
},
{
  slug: 'student-project-to-internship-cv',
  "icon": "🧪",
  "category": {
    "ar": "الاستعداد للتدريب",
    "en": "Internships & careers"
  },
  "title": {
    "ar": "من مشروع جامعي إلى خبرة مفيدة في CV: مثال لطالب بدون خبرة",
    "en": "Turn a university project into an internship-ready CV: a worked example"
  },
  "description": {
    "ar": "دليل لتوثيق مساهمتك الحقيقية في مشروع الجامعة وكتابة نقاط CV واقعية وتجنب الادعاءات المبالغ فيها.",
    "en": "Document your real contribution to a class project, write credible CV bullet points and prepare a portfolio for a first internship."
  },
  "intro": {
    "ar": "لو لسه ما اشتغلتش وظيفة، مشروع جامعي متقن ممكن يوضح طريقة تفكيرك. المشكلة مش نقص وظيفة سابقة؛ المشكلة إن كثير من السير الذاتية تكتب «عملت مشروع» بدون توضيح الدور أو الدليل. هنا هنستخدم مثال تطبيقي منظم.",
    "en": "If you have no paid work experience yet, a solid class project can demonstrate how you work. The problem is not necessarily the missing job title: it is vague claims such as “worked on a project” without describing your responsibility or evidence. Here is a practical way to show the work."
  },
  "sections": [
    {
      "title": {
        "ar": "1. اكتب المشروع كقصة مشكلة وحل",
        "en": "1. Describe the problem before the technology"
      },
      "paragraphs": [
        {
          "ar": "تخيل فريقاً دراسياً عمل تطبيق مواعيد امتحانات مبسطاً. المشكلة: الطالب كان بيبحث في أكثر من ملف PDF ليعرف وقت امتحانه. الحل في المشروع: نموذج يبحث باسم الطالب ويعرض اليوم والساعة والمكان من بيانات تدريبية. المثال افتراضي، مش مشروعاً من أعمال GoAcadio.",
          "en": "Imagine a class team building a simple examination timetable lookup. The problem: students had to search multiple PDF schedules to find an exam time. The classroom prototype lets them enter a name and see a day, time and room from mock data. This is an illustrative example, not a claim about a completed GoAcadio project."
        },
        {
          "ar": "قبل الكتابة في السيرة الذاتية حدد 3 حقائق: إيه المشكلة؟ إيه الجزء اللي نفذته بنفسك؟ إيه الدليل الموجود (تجربة، ملف README، صورة شاشة، أو اختبار)؟ بلاش تكتب إن التطبيق مستخدم من آلاف الطلاب لو ماعندكش أرقام موثقة.",
          "en": "Before writing your CV, identify three facts: what problem did the project address, which part did you personally implement, and what evidence exists (a demo, README, screenshot or test)? Do not claim thousands of users or impressive accuracy figures unless you can substantiate them."
        }
      ]
    },
    {
      "title": {
        "ar": "2. اعمل سجل مساهمات بسيط قبل كتابة CV",
        "en": "2. Build a simple contribution log"
      },
      "paragraphs": [
        {
          "ar": "اكتب جدول صغير من 4 خانات: المهمة، دورك، الأدوات، الدليل. مثال: «ربط صفحة البحث ببيانات JSON»؛ الدور «كتابة دالة تصفية وترتيب النتائج»؛ الأدوات «JavaScript وHTML»؛ الدليل «اختبار بحث باسم جزئي ولقطة للشاشة». وجود الدليل يخليك تشرح المشروع بثقة في المقابلة.",
          "en": "Create a four-column note: task, your role, tools and evidence. Example: “Connect timetable search to JSON data”; role: “Implemented filtering and result ordering”; tools: JavaScript and HTML; evidence: “Tested a partial-name search and saved a screenshot.” Having evidence makes interview follow-ups easier."
        },
        {
          "ar": "لو المشروع جماعي، اكتب بوضوح أنت عملت إيه، واذكر إنك تعاونت مع فريق من غير ما تنسب لنفسك قاعدة البيانات أو التصميم بالكامل. لو المشروع غير منشور، ممكن تعرض README وصور شاشة بعد ما تتأكد من عدم كشف بيانات طلاب حقيقية.",
          "en": "For team projects, be precise about your work and acknowledge teamwork without implying that you built the entire database or design alone. For a private project, a README and sanitized screenshots can be enough, provided no real student records are exposed."
        }
      ],
      "points": [
        {
          "ar": "اسم المشروع + جملة واحدة تشرح فائدته.",
          "en": "Project name and one sentence explaining the benefit."
        },
        {
          "ar": "تقنيتان أو ثلاث استخدمتهما فعلاً.",
          "en": "Two or three technologies you actually used."
        },
        {
          "ar": "نقطة واحدة مثبتة عن مساهمتك ومسؤوليتك.",
          "en": "One defensible contribution or responsibility."
        }
      ]
    },
    {
      "title": {
        "ar": "3. من جملة ضعيفة إلى نقطة قوية",
        "en": "3. Rewrite a weak CV bullet into a credible one"
      },
      "paragraphs": [
        {
          "ar": "ضعيف: «كنت مسؤول عن مشروع تخرج مذهل باستخدام تقنيات كثيرة». أفضل: «طوّرت واجهة بحث في نموذج جدول امتحانات باستخدام JavaScript، مع تصفية بالاسم وعرض اليوم والساعة، واختبرت إدخال أسماء كاملة وجزئية». الصياغة الثانية أقوى لأنها قابلة للسؤال والتحقق.",
          "en": "Weak: “Responsible for an amazing final project using many technologies.” Better: “Built a JavaScript timetable search interface that filters student names and displays exam dates and times; tested full and partial-name inputs.” The second version is more useful because a reviewer can ask how it worked."
        },
        {
          "ar": "لو عندك نتائج حقيقية، اذكرها مع سياقها. مثلاً «خفضت زمن البحث من 8 ثوانٍ إلى ثانيتين في اختبار محلي من 50 اسماً» لو أنت أجريت القياس ده بالفعل واحتفظت بالطريقة والنتيجة. لو ما قستش، احذف الأرقام تماماً.",
          "en": "When real measurements exist, give their context. For example, “Reduced lookup time from eight to two seconds in a 50-name local test” is suitable only if you actually ran, documented and can explain that measurement. Without an experiment, omit the numbers entirely."
        }
      ]
    },
    {
      "title": {
        "ar": "4. جهز README وبورتفوليو صغير",
        "en": "4. Prepare a minimal README and portfolio"
      },
      "paragraphs": [
        {
          "ar": "صفحة واحدة للمشروع تكفي كبداية: المشكلة، صورة أو فيديو قصير للواجهة، طريقة التشغيل، التقنيات، و3 اختبارات أجريتها. مثال اختبارات البحث: اسم مطابق، اسم جزئي، اسم غير موجود. صور الشاشة لازم تخفي أي بيانات شخصية أو رقم طالب.",
          "en": "A one-page project README is often enough: problem, interface screenshot or short demo, setup instructions, technologies and three tests you actually performed. For search, example cases are an exact name, a partial name and a nonexistent name. Remove identifying student records from screenshots."
        },
        {
          "ar": "افصل بين مشروع تدريبي وبرنامج منشور فعلاً. كتابة «prototype» أو «course project» توضح نطاق الشغل من غير ما تقلل قيمته. اعمل رابط GitHub فقط لو المستودع ملكك، مسموح بمشاركته، وفيه تعليمات تشغيل.",
          "en": "Distinguish a classroom prototype from a production service. Labeling it a “prototype” or “course project” clarifies scope without minimizing real work. Add a GitHub link only if you own or can share the repository and it includes usable setup instructions."
        }
      ]
    },
    {
      "title": {
        "ar": "5. اختبر وصف مشروعك قبل التقديم",
        "en": "5. Check your claims before applying"
      },
      "paragraphs": [
        {
          "ar": "اقرأ كل سطر في الـCV واسأل: هل أقدر أشرح خطوات التنفيذ من غير ما أفتح كود شخص تاني؟ هل أي نتيجة ذكرتها لها دليل؟ هل الأدوات المكتوبة استخدمتها بالفعل؟ لو الإجابة لا، عدّل العبارة.",
          "en": "For every CV line ask: could I explain how I implemented this without relying on someone else's code? Can I support each outcome with evidence? Did I personally use every listed technology? Rewrite anything you cannot defend."
        },
        {
          "ar": "استخدم CV Builder لكتابة مسودة قابلة للطباعة، ثم اطبعها PDF من المتصفح وراجع الروابط والإملاء وقابلية القراءة. خليك مستعد تشرح اختيارك لتقسيم المهمة أو معالجة خطأ تقني؛ الإجابة الصادقة أهم من الكلمات الكبيرة.",
          "en": "Use the CV Builder to draft and print a PDF, then review links, spelling and readability. Prepare to explain one design choice or bug you fixed. A specific, truthful explanation will usually serve you better than inflated buzzwords."
        }
      ]
    }
  ],
  "faqs": [
    {
      "question": {
        "ar": "هل ينفع أكتب مشروع مادة صغيرة في CV؟",
        "en": "Can I list a small coursework project on my CV?"
      },
      "answer": {
        "ar": "أيوه لو مرتبط بالتدريب وتقدر توضح مسؤوليتك ودليل على النتيجة، حتى لو مش مشروع تخرج.",
        "en": "Yes, if it relates to the internship and you can explain your contribution and evidence, even if it was not a capstone."
      }
    },
    {
      "question": {
        "ar": "هل لازم يكون عندي GitHub علني؟",
        "en": "Do I need a public GitHub repository?"
      },
      "answer": {
        "ar": "لا. ممكن تعرض مشروعاً خاصاً بملخص وطريقة تشغيل وصور خالية من بيانات شخصية، مع مراعاة حقوق الفريق.",
        "en": "No. You can document a private project with a description, reproducible steps and sanitized screenshots while respecting team rights."
      }
    },
    {
      "question": {
        "ar": "أكتب نتائج بالأرقام لو ماعملتش قياس؟",
        "en": "Should I add numerical results I never measured?"
      },
      "answer": {
        "ar": "لا. وصف الدالة أو الخطوات الحقيقية كفاية. الأرقام غير الموثقة بتضر المصداقية.",
        "en": "No. Describe the real implementation instead. Unsupported metrics weaken credibility."
      }
    },
    {
      "question": {
        "ar": "هل CV Builder بيبعت معلوماتي للسيرفر؟",
        "en": "Does the CV Builder upload my details to a server?"
      },
      "answer": {
        "ar": "مسودة الـCV في الأداة العامة محفوظة محلياً على جهازك. راجع صفحة الخصوصية قبل إدخال بيانات حساسة.",
        "en": "The public CV draft is stored locally on your device. Review the privacy page before entering sensitive details."
      }
    }
  ],
  "toolUrl": "/tools/cv-builder",
  "toolLabel": {
    "ar": "افتح باني السيرة الذاتية",
    "en": "Open the CV Builder"
  },
  "seoTitle": "Student Project to Internship CV: Realistic Worked Example | GoAcadio",
  "seoDescription": "Convert a university project into credible CV bullet points with a contribution log, honest evidence and a practical internship-ready checklist."
}
];

export function getStudyGuide(slug: string | undefined): StudyGuide | undefined {
  return studyGuides.find(g => g.slug === slug);
}
