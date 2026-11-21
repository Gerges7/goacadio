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
];

export function getStudyGuide(slug: string | undefined): StudyGuide | undefined {
  return studyGuides.find(g => g.slug === slug);
}
