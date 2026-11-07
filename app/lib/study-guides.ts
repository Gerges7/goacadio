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
        paragraphs: [{ ar: 'لو معاك تراكمي سابق وساعاته، تقدر تضيف نتيجة الفصل الجديد بمتوسط موزون: (CGPA القديم × ساعاته + GPA الفصل × ساعاته) ÷ إجمالي الساعات. الصيغة دي صالحة لما قواعد الجامعة تسمح بدمج الساعات دي بالشكل ده.', en: 'If you know your previous CGPA and its counted credits, a weighted update is (previous CGPA × previous credits + new term GPA × new term credits) ÷ combined credits. This assumes your institution counts those credits in the same way.' }] },
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
        paragraphs: [{ ar: 'خلال الجلسة، ابعد المشتتات وسجّل أي فكرة جانبية لترجع لها بعدين. بعد انتهاء المؤقت، خد 5 دقائق راحة. وبعد عدة جولات، ممكن تجرب راحة أطول.', en: 'During the session, put distractions aside and jot down side thoughts for later. After the timer, take a 5-minute break. After several sessions, consider a longer break.' }],
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
        paragraphs: [{ ar: 'استخدم عناوين واضحة، صياغة مختصرة، وخط مقروء. راجع الروابط والأخطاء الإملائية، واطبع PDF واتأكد إن كل صفحة سليمة قبل الإرسال. خصص المحتوى للفرصة اللي بتقدم عليها.', en: 'Use clear headings, concise writing, and readable typography. Test links, proofread, and inspect the exported PDF before applying. Tailor the content to each opportunity.' }] },
    ],
    faqs: [
      { question: { ar: 'لو معنديش خبرة عمل أكتب إيه؟', en: 'What if I have no work experience?' }, answer: { ar: 'ابدأ بالتعليم والمشاريع الجامعية والتطوع أو التدريب لو موجود. مهم توضح إنجازاتك الحقيقية.', en: 'Lead with education, coursework, projects, volunteering, or internships that demonstrate real work.' } },
      { question: { ar: 'هل ينفع أطبع CV من GoAcadio؟', en: 'Can I export a CV from GoAcadio?' }, answer: { ar: 'أيوه، باني الـCV يتيح الطباعة، وتقدر تختار Save as PDF من خيارات المتصفح.', en: 'Yes. Use the CV Builder’s print option and choose “Save as PDF” in your browser.' } },
    ],
    toolUrl: '/tools/cv-builder', toolLabel: { ar: 'افتح باني الـCV', en: 'Open Student CV Builder' },
    seoTitle: 'How to Write a University Student CV | GoAcadio',
    seoDescription: 'A practical CV guide for university students covering education, projects, skills and preparing a clean PDF resume.',
  },
];

export function getStudyGuide(slug: string | undefined): StudyGuide | undefined {
  return studyGuides.find(g => g.slug === slug);
}
