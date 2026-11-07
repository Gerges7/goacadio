/** Only score summaries are stored; never store lecture text, full questions or answers. */
export type QuizAttempt = {
  id: string;
  course_id: string | null;
  title: string;
  question_count: number;
  correct_count: number;
  quiz_format: 'mcq' | 'tf' | 'mixed';
  source_type: 'pdf' | 'text';
  created_at: string;
};
export type CoursePerformance = {
  courseId: string;
  attempts: number;
  correct: number;
  questions: number;
  accuracy: number;
};

export function accuracy(correct: number, questions: number): number {
  return questions > 0 ? Math.round(100 * correct / questions) : 0;
}

export function summarizeQuizAttempts(attempts: readonly QuizAttempt[], now: Date = new Date()) {
  const totalQuestions = attempts.reduce((n, a) => n + a.question_count, 0);
  const correct = attempts.reduce((n, a) => n + a.correct_count, 0);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const lastSevenDays = attempts.filter(a => {
    const date = new Date(a.created_at);
    return Number.isFinite(date.getTime()) && date >= start && date <= now;
  }).length;
  const grouped = new Map<string, {attempts:number; correct:number; questions:number}>();
  for (const a of attempts) {
    const key = a.course_id ?? '';
    const prev = grouped.get(key) ?? {attempts:0, correct:0, questions:0};
    prev.attempts++;
    prev.correct += a.correct_count;
    prev.questions += a.question_count;
    grouped.set(key, prev);
  }
  const courses: CoursePerformance[] = [...grouped].map(([courseId, g]) => ({
    courseId, ...g, accuracy:accuracy(g.correct, g.questions),
  })).sort((a,b) => b.attempts - a.attempts || a.accuracy - b.accuracy);
  // Avoid classifying an entire course from one small practice quiz.
  const needsReview = courses.filter(c => c.courseId && c.attempts >= 2 && c.questions >= 8)
    .sort((a,b) => a.accuracy - b.accuracy).slice(0,3);
  return {totalAttempts: attempts.length, totalQuestions, correct, accuracy: accuracy(correct, totalQuestions), lastSevenDays, courses, needsReview};
}
