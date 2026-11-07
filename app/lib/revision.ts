/** Free, rule-based revision prompts based on students' own saved quiz summaries.
 * This is a study-planning hint, never a diagnosis or an academic grade.
 */
import type { CoursePerformance } from './quiz-history';

export type RevisionLevel = 'review' | 'insufficient' | 'on-track' | 'no-data';
export type RevisionCourse = {id:string;name:string;code:string|null};
export type RevisionAdvice = {
  course:RevisionCourse;
  level:RevisionLevel;
  attempts:number;
  questions:number;
  accuracy:number|null;
};

export function revisionLevel(performance?:CoursePerformance): RevisionLevel {
  if (!performance || performance.attempts===0) return 'no-data';
  if (performance.attempts<2 || performance.questions<8) return 'insufficient';
  return performance.accuracy<70 ? 'review' : 'on-track';
}

export function buildRevisionAdvice(
  courses:readonly RevisionCourse[],
  performances:readonly CoursePerformance[],
):RevisionAdvice[] {
  const byCourse = new Map(performances.map(p=>[p.courseId,p] as const));
  const rank:Record<RevisionLevel,number> = {'review':0,'insufficient':1,'no-data':2,'on-track':3};
  return courses.map(course=>{
    const p=byCourse.get(course.id);
    return {course,level:revisionLevel(p),attempts:p?.attempts??0,
      questions:p?.questions??0,accuracy:p?.accuracy??null};
  }).sort((a,b)=>rank[a.level]-rank[b.level]
    || (a.level==='review'&&b.level==='review'?(a.accuracy??0)-(b.accuracy??0):0)
    || a.course.name.localeCompare(b.course.name));
}

/** Return a local calendar day, not a UTC day; avoids a one-day shift for some students. */
export function dateInLocalDays(days:number,now:Date=new Date()):string {
  const date = new Date(now);
  date.setDate(date.getDate()+days);
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

export function revisionTaskTitle(courseName:string,arabic:boolean):string {
  return `${arabic?'مراجعة':'Revision'}: ${courseName}`.slice(0,160);
}
export function revisionTaskNotes(minutes:25|50,arabic:boolean):string {
  return arabic
    ? `جلسة مذاكرة ${minutes} دقيقة: راجع المفاهيم الأساسية، حل أسئلة تدريبية، ثم راجع الإجابات التي أخطأت فيها.`
    : `${minutes}-minute revision session: review key concepts, attempt practice questions, and revisit incorrect answers.`;
}
